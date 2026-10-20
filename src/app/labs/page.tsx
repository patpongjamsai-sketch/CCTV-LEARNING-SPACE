'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isLabUnlocked } from '../../lib/progressionState';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';

interface SubLabAction {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

interface SubLabItem {
  id: string;
  badge: string;
  badgeColor: 'cyan' | 'sky' | 'teal' | 'indigo' | 'emerald';
  title: string;
  desc: string;
  actions: SubLabAction[];
}

interface RoomSummary {
  room: number;
  slug: string;
  title: string;
  unitId: string;
  focus: string;
  duration: string;
  badge: string;
  badgeColor: 'sky' | 'cyan' | 'teal' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
  subLabs?: SubLabItem[];
}

const roomSummaries: RoomSummary[] = [
  {
    room: 101,
    slug: 'room-101',
    title: 'Smart Mart · CCTV Foundations & Components',
    unitId: 'U01',
    focus: 'การตรวจสอบอุปกรณ์ 5 ชนิด, การเดินสัญญาณภาพ และการต่อระบบ IP CCTV เบื้องต้นในร้านสะดวกซื้อ',
    duration: '180 นาที',
    badge: '3D Simulation',
    badgeColor: 'sky',
  },
  {
    room: 102,
    slug: 'room-102',
    title: 'Camera Selection & Placement Lab',
    unitId: 'U02',
    focus: 'เปรียบเทียบ Dome vs Bullet vs PTZ, ระยะเลนส์, เกณฑ์ระยะ DORI และเทคนิคการลดจุดบอดในพื้นที่จริง',
    duration: '180 นาที',
    badge: '3D Interactive Lab',
    badgeColor: 'cyan',
    subLabs: [
      {
        id: 'bullet-lab',
        badge: '3D LAB · BULLET',
        badgeColor: 'cyan',
        title: 'Bullet Camera 3D Interactive Lab V1',
        desc: 'ฝึกติดตั้งกล้องกระบอก: ตัวละครสำรวจพื้นที่, จุดติดตั้ง A–E, ปรับมุม Pan/Tilt/Roll, และใบงานประเมิน 4 พื้นผิว',
        actions: [
          {
            label: 'เข้าสู่ห้องปฏิบัติการ Bullet Camera →',
            href: '/labs/bullet-camera',
            variant: 'primary',
          },
        ],
      },
      {
        id: 'dome-lab',
        badge: '3D LAB · DOME',
        badgeColor: 'sky',
        title: 'Dome Camera 3D Interactive Lab V1',
        desc: 'ฝึกติดตั้งกล้องโดมใน 2 บรรยากาศ: กิมบอล 3 แกน (Pan/Tilt/Rotation), ทดสอบ Day/Night IR Reflection, และใบงาน 4 พื้นผิว',
        actions: [
          {
            label: '🏢 ห้องที่ 1: สำนักงาน →',
            href: '/labs/dome-camera/room-1',
            variant: 'primary',
          },
          {
            label: '🏭 ห้องที่ 2: โรงฝึกงาน →',
            href: '/labs/dome-camera/room-2',
            variant: 'secondary',
          },
        ],
      },
    ],
  },
  {
    room: 103,
    slug: 'room-103',
    title: 'Cabling, Conduit & Termination Lab',
    unitId: 'U03',
    focus: 'การเข้าหัวสาย RJ45 T568B, ขั้วต่อ BNC, ดัดท่อร้อยสาย uPVC 90°/45°, กล่องกันน้ำ และทดสอบด้วย Cable Tester',
    duration: '180 นาที',
    badge: '3D & Hands-on Lab',
    badgeColor: 'teal',
    subLabs: [
      {
        id: 'conduit-lab',
        badge: '3D LAB · uPVC CONDUIT',
        badgeColor: 'sky',
        title: 'คู่มือ 3D Interactive การดัดท่อ uPVC',
        desc: 'เทคนิควัดมาร์ค 25-30-35 ซม. ดัดสามเข่า 90° พร้อมกรรไกรตัดท่อ Ratchet & สูตร 1.414 ดัด 45° สองจังหวะหลบคาน',
        actions: [
          {
            label: '📐 เข้าสู่ห้องแล็บดัดท่อ 3D →',
            href: '/labs/conduit-bending',
            variant: 'primary',
          },
        ],
      },
      {
        id: 'rj45-game',
        badge: 'GAME · RJ45 CAT6',
        badgeColor: 'teal',
        title: 'เกมฝึกเข้าหัวสาย RJ45 CAT6',
        desc: 'ฝึก 8 ขั้นตอน: ตัด PoE, วัดและปอกสาย, เรียงสี T568B สองปลาย, ย้ำหัว, และอ่านผล Cable Tester ซ่อมหัวผิด',
        actions: [
          {
            label: '🔌 เข้าเล่นเกม RJ45 →',
            href: '/RJ45',
            variant: 'accent',
          },
        ],
      },
    ],
  },
  {
    room: 104,
    slug: 'room-104',
    title: 'IP Camera Networking & PoE Budget',
    unitId: 'U04',
    focus: 'การจัดสรร IP Address, Subnet, Gateway, คำนวณ PoE Budget, NVR 4.0 SADP GUI, และทดสอบ Ping/Cisco CLI',
    duration: '180 นาที',
    badge: '2D Pre-Lab & 3D Lab',
    badgeColor: 'indigo',
    subLabs: [
      {
        id: 'network-sim',
        badge: '2D PRE-LAB · HARDWARE CHASSIS',
        badgeColor: 'indigo',
        title: 'Interactive 2D CCTV Network Simulator',
        desc: 'จำลองเสียบสาย PoE Switch 1U Rackmount (Day/Night IR), ตั้งค่า IP แก้ Conflict ใน NVR 4.0 GUI, คำสั่ง Cisco CLI และคำนวณ Subnetting',
        actions: [
          {
            label: '💻 เข้าฝึก 2D Network Simulator →',
            href: '/labs/network-simulator',
            variant: 'primary',
          },
        ],
      },
    ],
  },
  {
    room: 105,
    slug: 'room-105',
    title: 'DVR & NVR Configuration Lab',
    unitId: 'U05',
    focus: 'การค้นหากล้อง ONVIF, การสลับ Codec H.265/H.264, ตั้งค่า Motion Mask และวางตารางบันทึกตามช่วงเวลา',
    duration: '180 นาที',
    badge: 'Interactive Lab',
    badgeColor: 'emerald',
  },
  {
    room: 106,
    slug: 'room-106',
    title: 'Recording, Storage & Remote Access Lab',
    unitId: 'U06',
    focus: 'สูตรคำนวณขนาด Surveillance HDD, ฟอร์แมตระบบไฟล์ดิสก์ และเปิดใช้งาน Cloud P2P QR Code ผ่านสมาร์ตโฟน',
    duration: '180 นาที',
    badge: 'Interactive Lab',
    badgeColor: 'emerald',
  },
  {
    room: 107,
    slug: 'room-107',
    title: 'Troubleshooting & Maintenance Detective Lab',
    unitId: 'U07',
    focus: 'วิเคราะห์อาการ NO VIDEO, แก้ปัญหา Hum Bars จาก Ground Loop, อาการไฟ PoE ไม่พอ และแบบฟอร์มตรวจสอบ PM',
    duration: '180 นาที',
    badge: 'Interactive Lab',
    badgeColor: 'emerald',
  },
  {
    room: 108,
    slug: 'room-108',
    title: 'Capstone Integrated CCTV Project',
    unitId: 'U08',
    focus: 'โครงงานบูรณาการ ออกแบบผังระบบ CCTV สมบูรณ์แบบ, จัดทำเอกสาร BOM, ตรวจรับระบบ และส่งมอบงาน Turnkey',
    duration: '180 นาที',
    badge: 'Capstone Lab',
    badgeColor: 'purple',
  },
];

export default function LabsDirectoryPage() {
  const [renderTick, setRenderTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleUpdate = () => setRenderTick((t) => t + 1);
    window.addEventListener('cctv_approvals_updated', handleUpdate);
    return () => window.removeEventListener('cctv_approvals_updated', handleUpdate);
  }, []);

