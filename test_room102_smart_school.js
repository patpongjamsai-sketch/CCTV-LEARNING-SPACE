import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function testRoom102SmartSchool() {
  const outputDir = path.resolve('output/room102_smart_school');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
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

  console.log('1. Navigating to Room 102 on http://localhost:3000 ...');
  await page.goto(
    'http://localhost:3000/labs/3d/room-102?student_code=TEST102&student_name=นายช่างทดสอบ_ปวช',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );

  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outputDir, '01_room102_start_screen.png') });
  console.log('Saved 01_room102_start_screen.png');

  // Click start session button
  const startBtn = page.getByRole('button', { name: /เข้าสู่|เริ่ม/i }).first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: path.join(outputDir, '02_room102_3d_world.png') });
  console.log('Saved 02_room102_3d_world.png');

  // ==========================================
  // Test Station 1: Outdoor Smart School
  // ==========================================
  console.log('2. Opening Station 1: Outdoor Campus Plan...');
  const st1Btn = page.getByRole('button', { name: /ผังภายนอก/i }).first();
  await st1Btn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outputDir, '03_station1_outdoor_modal.png') });
  console.log('Saved 03_station1_outdoor_modal.png');

  // Click FOV Toggle
  const fovBtn = page.getByRole('button', { name: /แสดงรัศมีมุมมอง FOV/i }).first();
  if (await fovBtn.isVisible()) {
    await fovBtn.click();
    await page.waitForTimeout(300);
  }

  // Assign camera for current spot (P1: Main Gate -> Bullet True WDR)
  const bulletWdrBtn = page.getByRole('button', { name: /Bullet True WDR/i }).first();
  if (await bulletWdrBtn.isVisible()) {
    await bulletWdrBtn.click();
    await page.waitForTimeout(200);
  }

  // Click Spot P2 (Sports Field)
  const spotP2 = page.getByRole('button', { name: /P2|สนามกีฬา/i }).first();
  if (await spotP2.isVisible()) {
    await spotP2.click();
    await page.waitForTimeout(200);
    // Assign PTZ Speed Dome
    const ptzBtn = page.getByRole('button', { name: /PTZ Speed Dome/i }).first();
    if (await ptzBtn.isVisible()) await ptzBtn.click();
  }

  // Click Spot P3 (Parking Lot)
  const spotP3 = page.getByRole('button', { name: /P3|ลานจอดรถ/i }).first();
  if (await spotP3.isVisible()) {
    await spotP3.click();
    await page.waitForTimeout(200);
    // Assign Wide Bullet
    const wideBtn = page.getByRole('button', { name: /Bullet มุมกว้าง/i }).first();
    if (await wideBtn.isVisible()) await wideBtn.click();
  }

  // Click Spot P4 (Fence Line)
  const spotP4 = page.getByRole('button', { name: /P4|แนวกำแพง/i }).first();
  if (await spotP4.isVisible()) {
    await spotP4.click();
    await page.waitForTimeout(200);
    // Assign Perimeter AI
    const aiBtn = page.getByRole('button', { name: /Line Crossing AI/i }).first();
    if (await aiBtn.isVisible()) await aiBtn.click();
  }

  // Click Spot P5 (Back Gate)
  const spotP5 = page.getByRole('button', { name: /P5|ประตูหลัง/i }).first();
  if (await spotP5.isVisible()) {
    await spotP5.click();
    await page.waitForTimeout(200);
    // Assign Full-Color
    const fcBtn = page.getByRole('button', { name: /Full-Color/i }).first();
    if (await fcBtn.isVisible()) await fcBtn.click();
  }

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '04_station1_outdoor_completed.png') });
  console.log('Saved 04_station1_outdoor_completed.png');

  // Save Station 1
  const saveSt1Btn = page.getByRole('button', { name: /บันทึกผล Station 1/i }).first();
  if (await saveSt1Btn.isVisible()) {
    await saveSt1Btn.click();
    await page.waitForTimeout(500);
  }

  // ==========================================
  // Test Station 2: Indoor Smart School
  // ==========================================
  console.log('3. Opening Station 2: Indoor Building Floor Plan...');
  const st2Btn = page.getByRole('button', { name: /ผังภายใน/i }).first();
  await st2Btn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outputDir, '05_station2_indoor_modal.png') });
  console.log('Saved 05_station2_indoor_modal.png');

  // Assign Spot S1 (Corridor Stairs) -> Dome IK10
  const domeIk10Btn = page.getByRole('button', { name: /Vandal-Proof \(IK10\)/i }).first();
  if (await domeIk10Btn.isVisible()) {
    await domeIk10Btn.click();
    await page.waitForTimeout(200);
  }

  // Assign Spot S2 (Canteen) -> Turret
  const spotS2 = page.getByRole('button', { name: /S2|โรงอาหาร/i }).first();
  if (await spotS2.isVisible()) {
    await spotS2.click();
    await page.waitForTimeout(200);
    const turretBtn = page.getByRole('button', { name: /Turret Eyeball/i }).first();
    if (await turretBtn.isVisible()) await turretBtn.click();
  }

  // Assign Spot S3 (Server Room) -> Fisheye 360
  const spotS3 = page.getByRole('button', { name: /S3|ห้องเซิร์ฟเวอร์/i }).first();
  if (await spotS3.isVisible()) {
    await spotS3.click();
    await page.waitForTimeout(200);
    const fisheyeBtn = page.getByRole('button', { name: /Fisheye 360/i }).first();
    if (await fisheyeBtn.isVisible()) await fisheyeBtn.click();
  }

  // Assign Spot S4 (Library) -> Recessed Dome
  const spotS4 = page.getByRole('button', { name: /S4|ห้องสมุด/i }).first();
  if (await spotS4.isVisible()) {
    await spotS4.click();
    await page.waitForTimeout(200);
    const recessedBtn = page.getByRole('button', { name: /In-Ceiling Dome/i }).first();
    if (await recessedBtn.isVisible()) await recessedBtn.click();
  }

  // Assign Spot S5 (Infirmary) -> Privacy Dome
  const spotS5 = page.getByRole('button', { name: /S5|ห้องพยาบาล/i }).first();
  if (await spotS5.isVisible()) {
    await spotS5.click();
    await page.waitForTimeout(200);
    const privDomeBtn = page.getByRole('button', { name: /Privacy Masking Dome/i }).first();
    if (await privDomeBtn.isVisible()) await privDomeBtn.click();
  }

  // Toggle Privacy Mask
  const pdpaToggleBtn = page.getByRole('button', { name: /Privacy Mask/i }).last();
  if (await pdpaToggleBtn.isVisible()) {
    await pdpaToggleBtn.click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: path.join(outputDir, '06_station2_indoor_completed.png') });
  console.log('Saved 06_station2_indoor_completed.png');

  // Save Station 2
  const saveSt2Btn = page.getByRole('button', { name: /บันทึกผล Station 2/i }).first();
  if (await saveSt2Btn.isVisible()) {
    await saveSt2Btn.click();
    await page.waitForTimeout(500);
  }

  // ==========================================
  // Test Station 3: Written Case Analysis
  // ==========================================
  console.log('4. Opening Station 3: Written Case Study Analysis...');
  const st3Btn = page.getByRole('button', { name: /วิเคราะห์ปัญหา/i }).first();
  await st3Btn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outputDir, '07_station3_written_modal.png') });
  console.log('Saved 07_station3_written_modal.png');

  // Fill in Case 1 Answer (Backlight WDR)
  const textareas = await page.locator('textarea').all();
  if (textareas.length >= 2) {
    await textareas[0].fill(
      'สาเหตุเกิดจากสภาวะแสงย้อน (Backlighting) ช่วงเช้าแดดส่องเข้ากล้อง จึงต้องใช้กล้องที่มีเทคโนโลยี True WDR เพื่อชดเชยแสงให้เห็นใบหน้านักเรียนชัดเจน'
    );
    await textareas[1].fill(
      'กล้องบริเวณบันไดควรเปลี่ยนเป็นกล้องโดมทนการทุบทำลาย Vandal-Proof Dome มาตรฐาน IK10 เพื่อกันแรงกระแทกจากลูกบอลและป้องกันมุมกล้องเคลื่อนที่'
    );
  }

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outputDir, '08_station3_filled_answers.png') });
  console.log('Saved 08_station3_filled_answers.png');

  // Submit Written answers
  const submitWrittenBtn = page.getByRole('button', { name: /ส่งคำตอบและตรวจประเมินผล/i }).first();
  if (await submitWrittenBtn.isVisible()) {
    await submitWrittenBtn.click();
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: path.join(outputDir, '09_station3_evaluated_expert_answers.png') });
  console.log('Saved 09_station3_evaluated_expert_answers.png');

  // Close Station 3 modal
  const closeSt3Btn = page.getByRole('button', { name: /ปิดหน้าต่าง/i }).first();
  if (await closeSt3Btn.isVisible()) {
    await closeSt3Btn.click();
    await page.waitForTimeout(500);
  }

  // ==========================================
  // Test Finalize Room 102 Submission
  // ==========================================
  console.log('5. Finalizing Room 102 Smart School Submission...');
  await page.screenshot({ path: path.join(outputDir, '10_all_stations_completed_hud.png') });
  console.log('Saved 10_all_stations_completed_hud.png');

  const finalizeBtn = page.getByRole('button', { name: /ส่งผลประเมิน/i }).first();
  if (await finalizeBtn.isVisible()) {
    await finalizeBtn.click();
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: path.join(outputDir, '11_room102_success_submission.png') });
  console.log('Saved 11_room102_success_submission.png');

  await browser.close();

  console.log('\n=== TEST SUMMARY ===');
  console.log(`Errors caught: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors list:', errors);
  } else {
    console.log('ALL ROOM 102 SMART SCHOOL STATIONS TESTED SUCCESSFULLY! 🎉');
  }
}

testRoom102SmartSchool().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
