import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT_DIR = 'playstore';
const RAW_DIR = 'playstore/raw-screenshots';

const screenshotsData = [
  {
    num: 1,
    title: 'SOU A LUMI',
    subtitle: 'Sua assistente digital no combate à violência.',
    rawFile: 'raw-1.png'
  },
  {
    num: 2,
    title: 'DENUNCIE COM SEGURANÇA',
    subtitle: 'Canais oficiais de proteção a direitos.',
    rawFile: 'raw-2.png'
  },
  {
    num: 3,
    title: 'SIMPLES E DIRETO',
    subtitle: 'Sem termos técnicos ou formulários complexos.',
    rawFile: 'raw-3.png'
  },
  {
    num: 4,
    title: 'ACOMPANHE O STATUS',
    subtitle: 'Consulte a evolução do seu caso pelo protocolo.',
    rawFile: 'raw-4.png'
  }
];

async function composeScreenshots() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Gerando as screenshots para a Play Store...');

  for (const s of screenshotsData) {
    const rawPath = `${RAW_DIR}/${s.rawFile}`;
    
    // 1. Criar o fundo com gradiente e luzes decorativas
    const bgSvg = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#021B3A" />
            <stop offset="50%" stop-color="#002D62" />
            <stop offset="100%" stop-color="#050C1A" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#bgGrad)" />
        <circle cx="1080" cy="400" r="500" fill="#00458E" opacity="0.25" filter="blur(80px)" />
        <circle cx="0" cy="1500" r="400" fill="#D4AF37" opacity="0.08" filter="blur(100px)" />
      </svg>
    `;

    // 2. Criar a moldura do celular e os textos de título/subtítulo
    const overlaySvg = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE57F" />
            <stop offset="100%" stop-color="#D4AF37" />
          </linearGradient>
        </defs>
        
        <!-- Título -->
        <text x="540" y="160" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="54" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="2">
          ${s.title}
        </text>
        
        <!-- Subtítulo -->
        <text x="540" y="235" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="500" fill="#E2E8F0" text-anchor="middle">
          ${s.subtitle}
        </text>
        
        <!-- Sombra do Celular -->
        <rect x="155" y="375" width="770" height="1490" rx="55" ry="55" fill="#000000" opacity="0.5" filter="blur(15px)" />

        <!-- Corpo do Celular (Outer border) -->
        <rect x="160" y="380" width="760" height="1480" rx="55" ry="55" fill="none" stroke="#1F2937" stroke-width="8" />
        <rect x="163" y="383" width="754" height="1474" rx="52" ry="52" fill="none" stroke="#4B5563" stroke-width="2" />
        
        <!-- Ilha Dinâmica / Notch -->
        <rect x="440" y="405" width="200" height="42" rx="21" ry="21" fill="#090D16" />
        
        <!-- Alto-falante -->
        <rect x="515" y="395" width="50" height="4" rx="2" ry="2" fill="#4B5563" />
      </svg>
    `;

    // 3. Criar a máscara para arredondar os cantos do print do app
    const maskSvg = `
      <svg width="730" height="1450" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="730" height="1450" rx="36" ry="36" fill="#FFFFFF" />
      </svg>
    `;

    // 4. Redimensionar e aplicar cantos arredondados na screenshot
    console.log(`Formatando e arredondando cantos de ${rawPath}...`);
    const roundedScreenshot = await sharp(rawPath)
      .resize(730, 1450, { fit: 'fill' })
      .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
      .png()
      .toBuffer();

    // 5. Montar a imagem final
    console.log(`Montando composição final da Screenshot ${s.num}...`);
    await sharp(Buffer.from(bgSvg))
      .composite([
        { input: roundedScreenshot, left: 175, top: 395 },
        { input: Buffer.from(overlaySvg), left: 0, top: 0 }
      ])
      .png()
      .toFile(`${OUT_DIR}/screenshot-${s.num}.png`);
  }

  console.log('Screenshots compostas salvas com sucesso em', OUT_DIR);
}

