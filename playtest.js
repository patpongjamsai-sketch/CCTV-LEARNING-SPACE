import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runPlaytest() {
  const outputDir = path.resolve('output/playtest');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const errors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(`Page Error: ${err.message}`);
  });

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  // 1. Capture Start Screen
  await page.screenshot({ path: path.join(outputDir, '01_start_screen.png') });
  console.log('Saved 01_start_screen.png');

  // 2. Click Start Button
  const startBtn = page.getByRole('button', { name: /เข้าสู่ Smart Mart/i });
  await startBtn.click();
  await page.waitForTimeout(1500);

  // 3. Capture Initial In-Game Scene
  await page.screenshot({ path: path.join(outputDir, '02_ingame_store_scene.png') });
  console.log('Saved 02_ingame_store_scene.png');

  // 4. Open Field Notebook (press Tab)
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '03_notebook_checklist.png') });
  console.log('Saved 03_notebook_checklist.png');

  // 5. Switch to Minimap Tab
  await page.getByRole('button', { name: /แผนผังร้าน/i }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, '04_notebook_minimap.png') });
  console.log('Saved 04_notebook_minimap.png');

  // 6. Switch to Workbenches Tab & perform Mission 3 & 4 matching
  await page.getByRole('button', { name: /โต๊ะปฏิบัติการ/i }).click();
  await page.waitForTimeout(300);

  // Match Mission 3 devices
  const selects = await page.locator('select').all();
  if (selects.length >= 5) {
    await selects[0].selectOption('FUNC_CAMERA');
    await selects[1].selectOption('FUNC_POE_SWITCH');
    await selects[2].selectOption('FUNC_NVR');
    await selects[3].selectOption('FUNC_ROUTER');
    await selects[4].selectOption('FUNC_CLIENT_PC');
  }

  // Place Mission 4 cards
  const analogButtons = await page.getByRole('button', { name: 'Analog' }).all();
  // Cards 0 (Coaxial), 2 (DVR), 6 (Analog Signal) are Analog
  if (analogButtons.length >= 8) {
    await analogButtons[0].click();
    await analogButtons[2].click();
    await analogButtons[6].click();
  }
  const ipButtons = await page.getByRole('button', { name: 'IP CCTV' }).all();
  // Cards 1 (Cat6), 3 (NVR), 4 (PoE), 5 (IP Address), 7 (Digital Packet) are IP
  if (ipButtons.length >= 8) {
    await ipButtons[1].click();
    await ipButtons[3].click();
    await ipButtons[4].click();
    await ipButtons[5].click();
    await ipButtons[7].click();
  }

  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '05_notebook_workbenches_completed.png') });
  console.log('Saved 05_notebook_workbenches_completed.png');

  // 7. Check Diagnostics Tab
  await page.getByRole('button', { name: /วิเคราะห์ระบบ/i }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, '06_notebook_diagnostics.png') });
  console.log('Saved 06_notebook_diagnostics.png');

  // 8. Close notebook
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Check Settings (Esc)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '07_settings_modal.png') });
  console.log('Saved 07_settings_modal.png');
  await page.keyboard.press('Escape');

  // Save log report
  fs.writeFileSync(
    path.join(outputDir, 'playtest_summary.json'),
    JSON.stringify(
      {
        totalLogs: consoleLogs.length,
        errorsCount: errors.length,
        errors,
        status: errors.length === 0 ? 'SUCCESS' : 'HAS_ERRORS',
      },
      null,
      2
    )
  );

  await browser.close();
  console.log(`Playtest completed. Total errors: ${errors.length}`);
}

runPlaytest().catch((e) => {
  console.error('Playtest error:', e);
  process.exit(1);
});
