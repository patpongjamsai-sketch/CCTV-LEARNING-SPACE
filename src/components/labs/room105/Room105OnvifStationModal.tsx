'use client';

import React, { useState } from 'react';
import {
  ROOM105_ONVIF_CAMERA_CATALOG,
  INITIAL_CHANNEL_MAPPINGS,
  ChannelMappingRow,
  Station1OnvifMappingPayload,

} from '../../../shared/domain/room105Types';

interface Room105OnvifStationModalProps {
  initialPayload?: Partial<Station1OnvifMappingPayload>;
  onSave: (payload: Station1OnvifMappingPayload) => void;
  onClose: () => void;
}

export const Room105OnvifStationModal: React.FC<Room105OnvifStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(initialPayload?.onvifDiscovered ?? true);
  const [selectedPreviewCam, setSelectedPreviewCam] = useState<string | null>('CAM-01');

  // Channel mappings state
  const [mappings, setMappings] = useState<ChannelMappingRow[]>(
    initialPayload?.channelMappings && initialPayload.channelMappings.length > 0
      ? initialPayload.channelMappings
      : INITIAL_CHANNEL_MAPPINGS
  );

  // Authentication credentials state per camera (safe simulation - no plain passwords persisted in payload)
  const [,setAuthInputs] = useState<Record<string, { username: string; authSuccess: boolean }>>({
    'CAM-01': { username: 'admin', authSuccess: true },
    'CAM-02': { username: 'admin', authSuccess: true },
    'CAM-03': { username: 'admin', authSuccess: true },
    'CAM-04': { username: 'admin', authSuccess: true },
  });

  // Trigger ONVIF discovery simulation
  const handleTriggerDiscovery = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 800);
  };

  // Change Channel mapping
  const handleAssignChannel = (deviceId: string, newChannel: number) => {
    setMappings((prev) =>
      prev.map((row) => (row.deviceId === deviceId ? { ...row, channelNumber: newChannel } : row))
    );
  };

  // Toggle authentication status simulation
  const handleToggleAuth = (deviceId: string) => {
    setAuthInputs((prev) => {
      const current = prev[deviceId] || { username: 'admin', authSuccess: true };
      const nextSuccess = !current.authSuccess;
      return {
        ...prev,
        [deviceId]: { ...current, authSuccess: nextSuccess },
      };
    });
    setMappings((prev) =>
      prev.map((row) =>
        row.deviceId === deviceId
          ? {
            ...row,
            authenticated: !row.authenticated,
            status: !row.authenticated ? 'ONLINE' : 'OFFLINE',
          }
          : row
      )
    );
  };

  // Check channel collisions (duplicate channels)
  const channelCounts: Record<number, number> = {};
  mappings.forEach((row) => {
    channelCounts[row.channelNumber] = (channelCounts[row.channelNumber] || 0) + 1;
  });
  const collisionChannels = Object.keys(channelCounts)
    .map(Number)
    .filter((ch) => (channelCounts[ch] ?? 0) > 1);
  const hasCollision = collisionChannels.length > 0;

  // Auto-align correct 1-to-1 mappings
  const handleAutoAlign = () => {
    setMappings(INITIAL_CHANNEL_MAPPINGS);
    setHasScanned(true);
    setAuthInputs({
      'CAM-01': { username: 'admin', authSuccess: true },
      'CAM-02': { username: 'admin', authSuccess: true },
      'CAM-03': { username: 'admin', authSuccess: true },
      'CAM-04': { username: 'admin', authSuccess: true },
    });
  };

  // Scoring calculation (35 pts max)
  let score = 0;
  // 1. ONVIF Scan completed (10 pts)
  if (hasScanned) score += 10;

  // 2. Authentication passed on at least 3 cameras (8 pts)
  const authCount = mappings.filter((m) => m.authenticated).length;
  if (authCount >= 4) score += 8;
  else if (authCount >= 2) score += 5;

  // 3. Channel Mapping with no collision and all 4 mapped (10 pts)
  if (!hasCollision && mappings.length >= 4) score += 10;
  else if (!hasCollision && mappings.length >= 2) score += 6;

  // 4. Status online & preview verified (7 pts)
  const onlineCount = mappings.filter((m) => m.status === 'ONLINE' && m.previewVerified).length;
  if (onlineCount >= 4) score += 7;
  else if (onlineCount >= 2) score += 4;

  const handleSave = () => {
    const payload: Station1OnvifMappingPayload = {
      onvifDiscovered: hasScanned,
      discoveredDeviceCount: ROOM105_ONVIF_CAMERA_CATALOG.length,
      channelMappings: mappings,
      hasChannelCollision: hasCollision,
      totalAssignedChannels: mappings.length,
      authSuccessCount: authCount,
      score,
      isCompleted: true,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl shadow-inner">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  STATION 1 (35 คะแนน)
                </span>
                <span className="text-[10px] text-slate-400">ONVIF Profile S/G/T & Channel Binding</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                ค้นหากล้อง ONVIF Discovery & จัดทำผัง Channel Mapping
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">คะแนนสถานี 1</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {score} <span className="text-xs text-slate-400 font-normal">/ 35</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Work Order Scenario Banner */}
          <div className="bg-sky-950/40 border border-sky-500/30 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div className="space-y-1">
              <strong className="text-sky-300 text-sm block">ใบงานคำสั่งการตั้งค่า NVR:</strong>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                ให้ผู้เรียนทำการค้นหากล้อง IP Camera ทั้ง 4 ตัวในเครือข่าย LAN ผ่านโปรโตคอล <strong>ONVIF (WS-Discovery)</strong>,
                ตรวจสอบพอร์ต <strong>ONVIF (8000)</strong> และ <strong>RTSP (554)</strong>, ยืนยันความปลอดภัยด้วยสิทธิ์ของบัญชีกล้อง,
                และดำเนินการ <strong>Channel Mapping (CH 1 ถึง CH 4)</strong> ให้ตรงกับประเภทและตำแหน่งกล้อง
                โดยต้องไม่มีการชนกันของ Channel (No Duplicate Channels)
              </p>
            </div>
          </div>

          {/* Action Toolbar: ONVIF Scanner & Alignment */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerDiscovery}
                disabled={isScanning}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    <span>กำลังสแกนเครือข่าย ONVIF...</span>
                  </>
                ) : (
                  <>
                    <span>📡</span>
                    <span>สแกนค้นหากล้อง ONVIF ใน LAN</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAutoAlign}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-semibold transition-all cursor-pointer"
              >
                ✨ จัดผังมาตรฐานอัตโนมัติ (Reset / Align)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">สถานะเครือข่าย:</span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                LAN 192.168.1.0/24 · ONVIF Online ({ROOM105_ONVIF_CAMERA_CATALOG.length} อุปกรณ์)
              </span>
            </div>
          </div>

          {/* Collision Warning Alert */}
          {hasCollision && (
            <div className="bg-amber-950/80 border border-amber-500/80 rounded-2xl p-3.5 text-amber-200 flex items-center gap-3 animate-pulse">
              <span className="text-xl">⚠️</span>
              <div>
                <strong className="font-bold text-amber-300">แจ้งเตือน Channel Collision:</strong> ตรวจพบการจับคู่ Channel ซ้ำกันในช่อง CH{' '}
                {collisionChannels.join(', ')} กรุณากำหนด Channel ให้ไม่ซ้ำกัน (1 กล้องต่อ 1 Channel)
              </div>
            </div>
          )}

          {/* Grid Layout: Camera Catalog & Channel Mapping */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Discovered ONVIF Devices & Mapping Form (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                    <span>📹</span> ตารางจับคู่ Channel บน NVR (Channel Mapping Table)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    กำหนด CH 1 - 4 ให้สอดคล้องกับ IP Camera
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2 px-2.5">อุปกรณ์</th>
                        <th className="py-2 px-2.5">IP / พอร์ต</th>
                        <th className="py-2 px-2.5">Profile</th>
                        <th className="py-2 px-2.5 text-center">NVR Channel</th>
                        <th className="py-2 px-2.5 text-center">ยืนยันสิทธิ์</th>
                        <th className="py-2 px-2.5 text-center">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {ROOM105_ONVIF_CAMERA_CATALOG.map((cam) => {
                        const currentMapping = mappings.find((m) => m.deviceId === cam.deviceId);
                        const isOnline = currentMapping?.status === 'ONLINE';
                        const currentCh = currentMapping?.channelNumber ?? 1;
                        const isDuplicate = (channelCounts[currentCh] ?? 0) > 1;

                        return (
                          <tr
                            key={cam.deviceId}
                            className={`hover:bg-slate-900/60 transition-colors ${selectedPreviewCam === cam.deviceId ? 'bg-sky-950/30' : ''
                              }`}
                            onClick={() => setSelectedPreviewCam(cam.deviceId)}
                          >
                            <td className="py-3 px-2.5">
                              <div className="font-bold text-slate-200">{cam.deviceId}</div>
                              <div className="text-[10px] text-slate-400">{cam.deviceNameTh}</div>
                            </td>
                            <td className="py-3 px-2.5 font-mono">
                              <div className="text-sky-300 font-bold">{cam.ipAddress}</div>
                              <div className="text-[10px] text-slate-400">
                                HTTP:{cam.httpPort} · ONVIF:{cam.onvifPort} · RTSP:{cam.rtspPort}
                              </div>
                            </td>
                            <td className="py-3 px-2.5">
                              <div className="flex flex-wrap gap-1">
                                {cam.supportedProfiles.map((p) => (
                                  <span
                                    key={p}
                                    className="bg-slate-800 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-2.5 text-center">
                              <select
                                value={currentCh}
                                onChange={(e) => handleAssignChannel(cam.deviceId, Number(e.target.value))}
                                className={`bg-slate-900 font-bold font-mono px-2.5 py-1.5 rounded-xl border text-xs cursor-pointer ${isDuplicate
                                    ? 'border-amber-500 text-amber-300 bg-amber-950/40'
                                    : 'border-sky-500/50 text-white'
                                  }`}
                              >
                                <option value={1}>CH 1 (Channel 1)</option>
                                <option value={2}>CH 2 (Channel 2)</option>
                                <option value={3}>CH 3 (Channel 3)</option>
                                <option value={4}>CH 4 (Channel 4)</option>
                              </select>
                            </td>
                            <td className="py-3 px-2.5 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAuth(cam.deviceId);
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${currentMapping?.authenticated
                                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                                    : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                                  }`}
                              >
                                {currentMapping?.authenticated ? '✓ ผ่านสิทธิ์ (admin)' : '✕ ไม่ผ่านสิทธิ์'}
                              </button>
                            </td>
                            <td className="py-3 px-2.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isOnline
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Camera Preview & Specs Monitor (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {(() => {
                const activeCam =
                  ROOM105_ONVIF_CAMERA_CATALOG.find(
                    (c) => c.deviceId === selectedPreviewCam
                  ) ?? ROOM105_ONVIF_CAMERA_CATALOG[0];

                if (!activeCam) {
                  return (
                    <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-amber-300">
                      ไม่พบข้อมูลกล้องสำหรับแสดงตัวอย่าง
                    </div>
                  );
                }

                const activeMapping = mappings.find(
                  (m) => m.deviceId === activeCam.deviceId
                );

                const isOnline = activeMapping?.status === 'ONLINE';

                return (
                  <div className="bg-slate-950/80 border border-sky-500/40 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                        <span>📺</span> Live Preview: {activeCam.deviceId}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        NVR CH {activeMapping?.channelNumber}
                      </span>
                    </div>

                    {/* Simulated Screen */}
                    <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center text-center p-3 shadow-inner">
                      {isOnline ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-900/60 pointer-events-none" />
                          <div className="relative z-10 space-y-1">
                            <div className="text-3xl">📹</div>
                            <div className="text-emerald-400 font-bold font-mono text-xs tracking-wider">
                              [LIVE STREAM ACTIVE]
                            </div>
                            <div className="text-[10px] text-slate-300">{activeCam.locationTh}</div>
                          </div>
                          {/* OSD Watermark */}
                          <div className="absolute top-2 left-2 text-[9px] font-mono text-emerald-300/80 bg-black/50 px-1.5 py-0.5 rounded">
                            {activeCam.deviceId} · {activeCam.sensorResolution}
                          </div>
                          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-black/50 px-1.5 py-0.5 rounded">
                            25.0 FPS · RTSP/H.265
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-2xl text-rose-400">⚠️</div>
                          <div className="text-rose-400 font-bold text-[11px]">NO VIDEO STREAM</div>
                          <div className="text-[10px] text-slate-400">
                            Authentication Failed or Channel Offline
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Device Details */}
                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ตำแหน่งติดตั้ง:</span>
                        <span className="text-slate-200 font-semibold">{activeCam.locationTh}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ความละเอียดเซ็นเซอร์:</span>
                        <span className="text-sky-300 font-mono font-semibold">{activeCam.sensorResolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ประเภทเลนส์:</span>
                        <span className="text-slate-200">{activeCam.lensType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">MAC Address:</span>
                        <span className="text-slate-300 font-mono">{activeCam.macAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RTSP Stream Path:</span>
                        <span className="text-indigo-300 font-mono text-[9px]">
                          rtsp://{activeCam.ipAddress}:554/live/ch{activeMapping?.channelNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>เกณฑ์ผ่านสถานี 1:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              สแกนพบกล้องครบ · ไม่มี Channel Collision · Online ทุกช่องสัญญาณ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer text-xs"
            >
              ยกเลิก / ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-sky-500 to-emerald-600 hover:from-sky-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all cursor-pointer text-xs flex items-center gap-2"
            >
              <span>💾</span>
              <span>บันทึกผล Station 1 ({score} คะแนน)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
