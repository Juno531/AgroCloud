import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const { isSidebarOpen, closeSidebar } = useLayout();
    const { user } = useAuth();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['/hr/employees']);

    const toggleMenu = (path: string) => {
        setExpandedMenus(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    const isItemActive = (item: any) => {
        const path = item.to;
        const isCurrentPath = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        const isChildActive = item.children?.some((child: any) => location.pathname === child.to || location.pathname.startsWith(child.to));

        return isCurrentPath || isChildActive ?
            'bg-primary/10 text-primary font-bold' :
            'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium';
    };

    const isSubActive = (path: string) => {
        return location.pathname === path ?
            'text-primary font-bold' :
            'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium';
    };


    const navItems = user?.role === 'SUPER_ADMIN'
        ? [
            { to: '/super-admin/companies', label: '회사 관리', icon: 'business' },
            { to: '/super-admin/users', label: '사용자 관리', icon: 'people' },
            { to: '/super-admin/settings', label: '시스템 설정', icon: 'settings_suggest' },
        ]
        : user?.role === 'USER'
            ? [
                { to: '/hr/my-attendance', label: '근태 현황', icon: 'schedule' },
                { to: '/hr/my-leave', label: '휴무 관리', icon: 'event_busy' },
                { to: '/attendance', label: '출퇴근', icon: 'event' },
                {
                    to: '/mypage/mysecurity',
                    label: '설정',
                    icon: 'settings',
                    children: [
                        { to: '/mypage/mysecurity', label: '내 정보 관리' }
                    ]
                },
            ]
            : [
                { to: '/', label: '대시보드', icon: 'dashboard' },
                {
                    to: '/farm/setting',
                    label: '농장',
                    icon: 'yard',
                    children: [
                        { to: '/farm/setting', label: '농장 설정' },
                        // { to: '/farm/cultivation', label: '재배 관리' }, // 일단 잠시 기능 보류
                    ]
                },
                {
                    to: '/hr/employees',
                    label: '인사',
                    icon: 'groups',
                    children: [
                        { to: '/hr/employees', label: '직원 관리' },
                        { to: '/hr/attendance-log', label: '출퇴근 기록' },
                        { to: '/hr/attendance-status', label: '근태 현황' },
                        { to: '/hr/attendance-management', label: '출퇴근 관리' },
                        { to: '/hr/attendance-settings', label: '출퇴근 설정' },
                    ]
                },
                {
                    to: '/hr/my-attendance',
                    label: '내 근태',
                    icon: 'person_pin_circle',
                    children: [
                        { to: '/attendance', label: '출퇴근' },
                        { to: '/hr/my-attendance', label: '내 근태 현황' },
                        { to: '/hr/my-leave', label: '내 휴무 관리' },
                    ]
                },
                {
                    to: '/mypage/mysecurity',
                    label: '설정',
                    icon: 'settings',
                    children: [
                        { to: '/mypage/mysecurity', label: '내 정보 관리' },
                    ]
                },
            ];



    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[var(--color-surface)] border-r border-primary/10 flex flex-col
                transition-transform duration-300 ease-in-out md:static md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons-round">filter_drama</span>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-xl tracking-tight leading-none text-slate-900 dark:text-white">Agro<span className="text-primary">Cloud</span></h1>
                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold mt-1">
                                {user?.role === 'SUPER_ADMIN' ? '슈퍼 어드민 패널' : '농장 관리 시스템'}
                            </p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus.includes(item.to);

                        return (
                            <div key={item.to} className="space-y-1">
                                {hasChildren ? (
                                    <div
                                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${isItemActive(item)}`}
                                    >
                                        <Link
                                            to={item.to}
                                            onClick={closeSidebar}
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <span className="material-icons-round">{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleMenu(item.to);
                                            }}
                                            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.to}
                                        onClick={closeSidebar}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isItemActive(item)}`}
                                    >
                                        <span className="material-icons-round">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                )}

                                {hasChildren && isExpanded && (
                                    <div className="ml-9 space-y-1 py-1">
                                        {item.children?.map((child) => (
                                            <Link
                                                key={child.to}
                                                to={child.to}
                                                onClick={closeSidebar}
                                                className={`block py-2 text-sm transition-colors ${isSubActive(child.to)}`}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

            </aside>
        </>
    );
};

export default Sidebar;
