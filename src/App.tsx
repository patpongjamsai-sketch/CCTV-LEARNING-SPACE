import React, { useState } from 'react';
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
import { LESSON_META } from './data/unit1RoleplayContent';

export const App: React.FC = () => {
  const isStarted = useRoleplayStore((s) => s.isStarted);
  const startSession = useRoleplayStore((s) => s.startSession);
  const openStationDialogue = useRoleplayStore((s) => s.openStationDialogue);
  const graphicsQuality = useRoleplayStore((s) => s.graphicsQuality);

  const [inputName, setInputName] = useState('นักเรียนช่างฝึกหัด CCTV');

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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-7 shadow-2xl text-slate-100 flex flex-col gap-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 mx-auto text-3xl border border-sky-500/30">
              📹
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase">
                {LESSON_META.courseCode} · ปวช. พ.ศ. 2567
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1">
                Unit 1: IP CCTV Fundamentals
              </h1>
              <h2 className="text-sm font-semibold text-slate-400">
                Block-Style Role-Play · Smart Mart Convenience Store
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              รับบทเป็น “ช่างฝึกหัด CCTV” เดินสำรวจร้าน Smart Mart พบผู้จัดการร้านและช่างผู้เชี่ยวชาญ รวบรวมการ์ดความรู้ ติดตั้งอุปกรณ์เสมือนจริง และต่อสายสัญญาณ Cat6/HDMI จนระบบออนไลน์และมีภาพ Live View ก่อนร้านเปิด!
            </p>

            <div className="text-left space-y-1">
              <label className="text-xs text-slate-400 font-medium">ชื่อผู้รับการฝึก / รหัสประจำตัว:</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                placeholder="ระบุชื่อ-นามสกุล หรือ รหัสนักศึกษา"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
              <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">WASD</kbd> เดิน / วิ่ง (Shift)</div>
              <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">Mouse</kbd> หมุนมุมกล้อง</div>
              <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">E / F</kbd> พูดคุย / หยิบ / วาง</div>
              <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">Tab</kbd> Checklist / แผนผัง</div>
            </div>

            <button
              type="button"
              onClick={() => startSession(inputName)}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-2xl cursor-pointer shadow-lg shadow-sky-500/25 transition-all text-sm"
            >
              เข้าสู่ Smart Mart และเริ่มภารกิจ
            </button>
          </div>
        </div>
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
