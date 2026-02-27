import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Settings, Menu } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleSidebar } = useLayout();
    const { user } = useAuth();

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
            id: 'attendance',
            label: '출퇴근',
            icon: Clock,
            path: '/attendance'
        },
        {
            id: 'settings',
            label: '설정',
            icon: Settings,
            path: '/mypage/mysecurity'
        },
    ].filter(item => {
        if (user?.role === 'USER') {
            return item.id !== 'dashboard';
        }
        return true;
    });

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16 px-1">
                {navItems.map((item) => {
                    const isActive = item.path ? (
                        location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path) && item.id !== 'qr')
                    ) : false;



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
