import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Room108CapstoneLab } from '../components/labs/room108/Room108CapstoneLab';

describe('Room 108: Integrated CCTV Capstone lab', () => {
  it('opens Station 1 (Project Planning & BOM) overlay', () => {
    const html = renderToStaticMarkup(<Room108CapstoneLab activeStation={1} />);

    expect(html).toContain('Room 108');
    expect(html).toContain('Station 1');
    expect(html).toContain('Customer Requirement Brief');
    expect(html).toContain('BOM');
  });

  it('opens Station 2 (System Commissioning) overlay', () => {
    const html = renderToStaticMarkup(<Room108CapstoneLab activeStation={2} />);

    expect(html).toContain('Room 108');
    expect(html).toContain('Station 2');
    expect(html).toContain('Commissioning');
  });

  it('opens Station 3 (Acceptance & Handover) overlay', () => {
    const html = renderToStaticMarkup(<Room108CapstoneLab activeStation={3} />);

    expect(html).toContain('Room 108');
    expect(html).toContain('Station 3');
    expect(html).toContain('ส่งมอบโครงการ');
  });

  it('provides the three Room 108 practice stations when no station is active', () => {
    const html = renderToStaticMarkup(<Room108CapstoneLab />);

    expect(html).toContain('data-testid="room108-station-1"');
    expect(html).toContain('data-testid="room108-station-2"');
    expect(html).toContain('data-testid="room108-station-3"');
  });
});
