# Fase 2 — Backend e sincronização (app ↔ web ↔ painel)

## O problema hoje

`context/AppContext.tsx` guarda denúncias e usuários no `localStorage` do próprio
aparelho. Ou seja:

- denúncia feita no celular **não aparece** no painel admin do MPMA
- cada dispositivo tem seus próprios dados, isolados
- login admin é fake (senha `123` no código)

Para "tudo que for feito no app ir direto pra web e pro painel", precisa de um
**servidor com banco de dados** — que você pode rodar no seu VPS.

## Arquitetura proposta

```
App (cidadão, TWA/PWA) ─┐
                        ├─► API (VPS) ─► Banco Postgres ─► Painel admin (web, tempo real)
Painel admin (web)  ────┘                     │
                                              └─► Push notification (web-push) p/ o cidadão
```

O frontend continua **static export** (funciona dentro do app da Play). Ele deixa
de ler `localStorage` e passa a chamar a API. `localStorage` vira só cache offline
+ fila de envio (denúncia feita sem internet sobe quando reconectar).

## Stack recomendada (rápida de subir no VPS)

**Opção A — Supabase (recomendado):** Postgres + API REST/realtime + Auth + Storage
(para anexos de foto/vídeo da denúncia) prontos. Tem cloud (free tier) ou
self-host no seu VPS via Docker. Realtime já entrega atualização ao painel sem
código extra.

**Opção B — Node próprio:** Express/Fastify + Prisma + Postgres + Docker no VPS.
Mais controle, mais trabalho. Escolher se houver exigência de dado 100% on-premise
do MPMA.

## Modelo de dados (base)

- `complaints` — id, categoria, título, descrição, localização, status, prioridade,
  data, anônima (bool), contato (opcional), anexos[]
- `users` — servidores MPMA (promotor/secretaria/ouvidoria/master) com **senha
  hasheada** (bcrypt/argon2), não texto puro
- `attachments` — mídias no Storage
- `audit_log` — quem mudou o status de cada denúncia (exigência típica de MP)
- `push_subscriptions` — para notificar o cidadão sobre o andamento

## Etapas

1. Subir Postgres + API no VPS (ou projeto Supabase).
2. Migrar os tipos de `AppContext.tsx` para tabelas.
3. **Auth de verdade** no `/admin` (hash de senha, JWT/sessão, papéis). Tirar as
   senhas `123` do código.
4. Trocar as chamadas `localStorage` do `AppContext` por chamadas à API + camada
   offline (fila de sincronização).
5. Denúncia anônima com protocolo: cidadão consulta status em `/acompanhar` sem login.
6. Realtime/refetch no painel → nova denúncia aparece na triagem na hora.
7. Push: gerar chaves VAPID, o SW já trata `push`; backend dispara em mudança de status.
8. LGPD: criptografia em repouso, retenção, e o formulário Data Safety da Play.

## Segurança (app de denúncia = dado sensível)

- HTTPS obrigatório (já é requisito do TWA).
- Denúncia anônima real: não logar IP junto do conteúdo se prometer anonimato.
- Rate limit no endpoint de denúncia (evita flood).
- Painel admin atrás de auth + papéis; nunca expor lista de denúncias sem sessão.
- Backups do banco no VPS.

> Quando quiser começar a fase 2, me diga se prefere **Supabase** ou **Node
> próprio** e se o banco precisa ficar no VPS do MPMA — eu monto o esquema, a API
> e a migração do `AppContext`.
