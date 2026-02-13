import React, { useState, useEffect, useRef } from 'react';
import Modal from '../UI/Modal';
import { Search, X, Loader } from 'lucide-react';
import api from '../../services/api';

interface NutrientRecordData {
    id?: number;
    bedId: string;
    bedName: string;
    plantingId?: number;
    cropId?: number;
    recordDate: string;
    supplyEc: number;
    supplyPh: number;
    supplyAmount: number;
    drainEc: number;
    drainPh: number;
    drainAmount: number;
    notes: string;
}

interface Bed {
    id: string;
    name: string;
    zoneName: string;
    bedNumber: number;
}

interface Crop {
    id: number;
    name: string;
}

interface NutrientRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NutrientRecordData) => void;
    farmId: number | null;
    crops: Crop[];
    plantings: { id: number; bedId: number; cropName: string; bedName?: string }[];
    initialData?: NutrientRecordData | null;
}

const NutrientRecordModal: React.FC<NutrientRecordModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    farmId,
    crops,
    plantings,
    initialData
}) => {
    const [formData, setFormData] = useState<NutrientRecordData>({
        bedId: '',
        bedName: '',
        plantingId: undefined,
        cropId: undefined,
        recordDate: new Date().toISOString().split('T')[0],
        supplyEc: 0,
        supplyPh: 0,
        supplyAmount: 0,
        drainEc: 0,
        drainPh: 0,
        drainAmount: 0,
        notes: ''
    });

    // Internal beds state - loaded when modal opens
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loadingBeds, setLoadingBeds] = useState(false);

    // Bed search state
    const [bedSearchQuery, setBedSearchQuery] = useState('');
    const [showBedSuggestions, setShowBedSuggestions] = useState(false);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const bedSearchRef = useRef<HTMLDivElement>(null);

    // Fetch beds when modal opens
    useEffect(() => {
        if (isOpen && farmId) {
            fetchBeds();
        }
    }, [isOpen, farmId]);

    const fetchBeds = async () => {
        if (!farmId) return;
        setLoadingBeds(true);
        try {
            const response = await api.get(`/layout/houses/${farmId}`);
            if (response.data.data && response.data.data.layoutData) {
                const layoutData = JSON.parse(response.data.data.layoutData);
                const bedsFromLayout: Bed[] = [];
                (layoutData.zones || []).forEach((zone: any) => {
                    for (let i = 0; i < zone.bedCount; i++) {
                        bedsFromLayout.push({
                            id: `${zone.id}-${i}`,
                            zoneId: zone.id,
                            zoneName: zone.name,
                            bedNumber: i + 1,
                            name: `${zone.name} B-${i + 1}`
                        } as Bed);
                    }
                });
                setBeds(bedsFromLayout);
            } else {
                setBeds([]);
            }
        } catch (error) {
            console.error('Error fetching beds:', error);
            setBeds([]);
        } finally {
            setLoadingBeds(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            if (initialData.bedName) {
                setBedSearchQuery(initialData.bedName);
                const bed = beds.find(b => b.name === initialData.bedName);
                setSelectedBed(bed || null);
            }
        } else {
            setFormData({
                bedId: '',
                bedName: '',
                plantingId: undefined,
                cropId: undefined,
                recordDate: new Date().toISOString().split('T')[0],
                supplyEc: 0,
                supplyPh: 0,
                supplyAmount: 0,
                drainEc: 0,
                drainPh: 0,
                drainAmount: 0,
                notes: ''
            });
            setBedSearchQuery('');
            setSelectedBed(null);
        }
    }, [initialData, beds, isOpen]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bedSearchRef.current && !bedSearchRef.current.contains(event.target as Node)) {
                setShowBedSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBed) {
            alert('베드를 선택해주세요.');
            return;
        }
        onSubmit({
            ...formData,
            bedId: selectedBed.id,
            bedName: selectedBed.name
        });
    };

    // Filter beds based on search query (prioritize bed number)
    const filteredBeds = beds.filter(bed => {
        const query = bedSearchQuery.trim().toLowerCase();
        if (!query) return true; // Show all beds if no query

        // Extract just the number from query (e.g., "1", "01", "B-1", "b1" -> 1)
        const numMatch = query.match(/\d+/);
        const queryNum = numMatch ? parseInt(numMatch[0]) : null;

        // Match by bed number first
        if (queryNum !== null && bed.bedNumber === queryNum) {
            return true;
        }

        // Also allow searching by full name or zone
        return (
            bed.name.toLowerCase().includes(query) ||
            bed.bedNumber.toString() === query ||
            `b-${bed.bedNumber}`.toLowerCase() === query ||
            `b${bed.bedNumber}`.toLowerCase() === query
        );
    });

    const handleBedSelect = (bed: Bed) => {
        setSelectedBed(bed);
        setBedSearchQuery(bed.name);
        setFormData({ ...formData, bedId: bed.id, bedName: bed.name });
        setShowBedSuggestions(false);
    };

    const clearBedSelection = () => {
        setSelectedBed(null);
        setBedSearchQuery('');
        setFormData({ ...formData, bedId: '', bedName: '' });
    };

    // Find planting for selected bed
    const bedPlanting = selectedBed
        ? plantings.find(p => p.bedName === selectedBed.name)
        : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? '양액 기록 수정' : '양액 기록 추가'}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Bed Selection with Search */}
                    <div style={{ gridColumn: 'span 2' }} ref={bedSearchRef}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            베드 <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--color-surface)'
                            }}>
                                {loadingBeds ? (
                                    <Loader size={16} style={{ marginLeft: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Search size={16} style={{ marginLeft: '0.5rem', color: 'var(--color-text-secondary)' }} />
                                )}
                                <input
                                    type="text"
                                    placeholder={loadingBeds ? "베드 로딩 중..." : "베드 번호 입력 (예: 1, B-1)"}
                                    value={bedSearchQuery}
                                    onChange={(e) => {
                                        setBedSearchQuery(e.target.value);
                                        setShowBedSuggestions(true);
                                        if (selectedBed && e.target.value !== selectedBed.name) {
                                            setSelectedBed(null);
                                        }
                                    }}
                                    onFocus={() => setShowBedSuggestions(true)}
                                    disabled={loadingBeds}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: 'none',
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                        color: 'var(--color-text)'
                                    }}
                                />
                                {selectedBed && (
                                    <button
                                        type="button"
                                        onClick={clearBedSelection}
                                        style={{
                                            padding: '0.25rem',
                                            marginRight: '0.5rem',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-secondary)'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {showBedSuggestions && !loadingBeds && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    zIndex: 1000,
                                    boxShadow: 'var(--shadow-md)'
                                }}>
                                    {beds.length === 0 ? (
                                        <div style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                            베드 레이아웃이 없습니다. 베드 관리 탭에서 먼저 설정해주세요.
                                        </div>
                                    ) : filteredBeds.length > 0 ? (
                                        filteredBeds.map(bed => (
                                            <div
                                                key={bed.id}
                                                onClick={() => handleBedSelect(bed)}
                                                style={{
                                                    padding: '0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--color-border)',
                                                    backgroundColor: selectedBed?.id === bed.id ? 'var(--color-primary-light)' : 'transparent',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedBed?.id === bed.id ? 'var(--color-primary-light)' : 'transparent'}
                                            >
                                                <div style={{ fontWeight: 500 }}>{bed.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                                    {bed.zoneName} · B-{bed.bedNumber}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                            검색 결과가 없습니다
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedBed && (
                            <div style={{
                                marginTop: '0.5rem',
                                padding: '0.5rem',
                                backgroundColor: 'var(--color-success-bg, #dcfce7)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                color: 'var(--color-success-text, #166534)'
                            }}>
                                ✓ 선택됨: {selectedBed.name} ({selectedBed.zoneName})
                            </div>
                        )}
                    </div>

                    {/* Crop Selection */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            품종
                        </label>
                        {bedPlanting ? (
                            <div style={{
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--color-background)'
                            }}>
                                <span style={{ fontWeight: 500 }}>{bedPlanting.cropName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                                    (정식된 품종)
                                </span>
                            </div>
                        ) : (
                            <select
                                value={formData.cropId || ''}
                                onChange={(e) => setFormData({ ...formData, cropId: e.target.value ? Number(e.target.value) : undefined })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            >
                                <option value="">품종 선택</option>
                                {crops.map(crop => (
                                    <option key={crop.id} value={crop.id}>{crop.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Record Date */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            기록 날짜 <span style={{ color: 'var(--color-danger)' }}>*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.recordDate}
                            onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Supply EC */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            급액EC
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.supplyEc}
                            onChange={(e) => setFormData({ ...formData, supplyEc: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Drain EC */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            배액EC
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.drainEc}
                            onChange={(e) => setFormData({ ...formData, drainEc: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Supply pH */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            급액pH
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.supplyPh}
                            onChange={(e) => setFormData({ ...formData, supplyPh: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Drain pH */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            배액pH
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.drainPh}
                            onChange={(e) => setFormData({ ...formData, drainPh: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Supply Amount */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            급액량 (mL)
                        </label>
                        <input
                            type="number"
                            value={formData.supplyAmount}
                            onChange={(e) => setFormData({ ...formData, supplyAmount: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Drain Amount */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            배액량 (mL)
                        </label>
                        <input
                            type="number"
                            value={formData.drainAmount}
                            onChange={(e) => setFormData({ ...formData, drainAmount: Number(e.target.value) })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>

                    {/* Notes */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>
                            비고
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={onClose}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!selectedBed}>
                        {initialData ? '수정' : '추가'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default NutrientRecordModal;
