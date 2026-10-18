import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'screenshots');

const BROWSER_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

function findBrowserExecutable() {
  for (const p of BROWSER_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No se encontró Microsoft Edge ni Google Chrome instalado en las rutas estándar.');
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout esperando a que inicie el servidor en ${url}`);
}

async function captureAllScreens() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('🚀 Iniciando servidor backend y frontend para capturas...');
  const apiServer = spawn('node', ['server/index.js'], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
    shell: true
  });

  const viteServer = spawn('npx', ['vite', '--port', '5188', '--strictPort'], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
    shell: true
  });

  const baseUrl = 'http://localhost:5188';

  try {
    await waitForServer(baseUrl);
    console.log(`✅ Servidor listo en ${baseUrl}`);

    const executablePath = findBrowserExecutable();
    console.log(`🌐 Usando navegador: ${executablePath}`);

    const browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--disable-gpu', '--no-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5
    });

    const page = await context.newPage();

    const snap = async (name, fullPage = true) => {
      await page.waitForTimeout(450);
      const filePath = path.join(OUT_DIR, name);
      await page.screenshot({ path: filePath, fullPage });
      console.log(`📸 Capturada: ${name}`);
    };

    // 1. Club Invitado (Dark Mode - Desktop)
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await snap('01-club-invitado-dark.png');

    // 2. Club Invitado (Dark Mode - Mobile 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await snap('02-club-invitado-mobile.png');
    await page.setViewportSize({ width: 1440, height: 900 });

    // 3. Club Invitado (Light Mode - Desktop)
    const themeBtn = page.locator('button[aria-label="Cambiar tema de color"]');
    await themeBtn.click();
    await snap('03-club-invitado-light.png');
    // Volver a Dark Mode
    await themeBtn.click();
    await page.waitForTimeout(250);

    // 4. Login rápido de Socio (Mateo 10 PTS)
    const demoMateoBtn = page.locator('button:has-text("Mateo (10 PTS")');
    if (await demoMateoBtn.isVisible()) {
      await demoMateoBtn.click();
      await page.waitForTimeout(400);
      const loginBtn = page.locator('button:has-text("Entrar a mi cuenta")');
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Volver a pestaña Mi Pase & Puntos con el socio logueado
    const tabClub = page.locator('header button:has-text("Mi Pase")');
    await tabClub.click();
    await snap('04-club-socio-puntos.png');

    // 5. Pestaña Canje de Premios en MembershipCard
    const tabPremios = page.locator('button:has-text("Premios")').first();
    if (await tabPremios.isVisible()) {
      await tabPremios.click();
      await snap('05-club-socio-premios.png');
      const tabPuntos = page.locator('button:has-text("Puntos")').first();
      if (await tabPuntos.isVisible()) await tabPuntos.click();
    }

    // 6. Modal QR de Socio
    const qrBtn = page.locator('button[aria-label="Mostrar código QR de socio"], button[title*="QR"]');
    if ((await qrBtn.count()) > 0) {
      await qrBtn.first().click();
      await snap('06-club-modal-qr.png', false);
      const listoBtn = page.locator('button:has-text("Listo")');
      if (await listoBtn.isVisible()) await listoBtn.click();
    }

    // 7. Modal Lightbox de Galería de Fotos
    const galleryItem = page.locator('button:has-text("Corte + Bebida"), button:has-text("Burst Fade")').first();
    if (await galleryItem.isVisible()) {
      await galleryItem.click();
      await snap('07-club-modal-foto.png', false);
      const closePreview = page.locator('button[aria-label="Cerrar vista previa"]');
      if (await closePreview.isVisible()) await closePreview.click();
    }

    // 8. Reservar Turno — Paso 1 (Servicios y Bebida)
    const tabBook = page.locator('header button:has-text("Reservar Turno")');
    await tabBook.click();
    await snap('08-reserva-paso1-servicios.png');

    // 9. Reservar Turno — Paso 1 (Mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await snap('09-reserva-paso1-mobile.png');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Seleccionar Corte + Bebida para ver el selector de bebidas y avanzar al Paso 2
    const corteBebidaCard = page.locator('h3:has-text("Corte + Bebida")').first();
    if (await corteBebidaCard.isVisible()) {
      await corteBebidaCard.click();
    }
    const continueToStep2 = page.locator('button:has-text("Elegir Día y Horario"), button:has-text("Continuar")').first();
    if (await continueToStep2.isVisible()) {
      await continueToStep2.click();
    }

    // 10. Reservar Turno — Paso 2 (Agenda y Horario)
    await page.waitForTimeout(400);
    // Elegir un horario libre
    const availableSlot = page.locator('button:has-text("hs"):not([disabled])').first();
    if (await availableSlot.isVisible()) {
      await availableSlot.click();
    }
    await snap('10-reserva-paso2-horario.png');

    // 11. Reservar Turno — Paso 3 (Bloqueo 15 min y WhatsApp Handshake)
    const requestTurnBtn = page.locator('button:has-text("Solicitar Turno")');
    if (await requestTurnBtn.isVisible() && (await requestTurnBtn.isEnabled())) {
      await requestTurnBtn.click();
      await page.waitForTimeout(600);
      await snap('11-reserva-paso3-whatsapp.png');
    }

    // 12. Mis Turnos
    const tabTurns = page.locator('header button:has-text("Mis Turnos")');
    await tabTurns.click();
    await snap('12-mis-turnos.png');

    // 13. Modal Términos del Servicio (Footer)
    const termsBtn = page.locator('footer button:has-text("Términos del Servicio")');
    if (await termsBtn.isVisible()) {
      await termsBtn.click();
      await snap('13-modal-terminos.png', false);
      const closeTerms = page.locator('button:has-text("Entendido")');
      if (await closeTerms.isVisible()) await closeTerms.click();
    }

    // 14. Admin Login (Acceso Barbero)
    const staffBtn = page.locator('footer button[aria-label="Acceso privado del salón"]');
    await staffBtn.click();
    await snap('14-admin-login.png');

    // Cargar clave demo y entrar al panel de David
    const demoAdminBtn = page.locator('button:has-text("Cargar clave demo")');
    if (await demoAdminBtn.isVisible()) {
      await demoAdminBtn.click();
      await page.locator('button:has-text("Entrar al Panel de David")').click();
      await page.waitForTimeout(600);
    }

    // 15. Admin Tab 1: Handshake WA (Pendientes)
    await snap('15-admin-handshake-wa.png');

    // 16. Admin Tab 2: Agenda & Bloqueos
    await page.locator('button:has-text("Agenda & Bloqueos")').click();
    await snap('16-admin-agenda-bloqueos.png');

    // 17. Admin Tab 3: Caja & Cobros
    await page.locator('button:has-text("Caja & Cobros")').click();
    await snap('17-admin-caja-cobros.png');

    // 18. Admin Tab 4: Cumpleaños
    await page.locator('button:has-text("Cumpleaños")').click();
    await snap('18-admin-cumpleanos.png');

    // 19. Admin Tab 5: Socios & PINs
    await page.locator('button:has-text("Socios & PINs")').click();
    await snap('19-admin-socios-pins.png');

    // 20. Admin Modal: Precios & Config
    const configBtn = page.locator('button:has-text("Precios & Config")');
    if (await configBtn.isVisible()) {
      await configBtn.click();
      await snap('20-admin-modal-config.png', false);
      // Close modal
      const closeCfgBtn = page.locator('.fixed button:has(svg.lucide-x)').first();
      if (await closeCfgBtn.isVisible()) await closeCfgBtn.click();
    }

    // 21. Admin en Modo Claro (para auditar contraste en Light Mode)
    await page.locator('button:has-text("Agenda & Bloqueos")').click();
    await themeBtn.click();
    await snap('21-admin-light-mode.png');

    await browser.close();
    console.log(`\n✨ ¡Listo! Se guardaron todas las capturas en: ${OUT_DIR}`);
  } finally {
    apiServer.kill();
    viteServer.kill();
  }
}

captureAllScreens().catch((err) => {
  console.error('❌ Error al capturar pantallas:', err);
  process.exit(1);
});
