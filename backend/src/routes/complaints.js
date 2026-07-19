import { z } from 'zod';
import { prisma, generateProtocol } from '../db.js';

const submitSchema = z.object({
  category: z.enum(['child', 'elderly', 'env']),
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(10).max(4000),
  location: z.string().trim().max(160).optional().default(''),
  priority: z.enum(['alta', 'media', 'baixa']).optional().default('media'),
  anonymous: z.boolean().optional().default(true),
  contactEmail: z.string().email().optional().nullable(),
});

export default async function complaintRoutes(app) {
  // Envio público de denúncia (cidadão, pode ser anônimo)
  app.post('/api/complaints', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dados inválidos', details: parsed.error.flatten() });
    }
    const data = parsed.data;

    // Garante protocolo único
    let protocol = generateProtocol();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.complaint.findUnique({ where: { id: protocol } });
      if (!exists) break;
      protocol = generateProtocol();
    }

    const complaint = await prisma.complaint.create({
      data: {
        id: protocol,
        category: data.category,
        title: data.title,
        description: data.description,
        location: data.location || 'Não informado',
        priority: data.priority,
        anonymous: data.anonymous,
        contactEmail: data.anonymous ? null : data.contactEmail ?? null,
        status: 'recebida',
        events: { create: { toStatus: 'recebida', note: 'Denúncia recebida.' } },
        notifications: {
          create: {
            protocol,
            kind: 'update',
            title: 'Denúncia recebida',
            body: `Seu protocolo é ${protocol}. Guarde para acompanhar.`,
          },
        },
      },
    });

    return reply.code(201).send({ protocol: complaint.id, id: complaint.id });
  });

  // Consulta pública por protocolo (acompanhamento)
  app.get('/api/complaints/:protocol', async (request, reply) => {
    const protocol = String(request.params.protocol).trim().toUpperCase();
    const complaint = await prisma.complaint.findUnique({
      where: { id: protocol },
      include: {
        events: { orderBy: { createdAt: 'asc' } },
        attachments: { select: { id: true, mime: true, size: true, createdAt: true } },
      },
    });
    if (!complaint) {
      return reply.code(404).send({ error: 'Protocolo não encontrado' });
    }
    return complaint;
  });
}
