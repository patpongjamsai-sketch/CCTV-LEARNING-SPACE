import { describe, expect, it } from 'vitest';
import { requiredEquipment } from '../data/equipment';
import { learningQuestions } from '../data/questions';
import { GameStore } from '../simulation/GameState';
import { MissionEngine } from '../simulation/MissionEngine';

function completeCore(engine: MissionEngine): void {
  requiredEquipment.forEach((item) => engine.inspectEquipment(item.id));
  engine.pickupEquipment('ip_camera_4mp');
  engine.placeEquipment('ip_camera_4mp', 'inspection_pad');
}

describe('mission and score', () => {
  it('blocks Room 102 mission until Room 101 has unlocked it', () => {
    // จับข้อผิดพลาดกรณีผู้เรียนข้าม Mission 101 แล้วเริ่ม Room 102 ได้ทันที
    const store = new GameStore();
    const engine = new MissionEngine(store);
    expect(engine.start('F1-M102')).toBe(false);
    expect(store.snapshot.currentMission).toBe('F1-M101');
  });

  it('starts Room 102 mission after the room has been unlocked', () => {
    // จับข้อผิดพลาดกรณีปลดประตูแล้วแต่ Mission 102 เริ่มไม่ได้
    const store = new GameStore();
    store.update((state) => state.unlockedRooms.push(102));
    const engine = new MissionEngine(store, () => 20_000);
    expect(engine.start('F1-M102')).toBe(true);
    expect(store.snapshot.currentMission).toBe('F1-M102');
    expect(store.snapshot.missionResults['F1-M102']?.status).toBe('active');
  });

  it('keeps the original mission timer when an active Room 102 station is inspected again', () => {
    // จับข้อผิดพลาดกรณีการ Inspect ซ้ำรีเซ็ตเวลา ทำให้ completionTime ต่ำกว่าความจริง
    let now = 20_000;
    const store = new GameStore();
    store.update((state) => state.unlockedRooms.push(102));
    const engine = new MissionEngine(store, () => now);
    engine.start('F1-M102');
    now = 40_000;
    engine.start('F1-M102');
    expect(store.snapshot.missionStartedAt).toBe(20_000);
  });

  it('scores Room 102 independently and unlocks Room 103 at 70 points or more', () => {
    // จับข้อผิดพลาดกรณีคะแนน Room 101 ปะปนกับ Room 102 หรือผ่านแล้วไม่ปลดห้องถัดไป
    const store = new GameStore();
    store.update((state) => state.unlockedRooms.push(102));
    const engine = new MissionEngine(store, () => 30_000);
    engine.start('F1-M102');
    store.update((state) => state.completedObjectives.push(
      'inspect:r102:dome_camera',
      'inspect:r102:bullet_camera',
      'inspect:r102:ptz_camera',
      'test:r102:coverage_preview',
    ));
    learningQuestions
      .filter((question) => question.id.startsWith('q102_'))
      .forEach((question) => engine.answerQuestion(question.id, question.answer));

    const result = engine.evaluate();
    expect(result.breakdown.total).toBe(100);
    expect(result.passed).toBe(true);
    expect(store.snapshot.unlockedRooms).toContain(103);
    expect(store.snapshot.missionResults['F1-M102']?.bestScore).toBe(100);
  });

  it('records only a valid action objective from the active Room 102 mission', () => {
    // จับข้อผิดพลาดกรณีเปิด Preview แล้ว Objective ไม่อัปเดตหรือบันทึก Objective ปลอมได้
    const store = new GameStore();
    store.update((state) => state.unlockedRooms.push(102));
    const engine = new MissionEngine(store);
    engine.start('F1-M102');
    const recordAction = (engine as unknown as { recordAction?: (id: string) => boolean }).recordAction;
    expect(recordAction?.call(engine, 'test:r102:coverage_preview')).toBe(true);
    expect(recordAction?.call(engine, 'test:not-in-mission')).toBe(false);
    expect(store.snapshot.completedObjectives).toContain('test:r102:coverage_preview');
    expect(store.snapshot.completedObjectives).not.toContain('test:not-in-mission');
  });

  it('does not count Room 102 answers toward the Room 101 score', () => {
    // จับข้อผิดพลาดกรณีใช้คำตอบจากอีกห้องทำให้ Mission 101 ผ่านโดยไม่ได้ตอบโจทย์ของตนเอง
    const store = new GameStore();
    const engine = new MissionEngine(store);
    engine.start('F1-M101');
    completeCore(engine);
    learningQuestions
      .filter((question) => question.id.startsWith('q102_'))
      .forEach((question) => engine.answerQuestion(question.id, question.answer));
    const result = engine.evaluate();
    expect(result.breakdown.total).toBe(25);
    expect(result.passed).toBe(false);
    expect(store.snapshot.unlockedRooms).not.toContain(102);
  });

  it('scores exactly 100 with all correct objectives and unlocks room 102', () => {
    const store = new GameStore();
    const engine = new MissionEngine(store, () => 10_000);
    engine.start();
    completeCore(engine);
    learningQuestions.forEach((question) => engine.answerQuestion(question.id, question.answer));
    const result = engine.evaluate();
    expect(result.breakdown.total).toBe(100);
    expect(result.passed).toBe(true);
    expect(store.snapshot.unlockedRooms).toContain(102);
  });

  it('does not unlock room 102 below 70 or when core objectives are missing', () => {
    const store = new GameStore();
    const engine = new MissionEngine(store);
    engine.answerQuestion('q_connection', 0);
    engine.answerQuestion('q_budget', 0);
    expect(engine.evaluate().passed).toBe(false);
    expect(store.snapshot.unlockedRooms).not.toContain(102);
  });

  it('applies hint and wrong-attempt deductions to troubleshooting', () => {
    const store = new GameStore();
    const engine = new MissionEngine(store);
    completeCore(engine);
    engine.answerQuestion('q_fault', 1);
    engine.useHint('q_fault');
    engine.answerQuestion('q_fault', 0);
    expect(engine.getScore().problemSolving).toBe(5);
  });
});
