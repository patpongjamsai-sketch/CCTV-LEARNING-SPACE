import type { Metadata } from 'next';
import { CctvComponentsLab } from '../../../components/labs/cctv-components/CctvComponentsLab';

export const metadata: Metadata = {
  title: 'CCTV 5 Core Components Mastery Lab | U01 Interactive Engineering Simulator',
  description: 'ห้องปฏิบัติการเจาะลึก 5 องค์ประกอบระบบ CCTV (รับภาพ, ส่งสัญญาณ, บันทึก, จัดการ, แสดงผล) พร้อมเครื่องคำนวณ PoE Power Budget, DORI Lens และภารกิจแก้ปัญหาหน้างานจริง',
};

export default function CctvComponentsLabPage() {
  return <CctvComponentsLab />;
}
