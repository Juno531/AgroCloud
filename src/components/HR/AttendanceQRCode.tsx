import React from 'react';
import QRCode from 'react-qr-code';
import { Settings } from 'lucide-react';

const AttendanceQRCode = () => {
    const sectionStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-primary)',
        fontSize: '1.25rem',
        fontWeight: 600
    };

    return (
        <div style={sectionStyle}>
            <div style={headerStyle}>
                <Settings size={24} />
                <h3>출퇴근 QR 코드</h3>
            </div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                직원들의 출퇴근을 위한 QR 코드입니다. 이 코드를 인쇄하여 작업장에 비치하세요.
            </p>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
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
    );
};

export default AttendanceQRCode;
