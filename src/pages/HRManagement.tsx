import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Activity } from 'lucide-react';
import EmployeeList from '../components/HR/EmployeeList';
import AttendanceHistory from '../components/HR/AttendanceHistory';
import DailyWorkStatus from '../components/HR/DailyWorkStatus';

const HRManagement = () => {
    const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'daily'>('employees');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { id: 'employees' as const, label: '작업자 관리', icon: Users },
        { id: 'attendance' as const, label: '출퇴근 기록', icon: ClipboardList },
        { id: 'daily' as const, label: '일일 현황', icon: Activity }
    ];

    return (
        <div style={{ padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-lg)', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-xl)' }}>
                <h2 style={{
                    fontSize: isMobile ? '1.375rem' : '1.75rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Users size={isMobile ? 24 : 28} />
                    인사 관리
                </h2>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    display: isMobile ? 'none' : 'block'
                }}>
                    작업자 정보, 출퇴근 기록, 일일 근무 현황을 관리합니다
                </p>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: isMobile ? '0' : '0.5rem',
                borderBottom: '2px solid var(--color-border)',
                marginBottom: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-xl)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: isMobile ? '0.25rem' : '0.5rem',
                                padding: isMobile ? '0.75rem 1rem' : '0.75rem 1.5rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: isMobile ? '0.875rem' : '1rem',
                                cursor: 'pointer',
                                borderBottom: isActive ? '2px solid var(--color-primary)' : 'none',
                                marginBottom: '-2px',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                flex: isMobile ? '1' : 'none',
                                minWidth: isMobile ? 'auto' : 'fit-content'
                            }}
                        >
                            <Icon size={isMobile ? 18 : 20} />
                            <span style={{ display: isMobile ? 'none' : 'inline' }}>{tab.label}</span>
                            <span style={{ display: isMobile ? 'inline' : 'none' }}>
                                {tab.id === 'employees' ? '작업자' : tab.id === 'attendance' ? '출퇴근' : '현황'}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'employees' && <EmployeeList />}
                {activeTab === 'attendance' && <AttendanceHistory />}
                {activeTab === 'daily' && <DailyWorkStatus />}
            </div>
        </div>
    );
};

export default HRManagement;
