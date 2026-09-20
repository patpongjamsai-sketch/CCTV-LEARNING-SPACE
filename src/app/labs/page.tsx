'use client';

import { useState, useEffect } from 'react';
import { isLabUnlocked } from '../../lib/progressionState';
import { PortalGlobalNav } from '../../components/portal/PortalGlobalNav';

const roomSummaries = [
    {
        room: 101,
        slug: 'room-101',
        title: 'Smart Mart · CCTV Foundations & Components',
        unitId: 'U01',
        focus: 'การตรวจสอบอุปกรณ์ 5 ชนิด, สัญญาณภาพ และการต่อระบบ IP CCTV เบื้องต้น',
        duration: '180 นาที',
        badge: '3D Simulation',
        badgeColor: 'sky',
    },
    {
        room: 102,
        slug: 'room-102',
        title: 'Camera Selection & Placement Lab',
        unitId: 'U02',
        focus: 'เปรียบเทียบ Dome vs Bullet vs PTZ, ระยะเลนส์, เกณฑ์ DORI และลดจุดบอด',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 103,
        slug: 'room-103',
        title: 'Cabling, Termination & Continuity Lab',
        unitId: 'U03',
        focus: 'การเข้าหัวสาย RJ45 T568B, ขั้วต่อ BNC, กล่องกันน้ำ และทดสอบด้วย Cable Tester',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 104,
        slug: 'room-104',
        title: 'IP Camera Networking & PoE Budget',
        unitId: 'U04',
        focus: 'การจัดสรร IP Address, Subnet, Gateway, คำนวณ PoE Budget และทดสอบ Ping',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 105,
        slug: 'room-105',
        title: 'DVR & NVR Configuration Lab',
        unitId: 'U05',
        focus: 'การค้นหากล้อง ONVIF, การสลับ Codec H.265, Motion Mask และตารางบันทึก',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 106,
        slug: 'room-106',
        title: 'Recording, Storage & Remote Access Lab',
        unitId: 'U06',
        focus: 'สูตรคำนวณขนาด Surveillance HDD, ฟอร์แมตดิสก์ และเปิดใช้งาน Cloud P2P QR Code',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 107,
        slug: 'room-107',
        title: 'Troubleshooting & Maintenance Detective Lab',
        unitId: 'U07',
        focus: 'วิเคราะห์อาการ NO VIDEO, แก้ปัญหา Hum Bars จาก Ground Loop และแบบฟอร์ม PM',
        duration: '180 นาที',
        badge: 'Interactive Lab',
        badgeColor: 'emerald',
    },
    {
        room: 108,
        slug: 'room-108',
        title: 'Capstone Integrated CCTV Project',
        unitId: 'U08',
        focus: 'โครงงานบูรณาการ ออกแบบผัง จัดทำ BOM ตรวจรับระบบ และส่งมอบงาน Turnkey',
        duration: '180 นาที',
        badge: 'Capstone Lab',
        badgeColor: 'purple',
    },
];

export default function LabsDirectoryPage() {
    const [renderTick, setRenderTick] = useState(0);

    useEffect(() => {
        const handleUpdate = () => setRenderTick((t) => t + 1);
        window.addEventListener('cctv_approvals_updated', handleUpdate);
        return () => window.removeEventListener('cctv_approvals_updated', handleUpdate);
    }, []);

    return (
        <>
            <PortalGlobalNav />
            <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans" key={renderTick}>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="space-y-1">
                        <a
                            href="/"
                            className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 mb-1 transition-colors"
                        >
                            ← กลับหน้าแดชบอร์ดหลัก
                        </a>
                        <h1 className="text-3xl font-black text-white">
                            ศูนย์ปฏิบัติการกล้องวงจรปิดเสมือนจริง (CCTV Virtual Labs)
                        </h1>
                        <p className="text-sm text-slate-400">
                            ห้องปฏิบัติการเสมือนจริง 8 ห้อง ครอบคลุมสมรรถนะช่างเทคนิคระบบโทรทัศน์วงจรปิด (21909-2020)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/teacher"
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-400 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                            <span>🎛️ แดชบอร์ดครูผู้สอน</span>
                        </a>
                        <a
                            href="/courses/21909-2020"
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                        >
                            📖 ดูแผนการเรียนรู้
                        </a>
                    </div>
                </div>

                {/* Labs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roomSummaries.map((room) => {
                        const labGate = isLabUnlocked(room.unitId);

                        return (
                            <div
                                key={room.slug}
                                className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between group ${
                                    labGate.unlocked
                                        ? 'border-slate-800 hover:border-sky-500/40 hover:shadow-2xl'
                                        : 'border-slate-800/80 opacity-80'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
                                            ROOM {room.room} · {room.unitId}
                                        </span>
                                        <span
                                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                !labGate.unlocked
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                    : room.badgeColor === 'sky'
                                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                                      : room.badgeColor === 'purple'
                                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            }`}
                                        >
                                            {!labGate.unlocked ? '🔒 LOCKED' : room.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                                            {room.title}
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            {room.focus}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-xs text-slate-500">
                                        <span>เวลาปฏิบัติ: {room.duration}</span>
                                    </div>

                                    {labGate.unlocked ? (
                                        <a
                                            href={`/labs/3d/${room.slug}?student_code=DEMO-TRAINEE&student_name=${encodeURIComponent('ผู้ทดลองเรียน (Trainee)')}`}
                                            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5"
                                        >
                                            <span>เข้าห้องแล็บ 3D</span>
                                            <span>→</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-2 text-amber-300 text-xs bg-slate-950/80 border border-amber-500/40 px-3 py-2 rounded-xl">
                                            <span>🔒 ต้องผ่านเนื้อหา 10 บท หรือรอครูอนุมัติ</span>
                                        </div>
                                    )}
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
