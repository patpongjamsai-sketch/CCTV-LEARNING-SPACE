import { unit01Content } from './unit01';
import { unit02Content } from './unit02';
import { unit03Content } from './unit03';
import { unit04Content } from './unit04';
import { unit05Content } from './unit05';
import { unit06Content } from './unit06';
import { unit07Content } from './unit07';
import { unit08Content } from './unit08';
import type { LessonDefinition, UnitContentBundle } from './types';

export {
  unit01Content,
  unit02Content,
  unit03Content,
  unit04Content,
  unit05Content,
  unit06Content,
  unit07Content,
  unit08Content,
};

export const allUnitsContent: UnitContentBundle[] = [
  unit01Content,
  unit02Content,
  unit03Content,
  unit04Content,
  unit05Content,
  unit06Content,
  unit07Content,
  unit08Content,
];

export function getUnitContent(unitId: string): UnitContentBundle | undefined {
  const normalized = unitId.toUpperCase();
  return allUnitsContent.find(
    (bundle) =>
      bundle.unit.id.toUpperCase() === normalized ||
      `ROOM-${bundle.unit.number + 100}` === normalized ||
      bundle.unit.number === parseInt(normalized.replace(/[^0-9]/g, ''), 10),
  );
}

export function getAllLessons(): LessonDefinition[] {
  return allUnitsContent.flatMap((bundle) => bundle.lessons);
}

export function getLessonById(lessonId: string): LessonDefinition | undefined {
  const normalized = lessonId.toUpperCase();
  return getAllLessons().find((lesson) => lesson.id.toUpperCase() === normalized);
}

export { validateUnitContract } from './validator';
export { canUnlockContent } from './unlock';
export type * from './types';
export type { LearnerUnlockState } from './unlock';
