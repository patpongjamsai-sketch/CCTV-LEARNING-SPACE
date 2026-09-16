import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { GameStartScreen } from '../components/game/GameStartScreen';

describe('authenticated game start screen', () => {
  it('shows the authenticated learner without a name input', () => {
    const html = renderToStaticMarkup(
      <GameStartScreen displayName="สมชาย ใจดี" studentCode="67301" onStart={vi.fn()} />,
    );

    expect(html).toContain('สมชาย ใจดี');
    expect(html).toContain('67301');
    expect(html).not.toContain('<input');
    expect(html).toContain('เริ่มภารกิจ');
  });
});
