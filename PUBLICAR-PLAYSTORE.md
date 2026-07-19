# Publicar o LUMI MPMA na Google Play Store

## ⚡ SUBIR HOJE — passo a passo curto

O build já funciona nesta máquina e a pasta `out/` é o site pronto.

```bash
# 1. Gerar o site estático (já rodado — regere se mudar algo)
npm run build          # cria a pasta out/

# 2. Publicar em HTTPS (escolha UM):
#    a) Netlify Drop (mais rápido): abra https://app.netlify.com/drop
#       e ARRASTE a pasta out/ — ganha uma URL https na hora.
#    b) Netlify CLI:  npx netlify deploy --prod --dir=out
#    c) Seu VPS: copie o conteúdo de out/ para o webroot do nginx (com HTTPS).
```

Depois que a URL estiver no ar:

3. Abra **https://www.pwabuilder.com**, cole a URL, **Package For Stores →
   Android → Google Play**. Em *Signing key* deixe **"Create new"** e **guarde o
   keystore**. Baixe o ZIP → dentro tem `app-release-signed.aab`.
4. Naquela tela do Play Console que você já está ("Criar versão de teste interno"),
   **arraste o `.aab`** em "Solte os pacotes de apps aqui".
5. Publique o `assetlinks.json` (vem no ZIP) em
   `https://SUA-URL/.well-known/assetlinks.json` — tira a barra de navegador do app.

> Sem esse deploy o PWABuilder não gera o `.aab` (ele lê a URL pública). É o único
> passo que falta pra subir hoje.

---

## Detalhes completos

O app é o **próprio site**, empacotado como Android (TWA — Trusted Web Activity).
Ninguém precisa instalar Java/Android Studio: o `.aab` (pacote da Play) é gerado
na nuvem pelo **PWABuilder**.

Fluxo completo:

```
Site (HTTPS) ──► já é PWA (manifest + service worker + ícones)
        │
        ▼
PWABuilder.com ──► gera .aab assinado + assetlinks.json
        │
        ▼
Google Play Console ──► upload .aab + ficha da loja ──► publicado
```

---

## O que já está pronto (feito no código)

- [x] `app/manifest.ts` — manifest com nome, ícones, atalhos, tela cheia, cores MPMA
- [x] `public/sw.js` — service worker: offline + cache + push notification (pronto p/ backend)
- [x] `public/offline.html` — tela offline com a marca
- [x] `public/icons/` — ícones 192/512 + **maskable** + apple-touch + favicons
- [x] `app/layout.tsx` — theme-color, viewport-fit=cover, apple web app, registro do SW
- [x] safe-area (notch / barra de gestos) no Navbar e bottom-nav
- [x] `public/_headers` — SW sem cache, manifest com content-type correto

---

## Passo 1 — Colocar o site no ar (HTTPS)

O `.aab` aponta para uma URL pública. Faça o deploy (Netlify/Vercel/seu VPS).

> **Atenção build local:** `npm run build` quebra nesta máquina por causa do
> caminho com acento (`Área de Trabalho`). No Netlify/servidor o caminho não tem
> acento, então o build/export roda normal. Se for buildar local, mova o projeto
> para um caminho sem acento (ex: `C:\dev\mpma`).

Depois de publicado, **verifique** (troque pelo seu domínio):

```bash
curl -I https://SEU-DOMINIO/manifest.webmanifest   # 200 + application/manifest+json
curl -I https://SEU-DOMINIO/sw.js                   # 200
curl -I https://SEU-DOMINIO/icons/icon-512.png      # 200
```

> `netlify.toml` hoje publica `.next` com o plugin Next. Como o projeto usa
> `output: 'export'`, confira se o site publicado serve os 3 arquivos acima. Se
> não servir, ajuste o deploy para publicar a pasta `out/` (a do export estático).

## Passo 2 — Conta Google Play Console

- Criar conta de desenvolvedor: https://play.google.com/console — **taxa única US$ 25**.
- Para órgão público (MPMA), abrir como **conta de organização** (pede dados/DUNS;
  prazo de verificação pode levar dias — comece já).

## Passo 3 — Gerar o pacote Android (.aab) no PWABuilder

