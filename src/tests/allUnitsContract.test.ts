import { describe, expect, it } from 'vitest';
import { allUnitsContent, getUnitContent, getAllLessons, getLessonById } from '../content/courses/21909-2020';
import { validateUnitContract } from '../content/courses/21909-2020/validator';

describe('All 8 Units content contracts', () => {
  it('contains exactly 8 units with 80 total lessons', () => {
    expect(allUnitsContent).toHaveLength(8);
    const allLessons = getAllLessons();
    expect(allLessons).toHaveLength(80);
  });

  it.each(allUnitsContent.map((bundle) => [bundle.unit.id, bundle]))(
    'validates unit %s contract without errors',
    (unitId, bundle) => {
      const result = validateUnitContract(bundle);
      expect(result.valid, `Unit ${unitId} validation failed: ${JSON.stringify(result.errors)}`).toBe(true);
      expect(result.errors).toEqual([]);

      // Weights must equal 100
      const weightedItems = [
        ...bundle.assessments,
        bundle.lab,
        bundle.faultChallenge,
        bundle.reflection,
      ];
      const totalWeight = weightedItems.reduce((sum, item) => sum + (item.scoring?.weight ?? 0), 0);
      expect(totalWeight).toBe(100);

      // Must have 10 lessons
      expect(bundle.lessons).toHaveLength(10);
    },
  );

  it('correctly resolves units and lessons via helper functions', () => {
    expect(getUnitContent('U02')?.unit.titleTh).toBe('กล้อง การเลือกใช้ และตำแหน่งติดตั้ง');
    expect(getUnitContent('room-104')?.unit.id).toBe('U04');
    expect(getUnitContent('U08')?.unit.number).toBe(8);

    const lesson = getLessonById('U03-L04');
    expect(lesson).toBeDefined();
    expect(lesson?.titleTh).toContain('T568');
  });
});
