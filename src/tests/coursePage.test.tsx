import { describe, expect, it } from 'vitest';

import CoursePage from '../app/courses/21909-2020/page';

describe('Unit 1 course route', () => {
  it('redirects to /labs to keep the learning portal focused on practical 3D labs and tests', () => {
    expect(() => CoursePage()).toThrow();
  });
});