1. Acesse https://www.pwabuilder.com e cole a URL do site.
2. Ele audita o PWA (manifest, SW, ícones). Corrija o que apontar em vermelho.
3. **Package For Stores → Android → Google Play**.
4. Confira o pacote:
   - **Package ID**: ex. `br.gov.ma.mp.sentinela` (não muda depois — escolha bem).
   - **App name**: LUMI MPMA
   - **Signing key**: deixe **"Create new"**. Baixe e **guarde o `.keystore` +
     senhas** em local seguro — sem ele você não consegue atualizar o app depois.
5. Baixe o ZIP. Dentro vem:
   - `app-release-signed.aab` → é o que sobe na Play
   - `assetlinks.json` → **Passo 4**
   - `signing-key-info.txt` → guarde junto do keystore

## Passo 4 — Digital Asset Links (tira a barra de URL do navegador)

Sem isso o app abre com uma barra de endereço feia. O PWABuilder gera o
`assetlinks.json`. Publique-o em:

```
https://SEU-DOMINIO/.well-known/assetlinks.json
```

Neste projeto: crie a pasta `public/.well-known/` e coloque o arquivo lá — o
export estático publica em `/.well-known/assetlinks.json`. Verifique:

```bash
curl https://SEU-DOMINIO/.well-known/assetlinks.json
```

## Passo 5 — Ficha da loja (Play Console)

Prepare os assets:

| Item | Especificação |
|------|---------------|
| Ícone da loja | 512×512 PNG (use `public/icons/icon-512.png`) |
| Feature graphic | 1024×500 PNG (banner do topo) |
| Screenshots celular | mín. 2, 1080×1920 (telas: início, denunciar, protocolo) |
| Título | LUMI MPMA (máx. 30 caracteres) |
| Descrição curta | máx. 80 caracteres |
| Descrição completa | até 4000 caracteres |

> Screenshots: abra o site no Chrome → DevTools (F12) → modo dispositivo (Ctrl+Shift+M)
> → escolha "Pixel 7" → capture cada tela. Ou instale o PWA no celular e printe.

Ainda no Console:
- **Política de privacidade (obrigatória)** — Passo 6.
- **Data safety / Segurança dos dados** — declare que o app coleta denúncias
  (dados sensíveis). Seja preciso: o que coleta, se anonimiza, como usa. Play
  reprova apps de denúncia com esse formulário mal preenchido.
- **Classificação de conteúdo** — responda o questionário.
- **Categoria** sugerida: Social / Estilo de vida / Governo.
- **Público-alvo**: adultos (o app trata de denúncias, não é infantil).

## Passo 6 — Política de privacidade (crítico)

App de denúncia lida com dado sensível → política de privacidade **obrigatória**,
hospedada numa URL pública (ex: `https://SEU-DOMINIO/privacidade`). Deve cobrir:

- que dados são coletados (texto da denúncia, localização, mídia, contato opcional)
- se a denúncia pode ser **anônima** e como o anonimato é garantido
- base legal (LGPD), finalidade, tempo de retenção, com quem é compartilhado
- direitos do titular e canal de contato do MPMA

> Recomendo validar o texto com o jurídico do MPMA antes de publicar.

## Passo 7 — Upload e revisão

1. Play Console → **Criar app** → idioma pt-BR.
2. **Produção → Criar release** → suba o `.aab`.
3. Preencha o que faltar (a Play mostra um checklist).
4. Enviar para revisão. Primeira revisão costuma levar de **alguns dias a ~2 semanas**
   (apps de governo/denúncia recebem análise mais rigorosa).

## Atualizações futuras

Mudou o site → deploy. O conteúdo do app atualiza **na hora** (é o site dentro do
shell), sem reenviar para a Play. Só reenvia `.aab` quando mudar ícone, nome,
permissões nativas ou o Package ID. Ao reenviar, use **o mesmo keystore** do Passo 3.

---

## Próxima fase — Sincronização real (app ↔ web ↔ painel)

Hoje as denúncias ficam só no aparelho (`localStorage`). Para o que você pediu —
"tudo que for feito no app vai direto pra web e pro painel" — falta um **backend +
banco de dados** (você tem VPS, dá pra rodar lá). Isso é a fase 2. Ver
`ROADMAP-BACKEND.md`.
