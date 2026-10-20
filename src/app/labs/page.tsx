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
                            href="/missions"
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                        >
                            🎯 ภารกิจฝึกทักษะ
                        </a>
                    </div>
                </div>

                {/* Featured 3D Interactive Labs (Bullet & Dome) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Featured Bullet Camera Lab */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/40 p-6 md:p-7 shadow-2xl flex flex-col justify-between gap-5">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold">
                                    3D LAB · BULLET
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    AVAILABLE
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white">
                                Bullet Camera 3D Interactive Lab V1
                            </h2>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                ฝึกติดตั้งกล้องกระบอก (Bullet Camera): ตัวละคร Roblox เดินสำรวจ, จุดติดตั้ง A–E, ปรับมุม Pan/Tilt/Roll, และใบงาน 4 พื้นผิวนักเรียนเลือกคำตอบเอง
                            </p>
                        </div>
                        <a
                            href="/labs/bullet-camera"
                            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-between"
                        >
                            <span>เข้าสู่ห้องปฏิบัติการ Bullet Camera</span>
                            <span>→</span>
                        </a>
                    </div>

                    {/* Featured Dome Camera Lab */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border border-sky-400/50 p-6 md:p-7 shadow-2xl flex flex-col justify-between gap-5">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold">
                                    3D LAB · DOME
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold animate-pulse">
                                    NEW RELEASE
                                </span>
                            </div>
                            <h2 className="text-lg md:text-xl font-bold text-white">
                                Dome Camera 3D Interactive Lab V1
                            </h2>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                ฝึกติดตั้งกล้องโดมใน <strong>2 ห้อง (Indoor Office & Semi-Outdoor)</strong>: กิมบอล 3 แกน (Pan/Tilt/Rotation), ทดสอบ Day/Night IR Reflection, และใบงาน 4 พื้นผิว
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            <a
                                href="/labs/dome-camera/room-1"
                                className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-sky-500/20 flex items-center justify-between"
                            >
                                <span>🏢 ห้องที่ 1: สำนักงาน</span>
                                <span>→</span>
                            </a>
                            <a
                                href="/labs/dome-camera/room-2"
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-bold rounded-xl text-xs border border-sky-500/30 transition-all flex items-center justify-between"
                            >
                                <span>🏭 ห้องที่ 2: โรงฝึกงาน</span>
                                <span>→</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ทักษะปฏิบัติการเฉพาะทาง (Conduit Bending 3D Lab & RJ45 Game) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Conduit Bending Lab */}
                    <section className="relative overflow-hidden rounded-3xl border border-sky-400/50 bg-gradient-to-br from-[#0c2238] via-[#093554] to-[#0a192f] p-6 md:p-7 shadow-2xl flex flex-col justify-between gap-5">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-lg border border-sky-300/40 bg-sky-300/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-sky-200">
                                    NEW 3D LAB · uPVC CONDUIT
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold animate-pulse">
                                    HOT
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                คู่มือ 3D Interactive การดัดท่อ uPVC (ดัดสามเข่า 90° & หลบคาน 45°)
                            </h2>
                            <p className="text-xs leading-relaxed text-slate-200">
                                ฝึก 2 ทักษะสำคัญ: เทคนิคการวัดมาร์ค 25-30-35 ซม. ดัดสามเข่ารอบข้อต่อ 90° ท่อมนสวยงามไร้รอยคอด และสูตรตัวคูณ 1.414 ดัด 45° สองจังหวะหลบคานคอนกรีตอย่างนุ่มนวล
                            </p>
                            <p className="text-xs text-sky-200/70">
                                2 โหมดการเรียนรู้ 3D · Room 103 Companion
                            </p>
                        </div>
                        <a
                            href="/labs/conduit-bending"
                            className="inline-flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-sky-400/20 transition hover:from-cyan-300 hover:to-sky-300"
                        >
                            <span>เข้าสู่ห้องแล็บดัดท่อ 3D</span>
                            <span>→</span>
                        </a>
                    </section>

                    {/* RJ45 Cat6 Game */}
                    <section className="relative overflow-hidden rounded-3xl border border-teal-400/50 bg-gradient-to-br from-[#102a36] via-[#103c45] to-[#10232f] p-6 md:p-7 shadow-2xl flex flex-col justify-between gap-5">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex rounded-lg border border-teal-300/40 bg-teal-300/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-teal-200">
                                    NEW GAME · RJ45 CAT6
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    AVAILABLE
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                เกมฝึกเข้าหัวสาย RJ45 CAT6
                            </h2>
                            <p className="text-xs leading-relaxed text-slate-200">
                                ฝึก 8 ขั้นตอนด้วยตนเอง: ตัด PoE, วัดและปอกสาย, เรียงสี T568B ทั้งสองปลาย, ย้ำหัว, อ่านผล Cable Tester และซ่อมหัวที่ผิด
                            </p>
                            <p className="text-xs text-teal-100/70">
                                Section ฝึกอิสระ · แยกจากคะแนน Room 103
                            </p>
                        </div>
                        <a
                            href="/RJ45"
                            className="inline-flex items-center justify-between rounded-xl bg-teal-300 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-teal-400/20 transition hover:bg-teal-200"
                        >
                            <span>เข้าเล่นเกม RJ45</span>
                            <span>→</span>
                        </a>
                    </section>
                </div>

                {/* Labs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roomSummaries.map((room) => {
                        // รอหลัง Hydration ก่อนอ่านสิทธิ์จาก localStorage เพื่อให้ HTML ฝั่ง Server/Client ตรงกัน
                        const labGate = mounted ? isLabUnlocked(room.unitId) : { unlocked: false, reason: '' };

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
