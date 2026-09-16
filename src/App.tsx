'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useRoleplayStore } from './store/useRoleplayStore';
import { SmartMartStore } from './components/scene/SmartMartStore';
import { PlayerController } from './components/player/PlayerController';
import { KnowledgeStation } from './components/learning/KnowledgeStation';
import { AnswerDropZone } from './components/learning/AnswerDropZone';
import { DataFlowBoard } from './components/learning/DataFlowBoard';
import { AnalogVsIpTable } from './components/learning/AnalogVsIpTable';
import { Mission5WiringLab } from './components/equipment/Mission5WiringLab';
import { ObjectiveHud } from './components/hud/ObjectiveHud';
import { InventoryBar } from './components/hud/InventoryBar';
import { InteractionPrompt } from './components/hud/InteractionPrompt';
import { NpcDialogue } from './components/learning/NpcDialogue';
import { FieldNotebook } from './components/hud/FieldNotebook';
import { SettingsModal } from './components/hud/SettingsModal';
import { GameStartScreen } from './components/game/GameStartScreen';
import { createUnit1Submission } from './client/game/createUnit1Submission';

export type GameLearner = {
  id: string;
  displayName: string;
  studentCode?: string | null;
};

export type AppProps = {
  learner?: GameLearner;
  onSessionStart?: () => Promise<void>;
  onCompleted?: (submission: ReturnType<typeof createUnit1Submission>) => Promise<void> | void;
};

export const App: React.FC<AppProps> = ({
  learner = { id: 'legacy-preview', displayName: 'ผู้เรียน' },
  onSessionStart,
  onCompleted,
}) => {
  const isStarted = useRoleplayStore((s) => s.isStarted);
  const startSession = useRoleplayStore((s) => s.startSession);
  const openStationDialogue = useRoleplayStore((s) => s.openStationDialogue);
  const graphicsQuality = useRoleplayStore((s) => s.graphicsQuality);

  const isCompleted = useRoleplayStore((s) => s.isCompleted);
  const [isLaunching, setIsLaunching] = React.useState(false);
  const [launchError, setLaunchError] = React.useState<string | null>(null);
  const completionSentRef = React.useRef(false);

  const beginSession = React.useCallback(async () => {
    setIsLaunching(true);
    setLaunchError(null);
    try {
      await onSessionStart?.();
      startSession(learner.displayName);
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'ไม่สามารถเริ่ม Session ได้');
    } finally {
      setIsLaunching(false);
    }
  }, [learner.displayName, onSessionStart, startSession]);

  React.useEffect(() => {
    if (!isCompleted || completionSentRef.current || !onCompleted) return;
    completionSentRef.current = true;
    void onCompleted(createUnit1Submission(useRoleplayStore.getState()));
  }, [isCompleted, onCompleted]);

  React.useEffect(() => {
    const handler = () => {
      const store = useRoleplayStore.getState();
      store.missions.M1.isCompleted = true;
      store.missions.M1.score = 15;
      store.missions.M2.isCompleted = true;
      store.missions.M2.score = 20;
      store.matchDeviceFunction('CAMERA_BULLET', 'FUNC_CAMERA');
      store.matchDeviceFunction('POE_SWITCH_8P', 'FUNC_POE_SWITCH');
      store.matchDeviceFunction('NVR_8CH', 'FUNC_NVR');
      store.matchDeviceFunction('ROUTER', 'FUNC_ROUTER');
      store.matchDeviceFunction('CLIENT_PC', 'FUNC_CLIENT_PC');
      (['CARD_COAXIAL', 'CARD_DVR', 'CARD_ANALOG_SIGNAL'] as any[]).forEach((c) => store.placeComparisonCard(c, 'ANALOG'));
      (['CARD_CAT6', 'CARD_NVR', 'CARD_POE', 'CARD_IP_ADDRESS', 'CARD_DIGITAL_PACKET'] as any[]).forEach((c) => store.placeComparisonCard(c, 'IP'));
      store.placedDevices.CAMERA_BULLET = true;
      store.placedDevices.POE_SWITCH_8P = true;
      store.placedDevices.NVR_8CH = true;
      store.placedDevices.CLIENT_PC = true;
      store.placedDevices.MONITOR = true;
      store.poweredDevices.POE_SWITCH_8P = true;
      store.poweredDevices.NVR_8CH = true;
      store.poweredDevices.CLIENT_PC = true;
      store.poweredDevices.MONITOR = true;
      store.connectCable('CAT6', 'CAMERA_BULLET', 'CAM_BULLET_PORT_RJ45', 'POE_SWITCH_8P', 'POE_SW_P1');
      store.connectCable('CAT6', 'POE_SWITCH_8P', 'POE_SW_UPLINK1', 'NVR_8CH', 'NVR_PORT_LAN');
      store.connectCable('CAT6', 'POE_SWITCH_8P', 'POE_SW_P2', 'CLIENT_PC', 'CLIENT_PC_PORT_LAN');
      store.connectCable('HDMI', 'NVR_8CH', 'NVR_PORT_HDMI_OUT', 'MONITOR', 'MONITOR_PORT_HDMI_IN');
      store.recomputeRubric();
    };

    window.addEventListener('TEST_COMPLETE_ALL_MISSIONS', handler);
    return () => window.removeEventListener('TEST_COMPLETE_ALL_MISSIONS', handler);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Start / Briefing Overlay Screen */}
      {!isStarted && (
        <GameStartScreen
          displayName={learner.displayName}
          studentCode={learner.studentCode}
          onStart={() => void beginSession()}
          isStarting={isLaunching}
          errorMessage={launchError}
        />
      )}

      {/* 3D WebGL Canvas */}
      <Canvas
        shadows={graphicsQuality === 'HIGH'}
        camera={{ position: [0, 3, 5], fov: 60 }}
        className="w-full h-full"
      >
        <SmartMartStore />
        <PlayerController />

        {/* 6 Knowledge Station Floating Beacons */}
        <KnowledgeStation
          zoneId="ZONE_A"
          position={[0, 0, -2]}
          color="#38bdf8"
          onInteract={() => openStationDialogue('ZONE_A')}
        />
        <KnowledgeStation
          zoneId="ZONE_B"
          position={[-6, 0, -8]}
          color="#10b981"
          onInteract={() => openStationDialogue('ZONE_B')}
        />
        <KnowledgeStation
          zoneId="ZONE_C"
          position={[6, 0, -8]}
          color="#0ea5e9"
          onInteract={() => openStationDialogue('ZONE_C')}
        />
        <KnowledgeStation
          zoneId="ZONE_D"
          position={[-6, 0, 4]}
          color="#f59e0b"
          onInteract={() => openStationDialogue('ZONE_D')}
        />
        <KnowledgeStation
          zoneId="ZONE_E"
          position={[6, 0, 4]}
          color="#8b5cf6"
          onInteract={() => openStationDialogue('ZONE_E')}
        />
        <KnowledgeStation
          zoneId="ZONE_F"
          position={[0, 0, 9]}
          color="#ec4899"
          onInteract={() => openStationDialogue('ZONE_F')}
        />

        {/* Mission Interactive Props in 3D */}
        <AnswerDropZone />
        <DataFlowBoard />
        <AnalogVsIpTable />
        <Mission5WiringLab />
      </Canvas>

      {/* DOM Overlay Layer */}
      {isStarted && (
        <>
          <ObjectiveHud />
          <InventoryBar />
          <InteractionPrompt />
          <NpcDialogue />
          <FieldNotebook />
          <SettingsModal />
        </>
      )}
    </div>
  );
};
