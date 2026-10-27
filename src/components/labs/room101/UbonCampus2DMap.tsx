'use client';

import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { UBON_ZONES } from './SiteSurveySimulator';

interface UbonCampus2DMapProps {
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  surveyedZones: string[];
  submittedSurveys: Record<string, any>;
}

export const UbonCampus2DMap: React.FC<UbonCampus2DMapProps> = ({
  selectedZoneId,
  onSelectZone,
  surveyedZones,
  submittedSurveys,
}) => {
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showCables, setShowCables] = useState<boolean>(true);

  // Position coordinates on 960x640 canvas matching the actual satellite image (5 จุดสำรวจ)
  const zoneCoordinates: Record<string, { x: number; y: number; label: string }> = {
    gate: { x: 845, y: 360, label: '1' }, // จุดที่ 1: หน้าป้อมยามติดถนนเข้าออกวิทยาลัย (ถ.ชวาลานอก)
    admin: { x: 585, y: 340, label: '2' }, // จุดที่ 2: อาคารอำนวยการ
    parking_dome: { x: 705, y: 565, label: '3' }, // จุดที่ 3: โดมใหญ่จอดรถ
    com_tech: { x: 415, y: 525, label: '4' }, // จุดที่ 4: อาคารเรียนแผนกเทคโนโลยีคอมพิวเตอร์
    canteen: { x: 380, y: 375, label: '5' }, // จุดที่ 5: โรงอาหาร
  };

  const serverCoord = { x: 535, y: 205, label: 'HUB' };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col select-none">
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur z-20 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">
            ผังพื้นที่จำลอง 2D วิทยาลัยเทคนิคอุบลราชธานี (Ubon Tech Campus Map)
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            (ไร้ป้ายข้อความเพื่อการสำรวจ)
          </span>
        </div>

        {/* View Controls: Vector Plan vs Satellite, Zoom, Show Cables */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMapMode('vector')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapMode === 'vector'
                  ? 'bg-sky-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ ผังแม่บท 2D
            </button>
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-sky-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛰️ ภาพถ่ายทางอากาศ
            </button>
          </div>

          {/* Cable toggle */}
          <button
            type="button"
            onClick={() => setShowCables(!showCables)}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
              showCables
                ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="แสดงแนวสายสัญญาณ UTP จาก Server Room"
          >
            🔌 แนวสาย UTP
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              title="ซูมเข้า"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              title="ซูมออก"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer"
              title="รีเซ็ตมุมมอง"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Viewport Canvas Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* Scalable Container */}
        <div
          className="relative w-full h-full transition-transform duration-300 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* ============================================================ */}
          {/* LAYER 1: SATELLITE PHOTO BACKGROUND (When Satellite Mode Active) */}
          {/* ============================================================ */}
          {mapMode === 'satellite' && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/ubon-tech-campus.jpg"
                alt="Ubon Ratchathani Technical College Aerial Satellite"
                className="w-full h-full object-cover opacity-90 filter contrast-110 brightness-95"
              />
              {/* Subtle dark vignette overlay */}
              <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
            </div>
          )}

          {/* ============================================================ */}
          {/* LAYER 2: 2D ARCHITECTURAL VECTOR MASTERPLAN (When Vector Mode Active) */}
          {/* Matches exact positions of buildings, courts, roads, field */}
          {/* ============================================================ */}
          <svg
            viewBox="0 0 960 640"
            className="w-full h-full relative z-10 select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Ground Grid Pattern */}
              <pattern id="campusGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.6" />
              </pattern>

              {/* Roof Gradient - Orange Workshop */}
              <linearGradient id="roofOrange" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="50%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>

              {/* Roof Gradient - Dark Red Main Building */}
              <linearGradient id="roofRed" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>

              {/* Roof Gradient - Industrial Gray Shed */}
              <linearGradient id="roofMetal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Server Glow Effect */}
              <radialGradient id="serverGlowEffect" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* BASE GROUND & GRASS (Only in Vector Mode) */}
            {mapMode === 'vector' && (
              <>
                {/* Background base */}
                <rect width="960" height="640" fill="#090d16" />
                <rect width="960" height="640" fill="url(#campusGridPattern)" />

                {/* Road Network (Asphalt Roads) */}
                {/* East Boundary Avenue (Chawalanok Road - ถ.ชวาลานอก) */}
                <path d="M 885 0 L 885 640" stroke="#1e293b" strokeWidth="32" />
                <path d="M 885 0 L 885 640" stroke="#334155" strokeWidth="2" strokeDasharray="12 10" />

                {/* South Boundary Avenue (Main South Street) */}
                <path d="M 0 610 L 960 610" stroke="#1e293b" strokeWidth="34" />
                <path d="M 0 610 L 960 610" stroke="#334155" strokeWidth="2" strokeDasharray="12 10" />

                {/* East Entrance Gate Access Road leading West into Campus */}
                <path d="M 885 360 L 510 360 L 510 200 L 235 200" stroke="#1e293b" strokeWidth="28" fill="none" />
                <path d="M 885 360 L 510 360 L 510 200 L 235 200" stroke="#475569" strokeWidth="2" strokeDasharray="10 8" fill="none" />

                {/* Internal Campus Avenue between Admin, Canteen, and Courts */}
                <path d="M 510 120 L 510 610" stroke="#1e293b" strokeWidth="24" fill="none" />
                <path d="M 510 120 L 510 610" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" fill="none" />

                {/* Lane passing Canteen (Zone 6) and Computer Dept (Zone 5) */}
                <path d="M 235 470 L 510 470 L 710 470" stroke="#1e293b" strokeWidth="24" fill="none" />
                <path d="M 235 610 L 235 120 L 710 120" stroke="#1e293b" strokeWidth="22" fill="none" />

                {/* ======================================================== */}
                {/* ATHLETIC RUNNING TRACK & OPEN FIELD (EAST OF CAMPUS) */}
                {/* ======================================================== */}
                <rect
                  x="705"
                  y="215"
                  width="165"
                  height="285"
                  rx="16"
                  fill="#78350f"
                  stroke="#92400e"
                  strokeWidth="2"
                  opacity="0.85"
                />
                {/* Field Inner Ring */}
                <rect
                  x="720"
                  y="230"
                  width="135"
                  height="255"
                  rx="12"
                  fill="#854d0e"
                  stroke="#a16207"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.9"
                />

                {/* ======================================================== */}
                {/* ZONE 1: EAST GUARDHOUSE & ENTRANCE GATE (ริม ถ.ชวาลานอก) */}
                {/* ======================================================== */}
                <rect
                  x="825"
                  y="342"
                  width="38"
                  height="36"
                  rx="4"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Entrance Security Barrier */}
                <line x1="865" y1="340" x2="865" y2="380" stroke="#f59e0b" strokeWidth="4" strokeDasharray="6 4" />

                {/* ======================================================== */}
                {/* ZONE 4: LARGE COVERED PARKING DOME (โดมใหญ่จอดรถ ทิศใต้) */}
                {/* ======================================================== */}
                <rect
                  x="635"
                  y="535"
                  width="145"
                  height="62"
                  rx="14"
                  fill="url(#roofMetal)"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {/* Canopy roof ribs */}
                <line x1="660" y1="535" x2="660" y2="597" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="685" y1="535" x2="685" y2="597" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="710" y1="535" x2="710" y2="597" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="735" y1="535" x2="735" y2="597" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.6" />
                <line x1="760" y1="535" x2="760" y2="597" stroke="#cbd5e1" strokeWidth="1" strokeOpacity="0.6" />

                {/* ======================================================== */}
                {/* BASKETBALL & FUTSAL MULTI-COURT (SOUTH-CENTRAL) */}
                {/* ======================================================== */}
                <rect
                  x="565"
                  y="435"
                  width="100"
                  height="125"
                  rx="6"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <rect x="575" y="445" width="38" height="48" fill="#0f766e" stroke="#ffffff" strokeWidth="1" />
                <rect x="618" y="445" width="38" height="48" fill="#0f766e" stroke="#ffffff" strokeWidth="1" />
                <rect x="575" y="500" width="80" height="50" fill="#0369a1" stroke="#ffffff" strokeWidth="1" />
                <circle cx="615" cy="525" r="11" fill="none" stroke="#ffffff" strokeWidth="1" />

                {/* ======================================================== */}
                {/* ZONE 3: ADMINISTRATIVE & DIRECTOR BUILDING (อาคารอำนวยการ) */}
                {/* ======================================================== */}
                <rect
                  x="545"
                  y="315"
                  width="85"
                  height="50"
                  rx="4"
                  fill="#334155"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                {/* Terrace & front entrance portico */}
                <rect x="575" y="360" width="25" height="8" fill="#475569" stroke="#64748b" strokeWidth="1" />

                {/* ======================================================== */}
                {/* ZONE 2: CCTV CONTROL & SERVER ROOM (ห้องควบคุมระบบ) */}
                {/* ======================================================== */}
                <rect
                  x="510"
                  y="185"
                  width="55"
                  height="40"
                  rx="4"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                {/* Server room glow core */}
                <rect x="522" y="196" width="30" height="18" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                {/* Long Workshop building above Server Room */}
                <rect
                  x="475"
                  y="145"
                  width="170"
                  height="38"
                  rx="4"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                />

                {/* ======================================================== */}
                {/* ZONE 6: COLLEGE CANTEEN / CAFETERIA (โรงอาหาร) */}
                {/* ======================================================== */}
                <rect
                  x="335"
                  y="345"
                  width="95"
                  height="60"
                  rx="6"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="2"
                />
                {/* Canteen side open deck */}
                <rect x="335" y="400" width="95" height="10" fill="#7c2d12" stroke="#ea580c" strokeWidth="1" />

                {/* ======================================================== */}
                {/* ZONE 5: COMPUTER TECHNOLOGY DEPT (อาคารเรียนแผนกคอมพิวเตอร์) */}
                {/* ======================================================== */}
                <rect
                  x="345"
                  y="508"
                  width="145"
                  height="36"
                  rx="4"
                  fill="#1e293b"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
                {/* Windows line */}
                <line x1="355" y1="526" x2="480" y2="526" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />

                {/* ======================================================== */}
                {/* OTHER CAMPUS WORKSHOPS (WEST ROW) */}
                {/* ======================================================== */}
                <rect x="70" y="270" width="180" height="70" rx="4" fill="url(#roofOrange)" stroke="#ea580c" strokeWidth="1.5" />
                <rect x="70" y="180" width="170" height="65" rx="4" fill="url(#roofMetal)" stroke="#cbd5e1" strokeWidth="1.5" />
                <rect x="60" y="95" width="180" height="60" rx="4" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                <rect x="60" y="460" width="170" height="55" rx="4" fill="url(#roofOrange)" stroke="#ea580c" strokeWidth="1.5" />

                {/* Tree Clusters */}
                {[
                  { cx: 310, cy: 370, r: 16 },
                  { cx: 335, cy: 385, r: 14 },
                  { cx: 505, cy: 375, r: 18 },
                  { cx: 530, cy: 380, r: 16 },
                  { cx: 380, cy: 570, r: 18 },
                  { cx: 410, cy: 575, r: 16 },
                  { cx: 50, cy: 370, r: 16 },
                  { cx: 50, cy: 400, r: 18 },
                  { cx: 720, cy: 150, r: 18 },
                  { cx: 745, cy: 160, r: 16 },
                ].map((tree, idx) => (
                  <circle
                    key={idx}
                    cx={tree.cx}
                    cy={tree.cy}
                    r={tree.r}
                    fill="#14532d"
                    stroke="#22c55e"
                    strokeWidth="0.8"
                    opacity="0.85"
                  />
                ))}
              </>
            )}

            {/* ======================================================== */}
            {/* LAYER 3: CABLING OVERLAY FROM SERVER ROOM (ZONE 5) */}
            {/* ======================================================== */}
            {showCables && (
              <g className="transition-opacity duration-300">
                {UBON_ZONES.map((zone) => {
                  if (zone.id === 'server') return null;
                  const coord = zoneCoordinates[zone.id];
                  if (!coord) return null;
                  const isSelected = selectedZoneId === zone.id;

                  return (
                    <g key={`cable-line-${zone.id}`}>
                      {/* Glow line when selected */}
                      {isSelected && (
                        <line
                          x1={serverCoord.x}
                          y1={serverCoord.y}
                          x2={coord.x}
                          y2={coord.y}
                          stroke="#38bdf8"
                          strokeWidth="6"
                          strokeOpacity="0.3"
                        />
                      )}
                      {/* Active Cable Route */}
                      <line
                        x1={serverCoord.x}
                        y1={serverCoord.y}
                        x2={coord.x}
                        y2={coord.y}
                        stroke={isSelected ? '#38bdf8' : '#64748b'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        strokeDasharray={isSelected ? 'none' : '5 4'}
                        strokeOpacity={isSelected ? 1 : 0.6}
                      />
                      {/* Distance Tag at Line Center */}
                      <rect
                        x={(serverCoord.x + coord.x) / 2 - 20}
                        y={(serverCoord.y + coord.y) / 2 - 9}
                        width="40"
                        height="18"
                        rx="4"
                        fill="#020617"
                        stroke={isSelected ? '#38bdf8' : '#475569'}
                        strokeWidth="1"
                      />
                      <text
                        x={(serverCoord.x + coord.x) / 2}
                        y={(serverCoord.y + coord.y) / 2 + 4}
                        fill={zone.distanceMeters > 90 ? '#f59e0b' : isSelected ? '#38bdf8' : '#94a3b8'}
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {zone.distanceMeters}m
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ======================================================== */}
            {/* LAYER 4: INTERACTIVE PULSING SURVEY PINS (NO PLACE TEXT) */}
            {/* ======================================================== */}
            {/* Central Server / NVR Hub Marker */}
            <g transform={`translate(${serverCoord.x}, ${serverCoord.y})`} className="select-none pointer-events-none">
              <rect
                x="-26"
                y="-13"
                width="52"
                height="26"
                rx="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2"
                filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.8))"
              />
              <text
                y="4"
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="black"
                textAnchor="middle"
              >
                NVR HUB
              </text>
            </g>

            {UBON_ZONES.map((zone) => {
              const coord = zoneCoordinates[zone.id];
              if (!coord) return null;
              const isSelected = selectedZoneId === zone.id;
              const isSubmitted = !!submittedSurveys[zone.id];
              const isSurveyed = surveyedZones.includes(zone.id);

              return (
                <g
                  key={`pin-${zone.id}`}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  onClick={() => onSelectZone(zone.id)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                >
                  {/* Outer Pulsing Aura when Selected */}
                  {isSelected && (
                    <circle r="26" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 3">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}

                  {/* Pulsing Signal Wave */}
                  <circle
                    r="20"
                    fill={isSubmitted ? '#10b981' : isSurveyed ? '#0284c7' : '#f59e0b'}
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values="14;24;14"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.5;0.1;0.5"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Main Pin Core Badge */}
                  <circle
                    r="15"
                    fill={isSubmitted ? '#059669' : isSelected ? '#0284c7' : '#0f172a'}
                    stroke={isSelected ? '#ffffff' : isSubmitted ? '#34d399' : '#38bdf8'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                    filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.8))"
                  />

                  {/* Pin Number Icon (1, 2, 3, 4, 5) - NO LOCATION TEXT */}
                  <text
                    y="4"
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    {coord.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Bottom Legend */}
        <div className="absolute bottom-2 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-300 z-20">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ส่งผลสำรวจแล้ว
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> กำลังเลือกสำรวจ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> ยังไม่ได้สำรวจ
            </span>
            <span className="flex items-center gap-1.5 hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> สาย UTP &gt; 90m
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-400">
            คลิกที่ <strong className="text-amber-400">หมุดตัวเลข 1 - 5</strong> เพื่อสำรวจจุดนั้น
          </div>
        </div>
      </div>
    </div>
  );
};
