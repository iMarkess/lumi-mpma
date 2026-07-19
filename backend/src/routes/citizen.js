import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';

const registerSchema = z.object({
  name: z.string().trim().min(3).max(120),
  cpf: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 11, 'CPF inválido'),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).max(72),
});

const loginSchema = z.object({
  identifier: z.string().min(1), // CPF ou e-mail
  password: z.string().min(1),
});

function publicUser(c) {
  return { id: c.id, name: c.name, cpf: c.cpf, email: c.email, avatarUrl: c.avatarUrl };
}

export default async function citizenRoutes(app) {
  // Cadastro
  app.post('/api/citizen/register', {
    config: { rateLimit: { max: 6, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }
    const { name, cpf, email, password } = parsed.data;

    const dup = await prisma.citizen.findFirst({
      where: { OR: [{ cpf }, ...(email ? [{ email }] : [])] },
    });
    if (dup) {
      return reply.code(409).send({ error: 'Já existe conta com este CPF ou e-mail.' });
    }

    const citizen = await prisma.citizen.create({
      data: { name, cpf, email: email ?? null, passwordHash: await bcrypt.hash(password, 10) },
    });

    const token = app.jwt.sign({ sub: citizen.id, kind: 'citizen', name: citizen.name }, { expiresIn: '30d' });
    return reply.code(201).send({ token, user: publicUser(citizen) });
  });

  // Login (CPF ou e-mail)
  app.post('/api/citizen/login', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Dados inválidos' });

    const id = parsed.data.identifier.trim();
    const cpf = id.replace(/\D/g, '');
    const citizen = await prisma.citizen.findFirst({
      where: { OR: [{ cpf: cpf.length === 11 ? cpf : undefined }, { email: id.toLowerCase() }] },
    });
    if (!citizen || !citizen.passwordHash) {
      return reply.code(401).send({ error: 'Conta ou senha incorretos' });
    }
    const ok = await bcrypt.compare(parsed.data.password, citizen.passwordHash);
    if (!ok) return reply.code(401).send({ error: 'Conta ou senha incorretos' });

    const token = app.jwt.sign({ sub: citizen.id, kind: 'citizen', name: citizen.name }, { expiresIn: '30d' });
    return { token, user: publicUser(citizen) };
  });

  // Login/cadastro com Google (envia o ID token do Google Identity Services)
  app.post('/api/citizen/google', async (request, reply) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return reply.code(501).send({ error: 'Login Google não configurado no servidor.' });
    }
    const { credential } = request.body ?? {};
    if (!credential) return reply.code(400).send({ error: 'Token do Google ausente.' });

    let payload;
    try {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      return reply.code(401).send({ error: 'Token do Google inválido.' });
    }

    const googleId = payload.sub;
    let citizen = await prisma.citizen.findFirst({
      where: { OR: [{ googleId }, { email: payload.email }] },
    });
    if (!citizen) {
      citizen = await prisma.citizen.create({
        data: {
          name: payload.name ?? 'Cidadão',
          email: payload.email ?? null,
          googleId,
          avatarUrl: payload.picture ?? null,
        },
      });
    } else if (!citizen.googleId) {
      citizen = await prisma.citizen.update({
        where: { id: citizen.id },
        data: { googleId, avatarUrl: citizen.avatarUrl ?? payload.picture ?? null },
      });
    }

    const token = app.jwt.sign({ sub: citizen.id, kind: 'citizen', name: citizen.name }, { expiresIn: '30d' });
    return { token, user: publicUser(citizen) };
  });

  // Sessão atual
  app.get('/api/citizen/me', { onRequest: [app.authenticate] }, async (request, reply) => {
    const citizen = await prisma.citizen.findUnique({ where: { id: request.user.sub } });
    if (!citizen) return reply.code(404).send({ error: 'Conta não encontrada' });
    return publicUser(citizen);
  });
}
