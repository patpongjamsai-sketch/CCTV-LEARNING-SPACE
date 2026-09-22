import { LoginForm } from './LoginForm';

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMap: Record<string, string> = {
    auth_callback_failed: 'การยืนยันตัวตนผ่านลิงก์ไม่สำเร็จหรือลิงก์หมดอายุ โปรดลองอีกครั้ง',
    oauth_start_failed: 'ไม่สามารถเริ่มการเข้าสู่ระบบด้วย Google ได้ โปรดลองอีกครั้ง',
  };

  return (
    <LoginForm
      nextPath={params.next || '/'}
      errorMessage={
        params.error ? errorMap[params.error] || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' : undefined
      }
    />
  );
}
