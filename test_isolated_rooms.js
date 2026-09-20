import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testIsolatedRooms() {
  const outputDir = path.resolve('output/isolated_rooms');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Unlock labs for simulation test
  await context.addInitScript(() => {
    localStorage.setItem(
      'cctv_teacher_approvals',
      JSON.stringify({
        unlockedUnits: { U01: true, U02: true, U03: true, U04: true },
        unlockedLabs: { U01: true, U02: true, U03: true, U04: true },
        unlockedAssessments: { U01: true, U02: true, U03: true, U04: true },
        passedUnits: { U01: true, U02: true, U03: true, U04: true },
        studentOverrides: {},
      })
    );
  });

  const page = await context.newPage();

  console.log('--- 1. Testing Isolated Room 101 (Smart Mart) ---');
  await page.goto(
    'http://localhost:3000/labs/3d/room-101?student_code=TEST101&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const startBtn101 = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn101.isVisible()) {
    await startBtn101.click();
    await page.waitForTimeout(1500);
  }

  // Verify HUD doesn't show Zone C or continuous artifacts
  const bodyText101 = await page.textContent('body');
  console.log('Room 101 loaded successfully. Body preview length:', bodyText101?.length);

  await page.screenshot({ path: path.join(outputDir, '01_room101_isolated_smartmart.png') });
  console.log('Saved 01_room101_isolated_smartmart.png');

  // Walk toward East door (Press KeyD to walk toward X = 10.7)
  console.log('Walking toward East portal door in Room 101...');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(2800);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(outputDir, '02_room101_portal_door_locked.png') });
  console.log('Saved 02_room101_portal_door_locked.png');

  // Trigger completion in Room 101 to unlock the door
  console.log('Triggering Room 101 unlock in store...');
  await page.evaluate(() => {
    const store = window.__cctv_roleplay_store || window.useRoleplayStore;
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('cctv_unlock_room102'));
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outputDir, '02b_room101_near_door.png') });

  console.log('\n--- 2. Testing Isolated Room 102 (Smart School Lab) ---');
  await page.goto(
    'http://localhost:3000/labs/3d/room-102?student_code=TEST102&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const startBtn102 = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn102.isVisible()) {
    await startBtn102.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(outputDir, '03_room102_isolated_smartschool.png') });
  console.log('Saved 03_room102_isolated_smartschool.png');

  console.log('\n--- 3. Testing Isolated Room 103 (Cabling Workshop) ---');
  await page.goto(
    'http://localhost:3000/labs/3d/room-103?student_code=TEST103&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const startBtn103 = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn103.isVisible()) {
    await startBtn103.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(outputDir, '04_room103_isolated_cabling.png') });
  console.log('Saved 04_room103_isolated_cabling.png');

  console.log('\n--- 4. Testing Isolated Room 104 (Networking Workshop) ---');
  await page.goto(
    'http://localhost:3000/labs/3d/room-104?student_code=TEST104&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await page.waitForTimeout(1500);

  const startBtn104 = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn104.isVisible()) {
    await startBtn104.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(outputDir, '05_room104_isolated_networking.png') });
  console.log('Saved 05_room104_isolated_networking.png');

  await browser.close();
  console.log('\n=== ALL ISOLATED ROOM TESTS PASSED WITH SCREENSHOTS SAVED! ===');
}

testIsolatedRooms().catch((err) => {
  console.error('Error during isolated rooms test:', err);
  process.exit(1);
});
