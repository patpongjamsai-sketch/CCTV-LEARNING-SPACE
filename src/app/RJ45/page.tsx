import type { Metadata } from 'next';
import { Rj45GamePage } from '../../features/rj45-game/Rj45GamePage';

export const metadata: Metadata = {
  title: 'RJ45 CAT6 Workshop | CCTV Learning Center',
  description: 'เกมฝึกเข้าหัวสาย RJ45 CAT6 แบบ T568B สองปลายครบ 8 ขั้นตอน',
};

export default function Page() {
  return <Rj45GamePage />;
}
