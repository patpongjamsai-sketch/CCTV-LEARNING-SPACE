
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// จำลองเฉพาะขอบเขต WebGL และองค์ประกอบฉากที่ไม่เกี่ยวกับการตรวจ HUD
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <div data-testid="canvas" />,
}));

vi.mock('../components/hud/InventoryBar', () => ({
  InventoryBar: () => <div data-testid="inventory-bar">inventory</div>,
}));

vi.mock('../components/scene/Room101SmartMartScene', () => ({ Room101SmartMartScene: () => null }));
vi.mock('../components/scene/Room102SmartSchoolScene', () => ({ Room102SmartSchoolScene: () => null }));
vi.mock('../components/player/PlayerController', () => ({ PlayerController: () => null }));
vi.mock('../components/learning/KnowledgeStation', () => ({ KnowledgeStation: () => null }));
vi.mock('../components/learning/AnswerDropZone', () => ({ AnswerDropZone: () => null }));
vi.mock('../components/learning/DataFlowBoard', () => ({ DataFlowBoard: () => null }));
vi.mock('../components/learning/AnalogVsIpTable', () => ({ AnalogVsIpTable: () => null }));
vi.mock('../components/equipment/Mission5WiringLab', () => ({ Mission5WiringLab: () => null }));
vi.mock('../components/hud/ObjectiveHud', () => ({ ObjectiveHud: () => null }));
vi.mock('../components/hud/InteractionPrompt', () => ({ InteractionPrompt: () => null }));
vi.mock('../components/learning/NpcDialogue', () => ({ NpcDialogue: () => null }));
vi.mock('../components/hud/FieldNotebook', () => ({ FieldNotebook: () => null }));
vi.mock('../components/hud/SettingsModal', () => ({ SettingsModal: () => null }));
vi.mock('../components/game/GameStartScreen', () => ({ GameStartScreen: () => null }));
vi.mock('../components/labs/3d/props/Room102CameraPlacementProps', () => ({ Room102CameraPlacementProps: () => null }));
vi.mock('../components/labs/3d/props/Room103CablingProps', () => ({ Room103CablingProps: () => null }));
vi.mock('../components/labs/3d/props/Room104NetworkingProps', () => ({ Room104NetworkingProps: () => null }));
vi.mock('../components/labs/3d/props/Room105NvrConfigProps', () => ({ Room105NvrConfigProps: () => null }));
vi.mock('../components/labs/3d/props/Room106StorageProps', () => ({ Room106StorageProps: () => null }));
vi.mock('../components/labs/3d/props/Room107TroubleshootingProps', () => ({ Room107TroubleshootingProps: () => null }));
vi.mock('../components/labs/3d/props/Room108CapstoneProps', () => ({ Room108CapstoneProps: () => null }));
vi.mock('../components/labs/room101/Room101SmartMartLab', () => ({ Room101SmartMartLab: () => null }));
vi.mock('../components/labs/room102/Room102SmartSchoolLab', () => ({ Room102SmartSchoolLab: () => null }));
vi.mock('../components/labs/room103/Room103CablingLab', () => ({ Room103CablingLab: () => null }));
vi.mock('../components/labs/room104/Room104NetworkingLab', () => ({ Room104NetworkingLab: () => null }));

vi.mock('../store/useRoleplayStore', () => {
  const state = {
    isStarted: true,
    startSession: vi.fn(),
    openStationDialogue: vi.fn(),
    graphicsQuality: 'HIGH' as const,
    isCompleted: false,
    rubric: { isPassed: false, totalScore: 0 },
  };
  const useRoleplayStore = ((selector: (value: typeof state) => unknown) => selector(state)) as unknown as {
    (selector: (value: typeof state) => unknown): unknown;
    getState: () => typeof state;
  };
  useRoleplayStore.getState = () => state;
  return { useRoleplayStore };
});

describe('Cctv3DLabApp inventory bar visibility', () => {
  it('keeps the equipment inventory bar in Room 101', async () => {
    const { Cctv3DLabApp } = await import('../components/labs/3d/Cctv3DLabApp');
    const html = renderToStaticMarkup(<Cctv3DLabApp roomId="room-101" />);

    expect(html).toContain('data-testid="inventory-bar"');
  });

  it.each(['room-102', 'room-103', 'room-104', 'room-105'])(
    'does not render the equipment inventory bar in %s',
    async (roomId) => {
      const { Cctv3DLabApp } = await import('../components/labs/3d/Cctv3DLabApp');
      const html = renderToStaticMarkup(<Cctv3DLabApp roomId={roomId} />);

      expect(html).not.toContain('data-testid="inventory-bar"');
    },
  );
});
