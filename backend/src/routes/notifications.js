import { prisma } from '../db.js';

export default async function notificationRoutes(app) {
  // Notificações do cidadão por protocolo
  app.get('/api/notifications', async (request, reply) => {
    const protocol = request.query.protocol
      ? String(request.query.protocol).trim().toUpperCase()
      : null;
    if (!protocol) {
      return reply.code(400).send({ error: 'Informe o protocolo' });
    }
    return prisma.notification.findMany({
      where: { protocol },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  });

  app.patch('/api/notifications/:id/read', async (request) => {
    const id = String(request.params.id);
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  });
}
