import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import LessonPage from '../app/courses/21909-2020/lessons/[lessonId]/page';

describe('Unit 1 lesson detail route', () => {
  it('renders the selected lesson objectives, section content and lesson navigation', async () => {
    const html = renderToStaticMarkup(
      await LessonPage({ params: Promise.resolve({ lessonId: 'U01-L03' }) }),
    );

    expect(html).toContain('U01-L03');
    expect(html).toContain('DVR และ NVR: ศูนย์กลางของระบบบันทึก');
    expect(html).toContain('วัตถุประสงค์การเรียนรู้');
    expect(html).toContain('เนื้อหาหลักของ DVR และ NVR: ศูนย์กลางของระบบบันทึก');
    expect(html).toContain('href="/courses/21909-2020/lessons/U01-L02"');
    expect(html).toContain('href="/courses/21909-2020/lessons/U01-L04"');
  });
});
