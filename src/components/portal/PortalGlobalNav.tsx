'use client';

import { usePathname } from 'next/navigation';

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

export type PortalGlobalNavProps = {
    showTeacherTab?: boolean;
};

export function PortalGlobalNav({ showTeacherTab = false }: PortalGlobalNavProps = {}) {
    const pathname = usePathname() || '';
    const items = showTeacherTab || pathname.startsWith('/teacher')
        ? GLOBAL_NAV_ITEMS
        : GLOBAL_NAV_ITEMS.filter((item) => item.href !== '/teacher');

    return (
        <header className="portal-global-nav" aria-label="แถบนำทางหลัก 01 ถึง 05">
            <div className="portal-global-nav-inner">
                <a href="/" className="portal-global-brand" title="กลับหน้าแรก">
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
        </header>
    );
}
