import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Grid3x3 } from 'lucide-react';
import api from '../../services/api';

const BedLayoutEditor = ({ farmId, farmName }) => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (farmId) {
            // Clear zones immediately when farm changes
            setZones([]);
            loadLayout();
        }
    }, [farmId]);

    const loadLayout = async () => {
        try {
            console.log('Loading layout for farm:', farmId);
            const response = await api.get(`/layout/houses/${farmId}`);
            console.log('Load response:', response.data);

            if (response.data.data && response.data.data.layoutData) {
                const layoutData = JSON.parse(response.data.data.layoutData);
                console.log('Loaded zones:', layoutData.zones);
                setZones(layoutData.zones || []);
            } else {
                // No layout found, start fresh
                console.log('No layout found for this farm');
                setZones([]);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('No existing layout (404), starting fresh');
            } else {
                console.error('Error loading layout:', error);
            }
            // Always set to empty array when no layout exists
            setZones([]);
        }
    };

    const saveLayout = async () => {
        setLoading(true);
        try {
            const layoutData = JSON.stringify({ zones });
            console.log('Saving layout for farm:', farmId, 'Data:', layoutData);

            const response = await api.post(`/layout/houses/${farmId}`, {
                farmId: farmId,
                layoutData
            });

            console.log('Save response:', response.data);
            alert('✅ 레이아웃이 저장되었습니다!');

            // Reload to confirm save
            await loadLayout();
        } catch (error) {
            console.error('Failed to save layout:', error);
            if (error.response) {
                // Backend responded with error
                alert(`❌ 저장 실패: ${error.response.data.message || '백엔드 오류'}`);
            } else if (error.request) {
                // No response from backend
                alert('❌ 저장 실패: 백엔드 서버가 응답하지 않습니다. 서버가 실행 중인지 확인하세요.');
            } else {
                alert(`❌ 저장 실패: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const addZone = () => {
        const newZone = {
            id: Date.now().toString(),
            name: `구역 ${zones.length + 1}`,
            bedCount: 5
        };
        setZones([...zones, newZone]);
    };

    const removeZone = (zoneId) => {
        setZones(zones.filter(z => z.id !== zoneId));
    };

    const updateZoneName = (zoneId, name) => {
        setZones(zones.map(z => z.id === zoneId ? { ...z, name } : z));
    };

    const updateBedCount = (zoneId, count) => {
        const bedCount = Math.max(1, Math.min(100, parseInt(count) || 1));
        setZones(zones.map(z => z.id === zoneId ? { ...z, bedCount } : z));
    };

    const totalZones = zones.length;
    const totalBeds = zones.reduce((sum, zone) => sum + zone.bedCount, 0);

    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                padding: 'var(--spacing-lg)',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-md)'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            <Grid3x3 size={24} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            베드 레이아웃 에디터
                        </h3>
                        <p style={{ fontSize: '1rem', opacity: 0.9 }}>{farmName}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn"
                            onClick={addZone}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <Plus size={16} />
                            구역 추가
                        </button>
                        <button
                            className="btn"
                            onClick={saveLayout}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'white',
                                color: 'var(--color-primary)',
                                fontWeight: 600
                            }}
                        >
                            <Save size={16} />
                            {loading ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-xl)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>농장</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{farmName}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>구역 수</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalZones}개</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>총 베드 수</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalBeds}개</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: 'var(--spacing-xl)' }}>
                {zones.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--spacing-xxl)',
                        color: 'var(--color-text-secondary)',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px dashed var(--color-border)'
                    }}>
                        <Grid3x3 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>구역이 없습니다</p>
                        <p style={{ fontSize: '0.875rem' }}>"구역 추가" 버튼을 클릭하여 베드 레이아웃을 설정하세요</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {zones.map((zone, zoneIndex) => (
                            <div
                                key={zone.id}
                                style={{
                                    backgroundColor: 'var(--color-background)',
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--color-border)',
                                    boxShadow: 'var(--shadow-sm)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* Zone Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-md)',
                                    paddingBottom: 'var(--spacing-md)',
                                    borderBottom: '1px solid var(--color-border)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                        <input
                                            type="text"
                                            value={zone.name}
                                            onChange={(e) => updateZoneName(zone.id, e.target.value)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '2px solid var(--color-border)',
                                                fontSize: '1.125rem',
                                                fontWeight: 600,
                                                width: '200px',
                                                backgroundColor: 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                                transition: 'border-color 0.2s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                                        />
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            fontSize: '1rem'
                                        }}>
                                            <span style={{ fontWeight: 500 }}>베드 수:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={zone.bedCount}
                                                onChange={(e) => updateBedCount(zone.id, e.target.value)}
                                                style={{
                                                    padding: '0.75rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '2px solid var(--color-border)',
                                                    width: '100px',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    backgroundColor: 'var(--color-surface)',
                                                    color: 'var(--color-text)'
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <button
                                        className="btn"
                                        onClick={() => removeZone(zone.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--color-danger)',
                                            border: '2px solid var(--color-danger)',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        삭제
                                    </button>
                                </div>

                                {/* Bed Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(auto-fill, minmax(70px, 1fr))`,
                                    gap: '8px',
                                    marginTop: 'var(--spacing-md)'
                                }}>
                                    {Array.from({ length: zone.bedCount }).map((_, bedIndex) => (
                                        <div
                                            key={bedIndex}
                                            style={{
                                                backgroundColor: '#4ade80',
                                                border: '2px solid #22c55e',
                                                borderRadius: '6px',
                                                padding: '12px 8px',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                color: '#15803d',
                                                minHeight: '60px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                                e.currentTarget.style.borderColor = '#2563eb';
                                                e.currentTarget.style.color = '#1e40af';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                                e.currentTarget.style.backgroundColor = '#4ade80';
                                                e.currentTarget.style.borderColor = '#22c55e';
                                                e.currentTarget.style.color = '#15803d';
                                            }}
                                        >
                                            <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>B-{bedIndex + 1}</div>
                                            <div style={{ fontSize: '1.1rem' }}>●</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BedLayoutEditor;
