import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CoursePage from '../app/courses/21909-2020/page';

describe('Unit 1 course route', () => {
  it('renders canonical Unit 1 lessons and assessment flow from the content registry', () => {
    const html = renderToStaticMarkup(<CoursePage />);

    expect(html).toContain('U01-L01');
    expect(html).toContain('U01-L10');
    expect(html).toContain('U01-A01');
    expect(html).toContain('U01-LAB01');
    expect(html).toContain('U01-F01');
    expect(html).toContain('U01-R01');
    expect(html).toContain('href="/courses/21909-2020/lessons/U01-L01"');
    expect(html).toContain('href="/courses/21909-2020/lessons/U01-L10"');
  });
});
