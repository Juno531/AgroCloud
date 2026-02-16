import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';

const Sidebar = () => {
    const location = useLocation();
    const { isSidebarOpen, closeSidebar } = useLayout();

    const isActive = (path: string) => {
        return location.pathname === path ?
            'bg-primary/10 text-primary font-bold' :
            'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium';
    };

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
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-primary/10 flex flex-col
                transition-transform duration-300 ease-in-out md:static md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons-round">filter_drama</span>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-xl tracking-tight leading-none text-slate-800 dark:text-white">Agro<span className="text-primary">Cloud</span></h1>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">농장 관리 시스템</p>
                        </div>
                    </div>
                    <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <Link to="/" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/')}`}>
                        <span className="material-icons-round">dashboard</span>
                        <span>대시보드</span>
                    </Link>
                    <Link to="/hr" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/hr')}`}>
                        <span className="material-icons-round">groups</span>
                        <span>인사 관리</span>
                    </Link>
                    <Link to="/admin" onClick={closeSidebar} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
                        <span className="material-icons-round">settings</span>
                        <span>설정</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-primary/10">
                    <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border-2 border-primary/20 flex-shrink-0">
                            <img
                                alt="User"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzKn-oFNz5vHafhSVkzHtYeSeM1VTczbPdaEJaK0bk43he5zx32lxafy8vv9nrhQq7z6WIBPGm6nm5XVKmZ2_ZKLgCGEuTSghrGxfgeup29172jdK_SEl_FqLdXo2lN_dteU1-tuusmPyrO5TDGdNT4XqWw14YOhvHf3fY7T_6zdkoJ-xtRzQHstQtcP1i0uw0Ik4LmnSSIDlNpksMw4zJfw-G3uSplkySeAVC30ryt-Y4SjzZqmO_91VwhqsHqcHup6g0TUFaqK4"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">Johnathan Doe</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase truncate">농장 관리자</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
