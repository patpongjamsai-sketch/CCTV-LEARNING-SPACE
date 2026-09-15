import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testCameraCharacterWalls() {
  const outputDir = path.resolve('output/playtest');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser to test camera, character rotation, zoom, and partition walls...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  // Start game
  const startBtn = page.getByRole('button', { name: /เข้าสู่ Smart Mart/i });
  await startBtn.click();
  await page.waitForTimeout(1000);

  // 1. Initial view facing manager counter
  await page.screenshot({ path: path.join(outputDir, 'test_01_spawn_facing_north.png') });
  console.log('1. Captured test_01_spawn_facing_north.png');

  // 2. Rotate camera horizontally 90 degrees by dragging mouse
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 250, startY, { steps: 20 }); // drag to the left, rotating camera right
  await page.mouse.up();
  await page.waitForTimeout(800);

  // Character should have rotated to face the new camera direction!
  await page.screenshot({ path: path.join(outputDir, 'test_02_camera_and_character_rotated.png') });
  console.log('2. Captured test_02_camera_and_character_rotated.png');

  // 3. Test camera zoom in (scroll wheel)
  await page.mouse.wheel(0, -600); // zoom in
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'test_03_zoomed_in.png') });
  console.log('3. Captured test_03_zoomed_in.png');

  // 4. Test camera zoom out (scroll wheel)
  await page.mouse.wheel(0, 1200); // zoom out
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, 'test_04_zoomed_out.png') });
  console.log('4. Captured test_04_zoomed_out.png');

  // Reset zoom with keyboard zoom shortcut
  await page.keyboard.press('Equal');
  await page.keyboard.press('Equal');
  await page.waitForTimeout(400);

  // 5. Walk toward Zone C (Network Room with partition walls)
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 180, startY - 50, { steps: 15 });
  await page.mouse.up();
  await page.waitForTimeout(500);

  // Walk forward
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1400);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outputDir, 'test_05_zone_c_partition_wall.png') });
  console.log('5. Captured test_05_zone_c_partition_wall.png');

  // Walk toward Zone D (NVR Server Room with partition walls)
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 350, startY, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(500);

  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2000);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outputDir, 'test_06_zone_d_partition_wall.png') });
  console.log('6. Captured test_06_zone_d_partition_wall.png');

  await browser.close();

  console.log('Playtest completed successfully!');
  if (errors.length > 0) {
    console.error('Errors encountered:', errors);
  } else {
    console.log('Zero console errors!');
  }
}

testCameraCharacterWalls().catch(console.error);
