import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runFullPlaytest() {
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

  // 1. Fill Trainee Name & Start Game
  const nameInput = page.locator('input[type="text"]');
  await nameInput.fill('นายสมชาย ช่างไอที (ปวช. 21909-2020)');
  const startBtn = page.getByRole('button', { name: /เข้าสู่ Smart Mart/i });
  await startBtn.click();
  await page.waitForTimeout(1000);

  // Dispatch test event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('TEST_COMPLETE_ALL_MISSIONS'));
  });

  // Let's open Notebook Tab
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);

  // Complete Mission 3 & 4 on UI
  await page.getByRole('button', { name: /โต๊ะปฏิบัติการ/i }).click();
  await page.waitForTimeout(300);

  const selects = await page.locator('select').all();
  if (selects.length >= 5) {
    await selects[0].selectOption('FUNC_CAMERA');
    await selects[1].selectOption('FUNC_POE_SWITCH');
    await selects[2].selectOption('FUNC_NVR');
    await selects[3].selectOption('FUNC_ROUTER');
    await selects[4].selectOption('FUNC_CLIENT_PC');
  }

  const analogButtons = await page.getByRole('button', { name: 'Analog' }).all();
  if (analogButtons.length >= 8) {
    await analogButtons[0].click();
    await analogButtons[2].click();
    await analogButtons[6].click();
  }
  const ipButtons = await page.getByRole('button', { name: 'IP CCTV' }).all();
  if (ipButtons.length >= 8) {
    await ipButtons[1].click();
    await ipButtons[3].click();
    await ipButtons[4].click();
    await ipButtons[5].click();
    await ipButtons[7].click();
  }

  // Now trigger full lab wiring completion in store to test 100/100 score
  await page.evaluate(() => {
    // Dispatch custom event to trigger store actions
    window.dispatchEvent(new CustomEvent('TEST_COMPLETE_ALL_MISSIONS'));
  });

  await page.waitForTimeout(500);

  // Switch to Checklist tab to see updated score
  await page.getByRole('button', { name: /ภารกิจ 5 ขั้น/i }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '08_checklist_full_score.png') });
  console.log('Saved 08_checklist_full_score.png');

  // Switch to Certificate tab
  await page.getByRole('button', { name: /ใบรับรองการฝึก/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '09_official_certificate.png') });
  console.log('Saved 09_official_certificate.png');

  await browser.close();
  console.log(`Full Playtest finished. Total errors: ${errors.length}`);
}

runFullPlaytest().catch((e) => {
  console.error('Full Playtest error:', e);
  process.exit(1);
});
