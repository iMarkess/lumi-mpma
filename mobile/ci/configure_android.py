#!/usr/bin/env python3
"""Configura o projeto Android gerado pelo `flutter create` para release na Play.

Executar com working-directory = mobile/  (depois de `flutter create --platforms=android .`):

    python3 ci/configure_android.py

Por que este script existe
--------------------------
O AAB 1.0.3 publicado na Play instalava mas NAO abria. Causa comprovada:
o R8 do AGP 9 roda com `isObfuscationEnabled=true` + `isShrinkingEnabled=true`
por padrao no buildType release. Sem keep-rules, ele removeu/renomeou todo o
embedding Flutter e a propria `MainActivity`. O AndroidManifest continuava
apontando para `br.com.lumi.denuncia.MainActivity`, que nao existia mais no
classes.dex -> ClassNotFoundException -> processo morto no launch.

Evidencia no app-release.aab antigo:
    dex "MainActivity"                 -> 0 ocorrencias
    dex "io/flutter/embedding/android" -> 0 ocorrencias
    classes.dex                        -> 586 KB (deveria ter varios MB)

O que ele garante
-----------------
1. applicationId / namespace = br.com.lumi.denuncia (o package JA PUBLICADO;
   nao pode mudar nunca mais, senao a Play rejeita o upload).
2. minifyEnabled = false e shrinkResources = false no release.
3. Assinatura de release lida de android/key.properties.
4. MainActivity em FlutterFragmentActivity (exigencia do plugin local_auth).
5. Permissao INTERNET no manifest principal (o template so poe em debug/profile).
6. proguard-rules.pro com keeps corretos, caso alguem religue o minify no futuro.
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

APPLICATION_ID = "br.com.lumi.denuncia"
APP_LABEL = "LUMI"
MIN_SDK = 23

ROOT = Path(__file__).resolve().parent.parent  # mobile/
ANDROID = ROOT / "android"
APP = ANDROID / "app"
MAIN = APP / "src" / "main"

MARKER = "LUMI_ANDROID_RELEASE_CONFIG"


def fail(msg: str) -> None:
    print(f"ERRO: {msg}", file=sys.stderr)
    raise SystemExit(1)


# --------------------------------------------------------------------------- #
# 1. build.gradle (Kotlin DSL ou Groovy)
# --------------------------------------------------------------------------- #

GRADLE_KTS_BLOCK = f"""
// ===== {MARKER} — gerado por ci/configure_android.py. Nao editar a mao. =====
// Gradle aceita reabrir o bloco `android {{ }}`; sobrescrevemos so o que importa,
// sem depender do formato exato do template do Flutter (que muda entre versoes).
android {{
    namespace = "{APPLICATION_ID}"

    defaultConfig {{
        applicationId = "{APPLICATION_ID}"
        minSdk = {MIN_SDK}
    }}

    signingConfigs {{
        if (lumiKeystoreFile.exists()) {{
            create("release") {{
                keyAlias = lumiKeystore["keyAlias"] as String?
                keyPassword = lumiKeystore["keyPassword"] as String?
                storeFile = (lumiKeystore["storeFile"] as String?)?.let {{ file(it) }}
                storePassword = lumiKeystore["storePassword"] as String?
            }}
        }}
    }}

    buildTypes {{
        getByName("release") {{
            // NAO religar sem antes validar o AAB: foi isto que quebrou a 1.0.3.
            isMinifyEnabled = false
            isShrinkResources = false
            signingConfig = signingConfigs.findByName("release")
                ?: signingConfigs.getByName("debug")
        }}
    }}
}}
"""

GRADLE_KTS_HEADER = """import java.io.FileInputStream
import java.util.Properties

val lumiKeystore = Properties()
val lumiKeystoreFile = rootProject.file("key.properties")
if (lumiKeystoreFile.exists()) {
    FileInputStream(lumiKeystoreFile).use { lumiKeystore.load(it) }
}
"""

GRADLE_GROOVY_BLOCK = f"""
// ===== {MARKER} — gerado por ci/configure_android.py. Nao editar a mao. =====
def lumiKeystore = new Properties()
def lumiKeystoreFile = rootProject.file('key.properties')
if (lumiKeystoreFile.exists()) {{
    lumiKeystoreFile.withInputStream {{ lumiKeystore.load(it) }}
}}

