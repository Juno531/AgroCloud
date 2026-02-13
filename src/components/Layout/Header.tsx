import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <header className="app-header">
            <h2 className="header-title">농장 ERP 대시보드</h2>
            <div className="header-actions">
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

export default Header;
