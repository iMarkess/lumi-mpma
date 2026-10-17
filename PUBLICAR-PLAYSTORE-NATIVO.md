# Publicar a LUMI (app nativo) na Google Play

Package: **`br.com.lumi.denuncia`** (não muda nunca). Versão atual: **1.0.5 (6)**.

## 1. Gerar o pacote

```powershell
powershell -ExecutionPolicy Bypass -File mobile\build-local.ps1 -StorePassword 'SENHA_DA_KEYSTORE'
```

Sai `LUMI-1.0.5-6-SUBIR-ESTE.aab` na raiz do projeto, já verificado por
`mobile/ci/verify_aab.py`. **Não suba** `app-release-1.0.3-QUEBRADO-NAO-SUBIR.aab`.

A cada novo envio, aumente o número depois do `+` em `mobile/pubspec.yaml`
e o `appVersion` em `mobile/lib/core/config.dart`.

## 2. Backend precisa estar atualizado

O app usa rotas novas (`/api/citizen/password`, `/api/citizen/delete`). Antes de
mandar para revisão, publique o backend no VPS:

```bash
ssh root@31.97.151.126
cd ~/lumi-mpma && git pull --ff-only
cd backend && docker compose up -d --build api
```

## 3. Conta de teste para o revisor

A Play pede acesso a todas as funções. Crie uma conta pelo próprio app
(Criar conta) — ex.: CPF válido de teste + senha — e informe em
**Conteúdo do app → Acesso ao app**:

> A maior parte do app funciona sem login ("Continuar sem conta").
> Para testar a área de conta: CPF `xxx.xxx.xxx-xx`, senha `xxxxxx`.

## 4. Conteúdo do app (Play Console → Política → Conteúdo do app)

| Item | Resposta |
|---|---|
| Política de privacidade | `https://lumimpma.site/privacidade` |
| Exclusão de conta (URL) | `https://lumimpma.site/excluir-conta` — e no app: Perfil → Excluir conta |
| Anúncios | Não contém anúncios |
| Público-alvo | 18+ |
| App governamental | **Não** (app independente) |
| Recursos financeiros / saúde | Não |

### Segurança dos dados (Data safety)

- **Coleta dados?** Sim. **Compartilha com terceiros?** Não.
- **Criptografados em trânsito?** Sim (HTTPS). **Usuário pode pedir exclusão?** Sim.
- Tipos declarados:
  - *Informações pessoais → Nome, E-mail, Outros IDs (CPF)* — opcional, só quem cria conta. Finalidade: gerenciamento de conta.
  - *Informações pessoais → E-mail* — opcional, contato numa denúncia não anônima. Finalidade: funcionalidade do app.
  - *Mensagens no app / Outro conteúdo gerado pelo usuário* — texto da denúncia. Obrigatório para usar a função. Finalidade: funcionalidade do app.
- Não coleta: localização, contatos, fotos, identificadores de publicidade.
- Biometria: processada só no aparelho pelo Android, nada é enviado.

## 5. Ficha da loja

- **Nome:** LUMI — Denúncias
- **Descrição curta:** Registre denúncias com sigilo e acompanhe pelo protocolo.
- **Descrição completa:**
  > A LUMI é um aplicativo independente para registrar denúncias com segurança
  > e sigilo: situações envolvendo crianças e adolescentes, idosos e pessoas com
  > deficiência, e o meio ambiente. A denúncia pode ser anônima, sem cadastro.
  > Ao enviar, você recebe um número de protocolo e acompanha o andamento pelo
  > app, com notificações a cada atualização.
  >
  > A LUMI não é um canal oficial de órgão público. Em emergência, ligue 190.
- **Ícone 512×512:** `playstore/icon-512.png`
- **Feature graphic 1024×500:** `playstore/feature-graphic.png`
- **Screenshots:** `playstore/screenshot-1..4.png` — **refaça** com a versão 1.0.5
  (a tela de login mudou).

> Não use "oficial", "MPMA", "Ministério Público" nem brasão em nome, ícone,
> descrição ou screenshots: a Play reprova app que aparenta ser de órgão público
> sem comprovação.

## 6. Enviar

Teste interno → Criar versão → subir o `.aab` → notas da versão:

> Contas de cidadão, histórico de denúncias e notificações reais, exclusão de
> conta no app, bloqueio por biometria e melhorias gerais.

Depois de testar no celular pelo link de teste interno: **Produção → Criar
versão** com o mesmo `.aab` → **Enviar para revisão**.