  return (
    <>
      <PortalGlobalNav />
      <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 font-sans" key={renderTick}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <Link
                href="/"
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 mb-1 transition-colors"
              >
                ← กลับหน้าแดชบอร์ดหลัก
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>ศูนย์ปฏิบัติการกล้องวงจรปิดเสมือนจริง</span>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono font-bold">
                  8 UNITS
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                ระบบจำลอง 3 มิติ และ Pre-Lab Interactive 8 หน่วย ครอบคลุมสมรรถนะช่างเทคนิคระบบโทรทัศน์วงจรปิด (21909-2020)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/teacher"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>🎛️ แดชบอร์ดครูผู้สอน</span>
              </Link>
              <Link
                href="/missions"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
              >
                <span>🎯 ภารกิจฝึกทักษะ</span>
              </Link>
            </div>
          </div>

          {/* 8 Units Systematic Curriculum Grid */}
          <div className="space-y-6">
            {roomSummaries.map((room) => {
              const labGate = mounted ? isLabUnlocked(room.unitId) : { unlocked: false, reason: '' };
              const hasSubLabs = Boolean(room.subLabs && room.subLabs.length > 0);

              return (
                <div
                  key={room.slug}
                  id={`unit-${room.unitId.toLowerCase()}`}
                  className={`bg-slate-900/90 border rounded-3xl p-6 md:p-7 shadow-xl transition-all relative overflow-hidden ${
                    labGate.unlocked
                      ? 'border-slate-800 hover:border-sky-500/40 hover:shadow-2xl'
                      : 'border-slate-800/80 opacity-85'
                  }`}
                >
                  {/* Subtle Background Glow Accent for Active Units */}
                  {room.unitId === 'U02' && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                  )}
                  {room.unitId === 'U03' && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                  )}
                  {room.unitId === 'U04' && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  )}

                  {/* Unit Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-black tracking-wide">
                        {room.unitId} · ROOM {room.room}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        (เวลาปฏิบัติ: {room.duration})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          !labGate.unlocked
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : room.badgeColor === 'cyan'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : room.badgeColor === 'teal'
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                            : room.badgeColor === 'indigo'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : room.badgeColor === 'purple'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {!labGate.unlocked ? '🔒 LOCKED' : room.badge}
                      </span>
                    </div>
                  </div>

                  {/* Unit Title & Focus Description */}
                  <div className="py-4 space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                      {room.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                      {room.focus}
                    </p>
                  </div>

                  {/* Integrated Sub-Labs Section (e.g. U02 Bullet/Dome, U03 Conduit/RJ45, U04 Network Simulator) */}
                  {hasSubLabs && (
                    <div className="my-3 pt-3 border-t border-slate-800/60">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono">
                          ⚡ ชุดปฏิบัติการย่อย & ห้องทดลองเฉพาะทาง (Hands-on Labs):
                        </span>
                      </div>

                      <div className={`grid grid-cols-1 ${room.subLabs!.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                        {room.subLabs!.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                                    sub.badgeColor === 'cyan'
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                      : sub.badgeColor === 'sky'
                                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                      : sub.badgeColor === 'teal'
                                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  }`}
                                >
                                  {sub.badge}
                                </span>
                              </div>
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                {sub.title}
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {sub.desc}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {sub.actions.map((act, actIdx) => (
                                <Link
                                  key={actIdx}
                                  href={act.href}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 shadow-md ${
                                    act.variant === 'secondary'
                                      ? 'bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white border border-sky-500/30'
                                      : act.variant === 'accent'
                                      ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-teal-400/20'
                                      : 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 shadow-sky-500/20'
                                  }`}
                                >
                                  <span>{act.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unit Footer Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>ห้องปฏิบัติการจำลอง 3 มิติหลัก: Room {room.room}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {labGate.unlocked ? (
                        <Link
                          href={`/labs/3d/${room.slug}?student_code=DEMO-TRAINEE&student_name=${encodeURIComponent('ผู้ทดลองเรียน (Trainee)')}`}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                        >
                          <span>เข้าสู่ห้องปฏิบัติการ 3D Room {room.room}</span>
                          <span>→</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-300 text-xs bg-slate-950/80 border border-amber-500/40 px-3.5 py-2 rounded-xl">
                          <span>🔒 ต้องผ่านเนื้อหา 10 บท หรือรอครูอนุมัติสิทธิ์</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
