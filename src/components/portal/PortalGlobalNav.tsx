'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../lib/supabase/client';

export type GlobalNavItem = {
    num: string;
    label: string;
    href: string;
    matchPrefix?: string;
};

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
    { num: '01', label: 'ภาพรวมการเรียนรู้', href: '/' },
    { num: '02', label: 'เส้นทางการเรียนรู้', href: '/courses/21909-2020', matchPrefix: '/courses' },
    { num: '03', label: 'ภารกิจฝึกทักษะ', href: '/missions', matchPrefix: '/missions' },
    { num: '04', label: 'แบบทดสอบ', href: '/assessments', matchPrefix: '/assessments' },
    { num: '05', label: 'ผลการเรียนของฉัน', href: '/progress', matchPrefix: '/progress' },
    { num: '06', label: 'อนุมัติสิทธิ์ (Teacher)', href: '/teacher', matchPrefix: '/teacher' },
];

export type UserProfile = {
    displayName: string;
    role: 'student' | 'teacher' | 'admin';
    studentCode?: string;
    email?: string;
};

export type PortalGlobalNavProps = {
    showTeacherTab?: boolean;
    initialUser?: UserProfile | null;
};

export function PortalGlobalNav({ showTeacherTab = false, initialUser = null }: PortalGlobalNavProps = {}) {
    const pathname = usePathname() || '';
    const [user, setUser] = useState<UserProfile | null>(initialUser);

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                // 1. Try server API route first (most reliable, reads HTTP cookies & profiles)
                const res = await fetch('/api/auth/me', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.user && isMounted) {
                        setUser(data.user);
                        return;
                    }
                }

                // 2. Fallback to Supabase Browser Client
                const supabase = createBrowserSupabaseClient();
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser && isMounted) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('display_name, student_code, role')
                        .eq('id', authUser.id)
                        .maybeSingle();

                    setUser({
                        displayName: profile?.display_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'ผู้เรียน',
                        role: profile?.role || 'student',
                        studentCode: profile?.student_code || undefined,
                        email: authUser.email,
                    });
                }
            } catch {
                // ignore
            }
        };

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, []);

    const isTeacherOrAdmin = showTeacherTab || user?.role === 'teacher' || user?.role === 'admin' || pathname.startsWith('/teacher');
    const items = isTeacherOrAdmin
        ? GLOBAL_NAV_ITEMS
        : GLOBAL_NAV_ITEMS.filter((item) => item.href !== '/teacher');

    return (
        <header className="portal-global-nav w-full" aria-label="แถบนำทางหลัก 01 ถึง 05">
            <div className="portal-global-nav-inner w-full">
                <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto min-w-0 flex-1">
                    <a href="/" className="portal-global-brand shrink-0" title="กลับหน้าแรก">
                        <span className="portal-global-brand-badge">CCTV</span>
                        <span className="portal-global-brand-text">LEARNING ECOSYSTEM</span>
                    </a>

                    <nav className="portal-global-tabs" aria-label="เมนูระบบ">
                        {items.map((item) => {
                            const isActive = item.href === '/'
                                ? pathname === '/'
                                : pathname.startsWith(item.matchPrefix || item.href);

                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`portal-global-tab ${isActive ? 'portal-global-tab-active' : ''}`}
                                >
                                    <span className={`portal-global-tab-badge ${isActive ? 'portal-global-tab-badge-active' : ''}`}>
                                        {item.num}
                                    </span>
                                    <span className="portal-global-tab-label">{item.label}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* User Status / Login Badge */}
                <div className="flex items-center gap-3 shrink-0 ml-auto pl-4">
                    {user ? (
                        <div className="flex items-center gap-2.5 text-xs">
                            <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm" aria-hidden="true">
                                {user.displayName ? user.displayName.slice(0, 1) : 'ช'}
                            </span>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="font-semibold text-slate-200 text-xs truncate max-w-[150px]">
                                    {user.displayName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {user.role === 'teacher' ? '👨‍🏫 ครูผู้สอน' : user.role === 'admin' ? '🛡️ ผู้ดูแลระบบ' : '👨‍🔧 นักเรียน'}
                                    {user.studentCode ? ` (${user.studentCode})` : ''}
                                </span>
                            </div>
                            <a
                                href="/auth/logout"
                                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700/80 transition-colors"
                                title="ออกจากระบบ"
                            >
                                ออกจากระบบ
                            </a>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                            <span>เข้าสู่ระบบ</span>
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
}
