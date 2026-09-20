'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { useCctvTrainingStore } from '../../../store/useCctvTrainingStore';
import { Room101SmartMartScene } from '../../scene/Room101SmartMartScene';
import { Room102SmartSchoolScene } from '../../scene/Room102SmartSchoolScene';
import { PlayerController } from '../../player/PlayerController';
import { KnowledgeStation } from '../../learning/KnowledgeStation';
import { AnswerDropZone } from '../../learning/AnswerDropZone';
import { DataFlowBoard } from '../../learning/DataFlowBoard';
import { AnalogVsIpTable } from '../../learning/AnalogVsIpTable';
import { Mission5WiringLab } from '../../equipment/Mission5WiringLab';
import { ObjectiveHud } from '../../hud/ObjectiveHud';
import { InventoryBar } from '../../hud/InventoryBar';
import { InteractionPrompt } from '../../hud/InteractionPrompt';
import { NpcDialogue } from '../../learning/NpcDialogue';
import { FieldNotebook } from '../../hud/FieldNotebook';
import { SettingsModal } from '../../hud/SettingsModal';
import { GameStartScreen } from '../../game/GameStartScreen';
import { createUnit1Submission } from '../../../client/game/createUnit1Submission';

// 3D Props for Rooms 102 - 108
import { Room102CameraPlacementProps } from './props/Room102CameraPlacementProps';
import { Room102SmartSchoolLab } from '../room102/Room102SmartSchoolLab';
import { Room103CablingProps } from './props/Room103CablingProps';
import { Room103CablingLab } from '../room103/Room103CablingLab';
import { Room104NetworkingLab } from '../room104/Room104NetworkingLab';
import { Room104NetworkingProps } from './props/Room104NetworkingProps';
import { Room105NvrConfigProps } from './props/Room105NvrConfigProps';
import { Room105NvrLab } from '../room105/Room105NvrLab';
import { Room106StorageProps } from './props/Room106StorageProps';
import { Room106StorageLab } from '../room106/Room106StorageLab';
import { Room107TroubleshootingProps } from './props/Room107TroubleshootingProps';
import { Room107TroubleshootingLab } from '../room107/Room107TroubleshootingLab';
import { Room108CapstoneProps } from './props/Room108CapstoneProps';
import { Room108CapstoneLab } from '../room108/Room108CapstoneLab';

export type GameLearner = {
  id: string;
  displayName: string;
  studentCode?: string | null;
};

export type Cctv3DLabAppProps = {
  roomId?: string;
  learner?: GameLearner;
  onSessionStart?: () => Promise<void>;
  onCompleted?: (submission: any) => Promise<void> | void;
};

