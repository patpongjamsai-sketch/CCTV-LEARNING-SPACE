import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testDioramaOrbit() {
  const outputDir = path.resolve('output/room102_smart_school');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to Room 102...');
  await page.goto(
    'http://localhost:3000/labs/3d/room-102?student_code=TEST102&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const startBtn = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(1500);
  }

  // Open Station 1
  const st1Btn = page.getByRole('button', { name: /ผังภายนอก/i }).first();
  await st1Btn.click();
  await page.waitForTimeout(1000);

  // Take screenshot of default isometric view
  await page.screenshot({ path: path.join(outputDir, 'diorama_01_default_isometric.png') });
  console.log('Saved diorama_01_default_isometric.png');

  // Perform mouse drag to rotate the 3D Diorama
  // The Canvas is in the left column
  const canvas = page.locator('canvas').first();
  const box = await canvas.boundingBox();
  if (box) {
    const startX = box.x + box.width * 0.5;
    const startY = box.y + box.height * 0.5;

    // Drag left-to-right & down-to-up to orbit
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 180, startY - 80, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    await page.screenshot({ path: path.join(outputDir, 'diorama_02_rotated_angle.png') });
    console.log('Saved diorama_02_rotated_angle.png');
  }

  // Click Top-down view button
  const topDownBtn = page.getByRole('button', { name: /ผังมุมบน/i }).first();
  if (await topDownBtn.isVisible()) {
    await topDownBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, 'diorama_03_topdown_view.png') });
    console.log('Saved diorama_03_topdown_view.png');
  }

  // Click Reset angle button
  const resetBtn = page.getByRole('button', { name: /รีเซ็ตมุม/i }).first();
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, 'diorama_04_reset_isometric.png') });
    console.log('Saved diorama_04_reset_isometric.png');
  }

  await browser.close();
  console.log('Diorama 3D Orbit test complete!');
}

testDioramaOrbit().catch((err) => {
  console.error('Error during diorama orbit test:', err);
  process.exit(1);
});
