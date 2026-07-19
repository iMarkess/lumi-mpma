import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';

const loginSchema = z.object({
  cpf: z.string().min(1),
  password: z.string().min(1),
});

export default async function authRoutes(app) {
  app.post('/api/auth/login', {
    config: { rateLimit: { max: 8, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos' });
    }
    const cpf = parsed.data.cpf.replace(/\D/g, '');
    const user = await prisma.profile.findUnique({ where: { cpf } });
    if (!user || !user.active) {
      return reply.code(401).send({ error: 'CPF ou senha incorretos' });
    }
    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ error: 'CPF ou senha incorretos' });
    }

    const token = app.jwt.sign(
      { sub: user.id, role: user.role, name: user.name },
      { expiresIn: '12h' },
    );

    return {
      token,
      user: { id: user.id, name: user.name, role: user.role },
    };
  });

  // Retorna o usuário do token (validação de sessão)
  app.get('/api/auth/me', { onRequest: [app.authenticate] }, async (request) => {
    return request.user;
  });
}
