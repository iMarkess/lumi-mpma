export const env = {
  port: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

if (env.nodeEnv === 'production' && env.jwtSecret.startsWith('troque-')) {
  // eslint-disable-next-line no-console
  console.warn('[AVISO] Defina JWT_SECRET forte em produção!');
}
