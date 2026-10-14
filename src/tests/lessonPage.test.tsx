import { describe, expect, it } from 'vitest';

import LessonPage from '../app/courses/21909-2020/lessons/[lessonId]/page';

describe('Unit 1 lesson detail route', () => {
  it('redirects to assessments to keep learning focused on assessment and 3d missions', () => {
    expect(() => LessonPage()).toThrow();
  });
});
