#!/usr/bin/env python3
"""Valida o .aab ANTES de subir na Play. Quebra o build se o pacote estiver morto.

    python3 ci/verify_aab.py build/app/outputs/bundle/release/app-release.aab

Existe por causa da 1.0.3: o AAB subiu, passou na revisao, instalou — e nunca
abriu, porque o R8 tinha apagado a MainActivity e o embedding Flutter do dex.
Nada no build falhou. Este script transforma esse tipo de falha silenciosa em
erro de CI.

Checagens:
  1. libapp.so + libflutter.so presentes em arm64-v8a e armeabi-v7a.
  2. MainActivity presente no classes.dex.
  3. Classes de io/flutter/embedding/android presentes no classes.dex.
  4. assets/flutter_assets/ presente.
  5. classes.dex com tamanho plausivel (R8 agressivo derruba isso pra ~500 KB).
"""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

APPLICATION_ID = "br.com.lumi.denuncia"
MIN_DEX_BYTES = 1_500_000  # app Flutter + Play Services fica bem acima disto

REQUIRED_LIBS = [
    "base/lib/arm64-v8a/libapp.so",
    "base/lib/arm64-v8a/libflutter.so",
    "base/lib/armeabi-v7a/libapp.so",
    "base/lib/armeabi-v7a/libflutter.so",
]


def main() -> None:
    if len(sys.argv) < 2:
        print("uso: verify_aab.py <caminho/para/app-release.aab>", file=sys.stderr)
        raise SystemExit(2)

    aab = Path(sys.argv[1])
    if not aab.exists():
        print(f"FALHA: {aab} nao existe.", file=sys.stderr)
        raise SystemExit(1)

    problems: list[str] = []
    notes: list[str] = []

    with zipfile.ZipFile(aab) as z:
        names = set(z.namelist())

        for lib in REQUIRED_LIBS:
            if lib not in names:
                problems.append(f"biblioteca nativa ausente: {lib}")

        if not any(n.startswith("base/assets/flutter_assets/") for n in names):
            problems.append("base/assets/flutter_assets/ ausente — bundle sem os assets do Flutter")

        dex_names = sorted(n for n in names if n.startswith("base/dex/") and n.endswith(".dex"))
        if not dex_names:
            problems.append("nenhum classes.dex no bundle")
        else:
            blob = b"".join(z.read(n) for n in dex_names)
            total = len(blob)
            notes.append(f"dex: {len(dex_names)} arquivo(s), {total / 1e6:.2f} MB")

            if b"MainActivity" not in blob:
                problems.append(
                    "MainActivity NAO esta no dex — o app vai instalar e fechar no launch "
                    "(ClassNotFoundException). Foi exatamente o bug da 1.0.3."
                )
            if b"io/flutter/embedding/android" not in blob:
                problems.append(
                    "classes de io.flutter.embedding.android ausentes no dex — "
                    "R8 comeu o embedding do Flutter. Confira minifyEnabled=false."
                )
            if APPLICATION_ID.replace(".", "/").encode() not in blob:
                problems.append(f"nenhuma classe do package {APPLICATION_ID} no dex")
            if total < MIN_DEX_BYTES:
                problems.append(
                    f"dex com apenas {total / 1e6:.2f} MB — pequeno demais para este app; "
                    "sinal classico de shrinking agressivo"
                )

        if "BUNDLE-METADATA/com.android.tools/r8.json" in names:
            r8 = z.read("BUNDLE-METADATA/com.android.tools/r8.json").decode("utf-8", "replace")
            if '"isObfuscationEnabled":true' in r8:
                problems.append("R8 com ofuscacao LIGADA no release — desligue (minifyEnabled=false)")

    for n in notes:
        print(f"  · {n}")

    if problems:
        print("\nAAB REPROVADO:\n", file=sys.stderr)
        for p in problems:
            print(f"  ✗ {p}", file=sys.stderr)
        print("\nNAO suba este pacote na Play Console.", file=sys.stderr)
        raise SystemExit(1)

    print(f"\nAAB aprovado — {aab.name} pode subir na Play Console.")


if __name__ == "__main__":
    main()
