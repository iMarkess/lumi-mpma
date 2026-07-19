#!/usr/bin/env bash
# Publica o site (Next.js static export) em https://lumimpma.site (VPS).
# Uso (na raiz do projeto, com o repo já commitado):  bash deploy-site.sh
set -euo pipefail

VPS="root@31.97.151.126"
API="https://lumimpma.site"

echo "==> build (API embutida: $API)"
NEXT_PUBLIC_API_URL="$API" npm run build

echo "==> empacota out/"
tar czf /tmp/site.tgz -C out .

echo "==> envia + extrai no VPS (/var/www/lumimpma)"
scp /tmp/site.tgz "$VPS":/root/site.tgz
ssh "$VPS" 'rm -rf /var/www/lumimpma && mkdir -p /var/www/lumimpma && tar xzf /root/site.tgz -C /var/www/lumimpma && rm /root/site.tgz && systemctl reload nginx'

echo "==> pronto: https://lumimpma.site"
