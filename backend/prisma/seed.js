import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pass = await bcrypt.hash('123', 10);

  // Servidores do MPMA
  await prisma.profile.upsert({
    where: { cpf: '04667544341' },
    update: {},
    create: {
      name: 'Lucas Marques',
      cpf: '04667544341',
      passwordHash: pass,
      role: 'PROMOTOR',
    },
  });
  await prisma.profile.upsert({
    where: { cpf: '00000000000' },
    update: {},
    create: {
      name: 'Ana Silva',
      cpf: '00000000000',
      passwordHash: pass,
      role: 'SECRETARIA',
    },
  });

  // Denúncias de exemplo
  const samples = [
    {
      id: 'MPMA-X82J91',
      category: 'child',
      title: 'Possível negligência em escola',
      location: 'São Luís',
      description: 'Relato de negligência sistemática com alunos.',
      status: 'recebida',
      priority: 'alta',
    },
    {
      id: 'MPMA-A72K12',
      category: 'env',
      title: 'Queimada irregular em terreno',
      location: 'Imperatriz',
      description: 'Fogo em área de proteção ambiental.',
      status: 'em_triagem',
      priority: 'media',
    },
    {
      id: 'MPMA-B33L90',
      category: 'elderly',
      title: 'Maus-tratos por familiar',
      location: 'Caxias',
      description: 'Idoso em situação de abandono.',
      status: 'em_analise',
      priority: 'alta',
    },
  ];

  for (const s of samples) {
    await prisma.complaint.upsert({
      where: { id: s.id },
      update: {},
      create: {
        ...s,
        events: { create: { toStatus: s.status, note: 'Denúncia registrada (seed).' } },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed concluído: 2 servidores + 3 denúncias.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