android {{
    namespace '{APPLICATION_ID}'

    defaultConfig {{
        applicationId '{APPLICATION_ID}'
        minSdkVersion {MIN_SDK}
    }}

    signingConfigs {{
        if (lumiKeystoreFile.exists()) {{
            release {{
                keyAlias lumiKeystore['keyAlias']
                keyPassword lumiKeystore['keyPassword']
                storeFile lumiKeystore['storeFile'] ? file(lumiKeystore['storeFile']) : null
                storePassword lumiKeystore['storePassword']
            }}
        }}
    }}

    buildTypes {{
        release {{
            minifyEnabled false
            shrinkResources false
            signingConfig signingConfigs.findByName('release') ?: signingConfigs.debug
        }}
    }}
}}
"""


def patch_build_gradle() -> None:
    kts = APP / "build.gradle.kts"
    groovy = APP / "build.gradle"

    if kts.exists():
        text = kts.read_text(encoding="utf-8")
        if MARKER in text:
            print("build.gradle.kts ja configurado — pulando.")
            return
        # imports do Kotlin precisam ficar no topo do arquivo
        text = GRADLE_KTS_HEADER + "\n" + text + GRADLE_KTS_BLOCK
        kts.write_text(text, encoding="utf-8")
        print(f"build.gradle.kts configurado (applicationId={APPLICATION_ID}, minify=off).")
    elif groovy.exists():
        text = groovy.read_text(encoding="utf-8")
        if MARKER in text:
            print("build.gradle ja configurado — pulando.")
            return
        groovy.write_text(text + GRADLE_GROOVY_BLOCK, encoding="utf-8")
        print(f"build.gradle configurado (applicationId={APPLICATION_ID}, minify=off).")
    else:
        fail("android/app/build.gradle[.kts] nao encontrado — rode `flutter create` antes.")


# --------------------------------------------------------------------------- #
# 2. AndroidManifest.xml principal
# --------------------------------------------------------------------------- #

PERMISSIONS = [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.USE_BIOMETRIC",
    "android.permission.POST_NOTIFICATIONS",
]


def patch_manifest() -> None:
    manifest = MAIN / "AndroidManifest.xml"
    if not manifest.exists():
        fail("AndroidManifest.xml nao encontrado — rode `flutter create` antes.")

    text = manifest.read_text(encoding="utf-8")

    # Nome exibido do app.
    text = re.sub(r'android:label="[^"]*"', f'android:label="{APP_LABEL}"', text, count=1)

    # A activity fica referenciada de forma relativa (".MainActivity"), assim ela
    # acompanha o applicationId e nunca aponta pra um package que nao existe.
    text = re.sub(
        r'android:name="[\w.]*MainActivity"',
        'android:name=".MainActivity"',
        text,
        count=1,
    )

    # Permissoes: o template do Flutter so declara INTERNET nos manifests de
    # debug/profile. Em release o app fica sem rede.
    missing = [p for p in PERMISSIONS if f'android:name="{p}"' not in text]
    if missing:
        block = "\n".join(f'    <uses-permission android:name="{p}"/>' for p in missing)
        text = text.replace("<application", block + "\n\n    <application", 1)

    manifest.write_text(text, encoding="utf-8")
    print(f"AndroidManifest.xml configurado (label={APP_LABEL}, +{len(missing)} permissoes).")


# --------------------------------------------------------------------------- #
# 3. MainActivity
# --------------------------------------------------------------------------- #

MAIN_ACTIVITY = f"""package {APPLICATION_ID}

import io.flutter.embedding.android.FlutterFragmentActivity

// FlutterFragmentActivity (e nao FlutterActivity): o plugin local_auth exige uma
// FragmentActivity para exibir o prompt biometrico. Com FlutterActivity ele
// lanca `no_fragment_activity` na primeira chamada de biometria.
class MainActivity : FlutterFragmentActivity()
"""


def write_main_activity() -> None:
    kotlin_root = MAIN / "kotlin"
    java_root = MAIN / "java"

    # Remove qualquer MainActivity gerada em outro package (org do flutter create).
    for root in (kotlin_root, java_root):
        if root.exists():
            shutil.rmtree(root)

    target = kotlin_root.joinpath(*APPLICATION_ID.split("."))
    target.mkdir(parents=True, exist_ok=True)
    (target / "MainActivity.kt").write_text(MAIN_ACTIVITY, encoding="utf-8")
    print(f"MainActivity.kt escrita em {APPLICATION_ID} (FlutterFragmentActivity).")


# --------------------------------------------------------------------------- #
# 4. proguard-rules.pro (rede de seguranca)
# --------------------------------------------------------------------------- #

PROGUARD = """# Keeps da LUMI. O release sai com minifyEnabled=false, mas se alguem religar
# o R8 sem estas regras o app volta a instalar e nao abrir.

# Activity de entrada declarada no manifest.
-keep class br.com.lumi.denuncia.MainActivity { *; }

# Embedding Flutter (carregado por reflexao pelo runtime nativo).
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }
-dontwarn io.flutter.embedding.**

# Google Sign-In / Play Services.
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# local_auth (AndroidX biometric).
-keep class androidx.biometric.** { *; }
-keep class androidx.fragment.app.** { *; }
"""


def write_proguard() -> None:
    (APP / "proguard-rules.pro").write_text(PROGUARD, encoding="utf-8")
    print("proguard-rules.pro escrito.")


# --------------------------------------------------------------------------- #

def main() -> None:
    if not ANDROID.exists():
        fail("pasta android/ nao existe — rode `flutter create --platforms=android .` antes.")
    patch_build_gradle()
    patch_manifest()
    write_main_activity()
    write_proguard()
    print(f"\nOK — Android pronto para release. applicationId={APPLICATION_ID}")


if __name__ == "__main__":
    main()
