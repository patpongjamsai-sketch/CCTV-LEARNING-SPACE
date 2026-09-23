'use client';

import React, { useState, useEffect } from 'react';
import { useRoleplayStore } from '../../../store/useRoleplayStore';
import { DeviceId } from '../../../shared/domain/roleplayTypes';
import { Room101Mission5IsometricCanvas } from './Room101Mission5IsometricCanvas';

interface Room101Mission5ModalProps {
  onClose: () => void;
  onPrev?: () => void;
  onCompleteAll?: () => void;
}

export const Room101Mission5Modal: React.FC<Room101Mission5ModalProps> = ({
  onClose,
  onPrev,
  onCompleteAll,
}) => {
  const connections = useRoleplayStore((s) => s.connections);
  const poweredDevices = useRoleplayStore((s) => s.poweredDevices);
  const topology = useRoleplayStore((s) => s.topologyResult);
  const missionState = useRoleplayStore((s) => s.missions.M5);
  const connectCable = useRoleplayStore((s) => s.connectCable);
  const toggleDevicePower = useRoleplayStore((s) => s.toggleDevicePower);
  const ensureM5DevicesReady = useRoleplayStore((s) => s.ensureM5DevicesReady);
  const resetM5Connections = useRoleplayStore((s) => s.resetM5Connections);
  const rubric = useRoleplayStore((s) => s.rubric);

  // Ensure devices are registered on mount
  useEffect(() => {
    ensureM5DevicesReady();
  }, [ensureM5DevicesReady]);

  // Port selection state for manual wiring
  const [selectedPort, setSelectedPort] = useState<{
    deviceId: DeviceId;
    portId: string;
    portType: 'RJ45' | 'HDMI';
  } | null>(null);

  const [wiringNotice, setWiringNotice] = useState<string | null>(null);
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleString('th-TH', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check existing cables
  const hasCamToSwitch = connections.some(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'CAMERA_BULLET' && c.toDeviceId === 'POE_SWITCH_8P') ||
        (c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'CAMERA_BULLET'))
  );

  const hasSwitchToNvr = connections.some(
    (c) =>
      c.cableType === 'CAT6' &&
      ((c.fromDeviceId === 'POE_SWITCH_8P' && c.toDeviceId === 'NVR_8CH') ||
        (c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'POE_SWITCH_8P'))
  );

  const hasNvrToMonitor = connections.some(
    (c) =>
      c.cableType === 'HDMI' &&
      ((c.fromDeviceId === 'NVR_8CH' && c.toDeviceId === 'MONITOR') ||
        (c.fromDeviceId === 'MONITOR' && c.toDeviceId === 'NVR_8CH'))
  );

  const isSwitchPowered = !!poweredDevices.POE_SWITCH_8P;
  const isNvrPowered = !!poweredDevices.NVR_8CH;
  const isMonitorPowered = !!poweredDevices.MONITOR;

  // Handle clicking on a port
  const handlePortClick = (
    deviceId: DeviceId,
    portId: string,
    portType: 'RJ45' | 'HDMI'
  ) => {
    if (!selectedPort) {
      setSelectedPort({ deviceId, portId, portType });
      setWiringNotice(`เลือกพอร์ตต้นทาง: [${deviceId}] ${portId} (${portType}) กรุณาคลิกพอร์ตปลายทางที่ต้องการต่อสาย`);
      return;
    }

    // Clicking same port cancels
    if (selectedPort.deviceId === deviceId && selectedPort.portId === portId) {
      setSelectedPort(null);
      setWiringNotice('ยกเลิกการเลือกพอร์ต');
      return;
    }

    // Validate media compatibility
    if (selectedPort.portType !== portType) {
      setWiringNotice(`❌ ชนิดสายไม่ตรงกัน: ไม่สามารถเชื่อมต่อสายสัญญาณระหว่างพอร์ต ${selectedPort.portType} กับ ${portType} ได้`);
      setSelectedPort(null);
      return;
    }

    if (selectedPort.deviceId === deviceId) {
      setWiringNotice('❌ ไม่สามารถต่อสายวนกลับมาที่อุปกรณ์ตัวเดียวกันได้');
      setSelectedPort(null);
      return;
    }

    const cableType = portType === 'HDMI' ? 'HDMI' : 'CAT6';
    connectCable(
      cableType,
      selectedPort.deviceId,
      selectedPort.portId,
      deviceId,
      portId
    );
    setWiringNotice(`✓ ต่อสาย ${cableType}: [${selectedPort.deviceId}] ➔ [${deviceId}] สำเร็จ!`);
    setSelectedPort(null);
  };

  // Quick connect all 3 standard cables
  const handleConnectStandardCables = () => {
    resetM5Connections();
    setTimeout(() => {
      connectCable('CAT6', 'CAMERA_BULLET', 'RJ45_POE', 'POE_SWITCH_8P', 'POE_1');
      connectCable('CAT6', 'POE_SWITCH_8P', 'LAN_UPLINK', 'NVR_8CH', 'LAN_1');
      connectCable('HDMI', 'NVR_8CH', 'HDMI_OUT', 'MONITOR', 'HDMI_IN');
      // Power on all 3
      if (!useRoleplayStore.getState().poweredDevices.POE_SWITCH_8P) toggleDevicePower('POE_SWITCH_8P');
      if (!useRoleplayStore.getState().poweredDevices.NVR_8CH) toggleDevicePower('NVR_8CH');
      if (!useRoleplayStore.getState().poweredDevices.MONITOR) toggleDevicePower('MONITOR');
      setWiringNotice('✓ ต่อสายมาตรฐาน Cat6 และ HDMI ครบ 3 เส้น พร้อมเปิดสวิตช์ระบบเรียบร้อย!');
    }, 50);
  };

  const handlePowerAll = () => {
    if (!isSwitchPowered) toggleDevicePower('POE_SWITCH_8P');
    if (!isNvrPowered) toggleDevicePower('NVR_8CH');
    if (!isMonitorPowered) toggleDevicePower('MONITOR');
    setWiringNotice('เปิดสวิตช์ไฟ AC อุปกรณ์ทั้งหมดเรียบร้อย');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-5xl max-h-[94vh] bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold border border-sky-500/30">
              5
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  ภารกิจที่ 5 · 25 คะแนน
                </span>
                {topology.isLiveViewActive && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 ONLINE & LIVE VIEW ACTIVE
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                ประกอบระบบและเชื่อมต่อสายสัญญาณ (Cabling & System Commissioning)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-300">
              คะแนน M5:{' '}
              <strong className="text-emerald-400 font-bold text-sm">
                {missionState.score}
              </strong>
              /25 · รวมทั้งวิชา: <strong className="text-sky-400 font-bold text-sm">{rubric.totalScore}</strong>/100
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">เครื่องมือด่วน:</span>
              <button
                type="button"
                onClick={handleConnectStandardCables}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>ต่อสายมาตรฐาน &amp; เปิดระบบทันที (Standard Setup)</span>
              </button>
              <button
                type="button"
                onClick={handlePowerAll}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
              >
                🔌 เปิดไฟทุกเครื่อง
              </button>
              <button
                type="button"
                onClick={resetM5Connections}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
              >
                ↺ รีเซ็ตสาย
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                PoE: <strong className="text-sky-400">{topology.totalPoeWattsUsed}/{topology.poeBudgetWatts}W</strong>
              </div>
              <div>
                กล้อง:{' '}
                <strong className={topology.isCameraOnline ? 'text-emerald-400' : 'text-rose-400'}>
                  {topology.isCameraOnline ? 'ONLINE' : 'OFFLINE'}
                </strong>
              </div>
              <div>
                NVR:{' '}
                <strong className={topology.isNvrReachable ? 'text-emerald-400' : 'text-rose-400'}>
                  {topology.isNvrReachable ? 'UP' : 'DOWN'}
                </strong>
              </div>
            </div>
          </div>

          {/* Notice Alert if active */}
          {wiringNotice && (
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 flex items-center justify-between">
              <span>{wiringNotice}</span>
              <button
                type="button"
                onClick={() => setWiringNotice(null)}
                className="text-slate-400 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* 3D Isometric Interactive Cabling Lab Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>🛰️</span>
                <span>เวิร์กเบนช์ต่อสาย 3D Isometric Lab (คลิกพอร์ต 3D เพื่อต่อสาย Cat6 / HDMI &amp; เปิดสวิตช์ไฟ)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                สถานะ: {topology.isLiveViewActive ? '● ระบบออนไลน์สมบูรณ์ (4K Live View)' : 'รอการเชื่อมต่อสายและเปิดไฟ'}
              </span>
            </div>

            <Room101Mission5IsometricCanvas
              selectedPort={selectedPort}
              onPortClick={handlePortClick}
              onPowerToggle={toggleDevicePower}
            />
          </div>

          {/* Interactive 2D Wiring Schematic */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              ผังสถานะพอร์ตและวงจรไฟฟ้า (Circuit Status &amp; Detail Diagram)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* NODE 1: IP CAMERA */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">📹</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        topology.isCameraOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {topology.isCameraOnline ? '● Online' : '○ Offline'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">1. กล้อง IP Camera</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">รับไฟเลี้ยง PoE 12.5W ผ่านสายแลน</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">พอร์ตเชื่อมต่อ:</span>
                  <button
                    type="button"
                    onClick={() => handlePortClick('CAMERA_BULLET', 'RJ45_POE', 'RJ45')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'CAMERA_BULLET' && selectedPort?.portId === 'RJ45_POE'
                        ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-sky-400'
                        : hasCamToSwitch
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[RJ45 PoE In]</span>
                    <span className="text-[10px]">{hasCamToSwitch ? 'ต่อสายแล้ว ✓' : 'คลิกต่อสาย'}</span>
                  </button>
                </div>
              </div>

              {/* NODE 2: POE SWITCH */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">🔀</span>
                    <button
                      type="button"
                      onClick={() => toggleDevicePower('POE_SWITCH_8P')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        isSwitchPowered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isSwitchPowered ? '⚡ สวิตช์ ON' : '○ สวิตช์ OFF'}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white">2. สวิตช์ 8-Port PoE</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">จ่ายไฟ PoE 48V (65W Budget)</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">พอร์ตเชื่อมต่อ:</span>
                  <button
                    type="button"
                    onClick={() => handlePortClick('POE_SWITCH_8P', 'POE_1', 'RJ45')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'POE_SWITCH_8P' && selectedPort?.portId === 'POE_1'
                        ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-sky-400'
                        : hasCamToSwitch
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[Port 1: PoE Out]</span>
                    <span className="text-[10px]">{hasCamToSwitch ? 'รับกล้อง ✓' : 'คลิกต่อสาย'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePortClick('POE_SWITCH_8P', 'LAN_UPLINK', 'RJ45')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'POE_SWITCH_8P' && selectedPort?.portId === 'LAN_UPLINK'
                        ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-sky-400'
                        : hasSwitchToNvr
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[LAN Uplink]</span>
                    <span className="text-[10px]">{hasSwitchToNvr ? 'ส่ง NVR ✓' : 'คลิกต่อสาย'}</span>
                  </button>
                </div>
              </div>

              {/* NODE 3: NVR */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">📼</span>
                    <button
                      type="button"
                      onClick={() => toggleDevicePower('NVR_8CH')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        isNvrPowered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isNvrPowered ? '⚡ เครื่อง ON' : '○ เครื่อง OFF'}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white">3. เครื่องบันทึก NVR</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">รับสตรีมภาพและส่งสัญญาณจอ</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">พอร์ตเชื่อมต่อ:</span>
                  <button
                    type="button"
                    onClick={() => handlePortClick('NVR_8CH', 'LAN_1', 'RJ45')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'NVR_8CH' && selectedPort?.portId === 'LAN_1'
                        ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-sky-400'
                        : hasSwitchToNvr
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[LAN Network In]</span>
                    <span className="text-[10px]">{hasSwitchToNvr ? 'รับ Switch ✓' : 'คลิกต่อสาย'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePortClick('NVR_8CH', 'HDMI_OUT', 'HDMI')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'NVR_8CH' && selectedPort?.portId === 'HDMI_OUT'
                        ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400'
                        : hasNvrToMonitor
                        ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[HDMI Out]</span>
                    <span className="text-[10px]">{hasNvrToMonitor ? 'ส่งจอภาพ ✓' : 'คลิกต่อสาย'}</span>
                  </button>
                </div>
              </div>

              {/* NODE 4: MONITOR DISPLAY */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border-2 border-slate-800 flex flex-col justify-between gap-3 shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-800 border border-slate-700">🖥️</span>
                    <button
                      type="button"
                      onClick={() => toggleDevicePower('MONITOR')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        isMonitorPowered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isMonitorPowered ? '⚡ จอภาพ ON' : '○ จอภาพ OFF'}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-white">4. จอมอนิเตอร์ตรวจการ</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">แสดงภาพสดแบบ Full HD</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono">พอร์ตเชื่อมต่อ:</span>
                  <button
                    type="button"
                    onClick={() => handlePortClick('MONITOR', 'HDMI_IN', 'HDMI')}
                    className={`w-full p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-all ${
                      selectedPort?.deviceId === 'MONITOR' && selectedPort?.portId === 'HDMI_IN'
                        ? 'bg-amber-400 text-slate-950 border-white ring-2 ring-amber-400'
                        : hasNvrToMonitor
                        ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>[HDMI In]</span>
                    <span className="text-[10px]">{hasNvrToMonitor ? 'รับภาพ NVR ✓' : 'คลิกต่อสาย'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live View Screen Simulation */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              หน้าจอแสดงผลสด CCTV Live View (ผลลัพธ์การทดสอบระบบ)
            </span>

            <div className="w-full aspect-video max-h-80 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden relative flex items-center justify-center shadow-2xl">
              {topology.isLiveViewActive ? (
                <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 flex flex-col justify-between p-4 overflow-hidden">
                  {/* Subtle Scanlines effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/20 to-black/60" />
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

                  {/* CCTV Stream OSD Header */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold drop-shadow">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-rose-400 font-black tracking-wider">[● REC]</span>
                      <span className="text-white">CAM 01: ENTRANCE SMART MART</span>
                    </span>
                    <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">
                      3840x2160 (4K UHD) @ 30FPS · H.265+ · 4096 Kbps
                    </span>
                    <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/50">
                      {liveTime || 'LIVE'}
                    </span>
                  </div>

                  {/* Simulated Camera View Center & AI Bounding Box */}
                  <div className="relative z-10 text-center space-y-2 my-auto">
                    <div className="inline-block relative p-4 border border-emerald-500/30 rounded-2xl bg-slate-950/40 backdrop-blur-sm shadow-xl">
                      {/* Corner Target Markers */}
                      <span className="absolute top-1 left-1 text-emerald-400 text-xs font-mono">┌</span>
                      <span className="absolute top-1 right-1 text-emerald-400 text-xs font-mono">┐</span>
                      <span className="absolute bottom-1 left-1 text-emerald-400 text-xs font-mono">└</span>
                      <span className="absolute bottom-1 right-1 text-emerald-400 text-xs font-mono">┘</span>

                      <div className="text-5xl animate-bounce duration-1000">🏪</div>
                      <div className="text-sm font-bold text-white mt-1">
                        สัญญาณภาพสดสมบูรณ์ (4K CCTV Live Stream Active)
                      </div>
                      <div className="text-xs text-emerald-300 font-mono">
                        PoE 48V Linked · NVR Stream OK · HDMI 60Hz · 0 Packet Loss
                      </div>
                    </div>
                  </div>

                  {/* OSD Footer */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>IP: 192.168.1.101/24 (PoE: 7.5W)</span>
                    <span className="text-emerald-400 font-bold">🟢 STATUS: ALL HARDWARE ONLINE &amp; RECORDING</span>
                    <span className="text-sky-300 font-bold">คะแนนเต็ม 25/25 ✓</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full p-6 flex flex-col justify-between items-center text-center bg-slate-950">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>INPUT: HDMI 1</span>
                    <span>MONITOR: {isMonitorPowered ? 'POWER ON' : 'STANDBY'}</span>
                  </div>

                  <div className="space-y-3 max-w-lg mx-auto">
                    <div className="text-4xl opacity-40">
                      {hasNvrToMonitor ? '📺' : '🔌'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-300">
                        {!hasNvrToMonitor
                          ? '[ ยังไม่ได้เชื่อมต่อสาย HDMI สู่จอมอนิเตอร์ ]'
                          : !isMonitorPowered || !isNvrPowered || !isSwitchPowered
                          ? '[ สัญญาณ HDMI พร้อมแล้ว — รอเปิดสวิตช์ไฟอุปกรณ์ ]'
                          : '[ รอสัญญาณภาพจากกล้องและ NVR ]'}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {!hasNvrToMonitor
                          ? 'คลิกพอร์ต [HDMI In] ที่จอมอนิเตอร์ และ [HDMI Out] ที่เครื่อง NVR เพื่อเชื่อมโยงสัญญาณภาพ'
                          : 'ต่อสาย HDMI เรียบร้อยแล้ว กรุณากดปุ่มเปิดสวิตช์ Power ON ให้ครบทุกเครื่อง'}
                      </p>
                    </div>

                    {/* Step-by-Step Connection Status Indicators */}
                    <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono">
                      <span className={`px-2 py-1 rounded-lg border ${hasCamToSwitch ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        1. กล้อง ➔ Switch: {hasCamToSwitch ? '✓' : 'รอต่อ'}
                      </span>
                      <span className={`px-2 py-1 rounded-lg border ${hasSwitchToNvr ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        2. Switch ➔ NVR: {hasSwitchToNvr ? '✓' : 'รอต่อ'}
                      </span>
                      <span className={`px-2 py-1 rounded-lg border ${hasNvrToMonitor ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                        3. NVR ➔ Monitor (HDMI): {hasNvrToMonitor ? '✓' : 'รอต่อ'}
                      </span>
                    </div>

                    {/* Quick Power Button if cables are connected */}
                    {hasCamToSwitch && hasSwitchToNvr && hasNvrToMonitor && (!isSwitchPowered || !isNvrPowered || !isMonitorPowered) && (
                      <button
                        type="button"
                        onClick={handlePowerAll}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                      >
                        ⚡ เปิดสวิตช์ไฟทุกอุปกรณ์ทันที เพื่อเริ่ม Live View
                      </button>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 font-mono">
                    PRO-TIP: รองรับการคลิกเชื่อมต่อทั้งจากหน้าจอ 3D ด้านบนและผัง 2D ด้านล่าง
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic Log Output */}
          {topology.diagnosticEvents.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs font-mono">
              <span className="font-bold text-slate-400">บันทึกผลการทดสอบระบบ (Diagnostic Logs):</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {topology.diagnosticEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded text-[11px] ${
                      evt.severity === 'SUCCESS'
                        ? 'text-emerald-300 bg-emerald-950/30'
                        : evt.severity === 'ERROR'
                        ? 'text-rose-300 bg-rose-950/30'
                        : 'text-amber-300 bg-amber-950/30'
                    }`}
                  >
                    [{evt.code}] {evt.titleTh} — {evt.messageTh}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                type="button"
                onClick={onPrev}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                ◀ ย้อนกลับภารกิจที่ 4
              </button>
            )}
            <span className="text-xs text-slate-300 hidden sm:inline">
              {topology.isLiveViewActive
                ? '✓ ผ่านภารกิจที่ 5 สมบูรณ์! ประตูเชื่อมต่อสู่ Room 102 ปลดล็อกแล้ว'
                : 'ต่อสาย Cat6/HDMI และเปิดสวิตช์ให้ภาพ Live View ปรากฏ'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            {topology.isLiveViewActive && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCompleteAll?.();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                🎓 ปฏิบัติภารกิจครบ 5 ขั้นแล้ว (สำเร็จ!)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
