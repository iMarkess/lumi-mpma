# LUMI MPMA — API de Denúncias

Backend do app de denúncias: **PostgreSQL + Fastify + Prisma**, 100% no seu VPS
via Docker. Sincroniza app do cidadão ↔ painel admin ↔ web.

## Por que esta stack

- **PostgreSQL** — banco robusto, LGPD/soberania (dados no seu VPS).
- **Fastify** — API rápida e enxuta.
- **Prisma** — schema tipado + migrações.
- **JWT + bcrypt** — login seguro dos servidores do MPMA (senha nunca em texto).
- **rate limit** — protege o endpoint público de denúncia contra flood.

## Subir no VPS (Docker)

Pré-requisito: Docker + Docker Compose no VPS.

```bash
cd backend
cp .env.example .env
nano .env            # defina DB_PASSWORD, JWT_SECRET forte e CORS_ORIGIN

docker compose up -d --build      # sobe Postgres + API (porta 3333)
docker compose exec api npm run seed   # (opcional) dados de exemplo + logins
```

Testar:

```bash
curl http://SEU_VPS:3333/health
curl http://SEU_VPS:3333/api/complaints/MPMA-X82J91   # se rodou o seed
```

> **HTTPS:** ponha um Nginx/Caddy na frente com TLS (ex.: `api.mpma.mp.br` →
> `localhost:3333`). O app/web deve falar com a API em **https**.

## Endpoints

Público (cidadão):
- `POST /api/complaints` — envia denúncia → `{ protocol }`
- `GET  /api/complaints/:protocol` — acompanha (com timeline de status)
- `GET  /api/notifications?protocol=MPMA-XXXX` — avisos da denúncia
- `PATCH /api/notifications/:id/read`

Servidores (JWT):
- `POST  /api/auth/login` — `{ cpf, password }` → `{ token, user }`
- `GET   /api/auth/me`
- `GET   /api/admin/complaints?status=&category=&q=` — lista/triagem
- `GET   /api/admin/stats` — contadores do dashboard
- `GET   /api/admin/complaints/:id`
- `PATCH /api/admin/complaints/:id` — muda status (gera auditoria + notifica cidadão)

Logins do seed: CPF `046.675.443-41` ou `000.000.000-00`, senha `123`
(**troque em produção**).

## Conectar o app/web

No site Next.js, defina a variável de ambiente e faça o rebuild:

```
NEXT_PUBLIC_API_URL=https://api.SEU-DOMINIO
```

O site usa a API quando a variável existe; sem ela, cai no modo local
(`localStorage`) — então o deploy da PWA nunca quebra. Ver `lib/api.ts` no projeto web.

## Modelo de dados

`Profile` (servidores) · `Complaint` (protocolo = id) · `ComplaintEvent`
(auditoria/timeline) · `Attachment` (evidências) · `Notification` (avisos ao cidadão).

## Manutenção

```bash
docker compose logs -f api          # logs
docker compose exec db pg_dump -U sentinela sentinela > backup.sql   # backup
docker compose down                 # parar
```
