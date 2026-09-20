import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AssessmentsPage from '../app/assessments/page';

describe('Unit 1 assessments route', () => {
  it('renders the canonical assessment, LAB, fault and reflection flow', () => {
    const html = renderToStaticMarkup(<AssessmentsPage />);

    expect(html).toContain('U01-A01');
    expect(html).toContain('U01-A04');
    expect(html).toContain('U01-LAB01');
    expect(html).toContain('U01-F01');
    expect(html).toContain('U01-R01');
  });
});
