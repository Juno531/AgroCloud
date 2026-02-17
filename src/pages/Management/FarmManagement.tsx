import React, { useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { useFarm } from '../../context/FarmContext';
import { useLayout } from '../../context/LayoutContext';
import { useEffect } from 'react';


const FarmManagement: React.FC = () => {
    const { fields, addField, removeField } = useFarm();
    const { setTitle } = useLayout();

    useEffect(() => {
        setTitle('농장 관리');
    }, [setTitle]);
    const [newFarm, setNewFarm] = useState({ name: '', location: '', area: '' });
    const [isAdding, setIsAdding] = useState(false);

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    }>({ title: '', message: '', onConfirm: async () => { } });

    const handleAddClick = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmConfig({
            title: '농장 추가',
            message: `${newFarm.name} 농장을 추가하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await addField({
                        name: newFarm.name,
                        size: newFarm.area, // area input value (string) -> size (string) for addField
                        location: newFarm.location
                    });
                    setNewFarm({ name: '', location: '', area: '' });
                    setIsAdding(false);
                } catch (error) {
                    console.error('Error creating farm:', error);
                    alert('농장 생성 실패');
                }
            }
        });
        setConfirmOpen(true);
    };

    const handleRemoveClick = (id: number, name: string) => {
        setConfirmConfig({
            title: '농장 삭제',
            message: `${name} 농장을 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await removeField(id);
                } catch (error) {
                    console.error('Error deleting farm:', error);
                    alert('농장 삭제 실패');
                }
            }
        });
        setConfirmOpen(true);
    };

    const sectionStyle: React.CSSProperties = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-xl)'
    };

    return (
        <div className="farm-management-page responsive-padding" style={{ paddingTop: 'var(--spacing-lg)' }}>

            <div style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>농장 목록</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAdding(!isAdding)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={16} />
                        {isAdding ? '취소' : '농장 추가'}
                    </button>
                </div>

                {isAdding && (
                    <form onSubmit={handleAddClick} style={{
                        backgroundColor: 'var(--color-background)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        border: '2px solid var(--color-primary)'
                    }}>
                        <div className="farm-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>농장명</label>
                                <input
                                    type="text"
                                    value={newFarm.name}
                                    onChange={e => setNewFarm({ ...newFarm, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                                    placeholder="예: 행복농장"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>위치</label>
                                <input
                                    type="text"
                                    value={newFarm.location}
                                    onChange={e => setNewFarm({ ...newFarm, location: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                                    placeholder="예: 경기도 화성시"
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>면적 (m²)</label>
                            <input
                                type="number"
                                value={newFarm.area}
                                onChange={e => setNewFarm({ ...newFarm, area: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                                placeholder="예: 1000"
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">추가</button>
                        </div>
                    </form>
                )}

                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {fields.map(farm => (
                        <div
                            key={farm.id}
                            style={{
                                backgroundColor: 'var(--color-background)',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            <div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{farm.name}</h4>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                    {farm.location && <span>📍 {farm.location}</span>}
                                    {farm.area && <span>📐 {farm.area} m²</span>}
                                </div>
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={() => handleRemoveClick(farm.id, farm.name)}
                                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                            >
                                <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                                삭제
                            </button>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                            <p>등록된 농장이 없습니다</p>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>상단의 "농장 추가" 버튼을 클릭하여 농장을 등록하세요</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
            />
            <style>{`
                @media (max-width: 767px) {
                    .farm-form-grid {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .btn {
                        min-height: var(--min-touch-target);
                    }
                }
            `}</style>
        </div>
    );
};

export default FarmManagement;
