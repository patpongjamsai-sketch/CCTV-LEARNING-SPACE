import { describe, expect, it } from 'vitest';
import { equipmentCatalog, equipmentById, requiredEquipment } from '../data/equipment';
import * as equipmentData from '../data/equipment';
import { missions } from '../data/missions';
import { learningQuestions, questionById } from '../data/questions';

describe('data contracts', () => {
  it('contains 18 unique equipment records and 10 required items', () => {
    expect(equipmentCatalog).toHaveLength(18);
    expect(new Set(equipmentCatalog.map((item) => item.id)).size).toBe(18);
    expect(requiredEquipment).toHaveLength(10);
  });

  it('uses supported categories, systems and connectors', () => {
    const categories = new Set(['camera', 'recorder', 'network', 'storage', 'cable', 'connector', 'display', 'power', 'tool']);
    const systems = new Set(['Analog', 'IP', 'Both', 'None']);
    for (const item of equipmentCatalog) {
      expect(categories.has(item.category)).toBe(true);
      expect(systems.has(item.system)).toBe(true);
      expect(item.connectors.length).toBeGreaterThan(0);
    }
  });

  it('keeps mission ids unique and all objective references valid', () => {
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(missions.length);
    for (const mission of missions) {
      for (const objective of mission.objectives) {
        if (objective.equipmentId) expect(equipmentById.has(objective.equipmentId)).toBe(true);
        if (objective.questionId) expect(questionById.has(objective.questionId)).toBe(true);
      }
    }
  });

  it('defines Room 102 as Camera Selection and Placement with a 70-point pass score', () => {
    // จับข้อผิดพลาดกรณีเปิดห้องแล้วแต่ไม่มี Mission ให้ผู้เรียนทำ
    expect(missions.find((mission) => mission.id === 'F1-M102')).toMatchObject({
      room: 102,
      title: 'Camera Selection & Placement',
      passScore: 70,
      nextMission: 'F1-M103',
    });
  });

  it('provides seven Room 102 questions worth 95 points before completion bonus', () => {
    // จับข้อผิดพลาดกรณีโจทย์ Room 102 หายหรือคะแนนรวมไม่ถึงโครงสร้าง 100 คะแนน
    const room102Questions = learningQuestions.filter((question) => question.id.startsWith('q102_'));
    expect(room102Questions).toHaveLength(7);
    expect(room102Questions.reduce((sum, question) => sum + question.points, 0)).toBe(95);
  });

  it('places three camera stations and one coverage simulator in Room 102', () => {
    // จับข้อผิดพลาดกรณี Mission มีข้อมูลแต่ห้องสามมิติไม่มีสถานีให้ปฏิบัติ
    const stations = (equipmentData as typeof equipmentData & {
      room102Stations?: Array<{ id: string; kind: string }>;
    }).room102Stations;
    expect(stations?.map((station) => [station.id, station.kind])).toEqual([
      ['r102:dome_camera', 'equipment'],
      ['r102:bullet_camera', 'equipment'],
      ['r102:ptz_camera', 'equipment'],
      ['r102:coverage_preview', 'preview'],
    ]);
  });
});
