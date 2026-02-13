import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Role-based navigation
    const getNavItems = () => {
        const { user } = useAuth();

        // ADMIN sees everything
        if (user?.role === 'ADMIN') {
            return [
                { path: '/', label: '대시보드' },
                { path: '/cultivation', label: '재배 관리' },
                { path: '/sales', label: '판매 관리' },
                { path: '/farm', label: '농장 관리' },
                { path: '/hr', label: '인사 관리' },
                { path: '/admin', label: '설정' }
            ];
        }

        // USER (Worker) sees only Attendance
        if (user?.role === 'USER') {
            return [
                { path: '/attendance', label: '출퇴근' }
            ];
        }

        // Fallback for unauthenticated or unknown state (though PrivateRoute handles this)
        return [];
    };

    const navItems = getNavItems();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <img src="/plant-logo.svg" alt="Farm ERP" style={{ width: '28px', height: '28px' }} />
                </div>
                <h1 className="logo-text">Farm ERP</h1>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={item.label}
                        >
                            <span className="nav-text">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div style={{ marginTop: 'auto', padding: '1rem' }}>
                <button
                    onClick={handleLogout}
                    className="nav-item"
                    style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem'
                    }}
                >
                    <LogOut size={20} />
                    <span className="nav-text">로그아웃</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
