import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'warn', 'error'],
});

/// Gera um protocolo único no formato LUMI-XXXXXX.
export function generateProtocol() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LUMI-${rand}`;
}
