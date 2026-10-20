'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  Video,
  Sliders,
  Terminal,
  Calculator,
  Server,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Sun,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Layers,
  RefreshCw,
  ExternalLink,
  Info,
  Plug,
  Activity,
  CornerDownLeft,
  Trash2,
} from 'lucide-react';

interface CableItem {
  id: string;
  name: string;
  type: 'poe_cam' | 'uplink_dev';
  baseWatt: number;
  irWatt: number;
  connectedPort: number | null;
  color: 'amber' | 'blue' | 'emerald';
}

interface CameraIpConfig {
  id: number;
  ch: string;
  name: string;
  model: string;
  ip: string;
  mask: string;
  gw: string;
  mac: string;
  dhcp: boolean;
  bitrate: string;
  res: string;
}

const DEFAULT_CAMERA: CameraIpConfig = {
  id: 1,
  ch: 'CH1',
  name: 'CAM-01 (หน้าทางเข้า)',
  model: 'DS-2CD2143G2-I',
  ip: '192.168.1.101',
  mask: '255.255.255.0',
  gw: '192.168.1.1',
  mac: 'A4:14:37:01:01',
  dhcp: false,
  bitrate: '4096 Kbps',
  res: '2688×1520',
};

export function NetworkSimulator() {
  const [activeTab, setActiveTab] = useState<'plan' | 'switch' | 'ip' | 'cli' | 'subnet'>('switch');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warn' | 'info'>('success');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // ==========================================
  // MODULE 2 STATE: POE SWITCH & CABLING
  // ==========================================
  const [selectedCableId, setSelectedCableId] = useState<string>('cam3');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [switchDipMode, setSwitchDipMode] = useState<'standard' | 'vlan' | 'extend'>('standard');

  const [cables, setCables] = useState<CableItem[]>([
    { id: 'cam1', name: 'สายสีเหลือง: CAM-01 (หน้าทางเข้า)', type: 'poe_cam', baseWatt: 5.5, irWatt: 11.5, connectedPort: 1, color: 'amber' },
    { id: 'cam2', name: 'สายสีเหลือง: CAM-02 (โถงล็อบบี้)', type: 'poe_cam', baseWatt: 5.0, irWatt: 10.5, connectedPort: 2, color: 'amber' },
    { id: 'cam3', name: 'สายสีเหลือง: CAM-03 (ลานจอดรถ)', type: 'poe_cam', baseWatt: 6.5, irWatt: 14.0, connectedPort: null, color: 'amber' },
    { id: 'cam4', name: 'สายสีเหลือง: CAM-04 (คลังสินค้า PTZ)', type: 'poe_cam', baseWatt: 9.0, irWatt: 22.0, connectedPort: null, color: 'amber' },
    { id: 'nvr',  name: 'สายสีน้ำเงิน: เครื่องบันทึก NVR-4CH', type: 'uplink_dev', baseWatt: 0, irWatt: 0, connectedPort: 9, color: 'blue' },
    { id: 'router', name: 'สายสีเขียว: Router Gateway (อินเทอร์เน็ต)', type: 'uplink_dev', baseWatt: 0, irWatt: 0, connectedPort: 10, color: 'emerald' },
  ]);

  // Compute live PoE Wattage
  const maxBudget = 65.0;
  let totalWatts = 0;
  cables.forEach((c) => {
    if (c.connectedPort !== null && c.connectedPort <= 8 && c.type === 'poe_cam') {
      totalWatts += isNightMode ? c.irWatt : c.baseWatt;
    }
  });

  const handlePortClick = (portNum: number) => {
    const existing = cables.find((c) => c.connectedPort === portNum);
    if (existing) {
      setCables((prev) =>
        prev.map((c) => (c.id === existing.id ? { ...c, connectedPort: null } : c))
      );
      showToast(`ถอดสาย ${existing.name} ออกจากพอร์ต #${portNum} แล้ว`, 'warn');
      return;
    }

    if (!selectedCableId) {
      showToast('กรุณาคลิกเลือกสายสัญญาณจากรายการด้านซ้ายก่อนครับ', 'info');
      return;
    }

    const cable = cables.find((c) => c.id === selectedCableId);
    if (!cable) return;

    setCables((prev) =>
      prev.map((c) => (c.id === selectedCableId ? { ...c, connectedPort: portNum } : c))
    );

    if (cable.type === 'poe_cam' && portNum > 8) {
      showToast(`คำเตือน: คุณเสียบกล้องเข้าพอร์ต Uplink (#${portNum}) ซึ่งไม่มีไฟ PoE กล้องจะไม่ทำงาน!`, 'warn');
    } else {
      showToast(`เสียบ ${cable.name} เข้ากับพอร์ต #${portNum} สำเร็จ!`, 'success');
    }

    // Auto-select next unplugged
    const nextUnplugged = cables.find((c) => c.id !== selectedCableId && c.connectedPort === null);
    if (nextUnplugged) {
      setSelectedCableId(nextUnplugged.id);
    }
  };

  const autoWireSwitch = () => {
    setCables((prev) =>
      prev.map((c) => {
        if (c.id === 'cam1') return { ...c, connectedPort: 1 };
        if (c.id === 'cam2') return { ...c, connectedPort: 2 };
        if (c.id === 'cam3') return { ...c, connectedPort: 3 };
        if (c.id === 'cam4') return { ...c, connectedPort: 4 };
        if (c.id === 'nvr')  return { ...c, connectedPort: 9 };
        if (c.id === 'router') return { ...c, connectedPort: 10 };
        return c;
      })
    );
    showToast('เสียบสายกล้อง 4 ตัวเข้าพอร์ต PoE (1-4) และ NVR/Router เข้าพอร์ต Uplink (9-10) เรียบร้อยแล้ว', 'success');
  };

  const resetSwitchPorts = () => {
    setCables((prev) => prev.map((c) => ({ ...c, connectedPort: null })));
    setSelectedCableId('cam1');
    showToast('ถอดสายแลนออกจากพอร์ตทั้งหมดแล้ว', 'info');
  };

  // ==========================================
  // MODULE 3 STATE: IP CONFIG & NVR 4.0 GUI
  // ==========================================
  const [camerasIp, setCamerasIp] = useState<CameraIpConfig[]>([
    { id: 1, ch: 'CH1', name: 'CAM-01 (หน้าทางเข้า)', model: 'DS-2CD2143G2-I', ip: '192.168.1.101', mask: '255.255.255.0', gw: '192.168.1.1', mac: 'A4:14:37:01:01', dhcp: false, bitrate: '4096 Kbps', res: '2688×1520' },
    { id: 2, ch: 'CH2', name: 'CAM-02 (โถงล็อบบี้)', model: 'DS-2CD2143G2-I', ip: '192.168.1.102', mask: '255.255.255.0', gw: '192.168.1.1', mac: 'A4:14:37:01:02', dhcp: false, bitrate: '3584 Kbps', res: '1920×1080' },
    { id: 3, ch: 'CH3', name: 'CAM-03 (ลานจอดรถ)', model: 'DS-2CD2047G2-LU', ip: '192.168.1.101', mask: '255.255.255.0', gw: '192.168.1.1', mac: 'A4:14:37:01:03', dhcp: false, bitrate: '4096 Kbps', res: '2688×1520' }, // Intentional IP Conflict
    { id: 4, ch: 'CH4', name: 'CAM-04 (คลังสินค้า PTZ)', model: 'DS-2DE4425IW-DE', ip: '192.168.0.64',  mask: '255.255.255.0', gw: '192.168.0.1', mac: 'A4:14:37:01:04', dhcp: false, bitrate: '6144 Kbps', res: '2560×1440' }  // Intentional Wrong Subnet
  ]);

  const [editCamId, setEditCamId] = useState<number>(3);
  const editingCam: CameraIpConfig = camerasIp.find((c) => c.id === editCamId) ?? camerasIp[0] ?? DEFAULT_CAMERA;
  const [formDhcp, setFormDhcp] = useState<boolean>(editingCam.dhcp);
  const [formIp, setFormIp] = useState<string>(editingCam.ip);
  const [formMask, setFormMask] = useState<string>(editingCam.mask);
  const [formGw, setFormGw] = useState<string>(editingCam.gw);

  useEffect(() => {
    setFormDhcp(editingCam.dhcp);
    setFormIp(editingCam.ip);
    setFormMask(editingCam.mask);
    setFormGw(editingCam.gw);
  }, [editCamId, editingCam]);

  const evaluateCamStatus = (cam: CameraIpConfig) => {
    // Check duplicate IP
    const dups = camerasIp.filter((other) => other.id !== cam.id && other.ip.trim() === cam.ip.trim());
    if (dups.length > 0) {
      return { code: 'CONFLICT', label: 'IP Conflict (ชนกัน)', color: 'rose' };
    }
    // Check subnet 192.168.1.x
    const parts = cam.ip.trim().split('.');
    if (parts.length !== 4 || parts[0] !== '192' || parts[1] !== '168' || parts[2] !== '1') {
      return { code: 'SUBNET_ERR', label: 'Wrong Subnet (คนละวง)', color: 'amber' };
    }
    const hostNum = parseInt(parts[3] ?? '', 10);
    if (isNaN(hostNum) || hostNum <= 1 || hostNum >= 254 || hostNum === 200) {
      return { code: 'INVALID_HOST', label: 'Invalid Host IP', color: 'rose' };
    }
    return { code: 'ONLINE', label: 'Connected (Online)', color: 'emerald' };
  };

  const handleSaveCamIp = (e: React.FormEvent) => {
    e.preventDefault();
    setCamerasIp((prev) =>
      prev.map((c) =>
        c.id === editCamId
          ? {
              ...c,
              dhcp: formDhcp,
              ip: formIp.trim(),
              mask: formMask.trim(),
              gw: formGw.trim(),
            }
          : c
      )
    );

    const updatedCam: CameraIpConfig = {
      ...editingCam,
      ip: formIp.trim(),
      mask: formMask.trim(),
      gw: formGw.trim(),
      dhcp: formDhcp,
    };
    const status = evaluateCamStatus(updatedCam);
    if (status.code === 'ONLINE') {
      showToast(`บันทึก IP ${formIp} ให้กับ ${editingCam.name} สำเร็จ! ภาพขึ้นจอ NVR แล้ว`, 'success');
    } else {
      showToast(`บันทึกแล้ว แต่สถานะยังเป็น: ${status.label} กรุณาตรวจสอบ IP อีกครั้ง`, 'warn');
    }
  };

  const autoFixAllIps = () => {
    setCamerasIp((prev) =>
      prev.map((c, idx) => ({
        ...c,
        ip: `192.168.1.${101 + idx}`,
        mask: '255.255.255.0',
        gw: '192.168.1.1',
        dhcp: false,
      }))
    );
    setEditCamId(3);
    showToast('จัดเรียง IP กล้องทั้ง 4 ตัวเป็น 192.168.1.101 - 104 เรียบร้อยแล้ว กล้องออนไลน์ครบทุกช่อง!', 'success');
  };

  const batchActivateSubnet = () => {
    setCamerasIp((prev) =>
      prev.map((c) =>
        c.id === 4 ? { ...c, ip: '192.168.1.104', gw: '192.168.1.1' } : c
      )
    );
    setEditCamId(4);
    showToast('ดึงกล้อง CAM-04 จากวง 192.168.0.64 เข้าสู่วงแลน 192.168.1.104 สำเร็จ!', 'success');
  };

  // Ping Test Box
  const [pingTarget, setPingTarget] = useState<string>('192.168.1.101');
  const [pingLog, setPingLog] = useState<string>('คลิกปุ่ม Test เพื่อยิง Ping และตรวจสอบพอร์ต RTSP 554...');

  const runPingTest = () => {
    const target = pingTarget.trim();
    const match = camerasIp.find((c) => c.ip === target);
    let log = `Pinging ${target} with 32 bytes of data:\n`;

    if (match && evaluateCamStatus(match).code === 'ONLINE') {
      log += `Reply from ${target}: bytes=32 time=1ms TTL=64\n`;
      log += `Reply from ${target}: bytes=32 time=1ms TTL=64\n`;
      log += `Reply from ${target}: bytes=32 time<1ms TTL=64\n\n`;
      log += `Ping statistics: Sent = 3, Received = 3, Lost = 0 (0% loss)\n[OK] พอร์ต RTSP 554 เปิดอยู่ ภาพสตรีมปกติ`;
    } else if (match && evaluateCamStatus(match).code === 'CONFLICT') {
      log += `Reply from ${target}: bytes=32 time=2ms TTL=64 (DUP!)\n`;
      log += `Request timed out. (MAC Flapping / IP ซ้ำซ้อน!)\n\n`;
      log += `[FAIL] ตรวจพบ IP Conflict ไม่สามารถเปิด RTSP สตรีมได้`;
    } else {
      log += `Reply from 192.168.1.200: Destination host unreachable.\n`;
      log += `Request timed out.\n\n`;
      log += `[FAIL] ไม่พบอุปกรณ์ที่ IP นี้ หรืออุปกรณ์อยู่คนละ Subnet`;
    }
    setPingLog(log);
  };

  // Live OSD Clock
  const [clockStr, setClockStr] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setClockStr(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online count
  const onlineCount = camerasIp.filter((c) => evaluateCamStatus(c).code === 'ONLINE').length;
  const connectedCablesCount = cables.filter((c) => c.connectedPort !== null).length;

  // ==========================================
  // MODULE 4 STATE: MANAGED SWITCH CLI
  // ==========================================
  const [cliMode, setCliMode] = useState<'user' | 'priv' | 'config' | 'if'>('user');
  const [cliInput, setCliInput] = useState<string>('');
  const [cliLogs, setCliLogs] = useState<Array<{ text: string; color: string }>>([
    { text: 'Cisco Internetwork Operating System Software', color: 'text-slate-400' },
    { text: 'SG-300-10MP PoE+ Managed Switch Software, Version 15.2(4)E', color: 'text-slate-400' },
    { text: 'พิมพ์ "help" เพื่อดูคำสั่งทั้งหมด หรือคลิกปุ่มคำสั่งลัดด้านขวา...', color: 'text-amber-300' },
  ]);
  const [vlanName, setVlanName] = useState<string>('CCTV_NET');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cliLogs]);

  const getCliPrompt = () => {
    if (cliMode === 'user') return 'Switch>';
    if (cliMode === 'priv') return 'Switch#';
    if (cliMode === 'config') return 'Switch(config)#';
    return 'Switch(config-if)#';
  };

  const executeCliCommand = (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;

    const prompt = getCliPrompt();
    setCliLogs((prev) => [...prev, { text: `${prompt} ${raw}`, color: 'text-white font-bold' }]);
    const cmd = raw.toLowerCase();

    if (cmd === 'help' || cmd === '?') {
      setCliLogs((prev) => [
        ...prev,
        {
          text: `คำสั่งที่รองรับในโหมดจำลองนี้:
  enable                        - เข้าสู่โหมด Privileged EXEC (Switch#)
  configure terminal (conf t)   - เข้าสู่โหมด Global Configuration
  show power inline             - ดูสถานะการจ่ายไฟ PoE ทุกพอร์ต
  show vlan brief               - ดูตาราง VLAN และการแบ่งพอร์ต
  vlan 10                       - สร้าง/เข้าตั้งค่า VLAN 10 สำหรับระบบกล้อง
  interface fa0/1               - เข้าตั้งค่าพอร์ตที่ 1
  power inline never / auto     - สั่งตัด/จ่ายไฟ PoE เพื่อรีบูตกล้อง
  exit / end                    - ออกจากโหมดปัจจุบัน`,
          color: 'text-slate-300',
        },
      ]);
      return;
    }

    if (cmd === 'enable' || cmd === 'en') {
      setCliMode('priv');
      return;
    }

    if (cmd === 'configure terminal' || cmd === 'conf t') {
      setCliMode('config');
      setCliLogs((prev) => [...prev, { text: 'Enter configuration commands, one per line. End with CNTL/Z.', color: 'text-slate-400' }]);
      return;
    }

    if (cmd === 'exit' || cmd === 'end') {
      setCliMode('priv');
      return;
    }

    if (cmd.startsWith('vlan ')) {
      const vId = cmd.replace('vlan ', '').trim();
      setCliMode('config');
      setCliLogs((prev) => [...prev, { text: `[OK] สร้างและเปิดใช้งาน VLAN ${vId} สำหรับระบบกล้องวงจรปิดเรียบร้อยแล้ว`, color: 'text-amber-300' }]);
      return;
    }

    if (cmd.startsWith('int ') || cmd.startsWith('interface ')) {
      setCliMode('if');
      setCliLogs((prev) => [...prev, { text: '[OK] เข้าสู่โหมดตั้งค่าพอร์ต (Interface Configuration)', color: 'text-slate-400' }]);
      return;
    }

    if (cmd === 'power inline never') {
      setCliLogs((prev) => [...prev, { text: '%ILPOWER-5-POWER_GRANTED: ตัดการจ่ายไฟ PoE บนพอร์ตชั่วคราว (กล้องกำลังดับ...)', color: 'text-rose-400' }]);
      return;
    }

    if (cmd === 'power inline auto') {
      setCliLogs((prev) => [...prev, { text: '%ILPOWER-7-DETECT: จ่ายไฟ PoE 48V กลับเข้าพอร์ตอีกครั้ง (กล้องกำลังบูตใหม่...)', color: 'text-emerald-400' }]);
      return;
    }

    if (cmd === 'show power inline' || cmd === 'sh power inline') {
      let tbl = `Interface   Admin  Oper       Power   Device              Class Max\n`;
      tbl +=    `                              (Watts)                            \n`;
      tbl +=    `---------   ------ ---------- ------- ------------------- ----- ----\n`;
      for (let p = 1; p <= 8; p++) {
        const c = cables.find((x) => x.connectedPort === p && x.type === 'poe_cam');
        const w = c ? (isNightMode ? c.irWatt : c.baseWatt).toFixed(1) : '0.0';
        const oper = c ? 'on' : 'off';
        const dev = c ? `${c.id.toUpperCase()}-IPCAM` : 'n/a';
        tbl += `Fa0/${p}       auto   ${oper.padEnd(10)} ${w.padEnd(7)} ${dev.padEnd(19)} 3     30.0\n`;
      }
      setCliLogs((prev) => [...prev, { text: tbl, color: 'text-emerald-400' }]);
      return;
    }

    if (cmd === 'show vlan brief' || cmd === 'sh vlan') {
      const vlanOut = `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/9, Gi0/10
10   ${vlanName.padEnd(32)} active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
                                                Fa0/5, Fa0/6, Fa0/7, Fa0/8`;
      setCliLogs((prev) => [...prev, { text: vlanOut, color: 'text-sky-300' }]);
      return;
    }

    setCliLogs((prev) => [...prev, { text: `% คำสั่ง "${cmd}" ทำงานสำเร็จ (หรือพิมพ์ "help" เพื่อดูคำสั่งทั้งหมด)`, color: 'text-slate-400' }]);
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    executeCliCommand(cliInput);
    setCliInput('');
  };

  // ==========================================
  // MODULE 5 STATE: SUBNETTING CALCULATOR
  // ==========================================
  const [baseIp, setBaseIp] = useState<string>('192.168.10.0');
  const [cidr, setCidr] = useState<number>(24);
  const [camCountReq, setCamCountReq] = useState<number>(48);

  // Subnet Calculation
  const totalIps = Math.pow(2, 32 - cidr);
  const usableHosts = Math.max(0, totalIps - 2);
  const maskBits = (0xffffffff << (32 - cidr)) >>> 0;
  const m1 = (maskBits >>> 24) & 255;
  const m2 = (maskBits >>> 16) & 255;
  const m3 = (maskBits >>> 8) & 255;
  const m4 = maskBits & 255;
  const subnetMaskStr = `${m1}.${m2}.${m3}.${m4}`;

  const octets = baseIp.split('.').map((x) => parseInt(x, 10));
  const o1: number = Number.isFinite(octets[0]) ? (octets[0] as number) : 192;
  const o2: number = Number.isFinite(octets[1]) ? (octets[1] as number) : 168;
  const o3: number = Number.isFinite(octets[2]) ? (octets[2] as number) : 10;

  let netAddr = `${o1}.${o2}.${o3}.0`;
  let usableRangeStr = '';
  let broadcastAddrStr = '';

  if (cidr >= 24) {
    usableRangeStr = `${o1}.${o2}.${o3}.1 - ${o1}.${o2}.${o3}.${totalIps - 2}`;
    broadcastAddrStr = `${o1}.${o2}.${o3}.${totalIps - 1}`;
  } else {
    const extra = Math.pow(2, 24 - cidr);
    const alignedO3 = Math.floor(o3 / extra) * extra;
    netAddr = `${o1}.${o2}.${alignedO3}.0`;
    usableRangeStr = `${o1}.${o2}.${alignedO3}.1 - ${o1}.${o2}.${alignedO3 + extra - 1}.254`;
    broadcastAddrStr = `${o1}.${o2}.${alignedO3 + extra - 1}.255`;
  }

  const reservedInfra = Math.min(15, Math.floor(usableHosts * 0.15));
  const maxCamAllowed = Math.max(0, usableHosts - reservedInfra);
  const isCapacityOk = camCountReq <= maxCamAllowed;

  const camPercent = Math.min(75, Math.max(10, Math.round((camCountReq / usableHosts) * 100)));
  const freePercent = Math.max(3, 78 - camPercent);

  const prefixStr = `${o1}.${o2}.${o3}`;
  const camStart = cidr >= 26 ? 11 : 21;
  const camEnd = Math.min(usableHosts, camStart + camCountReq - 1);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md border transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toastType === 'success' ? 'bg-slate-900 border-emerald-500/80 text-emerald-200' :
          toastType === 'warn' ? 'bg-slate-900 border-amber-500/80 text-amber-200' :
          'bg-slate-900 border-sky-500/80 text-sky-200'
        }`}>
          {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastType === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toastType === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
          <div className="text-xs leading-relaxed">{toastMessage}</div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-sky-500/20 text-white">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  CCTV NetSim <span className="text-xs font-mono font-normal bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">U04 Interactive 2D Pre-Lab</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">ระบบจำลองการวางระบบและตั้งค่าเครือข่ายกล้องวงจรปิด (Room 104 Companion)</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300">สายเสียบ: <strong className="text-white font-mono">{connectedCablesCount}/6</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-sky-400" />
              <span className="text-slate-300">กล้องออนไลน์: <strong className="text-emerald-400 font-mono">{onlineCount}/4</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">VLAN: <strong className="text-amber-400 font-mono">{vlanName}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto space-x-1 border-t border-slate-800/60 pt-1.5 pb-2">
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" /> 1. แผนผังเนื้อหา (Content Plan)
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'switch'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Server className="w-4 h-4" /> 2. จำลองเสียบสาย PoE Switch
          </button>
          <button
            onClick={() => setActiveTab('ip')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ip'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Sliders className="w-4 h-4" /> 3. หน้าตั้งค่า IP & NVR GUI
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'cli'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" /> 4. คำสั่ง Switch (CLI)
          </button>
          <button
            onClick={() => setActiveTab('subnet')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'subnet'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Calculator className="w-4 h-4" /> 5. การแบ่งวงแลน (Subnetting)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ========================================================= */}
        {/* TAB 1: CONTENT PLAN & STORYBOARD                          */}
        {/* ========================================================= */}
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-sky-500/30 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-5">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-sky-500 text-slate-950 px-2.5 py-1 rounded-md">
                  U04 Curriculum Blueprint
                </span>
                <h2 className="text-2xl font-black text-white mt-2">
                  แผนการสร้างเนื้อหา: การวางระบบ Network สำหรับกล้องวงจรปิด (IP Camera)
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
                  โครงสร้างการเรียนรู้เชิงปฏิบัติการเสมือนจริงของหน่วยที่ 4 (U04) ออกแบบให้นักศึกษาได้ฝึกทักษะตั้งแต่ระดับกายภาพ (เสียบสาย PoE และคำนวณกำลังไฟ) การตั้งค่า IP ผ่าน Web GUI ไปจนถึงการเขียนคำสั่งควบคุมสวิตช์
                </p>
              </div>
              <button
                onClick={() => setActiveTab('switch')}
                className="px-5 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" /> เริ่มทดลองฝึกปฏิบัติการจริง
              </button>
            </div>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Module 1 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">01</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">Step 1</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3">Physical Layer & PoE Switch</h3>
                  <p className="text-xs text-emerald-400">การเชื่อมต่อสายสัญญาณและกำลังไฟ PoE</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs mt-3">
                    <li>เข้าใจความต่างระหว่างพอร์ต <strong>PoE (802.3af/at)</strong> และ <strong>Uplink</strong></li>
                    <li>คำนวณ <strong>PoE Budget (Watts)</strong> เพื่อป้องกันกล้องดับเวลากลางคืนเมื่อ IR ทำงาน</li>
                    <li>สังเกตไฟสถานะ <strong>Link/Act LED</strong> และ <strong>PoE LED</strong></li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('switch')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 self-end pt-2 cursor-pointer"
                >
                  เปิดหน้าจำลองการเสียบสาย →
                </button>
              </div>

              {/* Module 2 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold font-mono">02</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">Step 2</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3">IP Addressing & NVR Registration</h3>
                  <p className="text-xs text-sky-400">การกำหนดค่า IP กล้องและผูกเข้าเครื่องบันทึก</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs mt-3">
                    <li>เข้าใจปัญหา <strong>IP Conflict</strong> จากค่า Default โรงงาน (.1.64)</li>
                    <li>การตั้งค่า <strong>Static IP vs DHCP</strong> สำหรับกล้องและ NVR</li>
                    <li>การใช้โปรโตคอล <strong>ONVIF / RTSP Port (554)</strong> เพื่อดึงภาพขึ้นจอ</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('ip')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 self-end pt-2 cursor-pointer"
                >
                  เปิดหน้าตั้งค่า IP & NVR →
                </button>
              </div>

              {/* Module 3 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono">03</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">Step 3</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3">Managed Switch CLI & VLAN</h3>
                  <p className="text-xs text-amber-400">การเขียนคำสั่งแยกวงแลนกล้องเพื่อความปลอดภัย</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs mt-3">
                    <li>แยก <strong>VLAN กล้องวงจรปิด</strong> ลด Broadcast Storm และเพิ่มความปลอดภัย</li>
                    <li>ฝึกพิมพ์คำสั่ง Cisco IOS: <code>enable</code>, <code>conf t</code>, <code>vlan 10</code></li>
                    <li>รีบูตไฟพอร์ตกล้องที่ค้างจากระยะไกล (<code>power inline never/auto</code>)</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('cli')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 self-end pt-2 cursor-pointer"
                >
                  เปิดหน้าจอ Terminal CLI →
                </button>
              </div>

              {/* Module 4 */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold font-mono">04</span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">Step 4</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-3">Subnetting & Bandwidth Planning</h3>
                  <p className="text-xs text-purple-400">การแบ่งช่วง IP ตามจำนวนกล้องและอาคาร</p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs mt-3">
                    <li>เข้าใจ <strong>Subnet Mask (/23, /24, /26)</strong> ว่ารองรับกล้องได้กี่ตัว</li>
                    <li>จัดสรรช่วง IP Plan แยกกลุ่ม Gateway, NVR, กล้อง และสำรองอย่างเป็นระเบียบ</li>
                    <li>แก้ไขโจทย์กรณีศึกษาเมื่อโครงการมีกล้อง 350 ตัว</li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('subnet')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5 self-end pt-2 cursor-pointer"
                >
                  เปิดหน้าคำนวณแบ่งวง IP →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: POE SWITCH SIMULATOR                               */}
        {/* ========================================================= */}
        {activeTab === 'switch' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Mission Instruction */}
            <div className="bg-slate-900 border-l-4 border-emerald-500 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Plug className="w-5 h-5 text-emerald-400" /> ห้องทดลองที่ 1: จำลองการเสียบสาย LAN เข้ากับ PoE Switch
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>วิธีใช้งาน:</strong> 1) คลิกเลือกสายจากอุปกรณ์ด้านซ้าย → 2) คลิกที่พอร์ต RJ45 บนตัวสวิตช์เพื่อเสียบสาย (พอร์ต 1-8 จ่ายไฟ PoE, พอร์ต 9-10 เป็น Uplink)
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={autoWireSwitch}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> เสียบสายอัตโนมัติ (Demo)
                </button>
                <button
                  onClick={resetSwitchPorts}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ถอดสายทั้งหมด
                </button>
              </div>
            </div>

            {/* Switch Chassis Header Telemetry */}
            <div className="flex flex-wrap justify-between items-center gap-3 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 flex items-center gap-1">
                  <Server className="w-4 h-4 text-emerald-400" /> 19" RACKMOUNT UNIT (1U)
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isNightMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {isNightMode ? 'โหมดกลางคืน (IR On - วัตต์เพิ่ม 2 เท่า)' : 'โหมดกลางวัน (IR Off)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  DIP: {switchDipMode.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsNightMode((prev) => !prev);
                  showToast(!isNightMode ? 'เปิดไฟอินฟราเรด (IR) กล้องดึงไฟ PoE สูงขึ้นสองเท่า!' : 'สลับกลับโหมดกลางวันแล้ว', 'info');
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                {isNightMode ? 'สลับกลับโหมดกลางวัน' : 'จำลองโหลดกลางคืน (เปิด IR)'}
              </button>
            </div>

            {/* Realistic 1U Rack Hardware Faceplate */}
            <div className="flex items-stretch rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950">
              {/* Left Rack Ear */}
              <div className="w-8 sm:w-10 bg-slate-900 border-r border-slate-800 flex flex-col justify-between items-center py-4 select-none">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-500 rotate-45" /></div>
                <div className="h-10 w-1.5 rounded-full bg-slate-950 border border-slate-700" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-500 -rotate-45" /></div>
              </div>

              {/* Main Faceplate */}
              <div className="flex-1 p-4 sm:p-5 space-y-4">
                {/* Branding strip */}
                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2.5 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-sky-600 text-white text-[11px] font-black tracking-widest px-2 py-0.5 rounded">HIK-CISCO</span>
                    <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-200 font-mono">DS-3E1510P-SI</span>
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">8-Port PoE+ Gigabit Switch + 2 Uplink</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> LINK/ACT</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> PoE STATUS</span>
                    <span className="text-amber-400 font-semibold">PoE Budget: 65W Max</span>
                  </div>
                </div>

                {/* Switch Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Left: System LEDs & DIP Switch */}
                  <div className="lg:col-span-3 bg-slate-950/90 p-3 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                          <span className="text-slate-300">PWR</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-slate-300">SYS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${totalWatts > 50 ? 'bg-rose-500 animate-ping shadow-[0_0_8px_#f43f5e]' : 'bg-slate-700'}`} />
                          <span className={totalWatts > 50 ? 'text-rose-400 font-bold' : 'text-slate-500'}>PoE-MAX</span>
                        </div>
                      </div>

                      {/* Console Port */}
                      <div
                        onClick={() => setActiveTab('cli')}
                        className="cursor-pointer bg-slate-900 hover:bg-slate-850 px-2.5 py-1.5 rounded-xl border border-sky-500/40 text-center transition-all"
                        title="คลิกเพื่อเข้าสู่หน้าจอ CLI Console"
                      >
                        <div className="text-[9px] font-mono font-bold text-sky-400 mb-1">CONSOLE</div>
                        <div className="w-8 h-6 mx-auto bg-slate-950 rounded border border-slate-700 flex flex-col items-center justify-between p-0.5">
                          <div className="w-5 h-1 bg-amber-500/60 rounded-xs" />
                          <div className="w-2.5 h-1.5 bg-sky-500/30 rounded-xs" />
                        </div>
                        <div className="text-[8px] text-slate-500 mt-0.5 font-mono">115200 bps</div>
                      </div>

                      {/* DIP Switch */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-mono text-amber-400 font-bold mb-1 text-center">DIP MODE</div>
                        <div className="flex flex-col gap-1">
                          {(['standard', 'vlan', 'extend'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setSwitchDipMode(m);
                                showToast(`ปรับโหมด DIP เป็น ${m.toUpperCase()}`, 'info');
                              }}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all ${
                                switchDipMode === m ? 'bg-sky-600 text-white font-bold' : 'bg-slate-850 text-slate-400 hover:text-white'
                              }`}
                            >
                              {m === 'standard' ? '1: STD' : m === 'vlan' ? '2: VLAN' : '3: 250m'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Digital PoE Budget Meter */}
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">PoE LOAD:</span>
                        <span className={`font-bold ${totalWatts > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {totalWatts.toFixed(1)}W / {maxBudget.toFixed(1)}W
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${totalWatts > 50 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-sky-500'}`}
                          style={{ width: `${Math.min(100, Math.round((totalWatts / maxBudget) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">
                        {totalWatts > 50 ? '⚠️ โหลดเกิน 80%! ไฟเตือน PoE-MAX ทำงาน' : 'จ่ายไฟปกติ 48V DC (IEEE 802.3af/at)'}
                      </p>
                    </div>
                  </div>

                  {/* Center: 8 PoE+ Ports (1 - 8) */}
                  <div className="lg:col-span-6 bg-slate-950/90 p-3 rounded-2xl border border-amber-500/30">
                    <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-mono">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> PoE+ PORTS (1 - 8) | 30W MAX
                      </span>
                      <span className="text-slate-500 text-[10px]">คลิกช่องเพื่อเสียบ/ถอด</span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((portNum) => {
                        const plugged = cables.find((c) => c.connectedPort === portNum);
                        const isCam = plugged?.type === 'poe_cam';
                        const watt = plugged && isCam ? (isNightMode ? plugged.irWatt : plugged.baseWatt) : 0;
                        const linkOn = plugged !== undefined;

                        return (
                          <div
                            key={portNum}
                            onClick={() => handlePortClick(portNum)}
                            className={`cursor-pointer group rounded-xl p-1.5 flex flex-col items-center transition-all border ${
                              plugged ? 'bg-slate-900 border-emerald-500/50 shadow-md' : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div className="w-full flex justify-between items-center px-0.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${linkOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-800'}`} />
                              <span className="text-[9px] font-mono font-bold text-slate-400">{portNum}</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${watt > 0 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                            </div>

                            {/* RJ45 socket / Boot */}
                            <div className={`w-10 h-8 rounded border flex flex-col items-center justify-between p-1 relative overflow-hidden ${
                              plugged ? 'bg-amber-500/10 border-amber-400' : 'bg-black border-slate-800'
                            }`}>
                              <div className="w-6 h-1 bg-amber-500/50 rounded-xs" />
                              {plugged ? (
                                <div className="w-6 h-3 bg-amber-500 rounded-t-sm flex items-center justify-center text-[7px] font-mono font-bold text-slate-950">
                                  {plugged.id.toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-3 h-1.5 bg-slate-900 border border-slate-700 rounded-t-xs" />
                              )}
                            </div>

                            <span className="mt-1 text-[8px] font-mono truncate text-slate-400">
                              {watt > 0 ? `${watt.toFixed(1)}W` : 'PoE+'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: 2 Gigabit Uplink Ports (9 - 10) */}
                  <div className="lg:col-span-3 bg-slate-950/90 p-3 rounded-2xl border border-sky-500/30">
                    <div className="flex justify-between items-center mb-2 px-1 text-[11px] font-mono">
                      <span className="font-bold text-sky-400 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> UPLINK (9 - 10)
                      </span>
                      <span className="text-slate-500 text-[10px]">NVR / ROUTER</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      {[9, 10].map((portNum) => {
                        const plugged = cables.find((c) => c.connectedPort === portNum);
                        const linkOn = plugged !== undefined;

                        return (
                          <div
                            key={portNum}
                            onClick={() => handlePortClick(portNum)}
                            className={`cursor-pointer group rounded-xl p-1.5 flex flex-col items-center transition-all border ${
                              plugged ? 'bg-slate-900 border-sky-500/50 shadow-md' : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div className="w-full flex justify-between items-center px-0.5 mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${linkOn ? 'bg-sky-400 animate-pulse' : 'bg-slate-800'}`} />
                              <span className="text-[9px] font-mono font-bold text-slate-400">{portNum}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                            </div>

                            <div className={`w-10 h-8 rounded border flex flex-col items-center justify-between p-1 relative overflow-hidden ${
                              plugged ? (plugged.color === 'blue' ? 'bg-blue-500/20 border-blue-400' : 'bg-emerald-500/20 border-emerald-400') : 'bg-black border-slate-800'
                            }`}>
                              <div className="w-6 h-1 bg-sky-500/50 rounded-xs" />
                              {plugged ? (
                                <div className={`w-6 h-3 rounded-t-sm flex items-center justify-center text-[7px] font-mono font-bold text-white ${
                                  plugged.color === 'blue' ? 'bg-blue-600' : 'bg-emerald-600'
                                }`}>
                                  {plugged.id.toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-3 h-1.5 bg-slate-900 border border-slate-700 rounded-t-xs" />
                              )}
                            </div>

                            <span className="mt-1 text-[8px] font-mono truncate text-sky-400 font-semibold">
                              {plugged ? '1000M' : 'GBE'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Rack Ear */}
              <div className="w-8 sm:w-10 bg-slate-900 border-l border-slate-800 flex flex-col justify-between items-center py-4 select-none">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-500 -rotate-45" /></div>
                <div className="h-10 w-1.5 rounded-full bg-slate-950 border border-slate-700" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center"><div className="w-2 h-0.5 bg-slate-500 rotate-45" /></div>
              </div>
            </div>

            {/* Cable Inventory & Port Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Cables Inventory */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plug className="w-4 h-4 text-sky-400" /> 1. รายการสายสัญญาณ (คลิกเลือก 1 เส้น)
                  </h3>
                  <span className="text-[11px] text-slate-500">เลือกแล้วคลิกที่พอร์ต</span>
                </div>

                <div className="space-y-2">
                  {cables.map((cable) => {
                    const isSelected = selectedCableId === cable.id;
                    const isPlugged = cable.connectedPort !== null;

                    return (
                      <div
                        key={cable.id}
                        onClick={() => setSelectedCableId(cable.id)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-7 rounded-full ${
                            cable.color === 'amber' ? 'bg-amber-400' : cable.color === 'blue' ? 'bg-blue-400' : 'bg-emerald-400'
                          }`} />
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-white">{cable.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {cable.type === 'poe_cam'
                                ? `PoE: ปกติ ${cable.baseWatt}W / กลางคืน ${cable.irWatt}W`
                                : 'อุปกรณ์ Data (ไม่ต้องใช้ไฟ PoE)'}
                            </div>
                          </div>
                        </div>

                        {isPlugged ? (
                          <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                            Port #{cable.connectedPort}
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-xl">
                            รอเสียบ
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Live Port Status Table */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-emerald-400" /> 2. ตารางสถานะการเชื่อมต่อพอร์ต (Port Status)
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/60">
                          <th className="py-2.5 px-3 rounded-tl-xl">พอร์ต</th>
                          <th className="py-2.5 px-3">ประเภท</th>
                          <th className="py-2.5 px-3">อุปกรณ์ที่เสียบ</th>
                          <th className="py-2.5 px-3">สถานะ Link</th>
                          <th className="py-2.5 px-3">ไฟ PoE</th>
                          <th className="py-2.5 px-3 text-right rounded-tr-xl">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((portNum) => {
                          const isPoe = portNum <= 8;
                          const plugged = cables.find((c) => c.connectedPort === portNum);
                          const watt = plugged && plugged.type === 'poe_cam' ? (isNightMode ? plugged.irWatt : plugged.baseWatt) : 0;

                          return (
                            <tr key={portNum} className="hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-bold text-white">GE0/{portNum}</td>
                              <td className="py-2 px-3 text-slate-400">{isPoe ? 'PoE+ (802.3at)' : 'Uplink'}</td>
                              <td className="py-2 px-3 text-slate-200">{plugged ? (plugged.name.split(':')[1] ?? plugged.name) : '-'}</td>
                              <td className="py-2 px-3">
                                {plugged ? (
                                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> 1000Mbps
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Down</span>
                                )}
                              </td>
                              <td className="py-2 px-3 font-bold text-amber-400">{watt > 0 ? `${watt.toFixed(1)} W` : '0.0 W'}</td>
                              <td className="py-2 px-3 text-right">
                                {plugged ? (
                                  <button
                                    onClick={() => handlePortClick(portNum)}
                                    className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                                  >
                                    ถอดสาย
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePortClick(portNum)}
                                    className="text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                                  >
                                    เสียบ
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>เกร็ดความรู้สำหรับงานช่าง CCTV:</strong> หากนำสายกล้อง IP Camera ที่ไม่มีอะแดปเตอร์แยกไปเสียบที่ช่อง <strong>Uplink (Port 9-10)</strong> ซึ่งไม่มีระบบจ่ายไฟ PoE กล้องจะไม่ติด (สถานะ Down) และเวลากลางคืนเมื่อหลอด IR ทำงาน กล้องจะกินไฟเพิ่มขึ้นเกือบ 2 เท่า (6W → 12W)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: IP CONFIG & NVR 4.0 GUI                            */}
        {/* ========================================================= */}
        {activeTab === 'ip' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Mission Instruction */}
            <div className="bg-slate-900 border-l-4 border-sky-500 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-sky-400" /> ห้องทดลองที่ 2: หน้าจอเครื่องบันทึก NVR 4.0 Web GUI & โปรแกรม SADP Tool
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  <strong>สถานการณ์หน้างาน:</strong> เสียบสายกล้องครบ 4 ตัวแล้วแต่ภาพขึ้นแค่ 2 จอ เพราะ <strong>CH3 IP ชนกับ CH1 (.101)</strong> และ <strong>CH4 ติดค่าโรงงานคนละวง (.0.64)</strong> ให้คลิกเลือกกล้องในตารางแล้วแก้ไข IP ทางด้านขวา
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={batchActivateSubnet}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  ดึง CH4 เข้าวง .1.x
                </button>
                <button
                  onClick={autoFixAllIps}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs rounded-xl font-bold transition-all shadow-md shadow-sky-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> เรียง IP ทั้งหมด (.101 - .104)
                </button>
              </div>
            </div>

            {/* Embedded NVR Frame */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* NVR Header */}
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded font-mono">NVR 4.0</span>
                  <span className="text-xs sm:text-sm font-bold text-white font-mono">DS-7604NI-K1/4P</span>
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">FW: V4.74.210</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
                    NIC: <strong className="text-sky-400">192.168.1.200/24</strong>
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
                    BW: <strong className="text-emerald-400">{(onlineCount * 4.2).toFixed(1)} / 40 Mbps</strong>
                  </span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
                    {clockStr}
                  </span>
                </div>
              </div>

              {/* Main NVR Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Area: 2x2 Screen Split & SADP Table */}
                <div className="lg:col-span-8 p-4 sm:p-5 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-800">
                  {/* 4 Monitors Grid */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="font-bold text-white">HDMI MONITOR OUTPUT (2x2 SPLIT VIEW)</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">H.265+ | Port 554</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black p-2.5 rounded-xl border border-slate-800">
                      {camerasIp.map((cam) => {
                        const status = evaluateCamStatus(cam);
                        const isOnline = status.code === 'ONLINE';

                        return (
                          <div
                            key={cam.id}
                            onClick={() => setEditCamId(cam.id)}
                            className={`cursor-pointer rounded-xl p-3 h-40 flex flex-col justify-between relative border transition-all ${
                              isOnline
                                ? 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400'
                                : 'bg-slate-950 border-rose-500/50 hover:border-rose-400'
                            }`}
                          >
                            <div className="flex justify-between items-center z-10">
                              <span className="text-[10px] font-mono bg-black/80 px-2 py-0.5 rounded text-white font-bold">
                                {cam.ch} - {cam.name.split(' ')[0]}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                              }`}>
                                {isOnline ? 'LIVE' : '0 Kbps'}
                              </span>
                            </div>

                            <div className="my-auto text-center z-10">
                              {isOnline ? (
                                <div className="space-y-1">
                                  <Video className="w-8 h-8 text-emerald-400 mx-auto" />
                                  <div className="text-[11px] font-bold text-emerald-300 font-mono">STREAM ACTIVE</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{cam.res} @ 25fps</div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto animate-bounce" />
                                  <div className="text-[11px] font-bold text-rose-400 font-mono">NO VIDEO / {status.label}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">IP: {cam.ip} (คลิกเพื่อแก้)</div>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-mono bg-black/70 px-2 py-1 rounded text-slate-300">
                              <span>IP: {cam.ip}</span>
                              <span className="text-sky-400 hover:underline">คลิกแก้ไข →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SADP Scanner Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-400" /> SADP / ONVIF Online Device Scanner (พบ 4 อุปกรณ์)
                      </h3>
                      <button
                        onClick={() => showToast('สแกนหาอุปกรณ์ ARP / ONVIF เรียบร้อยแล้ว', 'info')}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
                      >
                        สแกนใหม่
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono bg-slate-950/70">
                            <th className="py-2 px-2">CH</th>
                            <th className="py-2 px-2">จุดติดตั้ง / รุ่น</th>
                            <th className="py-2 px-2">IPv4 Address</th>
                            <th className="py-2 px-2">Gateway</th>
                            <th className="py-2 px-2">สถานะ</th>
                            <th className="py-2 px-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {camerasIp.map((cam) => {
                            const status = evaluateCamStatus(cam);
                            const isSelected = cam.id === editCamId;

                            return (
                              <tr
                                key={cam.id}
                                onClick={() => setEditCamId(cam.id)}
                                className={`cursor-pointer transition-all ${isSelected ? 'bg-sky-500/15 border-l-2 border-l-sky-400' : 'hover:bg-slate-800/40'}`}
                              >
                                <td className="py-2.5 px-2 font-bold text-sky-400">{cam.ch}</td>
                                <td className="py-2.5 px-2">
                                  <div className="font-sans font-medium text-white">{cam.name}</div>
                                  <div className="text-[10px] text-slate-400">{cam.model}</div>
                                </td>
                                <td className={`py-2.5 px-2 font-bold ${status.code === 'ONLINE' ? 'text-emerald-300' : 'text-rose-400'}`}>
                                  {cam.ip}
                                </td>
                                <td className="py-2.5 px-2 text-slate-400">{cam.gw}</td>
                                <td className="py-2.5 px-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                    status.code === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                    status.code === 'CONFLICT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  }`}>
                                    {status.label}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <button className="text-[11px] bg-slate-800 hover:bg-sky-600 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer">
                                    แก้ไข
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Area: Modify IP Form & Ping Diagnostic */}
                <div className="lg:col-span-4 p-4 sm:p-5 space-y-5 bg-slate-900/50 flex flex-col justify-between">
                  {/* SADP Form */}
                  <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-mono font-bold text-sky-400 uppercase block">SADP Network Parameters</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{editingCam.name}</h4>
                      <span className="text-[10px] font-mono text-amber-400">MAC: {editingCam.mac}</span>
                    </div>

                    <form onSubmit={handleSaveCamIp} className="space-y-3 text-xs">
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div>
                          <label className="text-white font-medium block">Enable DHCP</label>
                          <span className="text-[10px] text-slate-400">รับ IP อัตโนมัติจากเราเตอร์</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formDhcp}
                          onChange={(e) => {
                            setFormDhcp(e.target.checked);
                            if (e.target.checked) {
                              setFormIp(`192.168.1.10${editCamId}`);
                              setFormMask('255.255.255.0');
                              setFormGw('192.168.1.1');
                            }
                          }}
                          className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-slate-300">IPv4 Address:</label>
                          <span className="text-[10px] font-mono text-sky-400">แนะนำ: 192.168.1.101 - 104</span>
                        </div>
                        <input
                          type="text"
                          value={formIp}
                          onChange={(e) => setFormIp(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-2 text-white font-mono outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-300 mb-1">Subnet Mask:</label>
                          <input
                            type="text"
                            value={formMask}
                            onChange={(e) => setFormMask(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-white font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-1">Gateway:</label>
                          <input
                            type="text"
                            value={formGw}
                            onChange={(e) => setFormGw(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-2.5 py-1.5 text-white font-mono outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> บันทึกและซิงค์เข้า NVR
                      </button>
                    </form>
                  </div>

                  {/* Ping Diagnostic Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-emerald-400" /> Ping & RTSP 554 Diagnostic
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">ICMPv4</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pingTarget}
                        onChange={(e) => setPingTarget(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none"
                        placeholder="192.168.1.101"
                      />
                      <button
                        onClick={runPingTest}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Test
                      </button>
                    </div>

                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-emerald-400 h-28 overflow-y-auto leading-relaxed">
                      {pingLog}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SWITCH CLI TERMINAL                                */}
        {/* ========================================================= */}
        {activeTab === 'cli' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Mission Instruction */}
            <div className="bg-slate-900 border-l-4 border-amber-500 p-4 rounded-2xl">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" /> ห้องทดลองที่ 3: หน้าจอเขียนคำสั่ง Managed Switch (Cisco IOS CLI) สำหรับระบบ CCTV
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ฝึกพิมพ์คำสั่งจริงในช่อง Terminal ด้านล่าง หรือคลิกที่ <strong>"ปุ่มคำสั่งลัด (Quick Macro)"</strong> ด้านขวาเพื่อดูการสร้าง VLAN แยกวงกล้อง และการรีบูตไฟพอร์ต PoE จากระยะไกล
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Terminal Output & Input (8 cols) */}
              <div className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden h-[520px]">
                {/* Terminal Header */}
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">COM3 - SSH PuTTY - Switch-CCTV-Core (192.168.1.254)</span>
                  </div>
                  <button
                    onClick={() => setCliLogs([{ text: 'ล้างหน้าจอ Terminal แล้ว พิมพ์ help เพื่อดูคำสั่ง...', color: 'text-slate-400' }])}
                    className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> ล้างหน้าจอ
                  </button>
                </div>

                {/* Output log */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm space-y-1.5 leading-relaxed bg-slate-950">
                  {cliLogs.map((log, index) => (
                    <div key={index} className={`whitespace-pre-wrap ${log.color}`}>
                      {log.text}
                    </div>
                  ))}
                  <div ref={terminalBottomRef} />
                </div>

                {/* Terminal Input Bar */}
                <form onSubmit={handleCliSubmit} className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center gap-2 font-mono text-xs sm:text-sm">
                  <span className="text-amber-400 font-bold whitespace-nowrap">{getCliPrompt()}</span>
                  <input
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="พิมพ์คำสั่ง เช่น show power inline, conf t, vlan 10..."
                    className="w-full bg-transparent text-white outline-none font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" /> Enter
                  </button>
                </form>
              </div>

              {/* Right: Quick Macros (4 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> ชุดคำสั่งลัดที่ใช้บ่อยในงาน CCTV
                  </h3>

                  {/* Macro 1 */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-400">1. ตรวจสอบการจ่ายไฟ PoE</span>
                      <button
                        onClick={() => executeCliCommand('show power inline')}
                        className="px-2.5 py-1 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        รันคำสั่ง
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded-lg">show power inline</code>
                    <p className="text-[11px] text-slate-400">ตรวจสอบว่ากล้องแต่ละพอร์ตดึงไฟกี่วัตต์ (Watts)</p>
                  </div>

                  {/* Macro 2 */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-sky-400">2. สร้าง VLAN 10 แยกวงกล้อง</span>
                      <button
                        onClick={() => {
                          setVlanName('CCTV_SECURITY');
                          executeCliCommand('vlan 10');
                          showToast('สร้าง VLAN 10 สำหรับแยกวงกล้องสำเร็จ!', 'success');
                        }}
                        className="px-2.5 py-1 bg-sky-600/20 text-sky-300 hover:bg-sky-600 hover:text-white border border-sky-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        รันคำสั่ง
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded-lg">vlan 10 → name CCTV_SECURITY</code>
                    <p className="text-[11px] text-slate-400">ป้องกัน Broadcast Storm จากเครือข่ายออฟฟิศ</p>
                  </div>

                  {/* Macro 3 */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-400">3. สั่งรีเซ็ตไฟ PoE รีบูตกล้องค้าง</span>
                      <button
                        onClick={() => {
                          executeCliCommand('interface fa0/1');
                          executeCliCommand('power inline never');
                          executeCliCommand('power inline auto');
                          showToast('สั่งตัด-ต่อไฟ PoE รีบูตกล้อง CAM-01 แล้วโดยไม่ต้องปีนเสา!', 'success');
                        }}
                        className="px-2.5 py-1 bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/30 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        รันคำสั่ง
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded-lg">int fa0/1 → power inline never/auto</code>
                    <p className="text-[11px] text-slate-400">แก้ปัญหากล้องค้างจากระยะไกล ไม่ต้องปีนบันไดไปถอดสาย</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SUBNETTING & CCTV ALLOCATION                       */}
        {/* ========================================================= */}
        {activeTab === 'subnet' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Mission Instruction */}
            <div className="bg-slate-900 border-l-4 border-purple-500 p-4 rounded-2xl">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" /> ห้องทดลองที่ 4: การคำนวณแบ่งวงแลน (IP Subnetting) และจัดสรรช่วง IP กล้อง
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ทดลองปรับขนาด <strong>CIDR Prefix</strong> หรือเลือกจาก <strong>โจทย์สถานการณ์จริง 3 รูปแบบ</strong> ด้านล่างเพื่อดูการจัดสรรช่วง IP
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setBaseIp('192.168.1.0');
                  setCidr(26);
                  setCamCountReq(32);
                  showToast('โหลดโจทย์ที่ 1: ร้านค้าขนาดเล็ก แบ่ง 4 โซนย่อย (/26)', 'info');
                }}
                className="bg-slate-900 hover:bg-slate-850 border border-purple-500/30 p-3.5 rounded-2xl text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> โจทย์ที่ 1: ร้านค้าขนาดเล็ก (/26)
                </div>
                <div className="text-[11px] text-slate-400">แบ่ง 4 โซนย่อย โซนละไม่เกิน 62 IP</div>
              </button>

              <button
                onClick={() => {
                  setBaseIp('192.168.10.0');
                  setCidr(24);
                  setCamCountReq(64);
                  showToast('โหลดโจทย์ที่ 2: อาคารสำนักงานมาตรฐาน (/24)', 'info');
                }}
                className="bg-slate-900 hover:bg-slate-850 border border-sky-500/30 p-3.5 rounded-2xl text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> โจทย์ที่ 2: อาคารสำนักงานมาตรฐาน (/24)
                </div>
                <div className="text-[11px] text-slate-400">วงแลน Class C ยอดนิยม รองรับสูงสุด 254 IP</div>
              </button>

              <button
                onClick={() => {
                  setBaseIp('192.168.20.0');
                  setCidr(23);
                  setCamCountReq(350);
                  showToast('โหลดโจทย์ที่ 3: โรงงานขนาดใหญ่ 350 กล้อง (/23)', 'info');
                }}
                className="bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 p-3.5 rounded-2xl text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> โจทย์ที่ 3: โรงงานขนาดใหญ่ 350 กล้อง (/23)
                </div>
                <div className="text-[11px] text-slate-400">ขยายเป็น /23 รองรับ 510 IP โดยไม่ต้องข้ามวง</div>
              </button>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" /> ตั้งค่าเครือข่ายตั้งต้น (Base Network)
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Network IP Address ตั้งต้น:</label>
                    <input
                      type="text"
                      value={baseIp}
                      onChange={(e) => setBaseIp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">ขนาด CIDR Prefix:</span>
                      <strong className="text-purple-400 font-mono">/{cidr} ({subnetMaskStr})</strong>
                    </div>
                    <input
                      type="range"
                      min="22"
                      max="28"
                      value={cidr}
                      onChange={(e) => setCidr(parseInt(e.target.value, 10))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>/22 (1022 IP)</span>
                      <span>/24 (254 IP)</span>
                      <span>/26 (62 IP)</span>
                      <span>/28 (14 IP)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">จำนวนกล้องที่ต้องการติดตั้ง:</span>
                      <strong className="text-emerald-400 font-mono">{camCountReq} ตัว</strong>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="450"
                      value={camCountReq}
                      onChange={(e) => setCamCountReq(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subnet Mask:</span>
                    <strong className="text-white">{subnetMaskStr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Address:</span>
                    <strong className="text-sky-400">{netAddr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Usable Host Range:</span>
                    <strong className="text-emerald-400">{usableRangeStr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Broadcast Address:</span>
                    <strong className="text-amber-400">{broadcastAddrStr}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                    <span className="text-slate-400">รองรับ Host รวม:</span>
                    <strong className="text-purple-400">{usableHosts} อุปกรณ์</strong>
                  </div>
                </div>
              </div>

              {/* Allocation Visual & Table */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> แผนผังการจัดสรรช่วง IP มาตรฐานงาน CCTV
                    </h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                      isCapacityOk ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {isCapacityOk ? 'ความจุเพียงพอ' : `IP ไม่พอ (ขาดอีก ${camCountReq - maxCamAllowed} IP)`}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-7 bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800 text-[10px] font-bold text-white text-center leading-7">
                    <div style={{ width: '10%' }} className="bg-rose-600" title="Gateway & Switch">GW</div>
                    <div style={{ width: '12%' }} className="bg-sky-600" title="NVR & Storage">NVR</div>
                    <div style={{ width: `${camPercent}%` }} className="bg-emerald-600 transition-all duration-300" title="Cameras">
                      กล้อง {camCountReq} ตัว
                    </div>
                    <div style={{ width: `${freePercent}%` }} className="bg-slate-800 text-slate-400 transition-all duration-300" title="Spare">
                      สำรอง
                    </div>
                  </div>

                  {/* Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-mono">
                          <th className="py-2 px-3 rounded-tl-xl">หมวดหมู่อุปกรณ์</th>
                          <th className="py-2 px-3">ช่วง IP ที่แนะนำ</th>
                          <th className="py-2 px-3 rounded-tr-xl">เหตุผลในการออกแบบ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-rose-400">1. Gateway & Managed Switch</td>
                          <td className="py-2.5 px-3 text-white">{prefixStr}.1 - {prefixStr}.5</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">กันไว้สำหรับ Router และ Switch Management IP</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-sky-400">2. เครื่องบันทึก NVR & Storage</td>
                          <td className="py-2.5 px-3 text-white">{prefixStr}.6 - {prefixStr}.{camStart - 1}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">แยกช่วงให้จำง่ายเวลาทำ Port Forward</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-emerald-400">3. กล้องวงจรปิด ({camCountReq} ตัว)</td>
                          <td className="py-2.5 px-3 text-emerald-300 font-bold">{prefixStr}.{camStart} - {prefixStr}.{camEnd}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">เรียงตามช่องกล้อง CH1, CH2, CH3...</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-semibold text-slate-400">4. ช่วงสำรอง (Spare / Service)</td>
                          <td className="py-2.5 px-3 text-slate-400">{prefixStr}.{camEnd + 1} เป็นต้นไป</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">เผื่อเพิ่มกล้อง หรือสำหรับโน้ตบุ๊กช่างเซอร์วิส</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-slate-400">
                  💡 <strong>คำแนะนำการวางระบบ:</strong> หากโครงการมีกล้องเกิน 254 ตัว ควรเลือกใช้ <strong>/23 (255.255.254.0)</strong> เพื่อรวมกล้อง 510 ตัวให้อยู่ใน Subnet เดียวกันและค้นหากล้องผ่าน ONVIF ได้โดยไม่ต้องข้าม Router
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
