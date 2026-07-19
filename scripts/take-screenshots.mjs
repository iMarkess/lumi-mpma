import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'playstore/raw-screenshots';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log('Iniciando o navegador Puppeteer com userDataDir isolado...');
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './.puppeteer_data',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Define viewport para simular um celular (360x715 com scale factor 3 gera imagens de 1080x2145)
  // O aspect ratio 360/715 (0.503) coincide exatamente com o da tela do mockup (730/1450)
  await page.setViewport({
    width: 360,
    height: 715,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  // Configura um User Agent de dispositivo móvel
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');

  // Primeiro navega para definir o domínio no localStorage
  console.log(`Navegando para ${BASE_URL}...`);
  await page.goto(`${BASE_URL}/entrar`);
  
  console.log('Injetando credenciais de teste no localStorage...');
  await page.evaluate(() => {
    localStorage.setItem('sentinela_citizen', JSON.stringify({
      token: 'local-demo',
      user: {
        id: '12345678901',
        name: 'Maria Silva',
        cpf: '12345678901',
        email: 'maria@silva.com'
      }
    }));
  });

  // Navega para a Home logada
  console.log('Navegando para a Home do App...');
  await page.goto(`${BASE_URL}/app?source=pwa`);
  await page.evaluate(() => {
    document.body.style.webkitFontSmoothing = 'antialiased';
    // Remove qualquer transição excessiva para evitar capturar frames pretos ou em transição lenta
    const style = document.createElement('style');
    style.innerHTML = `* { transition-duration: 0s !important; animation-duration: 0s !important; }`;
    document.head.appendChild(style);
  });
  await new Promise(r => setTimeout(r, 2000)); // espera

  console.log('Capturando Tela 1: Boas-vindas...');
  await page.screenshot({ path: `${OUT_DIR}/raw-1.png` });

  // Rola a tela para mostrar as categorias de denúncia
  console.log('Rolando para as categorias de denúncia...');
  await page.evaluate(() => {
    window.scrollTo(0, 260);
  });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Capturando Tela 2: Categorias...');
  await page.screenshot({ path: `${OUT_DIR}/raw-2.png` });

  // Navega para o formulário de denúncia de criança
  console.log('Navegando para o formulário de denúncia (Criança/Adolescente)...');
  await page.goto(`${BASE_URL}/denunciar/child?source=app`);
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `* { transition-duration: 0s !important; animation-duration: 0s !important; }`;
    document.head.appendChild(style);
  });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Capturando Tela 3: Formulário de Denúncia...');
  await page.screenshot({ path: `${OUT_DIR}/raw-3.png` });

  // Navega para acompanhar protocolo
  console.log('Navegando para tela de Acompanhamento...');
  await page.goto(`${BASE_URL}/acompanhar?source=app`);
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `* { transition-duration: 0s !important; animation-duration: 0s !important; }`;
    document.head.appendChild(style);
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Preenchendo protocolo e buscando...');
  await page.type('input[placeholder*="MPMA-"]', 'MPMA-X82J91');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000)); // espera o resultado

  console.log('Capturando Tela 4: Status do Protocolo...');
  await page.screenshot({ path: `${OUT_DIR}/raw-4.png` });

  await browser.close();
  console.log('Screenshots capturadas com sucesso!');
}

main().catch(err => {
  console.error('Erro na execução do script:', err);
  process.exit(1);
});
