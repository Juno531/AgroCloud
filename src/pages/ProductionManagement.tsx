import React, { useState, useEffect } from 'react';
import { ProductionService } from '../services/api';
import { useFarm } from '../context/FarmContext';
import { Layers, Plus, Home, AlignJustify } from 'lucide-react';
import Modal from '../components/UI/Modal';
import BedLayoutEditor from '../components/BedLayout/BedLayoutEditor';
import CropSelector from '../components/Cultivation/CropSelector';

const ProductionManagement = () => {
    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [selectedLine, setSelectedLine] = useState(null);

    // State for each domain
    const [houses, setHouses] = useState([]);
    const [lines, setLines] = useState([]);
    const [beds, setBeds] = useState([]);
    const [plantings, setPlantings] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // 'house', 'line', 'bed', 'planting'
    const [loading, setLoading] = useState(false);

    // Form States
    const [newHouse, setNewHouse] = useState({ name: '', farmId: '', width: '', length: '', houseType: '', description: '' });
    const [newLine, setNewLine] = useState({ houseId: '', name: '', lineNumber: '', bedCount: '', lengthMeters: '', description: '' });
    const [newBed, setNewBed] = useState({ lineId: '', name: '', bedNumber: '', lengthMeters: '', plantCapacity: '', description: '' });
    const [newPlanting, setNewPlanting] = useState({ bedId: '', cropId: '', cropName: '', plantingDate: '', plantCount: '', notes: '' });

    useEffect(() => {
        if (fields.length > 0 && !selectedFarm) {
            setSelectedFarm(fields[0].id);
        }
    }, [fields, selectedFarm]);

    useEffect(() => {
        if (selectedFarm) {
            fetchHouses();
        }
    }, [selectedFarm]);

    useEffect(() => {
        if (selectedHouse) {
            fetchLines();
            fetchBeds();
        }
    }, [selectedHouse]);

    useEffect(() => {
        if (selectedLine) {
            fetchBedsByLine();
        }
    }, [selectedLine]);

    const fetchHouses = async () => {
        setLoading(true);
        try {
            const response = await ProductionService.getHouses(selectedFarm);
            if (response.data.success) {
                setHouses(response.data.data);
                if (response.data.data.length > 0 && !selectedHouse) {
                    setSelectedHouse(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching houses:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLines = async () => {
        try {
            const response = await ProductionService.getLines(selectedHouse);
            if (response.data.success) {
                setLines(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching lines:", error);
        }
    };

    const fetchBeds = async () => {
        try {
            const response = await ProductionService.getBeds(selectedHouse);
            if (response.data.success) {
                setBeds(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching beds:", error);
        }
    };

    const fetchBedsByLine = async () => {
        try {
            const response = await ProductionService.getBedsByLine(selectedLine);
            if (response.data.success) {
                setBeds(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching beds by line:", error);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleAddHouse = async (e) => {
        e.preventDefault();
        try {
            await ProductionService.createHouse({ ...newHouse, farmId: selectedFarm });
            setIsModalOpen(false);
            fetchHouses();
            setNewHouse({ name: '', farmId: '', width: '', length: '', houseType: '', description: '' });
        } catch (error) {
            console.error("Error creating house:", error);
            alert(`하우스 생성 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddLine = async (e) => {
        e.preventDefault();
        try {
            await ProductionService.createLine({ ...newLine, houseId: selectedHouse });
            setIsModalOpen(false);
            fetchLines();
            setNewLine({ houseId: '', name: '', lineNumber: '', bedCount: '', lengthMeters: '', description: '' });
        } catch (error) {
            console.error("Error creating line:", error);
            alert(`라인 생성 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await ProductionService.createBed({ ...newBed, lineId: selectedLine });
            setIsModalOpen(false);
            fetchBeds();
            setNewBed({ lineId: '', name: '', bedNumber: '', lengthMeters: '', plantCapacity: '', description: '' });
        } catch (error) {
            console.error("Error creating bed:", error);
            alert(`베드 생성 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddPlanting = async (e) => {
        e.preventDefault();
        try {
            // Auto-create crop if it doesn't exist
            let cropId = newPlanting.cropId;
            if (!cropId && newPlanting.cropName) {
                const cropResponse = await ProductionService.createCrop({ name: newPlanting.cropName });
                if (cropResponse.data.success) {
                    cropId = cropResponse.data.data.id;
                }
            }

            await ProductionService.createPlanting({
                bedId: newPlanting.bedId,
                cropId: cropId,
                plantingDate: newPlanting.plantingDate,
                plantCount: newPlanting.plantCount,
                notes: newPlanting.notes
            });
            setIsModalOpen(false);
            setNewPlanting({ bedId: '', cropId: '', cropName: '', plantingDate: '', plantCount: '', notes: '' });
        } catch (error) {
            console.error("Error creating planting:", error);
            alert(`정식 생성 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-md)'
    };

    return (
        <div className="production-page" style={{ padding: 'var(--spacing-lg)' }}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>베드 관리</h2>
            </div>

            {/* Hierarchical Selection */}
            <div style={{ ...sectionStyle, display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>농장</label>
                    <select
                        value={selectedFarm || ''}
                        onChange={(e) => setSelectedFarm(Number(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                    >
                        {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>하우스</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={selectedHouse || ''}
                            onChange={(e) => setSelectedHouse(Number(e.target.value))}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem', flex: 1 }}
                        >
                            <option value="">하우스 선택</option>
                            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <button
                            className="btn btn-outline"
                            onClick={() => openModal('house')}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>라인</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={selectedLine || ''}
                            onChange={(e) => setSelectedLine(Number(e.target.value))}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem', flex: 1 }}
                            disabled={!selectedHouse}
                        >
                            <option value="">라인 선택 (전체)</option>
                            {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <button
                            className="btn btn-outline"
                            onClick={() => openModal('line')}
                            style={{ padding: '0.5rem 1rem' }}
                            disabled={!selectedHouse}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bed Layout Editor */}
            {selectedFarm && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <BedLayoutEditor farmId={selectedFarm} farmName={fields.find(f => f.id === selectedFarm)?.name || ''} />
                </div>
            )}

            {/* Beds List */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3>베드 목록</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => openModal('bed')}
                        disabled={!selectedLine}
                    >
                        <Plus size={16} style={{ marginRight: '0.5rem' }} />
                        베드 추가
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>베드명</th>
                            <th style={{ padding: '0.75rem' }}>라인</th>
                            <th style={{ padding: '0.75rem' }}>베드번호</th>
                            <th style={{ padding: '0.75rem' }}>길이 (m)</th>
                            <th style={{ padding: '0.75rem' }}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {beds.map(bed => (
                            <tr key={bed.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '0.75rem' }}>{bed.name}</td>
                                <td style={{ padding: '0.75rem' }}>{lines.find(l => l.id === bed.lineId)?.name || '-'}</td>
                                <td style={{ padding: '0.75rem' }}>{bed.bedNumber}</td>
                                <td style={{ padding: '0.75rem' }}>{bed.lengthMeters}m</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => {
                                            setNewPlanting({ ...newPlanting, bedId: bed.id });
                                            openModal('planting');
                                        }}
                                    >
                                        정식 추가
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {beds.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    {!selectedHouse ? '하우스를 선택해주세요' :
                                        !selectedLine ? '라인을 선택하거나 베드를 추가해주세요' :
                                            '베드가 없습니다'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    modalType === 'house' ? '하우스 추가' :
                        modalType === 'line' ? '라인 추가' :
                            modalType === 'bed' ? '베드 추가' :
                                '정식 추가'
                }
            >
                {modalType === 'house' && (
                    <form onSubmit={handleAddHouse}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>하우스명</label>
                            <input
                                type="text"
                                value={newHouse.name}
                                onChange={e => setNewHouse({ ...newHouse, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>너비 (m)</label>
                                <input
                                    type="number"
                                    value={newHouse.width}
                                    onChange={e => setNewHouse({ ...newHouse, width: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>길이 (m)</label>
                                <input
                                    type="number"
                                    value={newHouse.length}
                                    onChange={e => setNewHouse({ ...newHouse, length: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>하우스 유형</label>
                            <select
                                value={newHouse.houseType}
                                onChange={e => setNewHouse({ ...newHouse, houseType: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            >
                                <option value="">선택</option>
                                <option value="GLASS">유리온실</option>
                                <option value="PLASTIC">비닐하우스</option>
                                <option value="SMART">스마트팜</option>
                            </select>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">추가</button>
                        </div>
                    </form>
                )}

                {modalType === 'line' && (
                    <form onSubmit={handleAddLine}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>라인명</label>
                            <input
                                type="text"
                                value={newLine.name}
                                onChange={e => setNewLine({ ...newLine, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>라인 번호</label>
                                <input
                                    type="number"
                                    value={newLine.lineNumber}
                                    onChange={e => setNewLine({ ...newLine, lineNumber: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>길이 (m)</label>
                                <input
                                    type="number"
                                    value={newLine.lengthMeters}
                                    onChange={e => setNewLine({ ...newLine, lengthMeters: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">추가</button>
                        </div>
                    </form>
                )}

                {modalType === 'bed' && (
                    <form onSubmit={handleAddBed}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>베드명</label>
                            <input
                                type="text"
                                value={newBed.name}
                                onChange={e => setNewBed({ ...newBed, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>베드 번호</label>
                                <input
                                    type="number"
                                    value={newBed.bedNumber}
                                    onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>길이 (m)</label>
                                <input
                                    type="number"
                                    value={newBed.lengthMeters}
                                    onChange={e => setNewBed({ ...newBed, lengthMeters: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>식재 용량 (주)</label>
                            <input
                                type="number"
                                value={newBed.plantCapacity}
                                onChange={e => setNewBed({ ...newBed, plantCapacity: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">추가</button>
                        </div>
                    </form>
                )}

                {modalType === 'planting' && (
                    <form onSubmit={handleAddPlanting}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>품종명 (새 품종 자동 생성)</label>
                            <input
                                type="text"
                                value={newPlanting.cropName}
                                onChange={e => setNewPlanting({ ...newPlanting, cropName: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                placeholder="예: 설향, 금실"
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>정식일</label>
                            <input
                                type="date"
                                value={newPlanting.plantingDate}
                                onChange={e => setNewPlanting({ ...newPlanting, plantingDate: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>식재 주수</label>
                            <input
                                type="number"
                                value={newPlanting.plantCount}
                                onChange={e => setNewPlanting({ ...newPlanting, plantCount: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                            <button type="submit" className="btn btn-primary">추가</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ProductionManagement;
