import { LoginForm } from './LoginForm';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '../../lib/auth/currentProfile';

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const current = await getCurrentProfile().catch(() => ({ status: 'unavailable' as const }));
  if (current.status === 'authenticated') {
    redirect('/');
  }

  const params = await searchParams;
  const errorMap: Record<string, string> = {
    auth_callback_failed: 'การยืนยันตัวตนผ่านลิงก์ไม่สำเร็จหรือลิงก์หมดอายุ โปรดลองอีกครั้ง',
    oauth_start_failed: 'ไม่สามารถเริ่มการเข้าสู่ระบบด้วย Google ได้ โปรดลองอีกครั้ง',
  };

  return (
    <LoginForm
      nextPath={params.next || '/'}
      errorMessage={
        current.status === 'unavailable'
          ? 'ไม่สามารถตรวจสอบโปรไฟล์ได้ในขณะนี้ โปรดลองใหม่อีกครั้ง'
          : current.status === 'inactive'
          ? 'บัญชีนี้ยังไม่มีโปรไฟล์ที่เปิดใช้งาน โปรดติดต่อผู้ดูแลระบบ'
          : params.error ? errorMap[params.error] || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' : undefined
      }
    />
  );
}
