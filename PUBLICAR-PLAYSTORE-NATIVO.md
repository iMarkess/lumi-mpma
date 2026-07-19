# Publicar a LUMI (app NATIVO) na Google Play Store

App Flutter nativo. O `.aab` já está pronto e assinado.

## Você já tem (na pasta do projeto)
- **`app-release.aab`** → o pacote que sobe na Play
- **Ícone 512×512:** `public/icons/icon-512.png`
- **Feature graphic 1024×500:** `public/store/feature-graphic.png`
- **Keystore:** `lumi-upload.jks` (senha `LumiMpma#2026`, alias `upload`) — **guarde pra sempre**

## Falta só (você prepara)
- **Screenshots** (mín. 2 de celular): abra http://31.97.151.126:3333/web/ no Chrome →
  F12 → modo celular (Ctrl+Shift+M) → Pixel 7 → tire prints da Home, do formulário e do Acompanhar.
- **Política de privacidade** numa URL pública (obrigatória — app de denúncia). Modelo abaixo.

---

## Passo a passo (Play Console)

### 1. Enviar o app (teste interno) — você já está nessa tela
- **Teste interno → Criar versão** → arraste **`app-release.aab`** em "Solte os pacotes".
- **Nome da versão:** `1.0.0 (1)`.
- Salvar → **Avançar** → **Iniciar lançamento para teste interno**.
- Em **Testadores**: crie uma lista com seu e-mail (+ quem for testar). Eles recebem um link pra instalar pela Play.

### 2. Preencher "Painel" (obrigatório antes de produção)
No menu esquerdo, complete cada item com ✓:

**Configuração → Conteúdo do app:**
- **Política de privacidade:** cole a URL (Passo 4).
- **Acesso ao app:** "Todas as funções sem restrição" (ou explique o login de servidor).
- **Anúncios:** Não contém anúncios.
- **Segurança dos dados (Data safety):** declare que coleta denúncias (texto, opcional localização/contato); dados **criptografados em trânsito**; pode ser anônimo; não vende dados. Seja honesto — Play reprova denúncia mal declarada.
- **Classificação de conteúdo:** responda o questionário (vai dar "Livre/Adulto conforme").
- **Público-alvo:** 18+ (trata de denúncias).
- **App governamental:** se perguntar, marque que representa órgão público (MPMA) — pode pedir comprovação.

### 3. Ficha da loja (Store listing)
- **Nome:** LUMI
- **Descrição curta (80):** "Canal oficial de denúncias do Ministério Público do Maranhão."
- **Descrição completa:** (sugestão)
  > A LUMI é o aplicativo oficial do Ministério Público do Estado do Maranhão para
  > registrar denúncias com segurança e sigilo. Denuncie situações envolvendo crianças
  > e adolescentes, idosos e pessoas vulneráveis, e o meio ambiente. Sua denúncia pode
  > ser anônima e você acompanha o andamento pelo número de protocolo.
- **Ícone:** `public/icons/icon-512.png`
- **Feature graphic:** `public/store/feature-graphic.png`
- **Screenshots:** os que você tirou.

### 4. Política de privacidade (obrigatória)
Publique um texto numa URL (ex.: no seu site ou uma página simples). Deve dizer:
- Quais dados coleta (conteúdo da denúncia, e opcionalmente localização/contato).
- Que a denúncia pode ser **anônima**.
- Base legal (LGPD 13.709/2018), finalidade, retenção, com quem compartilha (MPMA).
- Canal de contato (Ouvidoria do MPMA).
> Valide com o jurídico do MPMA. Posso gerar esse texto + hospedar no VPS se quiser.

### 5. Enviar para revisão
- Com tudo ✓, vá em **Produção → Criar versão** → suba o mesmo `.aab` → **Enviar para revisão**.
- Revisão de app de governo/denúncia: de alguns dias a ~2 semanas.

---

## Atualizar o app depois
Mudou o código → me chama → eu re-buildo no VPS (mesma keystore) → você sobe o novo `.aab`.
Sempre incremente a versão em `mobile/pubspec.yaml` (`version: 1.0.1+2`, etc.).

## HTTPS (importante p/ produção)
Hoje o app fala com a API em HTTP no IP (só teste). Para produção séria, o certo é
**domínio + HTTPS** na API (posso configurar no seu VPS com um subdomínio, sem mexer
nos sites atuais). Recomendo antes de divulgar em massa.
