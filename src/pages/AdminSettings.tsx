import React, { useState, useEffect, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { Plus, Trash2, Settings, Info } from 'lucide-react';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import QRCode from 'react-qr-code';

const AdminSettings = () => {
    const { crops, addCrop, removeCrop } = useFarm();
    const [newCrop, setNewCrop] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger' as 'danger' | 'info' | 'warning'
    });

    const handleAddCrop = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCrop) {
            setConfirmDialog({
                isOpen: true,
                title: '품종 추가',
                message: `"${newCrop}" 품종을 추가하시겠습니까?`,
                variant: 'info',
                onConfirm: () => {
                    addCrop({ name: newCrop });
                    setNewCrop('');
                }
            });
        }
    };

    const handleRemoveCrop = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            title: '품종 삭제',
            message: `"${name}" 품종을 삭제하시겠습니까?`,
            variant: 'danger',
            onConfirm: () => {
                removeCrop(id);
            }
        });
    };

    const sectionStyle = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-primary)',
        fontSize: '1.25rem',
        fontWeight: 600
    };

    const listStyle = {
        listStyle: 'none',
        padding: 0,
        marginTop: '1rem'
    };

    const listItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-background)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '0.5rem'
    };

    return (
        <div style={{ padding: 'var(--spacing-lg)', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={28} />
                    설정
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>시스템 기본 설정을 관리합니다</p>
            </div>

            {/* Info Box */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #3b82f6',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                gap: '1rem'
            }}>
                <Info size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>품종 관리</p>
                    <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                        여기서 품종을 수동으로 등록하거나 삭제할 수 있습니다. 또한 정식 추가 시 품종명을 입력하면 자동으로 품종이 생성됩니다.
                    </p>
                </div>
            </div>

            {/* Farm Invite Code Section */}
            <div style={{
                ...sectionStyle,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '2px solid var(--color-primary)'
            }}>
                <div style={headerStyle}>
                    <Settings size={24} />
                    <h3>농장 초대 코드</h3>
                </div>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                    작업자가 회원가입할 때 아래 코드를 입력하면 이 농장에 소속됩니다.
                </p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        letterSpacing: '0.25em',
                        color: 'var(--color-primary)',
                        fontFamily: 'monospace'
                    }}>
                        FARM123
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('FARM123');
                            alert('초대 코드가 복사되었습니다!');
                        }}
                        className="btn btn-outline"
                        style={{ marginLeft: 'auto' }}
                    >
                        복사
                    </button>
                </div>
                <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '1rem',
                    textAlign: 'center'
                }}>
                    이 코드를 작업자에게 공유하세요. 작업자는 이 코드로 회원가입하여 출퇴근을 기록할 수 있습니다.
                </p>
            </div>

            {/* Crops Management */}
            <div style={sectionStyle}>
                <div style={headerStyle}>
                    <Settings size={24} />
                    <h3>품종 등록</h3>
                </div>

                {/* Add Crop Form */}
                <form onSubmit={handleAddCrop} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>품종명</label>
                            <input
                                type="text"
                                value={newCrop}
                                onChange={(e) => setNewCrop(e.target.value)}
                                placeholder="예: 설향, 킹스베리 등"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '1rem',
                                    backgroundColor: 'var(--color-background)'
                                }}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem' }}
                        >
                            <Plus size={16} style={{ marginRight: '0.5rem' }} />
                            추가
                        </button>
                    </div>
                </form>

                {/* Crop List */}
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>등록된 품종 목록</h4>
                    <ul style={listStyle}>
                        {crops.map(crop => (
                            <li key={crop.id} style={listItemStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🌱</span>
                                    <strong style={{ fontSize: '1.125rem' }}>{crop.name}</strong>
                                </div>
                                <button
                                    onClick={() => handleRemoveCrop(crop.id, crop.name)}
                                    className="btn btn-outline"
                                    style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                >
                                    <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                                    삭제
                                </button>
                            </li>
                        ))}
                        {crops.length === 0 && (
                            <li style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                                <p>등록된 품종이 없습니다</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>위 양식을 사용하여 새 품종을 등록하거나 정식 관리 페이지에서 정식을 추가하세요</p>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Confirm Dialog */}
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    variant={confirmDialog.variant}
                />
            </div>

            {/* QR Codes Section */}
            <div style={sectionStyle}>
                <div style={headerStyle}>
                    <Settings size={24} />
                    <h3>출퇴근 QR 코드</h3>
                </div>
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                    직원들의 출퇴근을 위한 QR 코드입니다. 이 코드를 인쇄하여 작업장에 비치하세요.
                </p>

                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {/* Clock In QR */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>출근하기 (Clock In)</h4>
                        <div style={{ padding: '1rem', background: 'white' }}>
                            <QRCode
                                value={JSON.stringify({ type: 'CLOCK_IN', farmId: 1, timestamp: Date.now() })}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>스캔 시 즉시 출근 처리됩니다</p>
                    </div>

                    {/* Clock Out QR */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>퇴근하기 (Clock Out)</h4>
                        <div style={{ padding: '1rem', background: 'white' }}>
                            <QRCode
                                value={JSON.stringify({ type: 'CLOCK_OUT', farmId: 1, timestamp: Date.now() })}
                                size={200}
                                level="H"
                            />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>스캔 시 즉시 퇴근 처리됩니다</p>
                    </div>
                </div>
            </div>

            {/* Attendance Records Section */}
            <AttendanceRecordsSection />
        </div>
    );
};

// Attendance Records Section Component
const AttendanceRecordsSection = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');

    const sectionStyle = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-primary)',
        fontSize: '1.25rem',
        fontWeight: 600
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/attendance/farm/1', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const filteredRecords = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return records.filter(record => {
            const recordDate = new Date(record.timestamp);

            switch (filter) {
                case 'today':
                    return recordDate >= today;
                case 'week': {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return recordDate >= weekAgo;
                }
                case 'month': {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return recordDate >= monthAgo;
                }
                default:
                    return true;
            }
        });
    }, [records, filter]);

    return (
        <div style={sectionStyle}>
            <div style={headerStyle}>
                <Settings size={24} />
                <h3>출퇴근 기록</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setFilter('today')}
                        className={`btn ${filter === 'today' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        오늘
                    </button>
                    <button
                        onClick={() => setFilter('week')}
                        className={`btn ${filter === 'week' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        최근 7일
                    </button>
                    <button
                        onClick={() => setFilter('month')}
                        className={`btn ${filter === 'month' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        최근 30일
                    </button>
                </div>
                <button
                    onClick={fetchRecords}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                    새로고침
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    로딩 중...
                </div>
            ) : filteredRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    선택한 기간에 출퇴근 기록이 없습니다.
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>작업자명</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>구분</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>날짜</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record: any) => {
                                const date = new Date(record.timestamp);
                                return (
                                    <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{record.userName}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                backgroundColor: record.type === 'CLOCK_IN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: record.type === 'CLOCK_IN' ? '#10b981' : '#ef4444'
                                            }}>
                                                {record.type === 'CLOCK_IN' ? '출근' : '퇴근'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{date.toLocaleDateString()}</td>
                                        <td style={{ padding: '0.75rem' }}>{date.toLocaleTimeString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
