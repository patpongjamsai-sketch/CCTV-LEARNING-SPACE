
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Room106StorageLab } from '../components/labs/room106/Room106StorageLab';

describe('Room 106: Storage and Cloud P2P lab', () => {
  it('opens the selected station as a mission overlay', () => {
    const html = renderToStaticMarkup(<Room106StorageLab activeStation={1} />);

    expect(html).toContain('Room 106');
    expect(html).toContain('Station 1');
    expect(html).toContain('คำนวณพื้นที่จัดเก็บและ Retention Days');
  });

  it('provides the three Room 106 practice stations when no station is active', () => {
    const html = renderToStaticMarkup(<Room106StorageLab />);

    expect(html).toContain('data-testid="room106-station-1"');
    expect(html).toContain('data-testid="room106-station-2"');
    expect(html).toContain('data-testid="room106-station-3"');
  });
});
