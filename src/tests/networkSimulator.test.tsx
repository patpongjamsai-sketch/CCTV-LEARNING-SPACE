import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkSimulator } from '../components/labs/room104/NetworkSimulator';

describe('NetworkSimulator (U04 Interactive 2D Pre-Lab)', () => {
  it('renders the 2D network simulator component with all core controls', () => {
    const html = renderToStaticMarkup(<NetworkSimulator />);

    // Brand and header
    expect(html).toContain('CCTV NetSim');
    expect(html).toContain('U04 Interactive 2D Pre-Lab');

    // 5 Navigation Tabs
    expect(html).toContain('1. แผนผังเนื้อหา (Content Plan)');
    expect(html).toContain('2. จำลองเสียบสาย PoE Switch');
    expect(html).toContain('3. หน้าตั้งค่า IP &amp; NVR GUI');
    expect(html).toContain('4. คำสั่ง Switch (CLI)');
    expect(html).toContain('5. การแบ่งวงแลน (Subnetting)');

    // Default tab is switch: PoE Switch Faceplate & Ports
    expect(html).toContain('DS-3E1510P-SI');
    expect(html).toContain('PoE+ PORTS (1 - 8)');
    expect(html).toContain('UPLINK (9 - 10)');
    expect(html).toContain('PoE LOAD:');
  });
});
