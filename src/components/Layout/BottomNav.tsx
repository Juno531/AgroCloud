import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, Clock, Settings, Menu } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleSidebar } = useLayout();

    const navItems = [
        {
            id: 'menu',
            label: '메뉴',
            icon: Menu,
            action: toggleSidebar
        },
        {
            id: 'dashboard',
            label: '대시보드',
            icon: LayoutDashboard,
            path: '/'
        },
        {
            id: 'qr',
            label: 'QR 스캔',
            icon: QrCode,
            path: '/hr/scan',
            isSpecial: true
        },
        {
            id: 'attendance',
            label: '출퇴근',
            icon: Clock,
            path: '/hr/attendance-log'
        },
        {
            id: 'settings',
            label: '설정',
            icon: Settings,
            path: '/admin'
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-1">
                {navItems.map((item) => {
                    const isActive = item.path ? (
                        location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path) && item.id !== 'qr')
                    ) : false;

                    if (item.isSpecial) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => item.path && navigate(item.path)}
                                className="relative -top-5 flex flex-col items-center justify-center p-2"
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                                    ${isActive
                                        ? 'bg-primary text-white ring-4 ring-white dark:ring-zinc-900'
                                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-4 ring-white dark:ring-zinc-900'}
                                `}>
                                    <item.icon size={24} />
                                </div>
                                <span className="text-[10px] font-medium mt-1 text-slate-600 dark:text-slate-400">
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : (item.path && navigate(item.path))}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 rounded-lg transition-colors
                                ${isActive
                                    ? 'text-primary'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
                            `}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
