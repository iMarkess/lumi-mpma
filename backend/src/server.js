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

// Política de privacidade (obrigatória na Play Store)
app.get('/privacidade', async (_req, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Política de Privacidade — LUMI (MPMA)</title>
<style>
:root{--azul:#00458E}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0b1220;line-height:1.65;background:#f6f8fc}
header{background:linear-gradient(135deg,#1E6FC4,#00458E 60%,#002D5C);color:#fff;padding:40px 20px}
.wrap{max-width:780px;margin:0 auto;padding:0 20px}
header .wrap{padding:0}
h1{margin:0 0 6px;font-size:1.7rem}
header p{margin:0;opacity:.9}
main{padding:32px 0 60px}
h2{color:var(--azul);margin-top:32px;font-size:1.15rem}
a{color:var(--azul)}
.upd{font-size:.85rem;color:#64748b}
ul{padding-left:20px}
footer{border-top:1px solid #e2e8f0;margin-top:40px;padding-top:20px;font-size:.85rem;color:#64748b}
</style></head><body>
<header><div class="wrap"><h1>Política de Privacidade — LUMI</h1>
<p>Ministério Público do Estado do Maranhão (MPMA)</p></div></header>
<main class="wrap">
<p class="upd">Última atualização: julho de 2026.</p>
<p>A LUMI é o aplicativo oficial do Ministério Público do Estado do Maranhão (MPMA)
para registro de denúncias. Esta política explica como tratamos seus dados, em
conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>

<h2>1. Dados que coletamos</h2>
<ul>
<li><b>Conteúdo da denúncia:</b> descrição, categoria, respostas do formulário e,
quando você informa, localização e anexos.</li>
<li><b>Denúncia anônima:</b> você pode denunciar sem se identificar. Nesse caso,
não coletamos seu nome, CPF ou contato.</li>
<li><b>Dados de conta (opcional):</b> se você criar conta, coletamos nome, CPF e
e-mail para autenticação e acompanhamento.</li>
<li><b>Dados técnicos mínimos</b> necessários ao funcionamento e à segurança do app.</li>
</ul>

<h2>2. Finalidade</h2>
<p>Usamos os dados exclusivamente para receber, triar e dar andamento às denúncias,
permitir o acompanhamento por protocolo e cumprir as atribuições legais do MPMA.</p>

<h2>3. Base legal</h2>
<p>O tratamento se fundamenta no cumprimento de obrigação legal e no exercício
regular de competências do Ministério Público (art. 7º e art. 23 da LGPD).</p>

<h2>4. Compartilhamento</h2>
<p>Os dados são acessados internamente pelas equipes competentes do MPMA. Não
vendemos nem compartilhamos dados com terceiros para fins comerciais.</p>

<h2>5. Segurança</h2>
<p>Os dados trafegam de forma criptografada e são armazenados em ambiente
controlado do MPMA, com acesso restrito.</p>

<h2>6. Retenção</h2>
<p>Os dados são mantidos pelo prazo necessário à apuração e conforme a tabela de
temporalidade e as normas aplicáveis ao MPMA.</p>

<h2>7. Direitos do titular</h2>
<p>Você pode solicitar confirmação, acesso, correção e, quando cabível, exclusão dos
seus dados, bem como informações sobre o tratamento, pelos canais da Ouvidoria do MPMA.</p>

<h2>8. Contato</h2>
<p>Ouvidoria do Ministério Público do Estado do Maranhão — pelos canais oficiais em
<a href="https://www.mpma.mp.br">mpma.mp.br</a>.</p>

<h2>9. Alterações</h2>
<p>Esta política pode ser atualizada. A versão vigente estará sempre disponível
neste endereço.</p>

<footer>© Ministério Público do Estado do Maranhão — LUMI. Documento fornecido para
fins de conformidade da Google Play. Recomenda-se validação pela assessoria jurídica do MPMA.</footer>
</main></body></html>`;
});

// Preview do app no navegador (build web do Flutter), se disponível.
{
  const { existsSync } = await import('node:fs');
  if (existsSync('/downloads/web/index.html')) {
    const fastifyStatic = (await import('@fastify/static')).default;
    await app.register(fastifyStatic, {
      root: '/downloads/web',
      prefix: '/web/',
      decorateReply: false,
    });
  }
}

// Download do APK (para instalar direto no celular durante os testes)
app.get('/download/lumi.apk', async (_req, reply) => {
  const { createReadStream, existsSync } = await import('node:fs');
  const path = '/downloads/lumi.apk';
  if (!existsSync(path)) {
    return reply.code(404).send({ error: 'APK ainda não disponível' });
  }
  reply.header('Content-Type', 'application/vnd.android.package-archive');
  reply.header('Content-Disposition', 'attachment; filename="lumi.apk"');
  return reply.send(createReadStream(path));
});

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
