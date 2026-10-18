import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';

const patchSchema = z.object({
  status: z.enum(['recebida', 'em_triagem', 'em_analise', 'concluida', 'rejeitada']),
  note: z.string().trim().max(1000).optional(),
});

export default async function adminRoutes(app) {
  // Todas as rotas de admin exigem token válido DE SERVIDOR. Token de cidadão
  // (kind: 'citizen', emitido no cadastro aberto do app) não abre o painel.
  app.addHook('onRequest', async (request, reply) => {
    await app.authenticate(request, reply);
    if (reply.sent) return;
    if (request.user?.kind === 'citizen' || !request.user?.role) {
      return reply.code(403).send({ error: 'Acesso restrito à equipe.' });
    }
    // Conta desativada perde o acesso na hora, mesmo com token ainda válido.
    const me = await prisma.profile.findUnique({
      where: { id: request.user.sub },
      select: { active: true, role: true },
    });
    if (!me?.active) return reply.code(401).send({ error: 'Conta desativada.' });
    request.user.role = me.role; // perfil atual, não o do momento do login
  });

  // Lista com filtros
  app.get('/api/admin/complaints', async (request) => {
    const { status, category, q } = request.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { id: { contains: String(q), mode: 'insensitive' } },
        { title: { contains: String(q), mode: 'insensitive' } },
        { location: { contains: String(q), mode: 'insensitive' } },
      ];
    }
    return prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  });

  // Contadores do dashboard
  app.get('/api/admin/stats', async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, triagem, analise, urgentes, concluidas, hoje, byStatus, byCategory, recent] =
      await Promise.all([
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: 'em_triagem' } }),
        prisma.complaint.count({ where: { status: 'em_analise' } }),
        // "Urgente" = prioridade alta ainda em aberto (concluída não pede ação).
        prisma.complaint.count({
          where: { priority: 'alta', status: { notIn: ['concluida', 'rejeitada'] } },
        }),
        prisma.complaint.count({ where: { status: 'concluida' } }),
        prisma.complaint.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.complaint.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.complaint.groupBy({ by: ['category'], _count: { _all: true } }),
        prisma.complaint.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
      ]);

    // Série dos últimos 30 dias (dia local do servidor).
    const daily = {};
    for (const { createdAt } of recent) {
      const key = createdAt.toISOString().slice(0, 10);
      daily[key] = (daily[key] ?? 0) + 1;
    }

    return {
      total,
      hoje,
      triagem,
      analise,
      urgentes,
      concluidas,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
      byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count._all])),
      daily,
    };
  });

  // Detalhe
  app.get('/api/admin/complaints/:id', async (request, reply) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: String(request.params.id).toUpperCase() },
      include: {
        // Quem mudou cada status aparece na trilha (auditoria interna).
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { name: true } } },
        },
        attachments: true,
      },
    });
    if (!complaint) return reply.code(404).send({ error: 'Não encontrado' });
    return complaint;
  });

  // Atualiza status (gera evento de auditoria + notificação ao cidadão)
  app.patch('/api/admin/complaints/:id', async (request, reply) => {
    const parsed = patchSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' });

    const id = String(request.params.id).toUpperCase();
    const current = await prisma.complaint.findUnique({ where: { id } });
    if (!current) return reply.code(404).send({ error: 'Não encontrado' });

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: parsed.data.status,
        events: {
          create: {
            fromStatus: current.status,
            toStatus: parsed.data.status,
            note: parsed.data.note,
            actorId: request.user?.sub ?? null,
          },
        },
        notifications: {
          create: {
            protocol: id,
            kind: 'update',
            title: 'Sua denúncia foi atualizada',
            body: `O protocolo ${id} agora está: ${parsed.data.status.replace('_', ' ')}.`,
          },
        },
      },
    });
    return updated;
  });

  // ===================== EQUIPE (contas do painel) =====================
  // Só PROMOTOR e MASTER gerenciam a equipe.
  const canManage = (request) => ['PROMOTOR', 'MASTER'].includes(request.user?.role);
  const publicProfile = (p) => ({
    id: p.id, name: p.name, cpf: p.cpf, role: p.role, active: p.active, createdAt: p.createdAt,
  });

  app.get('/api/admin/me', async (request, reply) => {
    const me = await prisma.profile.findUnique({ where: { id: request.user.sub } });
    if (!me || !me.active) return reply.code(401).send({ error: 'Conta desativada.' });
    return publicProfile(me);
  });

  // Troca a própria senha (exige a atual).
  app.post('/api/admin/me/password', {
    config: { rateLimit: { max: 6, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(72),
    }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'A nova senha precisa ter de 8 a 72 caracteres.' });
    const me = await prisma.profile.findUnique({ where: { id: request.user.sub } });
    if (!me || !(await bcrypt.compare(parsed.data.currentPassword, me.passwordHash))) {
      return reply.code(403).send({ error: 'Senha atual incorreta.' });
    }
    await prisma.profile.update({
      where: { id: me.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
    });
    return { ok: true };
  });

  app.get('/api/admin/users', async (request, reply) => {
    if (!canManage(request)) return reply.code(403).send({ error: 'Sem permissão.' });
    const users = await prisma.profile.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map(publicProfile);
  });

  const roleEnum = z.enum(['PROMOTOR', 'SECRETARIA', 'OUVIDORIA', 'MASTER']);

  app.post('/api/admin/users', async (request, reply) => {
    if (!canManage(request)) return reply.code(403).send({ error: 'Sem permissão.' });
    const parsed = z.object({
      name: z.string().trim().min(3).max(120),
      cpf: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 11, 'CPF inválido'),
      role: roleEnum,
      password: z.string().min(8).max(72),
    }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Confira nome, CPF, perfil e senha (mínimo 8 caracteres).' });
    // Só MASTER cria outro MASTER.
    if (parsed.data.role === 'MASTER' && request.user.role !== 'MASTER') {
      return reply.code(403).send({ error: 'Só administradores criam administradores.' });
    }
    const exists = await prisma.profile.findUnique({ where: { cpf: parsed.data.cpf } });
    if (exists) return reply.code(409).send({ error: 'Já existe uma conta com este CPF.' });
    const user = await prisma.profile.create({
      data: {
        name: parsed.data.name,
        cpf: parsed.data.cpf,
        role: parsed.data.role,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
    return reply.code(201).send(publicProfile(user));
  });

  // Ativa/desativa, muda perfil ou redefine a senha de alguém da equipe.
  app.patch('/api/admin/users/:id', async (request, reply) => {
    if (!canManage(request)) return reply.code(403).send({ error: 'Sem permissão.' });
    const parsed = z.object({
      active: z.boolean().optional(),
      role: roleEnum.optional(),
      password: z.string().min(8).max(72).optional(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos (senha mínima de 8 caracteres).' });
    const id = String(request.params.id);
    if (id === request.user.sub && (parsed.data.active === false || parsed.data.role)) {
      return reply.code(400).send({ error: 'Você não pode desativar nem mudar o perfil da própria conta.' });
    }
    if (parsed.data.role === 'MASTER' && request.user.role !== 'MASTER') {
      return reply.code(403).send({ error: 'Só administradores promovem a administrador.' });
    }
    const target = await prisma.profile.findUnique({ where: { id } });
    if (!target) return reply.code(404).send({ error: 'Conta não encontrada.' });
    const data = {};
    if (parsed.data.active !== undefined) data.active = parsed.data.active;
    if (parsed.data.role) data.role = parsed.data.role;
    if (parsed.data.password) data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const updated = await prisma.profile.update({ where: { id }, data });
    return publicProfile(updated);
  });
}
