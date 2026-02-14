import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Bell, User, Sun, Moon, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TopNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Role-based navigation
    const getNavItems = () => {
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

        // Fallback for unauthenticated or unknown state
        return [];
    };

    const navItems = getNavItems();

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="top-nav">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button
                className="hamburger-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="top-nav-logo">
                <div className="logo-icon">
                    <img src="/logo.svg" alt="Farm ERP" style={{ width: '32px', height: '32px' }} />
                </div>
                <h1 className="logo-text">Farm ERP</h1>
            </div>

            {/* Navigation */}
            <nav className={`top-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`top-nav-item ${isActive ? 'active' : ''}`}
                            title={item.label}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span className="nav-text">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Right Actions */}
            <div className="top-nav-actions">
                <button
                    className="icon-btn theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={20} color="var(--color-text)" /> : <Sun size={20} color="var(--color-text)" />}
                </button>
                <button className="icon-btn">
                    <Bell size={20} color="var(--color-text)" />
                </button>
                <div className="user-profile-wrapper" ref={dropdownRef}>
                    <button
                        className="user-profile"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            transition: 'background-color 0.2s',
                            color: 'var(--color-text)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <User size={20} />
                        <span>{user?.name || '사용자'}</span>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div
                            className="user-dropdown"
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 0.5rem)',
                                right: 0,
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                minWidth: '200px',
                                zIndex: 1000,
                                animation: 'slideDown 0.2s ease-out'
                            }}
                        >
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderBottom: '1px solid var(--color-border)'
                                }}
                            >
                                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                                    {user?.name}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                    {user?.email}
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    color: 'var(--color-error)',
                                    fontSize: '0.9375rem',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={18} />
                                <span>로그아웃</span>
                            </button>

                            <style>{`
                                @keyframes slideDown {
                                    from {
                                        opacity: 0;
                                        transform: translateY(-10px);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0);
                                    }
                                }
                                
                                .user-profile-wrapper {
                                    position: relative;
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopNav;
