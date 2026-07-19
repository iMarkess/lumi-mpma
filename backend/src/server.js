import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

import { env } from './env.js';
import { prisma } from './db.js';
import complaintRoutes from './routes/complaints.js';
import citizenRoutes from './routes/citizen.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

const app = Fastify({
  logger: { level: env.nodeEnv === 'production' ? 'info' : 'debug' },
});

await app.register(cors, {
  origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
  credentials: true,
});

await app.register(rateLimit, { global: false });

await app.register(jwt, { secret: env.jwtSecret });

// preHandler reutilizável para rotas protegidas
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Não autorizado' });
  }
});

app.get('/health', async () => ({ ok: true, ts: new Date().toISOString() }));

await app.register(complaintRoutes);
await app.register(citizenRoutes);
await app.register(authRoutes);
await app.register(adminRoutes);
await app.register(notificationRoutes);

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

try {
  await app.listen({ port: env.port, host: env.host });
  app.log.info(`LUMI API rodando em http://${env.host}:${env.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
