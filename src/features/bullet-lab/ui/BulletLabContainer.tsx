'use client';

import React, { useState } from 'react';
import { useBulletLabStore } from '../store/useBulletLabStore';
import { MISSIONS_LIST } from '../data/bulletLabData';
import { BulletLabHeader } from './BulletLabHeader';
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
  Info,
} from 'lucide-react';

export const BulletLabContainer: React.FC = () => {
  const currentMission = useBulletLabStore((s) => s.currentMission);
  const [panelOpen, setPanelOpen] = useState(true);

  const activeMissionMeta =
    MISSIONS_LIST.find((m) => m.id === currentMission) ?? MISSIONS_LIST[0]!;

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
      <BulletLabHeader />

      {/* 2. Mission Stepper Navigation */}
      <MissionStepper />

      {/* 3. Main Workspace (3D Canvas + Overlay HUD) */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex">
        {/* Three.js R3F Interactive Canvas */}
        <div className="flex-1 w-full h-full relative">
          <TrainingCanvas />

          {/* Quick 3D Interaction Tip on top-left of canvas */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-950/90 border border-cyan-500/30 text-slate-300 text-[11px] px-3.5 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              <strong className="text-cyan-300">W, A, S, D</strong> เดินตัวละคร Roblox (Shift วิ่ง) · ดับเบิ้ลคลิกอุปกรณ์ที่โต๊ะ PPE เพื่อสวมใส่ · ลากเมาส์หมุนฉาก
            </span>
          </div>
        </div>

        {/* Floating Side Panel: Mission Objectives & Interactive Controls */}
        <aside
          className={`absolute top-4 right-4 bottom-4 z-20 flex flex-col transition-all duration-300 ${
            panelOpen
              ? 'w-84 sm:w-96'
              : 'w-12 h-12 overflow-hidden'
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

              {/* Scrollable Mission Interactive Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {renderActiveMissionPanel()}
              </div>

              {/* Bottom Quick Status */}
              <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
                <span>โหมดจำลองอิสระ (Sandbox)</span>
                <span className="text-cyan-400 font-mono">
                  ภารกิจ {currentMission} จาก 4
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setPanelOpen(true)}
              className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-400 shadow-xl flex items-center justify-center cursor-pointer backdrop-blur-md transition-all"
              title="เปิดแผงควบคุมภารกิจ"
            >
              <PanelRightOpen className="w-5 h-5" />
            </button>
          )}
        </aside>
      </div>

      {/* 4. Picture-in-Picture Camera Live Preview */}
      <CameraPreviewPiP />

      {/* 5. Real-time Action Log Drawer */}
      <ActionLogDrawer />

      {/* 6. Summary Result Screen Preview */}
      <ResultModalPreview />

      {/* 7. Dedicated PPE Station Workbench Modal */}
      <PpeStationModal />

      {/* 8. Dedicated Mission 4 Installation & Assessment Modal */}
      <Mission4InstallationModal />
    </div>
  );
};
