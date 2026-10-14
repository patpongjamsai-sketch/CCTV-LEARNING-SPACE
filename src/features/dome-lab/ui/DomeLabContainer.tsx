'use client';

import React, { useState } from 'react';
import { useDomeLabStore } from '../store/useDomeLabStore';
import { MISSIONS_DATA } from '../data/domeLabData';
import { DomeLabHeader } from './DomeLabHeader';
import { MissionStepper } from './MissionStepper';
import { TrainingCanvas } from '../three/TrainingCanvas';
import { CameraPreviewPiP } from './CameraPreviewPiP';
import { ActionLogDrawer } from './ActionLogDrawer';
import { ResultModalPreview } from './ResultModalPreview';
import { PpeStationModal } from './PpeStationModal';
import { Mission4InstallationModal } from './Mission4InstallationModal';

// Mission Panels
import { Mission1PPEPanel } from './panels/Mission1PPEPanel';
import { Mission2SurveyPanel } from './panels/Mission2SurveyPanel';
import { Mission3FOVPanel } from './panels/Mission3FOVPanel';
import { Mission4SurfacePanel } from './panels/Mission4SurfacePanel';

import {
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useEffect } from 'react';
import { RoomId } from '../types';

interface DomeLabContainerProps {
  initialRoomId?: RoomId;
}

export const DomeLabContainer: React.FC<DomeLabContainerProps> = ({ initialRoomId }) => {
  const currentMission = useDomeLabStore((s) => s.currentMission);
  const setActiveRoom = useDomeLabStore((s) => s.setActiveRoom);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (initialRoomId) {
      setActiveRoom(initialRoomId);
    }
  }, [initialRoomId, setActiveRoom]);

  const activeMissionMeta =
    MISSIONS_DATA.find((m) => m.id === currentMission) ?? MISSIONS_DATA[0]!;

  const renderActiveMissionPanel = () => {
    switch (currentMission) {
      case 1:
        return <Mission1PPEPanel />;
      case 2:
        return <Mission2SurveyPanel />;
      case 3:
        return <Mission3FOVPanel />;
      case 4:
        return <Mission4SurfacePanel />;
      default:
        return <Mission1PPEPanel />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col font-sans select-none">
      {/* 1. Global Navigation Header */}
      <DomeLabHeader />

      {/* 2. Mission Stepper Navigation */}
      <MissionStepper />

      {/* 3. Main Workspace (3D Canvas + Overlay HUD) */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Three.js R3F Interactive Canvas */}
        <div className="flex-1 w-full h-full relative">
          <TrainingCanvas />
        </div>

        {/* Floating Side Panel: Mission Objectives & Interactive Controls */}
        <aside
          className={`absolute top-4 right-4 bottom-4 z-20 flex flex-col transition-all duration-300 ${
            panelOpen ? 'w-84 sm:w-96' : 'w-12 h-12 overflow-hidden'
          }`}
        >
          {panelOpen ? (
            <div className="flex-1 flex flex-col bg-slate-950/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Mission Panel Header */}
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    MISSION 0{activeMissionMeta.id} · {activeMissionMeta.phaseName}
                  </div>
                  <h2 className="text-sm font-bold text-white truncate">
                    {activeMissionMeta.titleTh}
                  </h2>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="ย่อแผงควบคุม"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Mission Panel Scrollable Body */}
              <div className="flex-1 overflow-y-auto">
                {renderActiveMissionPanel()}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setPanelOpen(true)}
              className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="เปิดแผงควบคุมภารกิจ"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          )}
        </aside>

        {/* 4. CCTV Live View PiP (Floating viewport) */}
        <CameraPreviewPiP />
      </div>

      {/* 5. Modals & Drawers */}
      <PpeStationModal />
      <Mission4InstallationModal />
      <ActionLogDrawer />
      <ResultModalPreview />
    </div>
  );
};
