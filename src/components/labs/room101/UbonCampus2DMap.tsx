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

  // Position coordinates on 960x640 canvas matching the actual satellite image
  const zoneCoordinates: Record<string, { x: number; y: number; label: string }> = {
    gate: { x: 235, y: 550, label: '1' }, // Main entrance gate at bottom-left road
    flagpole: { x: 670, y: 390, label: '2' }, // Sports court / open ground at bottom-right
    workshop: { x: 250, y: 310, label: '3' }, // Long orange workshop row on the west
    academic: { x: 440, y: 220, label: '4' }, // Central-North educational buildings
    server: { x: 470, y: 390, label: '5' }, // Central IT/Server hub
  };

  const serverCoord = zoneCoordinates['server']!;

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
                {/* South Boundary Avenue (Main Street) */}
                <path d="M 0 610 L 960 610" stroke="#1e293b" strokeWidth="36" />
                <path d="M 0 610 L 960 610" stroke="#334155" strokeWidth="2" strokeDasharray="12 10" />

                {/* Main Entrance Road leading North from Gate */}
                <path d="M 235 630 L 235 480 L 470 480 L 470 200 L 710 200" stroke="#1e293b" strokeWidth="32" fill="none" />
                <path d="M 235 630 L 235 480 L 470 480 L 470 200 L 710 200" stroke="#475569" strokeWidth="2" strokeDasharray="10 8" fill="none" />

                {/* East Ring Road around Sports Field */}
                <path d="M 710 200 L 710 600" stroke="#1e293b" strokeWidth="28" fill="none" />
                <path d="M 710 200 L 710 600" stroke="#475569" strokeWidth="1.5" strokeDasharray="8 6" fill="none" />

                {/* North Campus Internal Lanes */}
                <path d="M 235 240 L 470 240" stroke="#1e293b" strokeWidth="24" fill="none" />
                <path d="M 235 120 L 710 120" stroke="#1e293b" strokeWidth="24" fill="none" />

                {/* ======================================================== */}
                {/* ATHLETIC RUNNING TRACK & OPEN FIELD (EAST ZONE) */}
                {/* ======================================================== */}
                <rect
                  x="740"
                  y="200"
                  width="180"
                  height="340"
                  rx="16"
                  fill="#78350f"
                  stroke="#92400e"
                  strokeWidth="2"
                  opacity="0.85"
                />
                {/* Field Inner Ring */}
                <rect
                  x="755"
                  y="220"
                  width="150"
                  height="300"
                  rx="12"
                  fill="#854d0e"
                  stroke="#a16207"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.9"
                />

                {/* ======================================================== */}
                {/* BASKETBALL & FUTSAL MULTI-COURT (SOUTH-EAST ZONE) */}
                {/* ======================================================== */}
                <rect
                  x="565"
                  y="470"
                  width="110"
                  height="125"
                  rx="6"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Court markings */}
                <rect x="575" y="480" width="40" height="50" fill="#0f766e" stroke="#ffffff" strokeWidth="1" />
                <rect x="625" y="480" width="40" height="50" fill="#0f766e" stroke="#ffffff" strokeWidth="1" />
                <rect x="575" y="535" width="90" height="50" fill="#0369a1" stroke="#ffffff" strokeWidth="1" />
                <circle cx="620" cy="560" r="12" fill="none" stroke="#ffffff" strokeWidth="1" />

                {/* ======================================================== */}
                {/* AUDITORIUM / CURVED HALL (BOTTOM RIGHT) */}
                {/* ======================================================== */}
                <rect
                  x="735"
                  y="560"
                  width="185"
                  height="55"
                  rx="14"
                  fill="url(#roofMetal)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />

                {/* ======================================================== */}
                {/* WORKSHOP BUILDINGS ROW (WEST ZONE - ORANGE/RED ROOFS) */}
                {/* ======================================================== */}
                {/* Main Long Orange Workshop A */}
                <rect
                  x="70"
                  y="270"
                  width="190"
                  height="75"
                  rx="4"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                />
                {/* Workshop B (White/Metal Shed) */}
                <rect
                  x="70"
                  y="180"
                  width="180"
                  height="70"
                  rx="4"
                  fill="url(#roofMetal)"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
                {/* Workshop C (Northwest) */}
                <rect
                  x="60"
                  y="95"
                  width="190"
                  height="65"
                  rx="4"
                  fill="#334155"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                {/* Workshop D (Southwest) */}
                <rect
                  x="60"
                  y="460"
                  width="180"
                  height="60"
                  rx="4"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                />

                {/* ======================================================== */}
                {/* CENTRAL & NORTH ACADEMIC BUILDINGS */}
                {/* ======================================================== */}
                {/* Orange Gabled Hall A */}
                <rect
                  x="290"
                  y="160"
                  width="135"
                  height="80"
                  rx="4"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                />
                {/* Long Red Educational Building B */}
                <rect
                  x="480"
                  y="225"
                  width="160"
                  height="45"
                  rx="4"
                  fill="url(#roofOrange)"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                />
                {/* Central Hall / Administration C (Tiered Hip Roof) */}
                <rect
                  x="430"
                  y="410"
                  width="100"
                  height="90"
                  rx="6"
                  fill="url(#roofRed)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* North Lab Building D */}
                <rect
                  x="480"
                  y="310"
                  width="215"
                  height="50"
                  rx="4"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Tree Canopy Clusters */}
                {[
                  { cx: 310, cy: 370, r: 16 },
                  { cx: 335, cy: 385, r: 14 },
                  { cx: 300, cy: 405, r: 15 },
                  { cx: 505, cy: 375, r: 18 },
                  { cx: 530, cy: 380, r: 16 },
                  { cx: 380, cy: 540, r: 20 },
                  { cx: 410, cy: 550, r: 18 },
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

                {/* Gate Guardhouse & Barrier at Entrance */}
                <rect x="220" y="540" width="30" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="205" y1="550" x2="265" y2="550" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
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
