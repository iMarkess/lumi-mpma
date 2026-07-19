/**
 * Gera todos os ícones PWA / PlayStore a partir da logo LUMI.
 * Uso: node scripts/generate-icons.mjs
 * Requer: sharp (já presente em node_modules).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/images/lumi_logo.png'; // logo LUMI (transparente)
const OUT = 'public/icons';

await mkdir(OUT, { recursive: true });

const BRAND_BG = '#00458E'; // MPMA Blue (fundo dos maskable)
const ANY_BG = '#FFFFFF'; // fundo branco dos ícones "any"

// Ícones "any" — logo sobre branco, com leve respiro.
async function anyIcon(size, file) {
  const inner = Math.round(size * 0.86);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: ANY_BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${OUT}/${file}`);
}

// Ícones "maskable" — logo 70% centralizado sobre o azul da marca.
async function maskableIcon(size, file) {
  const inner = Math.round(size * 0.7);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${OUT}/${file}`);
}

await anyIcon(192, 'icon-192.png');
await anyIcon(512, 'icon-512.png');
await anyIcon(180, 'apple-touch-icon.png');
await maskableIcon(192, 'maskable-192.png');
await maskableIcon(512, 'maskable-512.png');
await anyIcon(32, 'favicon-32.png');
await anyIcon(16, 'favicon-16.png');
await anyIcon(96, 'shortcut-denunciar.png');
await anyIcon(96, 'shortcut-acompanhar.png');

console.log('Ícones LUMI gerados em', OUT);
