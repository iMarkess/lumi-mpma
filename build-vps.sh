#!/usr/bin/env bash
# Build do app LUMI (.aab) no VPS (Ubuntu/Debian). Sem GitHub Actions/nuvem paga.
#
# Uso no VPS:
#   curl -O https://raw.githubusercontent.com/iMarkess/lumi-mpma/main/build-vps.sh
#   bash build-vps.sh
#
# Recomenda >= 4GB RAM. Se der erro de memória no Gradle, crie swap (o script
# tenta criar 2GB de swap automaticamente se houver pouca RAM).

set -euo pipefail

REPO="https://github.com/iMarkess/lumi-mpma.git"
ANDROID_SDK_ROOT="$HOME/android-sdk"
FLUTTER_DIR="$HOME/flutter"
KEYSTORE="$HOME/lumi-upload.jks"
CMDTOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

echo "==> 1/8 Dependências do sistema"
$SUDO apt-get update -y
$SUDO apt-get install -y openjdk-17-jdk curl git unzip xz-utils python3

echo "==> 2/8 Swap (se RAM baixa)"
MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "${MEM_MB:-0}" -lt 3000 ] && [ ! -f /swapfile ]; then
  $SUDO fallocate -l 2G /swapfile && $SUDO chmod 600 /swapfile && $SUDO mkswap /swapfile && $SUDO swapon /swapfile || true
fi

echo "==> 3/8 Flutter (stable)"
if [ ! -d "$FLUTTER_DIR" ]; then
  git clone https://github.com/flutter/flutter.git -b stable --depth 1 "$FLUTTER_DIR"
fi
export PATH="$FLUTTER_DIR/bin:$PATH"

echo "==> 4/8 Android SDK (cmdline-tools + platform 34)"
export ANDROID_SDK_ROOT
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"
if [ ! -d "$ANDROID_SDK_ROOT/cmdline-tools/latest" ]; then
  tmp="$(mktemp -d)"
  curl -L -o "$tmp/cmdtools.zip" "$CMDTOOLS_URL"
  unzip -q "$tmp/cmdtools.zip" -d "$tmp"
  mv "$tmp/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest"
  rm -rf "$tmp"
fi
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
yes | sdkmanager --licenses >/dev/null || true
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/dev/null

echo "==> 5/8 Clonar/atualizar o repositório"
cd "$HOME"
if [ ! -d "$HOME/lumi-mpma" ]; then git clone "$REPO"; fi
cd "$HOME/lumi-mpma"
git pull --ff-only || true
cd mobile

echo "==> 6/8 Gerar plataforma Android"
flutter config --android-sdk "$ANDROID_SDK_ROOT" >/dev/null
flutter create --org br.mp --project-name lumi --platforms=android . >/dev/null
sed -i 's/android:label="[^"]*"/android:label="LUMI"/' android/app/src/main/AndroidManifest.xml

echo "==> 7/8 Chave de assinatura"
if [ -z "${STORE_PW:-}" ]; then read -rsp "Crie a senha da keystore (guarde!): " STORE_PW; echo; fi
if [ -z "${KEY_PW:-}" ]; then KEY_PW="$STORE_PW"; fi
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" -keyalg RSA -keysize 2048 -validity 10000 \
    -alias upload -storepass "$STORE_PW" -keypass "$KEY_PW" \
    -dname "CN=LUMI, OU=MPMA, O=Ministerio Publico do Maranhao, L=Sao Luis, ST=MA, C=BR"
fi
echo "----- SHA-1 / SHA-256 (guarde p/ Google/Play) -----"
keytool -list -v -keystore "$KEYSTORE" -alias upload -storepass "$STORE_PW" | grep -E "SHA1:|SHA256:"
echo "---------------------------------------------------"

cat > android/key.properties <<EOF
storePassword=$STORE_PW
keyPassword=$KEY_PW
keyAlias=upload
storeFile=$KEYSTORE
EOF
( cd android && python3 ../ci/sign_gradle.py )

echo "==> 8/8 Build do AAB (pode demorar na 1ª vez)"
flutter pub get
dart run flutter_launcher_icons || true
dart run flutter_native_splash:create || true
flutter build appbundle --release

AAB="$HOME/lumi-mpma/mobile/build/app/outputs/bundle/release/app-release.aab"
echo
echo "===================================================="
echo "PRONTO! AAB gerado em:"
echo "  $AAB"
echo "Baixe pro seu PC (do seu PC, PowerShell):"
echo "  scp usuario@IP_DO_VPS:$AAB ."
echo "Depois suba esse .aab na Play Console."
echo "GUARDE também a keystore: $KEYSTORE (+ a senha)."
echo "===================================================="
