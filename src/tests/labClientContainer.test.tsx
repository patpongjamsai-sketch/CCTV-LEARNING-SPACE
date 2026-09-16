import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockDynamicApp(props: any) {
      return (
        <div data-testid="mock-3d-app">
          <button type="button" onClick={props.onSessionStart} data-testid="start-btn">
            Start
          </button>
          <span>{props.learner.displayName}</span>
        </div>
      );
    };
  },
}));

import { LabClientContainer } from '../app/labs/3d/[roomId]/LabClientContainer';

describe('LabClientContainer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with authenticated learner props', () => {
    const html = renderToStaticMarkup(
      <LabClientContainer
        learner={{
          id: '11111111-1111-4111-8111-111111111111',
          displayName: 'สมชาย นักเรียนดีเด่น',
          studentCode: '67301',
        }}
        roomId="22222222-2222-4222-8222-222222222222"
        classId="33333333-3333-4333-8333-333333333333"
        unitId="44444444-4444-4444-8444-444444444444"
        missionId="55555555-5555-4555-8555-555555555555"
        roomTitle="Room 101 · Smart Mart"
      />,
    );

    expect(html).toContain('สมชาย นักเรียนดีเด่น');
    expect(html).toContain('data-testid="mock-3d-app"');
  });
});
