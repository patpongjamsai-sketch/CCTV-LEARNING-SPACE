'use client';

import React, { useState } from 'react';
import {
  Station2VideoCodecPayload,
  VideoCodecType,
  BitrateControlMode,
  ChannelStreamConfig,
} from '../../../shared/domain/room105Types';

interface Room105CodecStationModalProps {
  initialPayload?: Partial<Station2VideoCodecPayload>;
  onSave: (payload: Station2VideoCodecPayload) => void;
  onClose: () => void;
}

export const Room105CodecStationModal: React.FC<Room105CodecStationModalProps> = ({
  initialPayload,
  onSave,
  onClose,
}) => {
  const [globalCodec, setGlobalCodec] = useState<VideoCodecType>(
    initialPayload?.selectedGlobalCodec || 'H.265'
  );
  const [multiSplitMode, setMultiSplitMode] = useState<'1-SPLIT' | '4-SPLIT'>(
    initialPayload?.multiSplitMode || '4-SPLIT'
  );
  const [selectedChannel, setSelectedChannel] = useState<number>(1);
  const [bitrateReasoning, setBitrateReasoning] = useState<string>(
    initialPayload?.bitrateReasoning ||
      'ใช้ H.265 ร่วมกับ CBR สำหรับพื้นที่ที่ต้องการรักษาเสถียรภาพแบนด์วิดท์บนเครือข่าย LAN ไม่ให้เกิด Bitrate Spike และใช้ Main Stream 4096 kbps สำหรับบันทึกลง Hard Disk ควบคู่ Sub Stream สำหรับ Live View หลายจอ'
  );
  const [liveViewVerified, setLiveViewVerified] = useState<boolean>(
    initialPayload?.liveViewVerified ?? true
  );

  // Per-channel stream configs
  const [channelConfigs, setChannelConfigs] = useState<Record<number, ChannelStreamConfig>>(
    initialPayload?.streamConfigs || {
      1: {
        channelNumber: 1,
        cameraName: 'CH 1: Dome 4K (Main Entrance)',
        mainStream: {
          codec: globalCodec,
          resolution: '3840x2160 (4K UHD)',
          frameRateFps: 25,
          bitrateKbps: 4096,
          bitrateMode: 'CBR',
        },
        subStream: {
          codec: globalCodec,
          resolution: '704x576 (D1)',
          frameRateFps: 15,
          bitrateKbps: 512,
          bitrateMode: 'VBR',
        },
        liveViewStatus: 'OPTIMAL',
      },
      2: {
        channelNumber: 2,
        cameraName: 'CH 2: Bullet IR (Warehouse)',
        mainStream: {
          codec: globalCodec,
          resolution: '2560x1440 (2K QHD)',
          frameRateFps: 25,
          bitrateKbps: 3072,
          bitrateMode: 'CBR',
        },
        subStream: {
          codec: globalCodec,
          resolution: '704x576 (D1)',
          frameRateFps: 15,
          bitrateKbps: 512,
          bitrateMode: 'VBR',
        },
        liveViewStatus: 'OPTIMAL',
      },
      3: {
        channelNumber: 3,
        cameraName: 'CH 3: PTZ Speed Dome (Parking)',
        mainStream: {
          codec: globalCodec,
          resolution: '1920x1080 (Full HD)',
          frameRateFps: 30,
          bitrateKbps: 2048,
          bitrateMode: 'VBR',
        },
        subStream: {
          codec: globalCodec,
          resolution: '704x576 (D1)',
          frameRateFps: 15,
          bitrateKbps: 512,
          bitrateMode: 'VBR',
        },
        liveViewStatus: 'OPTIMAL',
      },
      4: {
        channelNumber: 4,
        cameraName: 'CH 4: Corridor Dome (Floor 2)',
        mainStream: {
          codec: globalCodec,
          resolution: '1920x1080 (Full HD)',
          frameRateFps: 25,
          bitrateKbps: 2048,
          bitrateMode: 'CBR',
        },
        subStream: {
          codec: globalCodec,
          resolution: '704x576 (D1)',
          frameRateFps: 15,
          bitrateKbps: 512,
          bitrateMode: 'VBR',
        },
        liveViewStatus: 'OPTIMAL',
      },
    }
  );

  // Switch global codec
  const handleSetGlobalCodec = (codec: VideoCodecType) => {
    setGlobalCodec(codec);

    setChannelConfigs((prev) => {
      const next: Record<number, ChannelStreamConfig> = {};

      Object.keys(prev).forEach((chKey) => {
        const ch = Number(chKey);
        const currentConfig = prev[ch];

        // Record<number, T> can still return undefined when indexed under
        // noUncheckedIndexedAccess, so guard before reading the config.
        if (!currentConfig) {
          return;
        }

        next[ch] = {
          ...currentConfig,
          mainStream: {
            ...currentConfig.mainStream,
            codec,
            // When H.264, increase bitrate to maintain similar image quality.
            bitrateKbps:
              codec === 'H.264'
                ? Math.min(8192, currentConfig.mainStream.bitrateKbps * 1.5)
                : 4096,
          },
          subStream: {
            ...currentConfig.subStream,
            codec,
          },
          liveViewStatus: codec === 'H.264' ? 'HIGH_BANDWIDTH' : 'OPTIMAL',
        };
      });

      return next;
    });
  };

  // Update specific channel config
  const handleUpdateChannelConfig = (
    channelNumber: number,
    field: 'frameRateFps' | 'bitrateKbps' | 'bitrateMode' | 'resolution',
    value: number | string | BitrateControlMode
  ) => {
    setChannelConfigs((prev) => {
      const currentConfig = prev[channelNumber];

      if (!currentConfig) {
        return prev;
      }

      return {
        ...prev,
        [channelNumber]: {
          ...currentConfig,
          mainStream: {
            ...currentConfig.mainStream,
            [field]: value,
          },
        },
      };
    });
  };

  // Calculations
  const channelsList = Object.values(channelConfigs);
  const totalBitrateKbps = channelsList.reduce(
    (acc, curr) => acc + curr.mainStream.bitrateKbps + curr.subStream.bitrateKbps,
    0
  );
  const totalBitrateMbps = parseFloat((totalBitrateKbps / 1000).toFixed(2));
  // Daily storage formula: (totalBitrateMbps * 3600 * 24) / (8 * 1024) GB
  const dailyStorageGb = parseFloat(((totalBitrateMbps * 86400) / 8192).toFixed(1));
  const storageSavingPercent = globalCodec === 'H.265' ? 52 : 0;

  // Scoring calculation (35 pts max)
  let score = 0;
  // 1. Codec Selection (H.265 gives max 10 pts, H.264 gives 5)
  if (globalCodec === 'H.265') score += 10;
  else score += 5;

  // 2. Resolution & FPS logic (8 pts)
  const validFps = channelsList.every(
    (c) => c.mainStream.frameRateFps >= 20 && c.mainStream.frameRateFps <= 30
  );
  if (validFps) score += 8;
  else score += 4;

  // 3. Bitrate & Mode Reasoning (8 pts)
  const hasReasoning = bitrateReasoning.trim().length >= 20;
  const reasonableBitrate = totalBitrateMbps <= 20;
  if (hasReasoning && reasonableBitrate) score += 8;
  else if (reasonableBitrate) score += 5;

  // 4. Multi-split Live View verified (9 pts)
  if (liveViewVerified && multiSplitMode === '4-SPLIT') score += 9;
  else if (liveViewVerified) score += 6;

  const handleSave = () => {
    const payload: Station2VideoCodecPayload = {
      selectedGlobalCodec: globalCodec,
      streamConfigs: channelConfigs,
      storageSavingPercent,
      estimatedTotalBitrateMbps: totalBitrateMbps,
      estimatedDailyStorageGb: dailyStorageGb,
      bitrateReasoning,
      liveViewVerified,
      multiSplitMode,
      score,
      isCompleted: true,
    };
    onSave(payload);
  };

  const currentChConfig =
    channelConfigs[selectedChannel] ?? channelConfigs[1];

  if (!currentChConfig) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
        <div className="rounded-2xl border border-amber-500/40 bg-slate-900 p-5 text-amber-300 shadow-xl">
          ไม่พบข้อมูลการตั้งค่า Channel สำหรับ Station 2
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                  STATION 2 (35 คะแนน)
                </span>
                <span className="text-[10px] text-slate-400">Video Compression & Live View Grid</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                การตั้งค่า Video Codec (H.264/H.265), บิตเรต และตรวจภาพสด Live View
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">คะแนนสถานี 2</span>
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
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div className="space-y-1">
              <strong className="text-indigo-300 text-sm block">ใบงานคำสั่งการบีบอัดวิดีโอ & สตรีมมิ่ง:</strong>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                ให้ผู้เรียนเปรียบเทียบมาตรฐานการบีบอัด <strong>H.264</strong> กับ <strong>H.265 (HEVC)</strong>,
                ตั้งค่า <strong>Main Stream</strong> สำหรับการบันทึกภาพคมชัดสูง และ <strong>Sub Stream</strong> สำหรับดูภาพสดหลายจอ,
                ปรับความละเอียด, Frame Rate (FPS), อัตราส่งข้อมูล (Bitrate) และโหมด <strong>CBR / VBR</strong> ให้สมดุลกับแบนด์วิดท์
                พร้อมทดสอบการแสดงผล Multi-Split Live View 4 ช่องสัญญาณ
              </p>
            </div>
          </div>

          {/* Codec Selection Tabs & Efficiency Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Codec Option H.264 */}
            <div
              onClick={() => handleSetGlobalCodec('H.264')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                globalCodec === 'H.264'
                  ? 'bg-amber-950/40 border-amber-500 shadow-xl'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <span>📹</span> มาตรฐาน H.264 (AVC)
                </span>
                {globalCodec === 'H.264' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    เลือกใช้งานอยู่
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                เข้ากันได้กับอุปกรณ์รุ่นเก่าสูง แต่ต้องการแบนด์วิดท์และพื้นที่จัดเก็บบน Hard Disk สูงกว่าถึง <strong>2 เท่า</strong> สำหรับกล้อง 4K/2K
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                <span>การประหยัดพื้นที่: <strong className="text-rose-400">0% (พื้นฐาน)</strong></span>
                <span>การโหลดดิสก์: <strong className="text-amber-400">สูง</strong></span>
              </div>
            </div>

            {/* Codec Option H.265 */}
            <div
              onClick={() => handleSetGlobalCodec('H.265')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                globalCodec === 'H.265'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-xl'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span>⚡</span> มาตรฐาน H.265 (HEVC) / H.265+
                </span>
                {globalCodec === 'H.265' && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    แนะนำ (Recommended)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                เทคโนโลยีการบีบอัดขั้นสูง <strong>ประหยัดพื้นที่จัดเก็บและแบนด์วิดท์ได้มากกว่า 50%</strong> โดยคงความคมชัดและรายละเอียดของภาพระดับ 4K/2K เท่าเดิม
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                <span>การประหยัดพื้นที่: <strong className="text-emerald-400 font-bold">&gt; 50%</strong></span>
                <span>แบนด์วิดท์เครือข่าย: <strong className="text-emerald-400 font-bold">ต่ำ &amp; คล่องตัว</strong></span>
              </div>
            </div>
          </div>

          {/* Bandwidth & Storage Estimation Dashboard */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2">
                <span>📈</span> การวิเคราะห์แบนด์วิดท์และขนาดพื้นที่บันทึก (Bandwidth & Storage Metrics)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">4 Channels Combined</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">แบนด์วิดท์รวม (Bitrate):</span>
                <span className="text-lg font-mono font-bold text-sky-300">{totalBitrateMbps} Mbps</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">รวม Main + Sub Streams</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">พื้นที่บันทึกต่อวัน:</span>
                <span className="text-lg font-mono font-bold text-amber-300">{dailyStorageGb} GB/วัน</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">บันทึกต่อเนื่อง 24 ชม.</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">พื้นที่ 30 วัน (ประมาณการ):</span>
                <span className="text-lg font-mono font-bold text-purple-300">
                  {((dailyStorageGb * 30) / 1024).toFixed(2)} TB
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">แนะนำ HDD Surveillance</span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">อัตราประหยัดเนื้อที่:</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {storageSavingPercent}%
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">
                  {globalCodec === 'H.265' ? '✓ ประหยัดสูงสุดด้วย H.265' : '⚠️ ไม่ได้เปิดใช้ H.265'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Stream Configuration & Live View Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Channel Stream Editor (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span>⚙️</span> กำหนดค่าสตรีมรายช่อง (Stream Settings)
                  </h4>
                  {/* Channel Selector Buttons */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setSelectedChannel(ch)}
                        className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
                          selectedChannel === ch
                            ? 'bg-sky-500 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-200">
                    {currentChConfig.cameraName}
                  </div>

                  {/* Main Stream Settings */}
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <span className="text-sky-300 font-bold text-[10px] block uppercase tracking-wider">
                      1. Main Stream (สำหรับการบันทึกภาพคมชัดสูง)
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">ความละเอียด:</label>
                        <select
                          value={currentChConfig.mainStream.resolution}
                          onChange={(e) =>
                            handleUpdateChannelConfig(selectedChannel, 'resolution', e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[10px]"
                        >
                          <option value="3840x2160 (4K UHD)">3840x2160 (4K UHD)</option>
                          <option value="2560x1440 (2K QHD)">2560x1440 (2K QHD)</option>
                          <option value="1920x1080 (Full HD)">1920x1080 (Full HD)</option>
                          <option value="1280x720 (720P HD)">1280x720 (720P HD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Frame Rate (FPS):</label>
                        <select
                          value={currentChConfig.mainStream.frameRateFps}
                          onChange={(e) =>
                            handleUpdateChannelConfig(selectedChannel, 'frameRateFps', Number(e.target.value))
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[10px]"
                        >
                          <option value={15}>15 FPS (ประหยัดแบนด์วิดท์)</option>
                          <option value={20}>20 FPS (สมดุล)</option>
                          <option value={25}>25 FPS (มาตรฐาน PAL)</option>
                          <option value={30}>30 FPS (มาตรฐาน NTSC)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Bitrate (kbps):</label>
                        <select
                          value={currentChConfig.mainStream.bitrateKbps}
                          onChange={(e) =>
                            handleUpdateChannelConfig(selectedChannel, 'bitrateKbps', Number(e.target.value))
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[10px]"
                        >
                          <option value={1024}>1024 kbps (1 Mbps)</option>
                          <option value={2048}>2048 kbps (2 Mbps)</option>
                          <option value={3072}>3072 kbps (3 Mbps)</option>
                          <option value={4096}>4096 kbps (4 Mbps)</option>
                          <option value={8192}>8192 kbps (8 Mbps)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Bitrate Mode:</label>
                        <select
                          value={currentChConfig.mainStream.bitrateMode}
                          onChange={(e) =>
                            handleUpdateChannelConfig(
                              selectedChannel,
                              'bitrateMode',
                              e.target.value as BitrateControlMode
                            )
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-1.5 rounded-lg text-[10px]"
                        >
                          <option value="CBR">CBR (Constant - แบนด์วิดท์คงที่)</option>
                          <option value="VBR">VBR (Variable - แปรผันตามภาพ)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Engineering Reasoning Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-300 font-bold block">
                      เหตุผลทางวิศวกรรมในการเลือก Codec และ Bitrate Mode:
                    </label>
                    <textarea
                      value={bitrateReasoning}
                      onChange={(e) => setBitrateReasoning(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none"
                      placeholder="อธิบายเหตุผล เช่น ทำไมเลือก H.265 และ CBR/VBR..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live View Grid Simulator (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/80 border border-sky-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                      <span>🖥️</span> NVR Multi-Split Live View Monitor
                    </h4>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                      {globalCodec} STREAMING
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMultiSplitMode('1-SPLIT')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        multiSplitMode === '1-SPLIT'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      1 จอใหญ่
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultiSplitMode('4-SPLIT')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        multiSplitMode === '4-SPLIT'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      4 จอแยก (Quad)
                    </button>
                  </div>
                </div>

                {/* Multi-Split Monitor Matrix */}
                {multiSplitMode === '4-SPLIT' ? (
                  <div className="grid grid-cols-2 gap-2 aspect-video bg-slate-900 rounded-xl p-2 border border-slate-800">
                    {[1, 2, 3, 4].map((ch) => {
                      const cfg = channelConfigs[ch];

                      if (!cfg) {
                        return null;
                      }

                      return (
                        <div
                          key={ch}
                          onClick={() => setSelectedChannel(ch)}
                          className={`relative rounded-lg overflow-hidden border bg-slate-950 flex flex-col items-center justify-center p-2 cursor-pointer transition-all ${
                            selectedChannel === ch
                              ? 'border-sky-400 shadow-md'
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-2xl">📹</div>
                          <div className="text-[10px] font-bold text-slate-200 mt-1">CH {ch}</div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            {cfg.mainStream.resolution.split(' ')[0]} · {cfg.mainStream.frameRateFps} FPS
                          </div>
                          {/* OSD Status Tag */}
                          <div className="absolute top-1 left-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-emerald-400">
                            REC · {globalCodec}
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded text-[8px] font-mono text-sky-300">
                            {cfg.mainStream.bitrateKbps} kbps
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-4">
                    <div className="text-4xl">📹</div>
                    <div className="text-sm font-bold text-white mt-2">
                      CH {selectedChannel}: {currentChConfig.cameraName}
                    </div>
                    <div className="text-xs text-sky-300 font-mono mt-1">
                      {currentChConfig.mainStream.resolution} · {currentChConfig.mainStream.frameRateFps} FPS ·{' '}
                      {currentChConfig.mainStream.bitrateKbps} kbps ({currentChConfig.mainStream.bitrateMode})
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                      LIVE · {globalCodec} 4K STREAM
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>สถานะ Live View:</span>
                    <strong className="text-emerald-400">ภาพนิ่ง เสถียร ไม่กระตุก (Bitrate Balanced)</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setLiveViewVerified(true)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    ✓ ยืนยันการตรวจ Live View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>เกณฑ์ผ่านสถานี 2:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              เลือก H.265 · กำหนด Bitrate/FPS สัมพันธ์กับพื้นที่ · ตรวจ Live View Multi-Split
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
              <span>บันทึกผล Station 2 ({score} คะแนน)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