async function composeFeatureGraphic() {
  console.log('Compondo o Feature Graphic (1024x500)...');

  const bgSvg = `
    <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#021B3A" />
          <stop offset="60%" stop-color="#002D62" />
          <stop offset="100%" stop-color="#09142A" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFE57F" />
          <stop offset="100%" stop-color="#D4AF37" />
        </linearGradient>
      </defs>
      
      <!-- Fundo -->
      <rect width="1024" height="500" fill="url(#bgGrad)" />
      
      <!-- Detalhes de brilho de fundo -->
      <circle cx="900" cy="250" r="300" fill="#00458E" opacity="0.4" filter="blur(60px)" />
      <circle cx="100" cy="400" r="250" fill="#D4AF37" opacity="0.08" filter="blur(75px)" />
      
      <!-- Linhas decorativas douradas (subtis) -->
      <path d="M 0,400 Q 300,450 600,350 T 1024,420" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.15" />
      <path d="M 0,420 Q 350,480 700,320 T 1024,380" fill="none" stroke="url(#goldGrad)" stroke-width="1" opacity="0.1" />

      <!-- Textos principais -->
      <!-- Nome do App -->
      <text x="60" y="140" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="64" font-weight="900" fill="url(#goldGrad)" letter-spacing="1">
        LUMI MPMA
      </text>
      
      <!-- Descrição da Entidade -->
      <text x="65" y="195" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#9CA3AF" letter-spacing="1.5">
        MINISTÉRIO PÚBLICO DO MARANHÃO
      </text>

      <!-- Slogan solicitado -->
      <text x="65" y="275" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" width="550">
        LUMI COM VOCÊ
      </text>
      <text x="65" y="325" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="800" fill="#FFE57F">
        NA PROTEÇÃO DA VIDA!
      </text>
      
      <!-- Rodapé de canais oficiais -->
      <text x="65" y="440" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#9CA3AF" letter-spacing="1">
        • CANAL OFICIAL DE DENÚNCIAS E DEFESA DE DIREITOS
      </text>
    </svg>
  `;

  // Carregar os arquivos auxiliares para compor
  const mascotPath = 'public/images/lumi_mascot_premium.png';
  const logoMpmaPath = 'public/images/logo_mpma.png';

  // Redimensionar Mascot (altura 430px)
  const mascotBuffer = await sharp(mascotPath)
    .resize({ height: 430, fit: 'contain' })
    .png()
    .toBuffer();

  // Redimensionar Logo MPMA (altura 55px)
  const logoMpmaBuffer = await sharp(logoMpmaPath)
    .resize({ height: 55, fit: 'contain' })
    .png()
    .toBuffer();

  await sharp(Buffer.from(bgSvg))
    .composite([
      { input: mascotBuffer, left: 630, top: 40 },
      { input: logoMpmaBuffer, left: 65, top: 360 }
    ])
    .png()
    .toFile(`${OUT_DIR}/feature-graphic.png`);

  console.log('Feature Graphic gerada em', `${OUT_DIR}/feature-graphic.png`);
}

async function generatePlaystoreIcon() {
  console.log('Gerando ícone oficial da Play Store (512x512)...');
  const srcIcon = 'public/images/lumi_logo.png';
  const BRAND_BG = '#00458E';

  // O ícone oficial na Play store é 512x512, com a logo centralizada (ocupando 70% da tela)
  const inner = Math.round(512 * 0.7);
  const logo = await sharp(srcIcon)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({ create: { width: 512, height: 512, channels: 4, background: BRAND_BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(`${OUT_DIR}/icon-512.png`);

  console.log('Ícone oficial da Play Store gerado em', `${OUT_DIR}/icon-512.png`);
}

async function run() {
  try {
    await composeScreenshots();
    await composeFeatureGraphic();
    await generatePlaystoreIcon();
    console.log('--- COMPOSIÇÃO DOS ASSETS CONCLUÍDA COM SUCESSO ---');
  } catch (err) {
    console.error('Erro na composição dos assets:', err);
    process.exit(1);
  }
}

run();
