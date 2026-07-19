import { z } from 'zod';
import { prisma } from '../db.js';

const patchSchema = z.object({
  status: z.enum(['recebida', 'em_triagem', 'em_analise', 'concluida', 'rejeitada']),
  note: z.string().trim().max(1000).optional(),
});

export default async function adminRoutes(app) {
  // Todas as rotas de admin exigem token válido
  app.addHook('onRequest', app.authenticate);

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
    const [total, triagem, analise, urgentes, concluidas] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'em_triagem' } }),
      prisma.complaint.count({ where: { status: 'em_analise' } }),
      prisma.complaint.count({ where: { priority: 'alta' } }),
      prisma.complaint.count({ where: { status: 'concluida' } }),
    ]);
    return { total, triagem, analise, urgentes, concluidas };
  });

  // Detalhe
  app.get('/api/admin/complaints/:id', async (request, reply) => {
    const complaint = await prisma.complaint.findUnique({
      where: { id: String(request.params.id).toUpperCase() },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
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
}
