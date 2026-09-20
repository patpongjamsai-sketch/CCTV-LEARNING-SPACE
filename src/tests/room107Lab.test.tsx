import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Room107TroubleshootingLab } from '../components/labs/room107/Room107TroubleshootingLab';

describe('Room 107: CCTV Troubleshooting & Preventive Maintenance lab', () => {
  it('opens Station 1 (Diagnostic Tree & Voltage Drop) overlay', () => {
    const html = renderToStaticMarkup(<Room107TroubleshootingLab activeStation={1} />);

    expect(html).toContain('Room 107');
    expect(html).toContain('Station 1');
    expect(html).toContain('NO VIDEO');
    expect(html).toContain('Voltage Drop');
  });

  it('opens Station 2 (Ground Loop & Hum Bars) overlay', () => {
    const html = renderToStaticMarkup(<Room107TroubleshootingLab activeStation={2} />);

    expect(html).toContain('Room 107');
    expect(html).toContain('Station 2');
    expect(html).toContain('Hum Bars');
    expect(html).toContain('Ground Loop Isolator');
  });

  it('opens Station 3 (PM & Service Report) overlay', () => {
    const html = renderToStaticMarkup(<Room107TroubleshootingLab activeStation={3} />);

    expect(html).toContain('Room 107');
    expect(html).toContain('Station 3');
    expect(html).toContain('PM Checklist');
  });

  it('provides the three Room 107 practice stations when no station is active', () => {
    const html = renderToStaticMarkup(<Room107TroubleshootingLab />);

    expect(html).toContain('data-testid="room107-station-1"');
    expect(html).toContain('data-testid="room107-station-2"');
    expect(html).toContain('data-testid="room107-station-3"');
  });
});
