# LUMI — App Flutter (Android / Play Store)

App nativo Material Design 3 do LUMI, canal independente de denúncias. Redesenho
completo mobile-first — **não** é o site num WebView. Ligado na API real do LUMI
(backend no VPS); repositórios mock só entram se `apiBaseUrl` ficar vazio.

## Stack

- **Flutter** + Material 3 (tema claro/escuro)
- **Riverpod** (estado) · **go_router** (navegação com bottom nav)
- **google_fonts** (Lexend + Inter) · **flutter_animate** (micro animações 60fps)
- **shimmer** (skeleton) · **local_auth** (biometria) · **shared_preferences** (tema/sessão)
- Clean Architecture: `data / domain / presentation` por feature

## Estrutura

```
lib/
  main.dart · app.dart
  core/
    theme/       app_colors · app_typography · app_theme
    router/      app_router (StatefulShellRoute — 5 abas)
    widgets/     app_card · section_header · status_chip · shimmer_box · empty_state
    utils/       date_format · cpf_formatter
    constants/   app_constants
  features/
    auth/          domain(user) · data(auth_repository) · presentation(login, auth_controller)
    shell/         presentation(home_shell — bottom navigation + badge)
    home/          presentation(home_screen — dashboard)
    complaints/    domain(complaint) · data(complaint_repository) · presentation(denunciar, form, acompanhar, providers)
    notifications/ domain · data · presentation
    profile/       presentation(profile_screen, theme_controller)
```

Telas: **Login** (CPF/senha/biometria/esqueci/tema/convidado) · **Home**
(saudação, indicadores, atalhos, atividades, pull-to-refresh) · **Denunciar**
(categorias + formulário com prioridade/anônimo/anexo/sucesso) · **Acompanhar**
(busca de protocolo + timeline de status) · **Notificações** (filtros + marcar
lida + badge) · **Perfil** (tema claro/escuro/auto, config, sair).

## Rodar (primeira vez)

Precisa do Flutter SDK instalado (>= 3.27) + Android Studio.

```bash
cd mobile

# 1. Gera as pastas nativas (android/ios/...) a partir do pubspec.
#    Preserva lib/ e pubspec.yaml.
flutter create . --org br.gov.ma.mp --project-name lumi_sentinela

# 2. Dependências
flutter pub get

# 3. Ícone adaptativo + splash (lê a config do pubspec.yaml)
dart run flutter_launcher_icons
dart run flutter_native_splash:create

# 4. Rodar no emulador/aparelho
flutter run
```

## Configuração Android (após `flutter create`)

- **Nome do app** — em `android/app/src/main/AndroidManifest.xml`:
  `android:label="LUMI"`
- **Application ID** — em `android/app/build.gradle`:
  `applicationId "br.gov.ma.mp.sentinela"` (não muda depois de publicar)
- **Versão** — em `pubspec.yaml`: `version: 1.0.0+1` (o `+1` é o versionCode;
  incremente a cada envio à Play)
- **Permissões** — adicione no `AndroidManifest.xml` conforme for ativando
  recursos reais:
  ```xml
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  <!-- ao anexar mídia / localização na denúncia: -->
  <uses-permission android:name="android.permission.CAMERA"/>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
  ```
- **minSdk** — o ícone adaptativo pede `minSdkVersion 23` (já no pubspec).

## Gerar o pacote da Play Store (.aab)

```bash
# Chave de assinatura (uma vez) — GUARDE o arquivo e as senhas:
keytool -genkey -v -keystore ~/sentinela-upload.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias upload

# android/key.properties (não versionar):
#   storePassword=...
#   keyPassword=...
#   keyAlias=upload
#   storeFile=/caminho/sentinela-upload.jks

flutter build appbundle --release
# saída: build/app/outputs/bundle/release/app-release.aab
```

Suba o `.aab` na Play Console (mesma tela de "teste interno").

> Sem máquina Android? Use **Codemagic** ou **GitHub Actions** (Flutter) para
> buildar o `.aab` na nuvem a partir deste repositório.

## Plugar a API real do LUMI

O app roda com mocks. Para conectar na API real, crie as implementações HTTP e
troque **só os providers**:

- `features/complaints/data/complaint_repository.dart` → `ApiComplaintRepository`
- `features/auth/data/auth_repository.dart` → `ApiAuthRepository`
- `features/notifications/data/notification_repository.dart` → `ApiNotificationRepository`

Depois aponte os providers (`complaintRepositoryProvider`, `authRepositoryProvider`,
`notificationRepositoryProvider`) para as novas classes. **Nenhuma tela muda.**

Sugestão: adicionar `dio` (HTTP) e um `ApiClient` com a base URL do LUMI +
interceptor de token. Nenhum endpoint/BD do LUMI é alterado — só consumo.
```

## Publicar NATIVO sem instalar nada (Codemagic)

Não tem Flutter/Android SDK na máquina? Use o `codemagic.yaml` na raiz do repo:

1. Suba o repositório no GitHub/GitLab.
2. https://codemagic.io → conecte o repo.
3. **Code signing (Android)** → crie um keystore com referência `lumi_keystore`.
   O Codemagic mostra o **SHA-1** — anote (usa no Google + Play).
4. Rode o workflow **android-lumi** → baixe o `.aab` → suba na Play Console.

Package name fixo: **`br.com.lumi.denuncia`** — é o applicationId já publicado na
Play. **Não pode mudar**, senão a Play Console rejeita o upload. Ele é definido em
`ci/configure_android.py` (constante `APPLICATION_ID`), não no `codemagic.yaml`.

### Por que a versão 1.0.3 instalava e não abria

O `flutter build appbundle --release` rodou com AGP 9, que liga R8 com
`isObfuscationEnabled=true` + `isShrinkingEnabled=true` por padrão. Sem keep-rules,
o R8 removeu a `MainActivity` e todo o `io.flutter.embedding.android` do
`classes.dex` (ficou em 586 KB). O manifest continuava apontando para
`br.com.lumi.denuncia.MainActivity` → `ClassNotFoundException` no launch → o
Android matava o processo. Instalava, ícone aparecia, abria e fechava na hora.

Correção, em três camadas:

1. `ci/configure_android.py` força `minifyEnabled=false` e `shrinkResources=false`
   no release, e escreve `proguard-rules.pro` caso alguém religue no futuro.
2. A `MainActivity` passou a ser referenciada como `.MainActivity` (relativa) no
   manifest — nunca mais aponta pra um package inexistente.
3. `ci/verify_aab.py` roda depois do build e **quebra o CI** se a `MainActivity`,
   o embedding do Flutter ou as libs nativas não estiverem no pacote.

O `.aab` antigo foi renomeado para `app-release-1.0.3-QUEBRADO-NAO-SUBIR.aab`
na raiz do repositório. Não suba esse arquivo.

## Dados e sessão

- **API:** `lib/core/config.dart` (`https://lumimpma.site`). Cliente HTTP em
  `lib/core/network/api_client.dart`.
- **Conta de cidadão:** `/api/citizen/{register,login,me,password,delete}`.
  Sessão (JWT) salva em `shared_preferences` — quem já entrou abre na Home.
- **Acesso anônimo:** "Continuar sem conta" — nada sobre a pessoa é enviado.
- **Minhas denúncias / notificações:** a API não lista denúncias (sigilo); os
  protocolos enviados ou consultados ficam salvos no aparelho
  (`lib/core/storage/local_store.dart`) e são consultados um a um.
- **Bloqueio por biometria:** Perfil → Segurança (`app_lock.dart`).

Login com Google foi removido (não estava configurado; a rota do backend
continua lá caso volte a ser usada).
