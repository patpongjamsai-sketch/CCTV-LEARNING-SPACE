import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './portal.css';

export const metadata: Metadata = {
  title: 'CCTV Learning Center',
  description: 'ศูนย์กลางการเรียนรู้วิชากล้องวงจรปิดบนระบบเครือข่าย 21909-2020',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