export const Cctv3DLabApp: React.FC<Cctv3DLabAppProps> = ({
  roomId = 'room-101',
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

  // Parse room number (101 - 108)
  const roomNumMatch = roomId.match(/(?:room-?|u0?)(\d+)/i);
  let roomNum = roomNumMatch && roomNumMatch[1] ? parseInt(roomNumMatch[1], 10) : 101;
  if (roomNum < 10) roomNum += 100;

  const buildRoomSubmission = useCctvTrainingStore((s) => s.buildRoomSubmission);
  const setActiveRoomId = useCctvTrainingStore((s) => s.setActiveRoomId);
  const activeStation102Modal = useCctvTrainingStore((s) => s.activeStation102Modal);
  const setActiveStation102Modal = useCctvTrainingStore((s) => s.setActiveStation102Modal);
  const activeStation103Modal = useCctvTrainingStore((s) => s.activeStation103Modal);
  const setActiveStation103Modal = useCctvTrainingStore((s) => s.setActiveStation103Modal);
  const activeStation104Modal = useCctvTrainingStore((s) => s.activeStation104Modal);
  const setActiveStation104Modal = useCctvTrainingStore((s) => s.setActiveStation104Modal);
  const activeStation105Modal = useCctvTrainingStore((s) => s.activeStation105Modal);
  const setActiveStation105Modal = useCctvTrainingStore((s) => s.setActiveStation105Modal);
  const activeStation106Modal = useCctvTrainingStore((s) => s.activeStation106Modal);
  const setActiveStation106Modal = useCctvTrainingStore((s) => s.setActiveStation106Modal);
  const activeStation107Modal = useCctvTrainingStore((s) => s.activeStation107Modal);
  const setActiveStation107Modal = useCctvTrainingStore((s) => s.setActiveStation107Modal);
  const activeStation108Modal = useCctvTrainingStore((s) => s.activeStation108Modal);
  const setActiveStation108Modal = useCctvTrainingStore((s) => s.setActiveStation108Modal);

  React.useEffect(() => {
    setActiveRoomId(roomId);
  }, [roomId, setActiveRoomId]);

  const beginSession = React.useCallback(async () => {
    setIsLaunching(true);
    setLaunchError(null);
    const roomTitleMap: Record<number, string> = {
      101: 'Smart Mart CCTV (Room 101)',
      102: 'Smart School CCTV Lab (Room 102)',
      103: 'Cabling & PoE Workshop (Room 103)',
      104: 'IP Network & PoE Troubleshooting (Room 104)',
      105: 'DVR/NVR Configuration & Video Compression (Room 105)',
      106: 'Storage Management (Room 106)',
      107: 'Troubleshooting (Room 107)',
      108: 'Capstone Challenge (Room 108)',
    };
    try {
      await onSessionStart?.();
      startSession(learner.displayName, roomTitleMap[roomNum] || `Room ${roomNum}`);
    } catch (error) {
      setLaunchError(error instanceof Error ? error.message : 'ไม่สามารถเริ่ม Session ได้');
    } finally {
      setIsLaunching(false);
    }
  }, [learner.displayName, onSessionStart, roomNum, startSession]);

  // Handle Room 101 completion automatically when rubric is fulfilled
  React.useEffect(() => {
    if (roomNum !== 101) return;
    if (!isCompleted || completionSentRef.current || !onCompleted) return;
    completionSentRef.current = true;
    void onCompleted(createUnit1Submission(useRoleplayStore.getState()));
  }, [isCompleted, onCompleted, roomNum]);

  // Handle manual submission for Rooms 102 - 108
  const handleRoomFinalize = React.useCallback(() => {
    if (completionSentRef.current || !onCompleted) return;
    completionSentRef.current = true;

    if (roomNum === 101) {
      void onCompleted(createUnit1Submission(useRoleplayStore.getState()));
    } else {
      const payload = buildRoomSubmission(roomId);
      void onCompleted(payload);
    }
  }, [buildRoomSubmission, onCompleted, roomId, roomNum]);

  const isRoom101Passed = useRoleplayStore(
    (s) => s.rubric.isPassed || s.rubric.totalScore >= 80 || s.isCompleted
  );
  const isRoom102Unlocked = isRoom101Passed || roomNum >= 102;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Launch / Start Screen Overlay */}
      {!isStarted && (
        <GameStartScreen
          displayName={learner.displayName}
          studentCode={learner.studentCode}
          onStart={() => void beginSession()}
          isStarting={isLaunching}
          errorMessage={launchError}
        />
      )}

      {/* 3D WebGL Canvas for ALL Rooms (Connected Multi-Room Continuous Scene) */}
      <Canvas
        shadows={graphicsQuality === 'HIGH'}
        dpr={graphicsQuality === 'HIGH' ? [1, 1.5] : 1}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 3, 5], fov: 60 }}
        className="w-full h-full"
      >
        {/* Isolated Modular 3D Scene Environments & Player System */}
        {roomNum === 101 && (
          <Room101SmartMartScene
            isRoom102Unlocked={isRoom102Unlocked}
            onEnterRoom102={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/labs/3d/room-102${window.location.search}`;
              }
            }}
          />
        )}
        {roomNum === 102 && (
          <Room102SmartSchoolScene
            onEnterRoom101={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/labs/3d/room-101${window.location.search}`;
              }
            }}
            onEnterRoom103={() => {
              if (typeof window !== 'undefined') {
                window.location.href = `/labs/3d/room-103${window.location.search}`;
              }
            }}
          />
        )}
        {roomNum >= 105 && (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[22, 22]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
            <gridHelper args={[22, 22, 0x38bdf8, 0x1e293b]} position={[0, 0.01, 0]} />
            <ambientLight intensity={0.85} />
            <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow />
          </group>
        )}

        <PlayerController roomId={roomId} isRoom102Unlocked={isRoom102Unlocked} />

        {/* Room 101: 6 Knowledge Station Floating Beacons (Only in Room 101, centered at 0, 0) */}
        {roomNum === 101 && (
          <>
            <KnowledgeStation
              zoneId="ZONE_A"
              position={[0, 0, -1]}
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

            {/* Room 101 Interactive Props (Stationed inside Room 101) */}
            <group position={[0, 0, 0]}>
              <AnswerDropZone />
              <DataFlowBoard />
              <AnalogVsIpTable />
              <Mission5WiringLab />
            </group>
          </>
        )}

        {/* Room 102 Interactive Props */}
        {roomNum === 102 && <Room102CameraPlacementProps />}

        {/* Room 103 - 108 Props */}
        {roomNum === 103 && <Room103CablingProps />}
        {roomNum === 104 && <Room104NetworkingProps />}
        {roomNum === 105 && <Room105NvrConfigProps />}
        {roomNum === 106 && <Room106StorageProps />}
        {roomNum === 107 && <Room107TroubleshootingProps />}
        {roomNum === 108 && (
          <Room108CapstoneProps onFinalizeSubmission={handleRoomFinalize} />
        )}
      </Canvas>

      {/* DOM Overlay Layer */}
      {isStarted && (
        <>
          {/* Quick Submit Toolbar for Rooms 102 - 108 */}
          {roomNum >= 102 && roomNum <= 108 && (
            <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
              <button
                onClick={handleRoomFinalize}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 via-emerald-600 to-sky-600 hover:from-amber-400 hover:to-sky-500 text-white font-bold rounded-2xl text-xs shadow-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>ส่งผลประเมินภารกิจ Room {roomNum}</span>
              </button>
            </div>
          )}

          {/* Room 102 Smart School Activity Runner */}
          {roomNum === 102 && (
            <Room102SmartSchoolLab
              activeStation={activeStation102Modal}
              onCloseStation={() => setActiveStation102Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 103 Cabling & Termination Activity Runner */}
          {roomNum === 103 && (
            <Room103CablingLab
              activeStation={activeStation103Modal}
              onCloseStation={() => setActiveStation103Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 104 Networking & Troubleshooting Activity Runner */}
          {roomNum === 104 && (
            <Room104NetworkingLab
              activeStation={activeStation104Modal}
              onCloseStation={() => setActiveStation104Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 105 DVR/NVR Configuration Activity Runner */}
          {roomNum === 105 && (
            <Room105NvrLab
              activeStation={activeStation105Modal}
              onCloseStation={() => setActiveStation105Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 106 Storage & Cloud P2P Activity Runner */}
          {roomNum === 106 && (
            <Room106StorageLab
              activeStation={activeStation106Modal}
              onCloseStation={() => setActiveStation106Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 107 Troubleshooting & PM Activity Runner */}
          {roomNum === 107 && (
            <Room107TroubleshootingLab
              activeStation={activeStation107Modal}
              onCloseStation={() => setActiveStation107Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Room 108 Integrated Capstone Activity Runner */}
          {roomNum === 108 && (
            <Room108CapstoneLab
              activeStation={activeStation108Modal}
              onCloseStation={() => setActiveStation108Modal(null)}
              onCompletedMission={async (submission) => {
                await onCompleted?.(submission);
              }}
            />
          )}

          {/* Roblox Character Walking & Table Interaction Helper Bar */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
            <div className="bg-slate-900/90 backdrop-blur-md border border-sky-500/50 px-5 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs text-slate-200">
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <span className="text-base">🧑‍🔧</span>
                <span>ตัวละคร Roblox:</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-100">[W][A][S][D]</span>
                <span>เดินไปที่โต๊ะ</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-100">[Shift]</span>
                <span>วิ่ง</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-emerald-500/50 text-emerald-300">[E]</span>
                <span>หรือคลิกที่โต๊ะเพื่อทำภารกิจ</span>
              </span>
            </div>
          </div>

          <ObjectiveHud />
          {roomNum === 101 && <InventoryBar />}
          <InteractionPrompt />
          <NpcDialogue />
          <FieldNotebook />
          <SettingsModal />
        </>
      )}
    </div>
  );
};
