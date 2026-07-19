# Ativar "Continuar com o Google" (LUMI)

Ao clicar, o Google mostra as contas do celular e a conta LUMI é **criada
automaticamente** no primeiro acesso. Já está tudo codado — falta só gerar um
**Client ID** no Google Cloud (grátis) e colocá-lo no build.

## 1. Criar o Client ID (Google Cloud Console)

1. Acesse https://console.cloud.google.com → crie um projeto (ex.: "LUMI MPMA").
2. Menu → **APIs e serviços → Tela de consentimento OAuth**:
   - Tipo: **Externo** → Criar
   - Nome do app: **LUMI**, e-mail de suporte, logo (opcional)
   - Salvar. (Pode deixar em "Teste" no início; adicione seu e-mail em
     "Usuários de teste".)
3. Menu → **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**
   - **Origens JavaScript autorizadas** — adicione as URLs onde o app roda:
     - `http://localhost:3000` (teste local)
     - `https://SEU-DOMINIO` (produção — ex. a URL do Netlify/VPS)
   - Criar → copie o **Client ID** (termina em `.apps.googleusercontent.com`).

## 2. Colocar no app

Crie o arquivo `.env.local` na raiz do projeto web:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=SEU_ID.apps.googleusercontent.com
```

E rebuild (a variável entra no build da PWA):

```bash
npm run build
```

> No deploy (Netlify/VPS), defina a MESMA variável no ambiente do build.

## 3. (Produção) Ativar no backend também

Para a conta ser criada com segurança no banco (não só demo local), no `backend/.env`:

```
GOOGLE_CLIENT_ID=SEU_ID.apps.googleusercontent.com
```

E no web, aponte `NEXT_PUBLIC_API_URL` para o VPS. Aí o fluxo é:
clique → escolhe conta Google → backend **verifica o token no Google** → cria/entra.

## Como funciona (já implementado)

- Botão oficial do Google + **One Tap** (as contas aparecem sozinhas ao abrir).
- Novo usuário → conta criada automaticamente (nome, e-mail, foto do Google).
- Sem `NEXT_PUBLIC_API_URL`: cria em **modo local** (demo) lendo os dados do Google.
- Com API: cria no **banco do VPS** com verificação do token.

Arquivos: `components/GoogleSignIn.tsx`, `context/CitizenAuth.tsx`,
`backend/src/routes/citizen.js`.
