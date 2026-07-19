"""Injeta a assinatura de release no android/app/build.gradle.kts (CI).

Executar com working-directory = mobile/android:
    python3 ../ci/sign_gradle.py
Lê as credenciais de key.properties (criado no workflow).
"""

f = "app/build.gradle.kts"
s = open(f, encoding="utf-8").read()

# Idempotência: se já foi patchado, não faz de novo.
if "keystoreProperties" in s:
    print("build.gradle.kts já configurado — pulando.")
    raise SystemExit(0)

if "java.util.Properties" not in s:
    s = "import java.util.Properties\nimport java.io.FileInputStream\n" + s

props = """
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}
"""
s = s.replace("android {", props + "\nandroid {", 1)

signing = """    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = (keystoreProperties["storeFile"] as String?)?.let { file(it) }
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }
"""
s = s.replace("    buildTypes {", signing + "\n    buildTypes {", 1)
s = s.replace('signingConfigs.getByName("debug")', 'signingConfigs.getByName("release")')

open(f, "w", encoding="utf-8").write(s)
print("build.gradle.kts configurado para assinatura de release.")
