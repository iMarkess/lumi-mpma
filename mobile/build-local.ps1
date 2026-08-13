# Builda o app-release.aab assinado NESTA MAQUINA, sem Codemagic e sem GitHub
# Actions. Uso, a partir da raiz do repositorio:
#
#     powershell -ExecutionPolicy Bypass -File mobile\build-local.ps1 -StorePassword 'SUA_SENHA'
#
# Leva ~20 min na primeira vez (Gradle baixa a distribuicao e o NDK) e ~3 min
# nas seguintes.
#
# Pre-requisitos, ja instalados em C:\dev:
#   C:\dev\jdk17          JDK 17 (Temurin)
#   C:\dev\flutter        Flutter SDK
#   C:\dev\android-sdk    Android SDK (platform 36, build-tools 36.0.0)
#
# Por que copia para C:\dev\lumi-build em vez de buildar no lugar:
# o repositorio mora em "OneDrive\Área de Trabalho", e o Gradle quebra com o
# acento no caminho. O OneDrive tambem sincroniza os artefatos no meio do build.

param(
    [Parameter(Mandatory = $true)]
    [string]$StorePassword,

    [string]$KeyPassword = $null,
    [string]$KeyAlias = 'upload',
    [string]$Keystore = $null
)

$ErrorActionPreference = 'Stop'

if (-not $KeyPassword) { $KeyPassword = $StorePassword }

$repo = Split-Path -Parent $PSScriptRoot
if (-not $Keystore) { $Keystore = Join-Path $repo 'lumi-upload.jks' }

$jdk = 'C:\dev\jdk17'
$sdk = 'C:\dev\android-sdk'
$flutterBin = 'C:\dev\flutter\bin'
$work = 'C:\dev\lumi-build'
$py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"

foreach ($p in @($jdk, $sdk, $flutterBin, $Keystore, $py)) {
    if (-not (Test-Path $p)) { throw "Nao encontrado: $p" }
}

$env:JAVA_HOME = $jdk
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:PATH = "$flutterBin;$jdk\bin;$sdk\platform-tools;$env:PATH"

Write-Host "==> sincronizando mobile/ para $work" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $work | Out-Null
# /XD android: a pasta nativa e sempre regerada; copiar a antiga por cima
# deixaria restos de uma configuracao anterior.
robocopy "$repo\mobile" "$work\mobile" /E /PURGE /NFL /NDL /NJH /NJS /XD build .dart_tool .gradle android ios | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy falhou (codigo $LASTEXITCODE)" }
$global:LASTEXITCODE = 0

Push-Location "$work\mobile"
try {
    Write-Host "==> gerando a plataforma android" -ForegroundColor Cyan
    # A org aqui e irrelevante: configure_android.py reescreve namespace e
    # applicationId para br.com.lumi.denuncia, o package publicado na Play.
    flutter create --platforms=android --org br.com.lumi . | Out-Null

    Write-Host "==> instalando a chave de assinatura" -ForegroundColor Cyan
    Copy-Item $Keystore "$work\mobile\android\app\upload-keystore.jks" -Force
    @(
        "storePassword=$StorePassword"
        "keyPassword=$KeyPassword"
        "keyAlias=$KeyAlias"
        'storeFile=upload-keystore.jks'
    ) | Set-Content -Path "$work\mobile\android\key.properties" -Encoding ascii

    Write-Host "==> normalizando a configuracao android" -ForegroundColor Cyan
    & $py ci\configure_android.py

    Write-Host "==> dependencias" -ForegroundColor Cyan
    flutter pub get | Out-Null

    Write-Host "==> icone + splash" -ForegroundColor Cyan
    dart run flutter_launcher_icons | Out-Null
    dart run flutter_native_splash:create | Out-Null
    # Os dois reescrevem o AndroidManifest: reaplica o patch por cima, senao
    # perde o label, as permissoes e a MainActivity relativa.
    & $py ci\configure_android.py

    Write-Host "==> build (release)" -ForegroundColor Cyan
    flutter build appbundle --release
    if ($LASTEXITCODE -ne 0) { throw "flutter build falhou" }

    $aab = "$work\mobile\build\app\outputs\bundle\release\app-release.aab"

    Write-Host "==> verificando o pacote" -ForegroundColor Cyan
    & $py ci\verify_aab.py $aab
    if ($LASTEXITCODE -ne 0) { throw 'AAB reprovado — nao suba na Play' }

    $version = ((Get-Content "$work\mobile\pubspec.yaml") -match '^version:')[0] -replace '^version:\s*', ''
    $name = 'LUMI-' + ($version -replace '\+', '-') + '-SUBIR-ESTE.aab'
    Copy-Item $aab (Join-Path $repo $name) -Force

    Write-Host ''
    Write-Host "PRONTO: $(Join-Path $repo $name)" -ForegroundColor Green
    Write-Host 'Confira a impressao digital abaixo — precisa bater com a chave de upload no Play Console:'
    & "$jdk\bin\keytool.exe" -printcert -jarfile $aab |
        Select-String -Pattern 'SHA1:|SHA256:' | Select-Object -First 2 |
        ForEach-Object { '   ' + $_.Line.Trim() }
}
finally {
    Pop-Location
}
