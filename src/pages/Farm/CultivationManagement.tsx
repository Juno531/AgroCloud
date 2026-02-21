import React, { useState, useEffect } from 'react';
import { CultivationService, ProductionService } from '../../services/api';
import api from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { Sprout, Bug, Hammer, TrendingUp, Plus, Layers, Flower, Trash2, Droplets, Check } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import BedLayoutEditor from '../../components/BedLayout/BedLayoutEditor';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import NutrientDataTable from '../../components/Cultivation/NutrientDataTable';
import NutrientChart from '../../components/Cultivation/NutrientChart';
import NutrientRecordModal from '../../components/Cultivation/NutrientRecordModal';
import { useLayout } from '../../context/LayoutContext';


const CultivationManagement = () => {
    const { setTitle } = useLayout();
    const [activeTab, setActiveTab] = useState('beds');

    useEffect(() => {
        setTitle('재배 관리');
    }, [setTitle]);

    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState(null);

    // Context Selection
    const [seasons, setSeasons] = useState([]);
    const [plantings, setPlantings] = useState([]);
    const [houses, setHouses] = useState([]);
    const [lines, setLines] = useState([]);
    const [beds, setBeds] = useState([]);

    const [selectedSeason, setSelectedSeason] = useState('');
    const [selectedPlanting, setSelectedPlanting] = useState('');
    const [selectedHouse, setSelectedHouse] = useState('');
    const [selectedLine, setSelectedLine] = useState('');
    const [selectedBed, setSelectedBed] = useState('');

    // Data States
    const [growthRecords, setGrowthRecords] = useState([]);
    const [pestRecords, setPestRecords] = useState([]);
    const [workRecords, setWorkRecords] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [allPlantings, setAllPlantings] = useState<any[]>([]); // For planting management tab
    const [crops, setCrops] = useState([]); // For crop filter
    const [selectedCropFilter, setSelectedCropFilter] = useState(''); // Filter by crop
    const [nutrientRecords, setNutrientRecords] = useState<any[]>([]); // Nutrient records
    const [layoutBeds, setLayoutBeds] = useState<any[]>([]); // Beds from BedLayoutEditor
    const [selectedBeds, setSelectedBeds] = useState<string[]>([]); // Multi-select for planting

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Form States
    const [newGrowth, setNewGrowth] = useState({ plantingId: '', recordDate: '', plantHeight: '', leafCount: '', leafLength: '', leafWidth: '', crownDiameter: '', notes: '' });
    const [newPest, setNewPest] = useState({ bedId: '', recordDate: '', pestType: 'APHIDS', severity: 'LOW', notes: '' });
    const [newWork, setNewWork] = useState({ bedId: '', workDate: '', workType: 'PRUNING', workerCount: 1, durationMinutes: 60, notes: '' });
    const [newHouse, setNewHouse] = useState({ name: '', farmId: '', width: '', length: '', houseType: '', description: '' });
    const [newLine, setNewLine] = useState({ houseId: '', name: '', lineNumber: '', bedCount: '', lengthMeters: '', description: '' });
    const [newBed, setNewBed] = useState({ lineId: '', name: '', bedNumber: '', lengthMeters: '', plantCapacity: '', description: '' });
    const [newPlanting, setNewPlanting] = useState<any>({ bedId: '', cropId: '', cropName: '', plantingDate: '', plantCount: '', notes: '', bedName: '' });
    const [editingNutrient, setEditingNutrient] = useState<any>(null);

    // Initial Load and Update when fields change
    useEffect(() => {
        if (fields.length > 0) {
            // Check if selectedFarm still exists in fields
            const farmExists = fields.some(f => f.id === selectedFarm);
            if (!farmExists) {
                // If selected farm doesn't exist or is not set, select the first one
                setSelectedFarm(fields[0].id);
            }
        } else {
            // No farms available, clear selection
            setSelectedFarm(null);
        }
    }, [fields]);

    // Fetch Context Data when Farm Changes
    useEffect(() => {
        if (selectedFarm) {
            fetchContextData();
            fetchLayoutBeds(); // Always fetch layout beds when farm changes
            if (activeTab === 'planting' || activeTab === 'nutrient') {
                fetchPlantings();
            }
        }
    }, [selectedFarm, activeTab]);

    // Fetch layout beds from BedLayoutEditor data
    const fetchLayoutBeds = async () => {
        if (!selectedFarm) return;
        try {
            const response = await api.get(`/layout/houses/${selectedFarm}`);
            if (response.data.data && response.data.data.layoutData) {
                const layoutData = JSON.parse(response.data.data.layoutData);
                const bedsFromLayout: any[] = [];
                (layoutData.zones || []).forEach((zone: any) => {
                    for (let i = 0; i < zone.bedCount; i++) {
                        bedsFromLayout.push({
                            id: `${zone.id}-${i}`,
                            zoneId: zone.id,
                            zoneName: zone.name,
                            bedNumber: i + 1,
                            name: `${zone.name} B-${i + 1}`,
                            planting: allPlantings.find(p => p.bedName === `${zone.name} B-${i + 1}`) || null
                        });
                    }
                });
                setLayoutBeds(bedsFromLayout);
            } else {
                setLayoutBeds([]);
            }
        } catch (error) {
            console.error('Error fetching layout beds:', error);
            setLayoutBeds([]);
        }
    };

    const fetchContextData = async () => {
        try {
            // Fetch Seasons for Planting context
            const seasonRes = await ProductionService.getSeasons(selectedFarm);
            if (seasonRes.data.success) setSeasons(seasonRes.data.data);

            // Fetch Houses for Bed context
            const houseRes = await ProductionService.getHouses(selectedFarm);
            if (houseRes.data.success) {
                setHouses(houseRes.data.data);
                if (houseRes.data.data.length > 0 && !selectedHouse) {
                    setSelectedHouse(houseRes.data.data[0].id);
                }
            }

            // Fetch all crops for filter
            const cropsRes = await ProductionService.getAllCrops();
            if (cropsRes.data.success) setCrops(cropsRes.data.data);
        } catch (error) {
            console.error("Error fetching context data:", error);
        }
    };

    const fetchPlantings = async () => {
        if (!selectedFarm) return;
        setLoading(true);
        try {
            const res = await ProductionService.getPlantingsByFarm(selectedFarm);
            if (res.data.success) setAllPlantings(res.data.data);
        } catch (error) {
            console.error("Error fetching plantings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Plantings when Season Changes
    useEffect(() => {
        if (selectedSeason) {
            const fetchPlantings = async () => {
                try {
                    const res = await ProductionService.getPlantings(selectedSeason);
                    if (res.data.success) setPlantings(res.data.data);
                } catch (error) {
                    console.error("Error fetching plantings:", error);
                }
            };
            fetchPlantings();
        } else {
            setPlantings([]);
        }
    }, [selectedSeason]);

    // Fetch Lines and Beds when House Changes
    useEffect(() => {
        if (selectedHouse) {
            const fetchHouseData = async () => {
                try {
                    const linesRes = await ProductionService.getLines(selectedHouse);
                    if (linesRes.data.success) setLines(linesRes.data.data);

                    const bedsRes = await ProductionService.getBeds(selectedHouse);
                    if (bedsRes.data.success) setBeds(bedsRes.data.data);
                } catch (error) {
                    console.error("Error fetching house data:", error);
                }
            };
            fetchHouseData();
        } else {
            setLines([]);
            setBeds([]);
        }
    }, [selectedHouse]);

    // Fetch Beds by Line when Line Changes
    useEffect(() => {
        if (selectedLine) {
            const fetchBedsByLine = async () => {
                try {
                    const res = await ProductionService.getBedsByLine(selectedLine);
                    if (res.data.success) setBeds(res.data.data);
                } catch (error) {
                    console.error("Error fetching beds by line:", error);
                }
            };
            fetchBedsByLine();
        }
    }, [selectedLine]);

    // Fetch Records based on Active Tab and Selection
    useEffect(() => {
        if (activeTab === 'growth' && selectedPlanting) {
            fetchGrowthRecords();
        } else if (activeTab === 'pest' && selectedBed) {
            fetchPestRecords();
        } else if (activeTab === 'work' && selectedBed) {
            fetchWorkRecords();
        } else if (activeTab === 'nutrient' && selectedFarm) {
            fetchNutrientRecords();
        }
    }, [activeTab, selectedPlanting, selectedBed, selectedFarm]);

    const fetchGrowthRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getGrowthRecordsByPlanting(selectedPlanting);
            if (res.data.success) setGrowthRecords(res.data.data);
        } catch (error) {
            console.error("Error fetching growth records:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPestRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getPestRecordsByBed(selectedBed);
            if (res.data.success) setPestRecords(res.data.data);
        } catch (error) {
            console.error("Error fetching pest records:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getWorkRecordsByBed(selectedBed);
            if (res.data.success) setWorkRecords(res.data.data);
        } catch (error) {
            console.error("Error fetching work records:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNutrientRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getNutrientRecordsByFarm(selectedFarm);
            if (res.data.success) setNutrientRecords(res.data.data);
        } catch (error) {
            console.error("Error fetching nutrient records:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleNutrientSubmit = async (data) => {
        try {
            if (editingNutrient) {
                await CultivationService.updateNutrientRecord(editingNutrient.id, data);
            } else {
                await CultivationService.createNutrientRecord(data);
            }
            setEditingNutrient(null);
            setIsModalOpen(false);
            fetchNutrientRecords();
        } catch (error) {
            console.error("Error saving nutrient record:", error);
        }
    };

    const handleNutrientEdit = (record) => {
        setEditingNutrient(record);
        setModalType('nutrient');
        setIsModalOpen(true);
    };

    const handleNutrientDelete = async (id, record) => {
        setConfirmDialog({
            isOpen: true,
            title: '양액 기록 삭제',
            message: `${record.recordDate} (${record.bedName}) 양액 기록을 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await CultivationService.deleteNutrientRecord(id);
                    fetchNutrientRecords();
                } catch (error) {
                    console.error("Error deleting nutrient record:", error);
                }
            }
        });
    };

    const handleAddGrowth = async (e) => {
        e.preventDefault();
        try {
            await CultivationService.createGrowthRecord({ ...newGrowth, plantingId: selectedPlanting });
            setIsModalOpen(false);
            fetchGrowthRecords();
            setNewGrowth({ plantingId: '', recordDate: '', plantHeight: '', leafCount: '', leafLength: '', leafWidth: '', crownDiameter: '', notes: '' });
        } catch (error) {
            console.error("Error creating growth record:", error);
        }
    };

    const handleAddPest = async (e) => {
        e.preventDefault();
        try {
            await CultivationService.createPestRecord({ ...newPest, bedId: selectedBed });
            setIsModalOpen(false);
            fetchPestRecords();
            setNewPest({ bedId: '', recordDate: '', pestType: 'APHIDS', severity: 'LOW', notes: '' });
        } catch (error) {
            console.error("Error creating pest record:", error);
        }
    };

    const handleAddWork = async (e) => {
        e.preventDefault();
        try {
            await CultivationService.createWorkRecord({ ...newWork, bedId: selectedBed });
            setIsModalOpen(false);
            fetchWorkRecords();
            setNewWork({ bedId: '', workDate: '', workType: 'PRUNING', workerCount: 1, durationMinutes: 60, notes: '' });
        } catch (error) {
            console.error("Error creating work record:", error);
        }
    };

    const handleAddHouse = async (e) => {
        e.preventDefault();
        try {
            await ProductionService.createHouse({ ...newHouse, farmId: selectedFarm });
            setIsModalOpen(false);
            fetchContextData();
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
            const res = await ProductionService.getLines(selectedHouse);
            if (res.data.success) setLines(res.data.data);
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
            const res = await ProductionService.getBeds(selectedHouse);
            if (res.data.success) setBeds(res.data.data);
            setNewBed({ lineId: '', name: '', bedNumber: '', lengthMeters: '', plantCapacity: '', description: '' });
        } catch (error) {
            console.error("Error creating bed:", error);
            alert(`베드 생성 실패: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddPlanting = async (e) => {
        e.preventDefault();
        try {
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

    const handleDeletePlanting = async (id, plantingInfo) => {
        setConfirmDialog({
            isOpen: true,
            title: '정식 삭제',
            message: `${plantingInfo.cropName} (${plantingInfo.bedName}) 정식을 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await ProductionService.deletePlanting(id);
                    fetchPlantings();
                } catch (error) {
                    console.error("Error deleting planting:", error);
                    alert(`정식 삭제 실패: ${error.response?.data?.message || error.message}`);
                }
            }
        });
    };

    const tabButtons = [
        { id: 'beds', label: '베드 관리', icon: Layers },
        { id: 'planting', label: '정식 관리', icon: Flower },
        { id: 'nutrient', label: '양액관리', icon: Droplets },
        { id: 'growth', label: '생육 조사', icon: Sprout },
        { id: 'pest', label: '병해충 예찰', icon: Bug },
        { id: 'work', label: '작업 일지', icon: Hammer },
        { id: 'prediction', label: '수확 예측', icon: TrendingUp },
    ];

    return (
        <div className="cultivation-page" style={{ padding: 'var(--spacing-lg)' }}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {tabButtons.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} style={{ marginRight: '8px' }} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Planting Management Tab */}
                {
                    activeTab === 'planting' && (
                        <>
                            <div style={{ ...sectionStyle, marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                    <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500 }}>품종 필터</label>
                                    <select
                                        value={selectedCropFilter}
                                        onChange={(e) => setSelectedCropFilter(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                                    >
                                        <option value="">전체</option>
                                        {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Bed Grid for Planting */}
                            <div style={sectionStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3>베드 선택하여 정식 추가</h3>
                                    {selectedBeds.length > 0 && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setNewPlanting({ ...newPlanting, bedId: selectedBeds[0] });
                                                openModal('planting');
                                            }}
                                        >
                                            <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                            선택한 베드에 정식 ({selectedBeds.length}개)
                                        </button>
                                    )}
                                </div>

                                {layoutBeds.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '3rem',
                                        color: 'var(--color-text-secondary)',
                                        backgroundColor: 'var(--color-background)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px dashed var(--color-border)'
                                    }}>
                                        <Layers size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>베드 레이아웃이 없습니다</p>
                                        <p style={{ fontSize: '0.875rem' }}>"베드 관리" 탭에서 먼저 베드 레이아웃을 설정하세요</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Group beds by zone */}
                                        {Object.entries(
                                            layoutBeds.reduce((acc: any, bed: any) => {
                                                if (!acc[bed.zoneName]) acc[bed.zoneName] = [];
                                                acc[bed.zoneName].push(bed);
                                                return acc;
                                            }, {})
                                        ).map(([zoneName, zoneBeds]: [string, any]) => (
                                            <div key={zoneName} style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>{zoneName}</h4>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                                    gap: '0.75rem'
                                                }}>
                                                    {zoneBeds.map((bed: any) => {
                                                        const hasPlanting = allPlantings.some((p: any) => p.bedName === bed.name);
                                                        const planting = allPlantings.find((p: any) => p.bedName === bed.name);
                                                        const isSelected = selectedBeds.includes(bed.id);

                                                        return (
                                                            <div
                                                                key={bed.id}
                                                                onClick={() => {
                                                                    if (isSelected) {
                                                                        setSelectedBeds(selectedBeds.filter(id => id !== bed.id));
                                                                    } else {
                                                                        setSelectedBeds([...selectedBeds, bed.id]);
                                                                    }
                                                                }}
                                                                style={{
                                                                    backgroundColor: hasPlanting ? '#4ade80' : isSelected ? '#60a5fa' : '#f3f4f6',
                                                                    border: `2px solid ${hasPlanting ? '#22c55e' : isSelected ? '#3b82f6' : '#d1d5db'}`,
                                                                    borderRadius: '8px',
                                                                    padding: '1rem',
                                                                    textAlign: 'center',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    position: 'relative'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '0.75rem', color: hasPlanting ? '#15803d' : '#6b7280', marginBottom: '4px' }}>
                                                                    B-{bed.bedNumber}
                                                                </div>
                                                                {hasPlanting ? (
                                                                    <>
                                                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15803d' }}>
                                                                            {planting?.cropName || '정식됨'}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '2px' }}>
                                                                            {planting?.plantingDate}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setNewPlanting({ ...newPlanting, bedId: bed.id, bedName: bed.name });
                                                                            openModal('planting');
                                                                        }}
                                                                        style={{
                                                                            backgroundColor: 'var(--color-primary)',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '50%',
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            padding: 0,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <Plus size={16} />
                                                                    </button>
                                                                )}
                                                                {isSelected && !hasPlanting && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        top: '4px',
                                                                        right: '4px',
                                                                        backgroundColor: '#3b82f6',
                                                                        borderRadius: '50%',
                                                                        width: '18px',
                                                                        height: '18px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        <Check size={12} color="white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>

                            {/* Existing Plantings Table */}
                            <div style={{ ...sectionStyle, marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3>정식 현황</h3>
                                </div>
                                {loading ? (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>로딩 중...</p>
                                ) : allPlantings.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>정식 기록이 없습니다</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                                                <th style={{ padding: '0.75rem' }}>베드</th>
                                                <th style={{ padding: '0.75rem' }}>품종</th>
                                                <th style={{ padding: '0.75rem' }}>정식일</th>
                                                <th style={{ padding: '0.75rem' }}>주수</th>
                                                <th style={{ padding: '0.75rem' }}>작업</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allPlantings
                                                .filter((p: any) => !selectedCropFilter || p.cropId === Number(selectedCropFilter))
                                                .map((planting: any) => (
                                                    <tr key={planting.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                        <td style={{ padding: '0.75rem' }}>{planting.bedName}</td>
                                                        <td style={{ padding: '0.75rem' }}>{planting.cropName}</td>
                                                        <td style={{ padding: '0.75rem' }}>{planting.plantingDate}</td>
                                                        <td style={{ padding: '0.75rem' }}>{planting.plantCount || '-'}</td>
                                                        <td style={{ padding: '0.75rem' }}>
                                                            <button
                                                                className="btn btn-sm btn-outline"
                                                                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                                                onClick={() => handleDeletePlanting(planting.id, planting)}
                                                            >
                                                                <Trash2 size={14} style={{ marginRight: '4px' }} />
                                                                삭제
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )
                }

                {/* Bed Management Tab */}
                {
                    activeTab === 'beds' && (
                        <>
                            {/* Farm and House Selection */}
                            <div style={{ ...sectionStyle, marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                            </div>

                            {/* Bed Layout Editor */}
                            {selectedFarm && (
                                <div style={{ marginTop: '1rem' }}>
                                    <BedLayoutEditor farmId={selectedFarm} farmName={fields.find(f => f.id === selectedFarm)?.name || ''} />
                                </div>
                            )}

                            {/* Help Text */}
                            <div style={{
                                ...sectionStyle,
                                marginTop: '1rem',
                                backgroundColor: 'var(--color-info-bg, #e0f2fe)',
                                border: '1px solid var(--color-info-border, #7dd3fc)',
                                borderRadius: '8px',
                                padding: '1rem'
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-info-text, #0369a1)', margin: 0 }}>
                                    💡 <strong>베드 레이아웃 사용법:</strong> 위의 에디터에서 구역을 추가하고 베드 수를 설정한 후 "저장" 버튼을 클릭하세요.
                                    저장된 베드는 "정식 관리" 탭에서 정식 작업에 사용할 수 있습니다.
                                </p>
                            </div>
                        </>
                    )
                }

                {/* Common Filters for other tabs */}
                {
                    activeTab !== 'beds' && (
                        <div style={{ ...sectionStyle, marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>농장</label>
                                <select
                                    value={selectedFarm || ''}
                                    onChange={(e) => setSelectedFarm(Number(e.target.value))}
                                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                >
                                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>

                            {activeTab === 'growth' && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>작기</label>
                                        <select
                                            value={selectedSeason}
                                            onChange={(e) => setSelectedSeason(e.target.value)}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        >
                                            <option value="">작기 선택</option>
                                            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>파종/정식</label>
                                        <select
                                            value={selectedPlanting}
                                            onChange={(e) => setSelectedPlanting(e.target.value)}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        >
                                            <option value="">파종/정식 선택</option>
                                            {plantings.map(p => <option key={p.id} value={p.id}>{p.cropName} ({p.bedName})</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {(activeTab === 'pest' || activeTab === 'work') && (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>하우스</label>
                                        <select
                                            value={selectedHouse}
                                            onChange={(e) => setSelectedHouse(e.target.value)}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        >
                                            <option value="">하우스 선택</option>
                                            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>베드</label>
                                        <select
                                            value={selectedBed}
                                            onChange={(e) => setSelectedBed(e.target.value)}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        >
                                            <option value="">베드 선택</option>
                                            {beds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'growth' && (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>생육 조사 기록</h3>
                                <button className="btn btn-primary" onClick={() => openModal('growth')} disabled={!selectedPlanting}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    기록 추가
                                </button>
                            </div>
                            {!selectedPlanting ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>작기와 파종/정식을 선택해주세요.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem' }}>날짜</th>
                                            <th style={{ padding: '0.75rem' }}>초장 (cm)</th>
                                            <th style={{ padding: '0.75rem' }}>엽수 (매)</th>
                                            <th style={{ padding: '0.75rem' }}>엽장 (cm)</th>
                                            <th style={{ padding: '0.75rem' }}>엽폭 (cm)</th>
                                            <th style={{ padding: '0.75rem' }}>관부직경 (mm)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {growthRecords.map(record => (
                                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.75rem' }}>{record.recordDate}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.plantHeight}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.leafCount}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.leafLength}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.leafWidth}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.crownDiameter}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'pest' && (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>병해충 예찰 기록</h3>
                                <button className="btn btn-primary" onClick={() => openModal('pest')} disabled={!selectedBed}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    기록 추가
                                </button>
                            </div>
                            {!selectedBed ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>하우스와 베드를 선택해주세요.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem' }}>날짜</th>
                                            <th style={{ padding: '0.75rem' }}>종류</th>
                                            <th style={{ padding: '0.75rem' }}>심각도</th>
                                            <th style={{ padding: '0.75rem' }}>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pestRecords.map(record => (
                                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.75rem' }}>{record.recordDate}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.pestType}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        backgroundColor: record.severity === 'HIGH' ? 'var(--color-error-bg)' :
                                                            record.severity === 'MEDIUM' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                                                        color: record.severity === 'HIGH' ? 'var(--color-error)' :
                                                            record.severity === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)'
                                                    }}>
                                                        {record.severity}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>{record.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'work' && (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>작업 일지</h3>
                                <button className="btn btn-primary" onClick={() => openModal('work')} disabled={!selectedBed}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    일지 추가
                                </button>
                            </div>
                            {!selectedBed ? (
                                <p style={{ color: 'var(--color-text-secondary)' }}>하우스와 베드를 선택해주세요.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem' }}>날짜</th>
                                            <th style={{ padding: '0.75rem' }}>작업 종류</th>
                                            <th style={{ padding: '0.75rem' }}>인원</th>
                                            <th style={{ padding: '0.75rem' }}>시간 (분)</th>
                                            <th style={{ padding: '0.75rem' }}>비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workRecords.map(record => (
                                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.75rem' }}>{record.workDate}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.workType}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.workerCount}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.durationMinutes}</td>
                                                <td style={{ padding: '0.75rem' }}>{record.notes}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'prediction' && (
                        <div style={sectionStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3>수확 예측</h3>
                                <button className="btn btn-primary" onClick={() => openModal('prediction')}>
                                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                    예측 생성
                                </button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.75rem' }}>베드</th>
                                        <th style={{ padding: '0.75rem' }}>예상 수확일</th>
                                        <th style={{ padding: '0.75rem' }}>예상 수확량(kg)</th>
                                        <th style={{ padding: '0.75rem' }}>신뢰도</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map(pred => (
                                        <tr key={pred.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '0.75rem' }}>{pred.plantingName}</td>
                                            <td style={{ padding: '0.75rem' }}>{pred.expectedHarvestDate}</td>
                                            <td style={{ padding: '0.75rem' }}>{pred.expectedYield} kg</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pred.confidence * 100}%`, height: '100%', backgroundColor: 'var(--color-primary)' }}></div>
                                                    </div>
                                                    <span>{Math.round(pred.confidence * 100)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }

                {/* Nutrient Management Tab */}
                {
                    activeTab === 'nutrient' && (
                        <>


                            <div style={sectionStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3>양액 기록</h3>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            setEditingNutrient(null);
                                            await fetchLayoutBeds(); // Ensure beds are loaded
                                            setModalType('nutrient');
                                            setIsModalOpen(true);
                                        }}
                                        disabled={loading}
                                    >
                                        <Plus size={16} style={{ marginRight: '0.5rem' }} />
                                        기록 추가
                                    </button>
                                </div>
                                {loading ? (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>로딩 중...</p>
                                ) : (
                                    <NutrientDataTable
                                        records={nutrientRecords}
                                        onEdit={handleNutrientEdit}
                                        onDelete={handleNutrientDelete}
                                    />
                                )}
                            </div>

                            <div style={{ ...sectionStyle, marginTop: '1rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>양액 트렌드</h3>
                                {nutrientRecords.length > 0 ? (
                                    <NutrientChart records={nutrientRecords} />
                                ) : (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                        데이터가 없습니다.
                                    </p>
                                )}
                            </div>
                        </>
                    )
                }

                {/* Generic Modal */}
                <Modal
                    isOpen={isModalOpen && modalType !== 'nutrient'}
                    onClose={() => setIsModalOpen(false)}
                    title={
                        modalType === 'bed' ? '베드 추가' :
                            modalType === 'planting' ? '정식 추가' :
                                modalType === 'growth' ? '생육 조사 기록 추가' :
                                    modalType === 'pest' ? '병해충 예찰 기록 추가' :
                                        modalType === 'work' ? '작업 일지 추가' :
                                            '수확 예측'
                    }
                >
                    {/* House Modal */}
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

                    {/* Line Modal */}
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

                    {/* Bed Modal */}
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

                    {/* Planting Modal */}
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

                    {/* Growth Record Modal */}
                    {modalType === 'growth' && (
                        <form onSubmit={handleAddGrowth}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>조사 날짜</label>
                                <input
                                    type="date"
                                    value={newGrowth.recordDate}
                                    onChange={e => setNewGrowth({ ...newGrowth, recordDate: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>초장 (cm)</label>
                                    <input
                                        type="number"
                                        value={newGrowth.plantHeight}
                                        onChange={e => setNewGrowth({ ...newGrowth, plantHeight: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>엽수 (매)</label>
                                    <input
                                        type="number"
                                        value={newGrowth.leafCount}
                                        onChange={e => setNewGrowth({ ...newGrowth, leafCount: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>엽장 (cm)</label>
                                    <input
                                        type="number"
                                        value={newGrowth.leafLength}
                                        onChange={e => setNewGrowth({ ...newGrowth, leafLength: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>엽폭 (cm)</label>
                                    <input
                                        type="number"
                                        value={newGrowth.leafWidth}
                                        onChange={e => setNewGrowth({ ...newGrowth, leafWidth: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>관부직경 (mm)</label>
                                <input
                                    type="number"
                                    value={newGrowth.crownDiameter}
                                    onChange={e => setNewGrowth({ ...newGrowth, crownDiameter: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                                <button type="submit" className="btn btn-primary">저장</button>
                            </div>
                        </form>
                    )}

                    {/* Pest Record Modal */}
                    {modalType === 'pest' && (
                        <form onSubmit={handleAddPest}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>예찰 날짜</label>
                                <input
                                    type="date"
                                    value={newPest.recordDate}
                                    onChange={e => setNewPest({ ...newPest, recordDate: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>종류</label>
                                <select
                                    value={newPest.pestType}
                                    onChange={e => setNewPest({ ...newPest, pestType: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                >
                                    <option value="APHIDS">진딧물</option>
                                    <option value="MITES">응애</option>
                                    <option value="POWDERY_MILDEW">흰가루병</option>
                                    <option value="GREY_MOLD">잿빛곰팡이병</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>심각도</label>
                                <select
                                    value={newPest.severity}
                                    onChange={e => setNewPest({ ...newPest, severity: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                >
                                    <option value="LOW">낮음</option>
                                    <option value="MEDIUM">중간</option>
                                    <option value="HIGH">높음</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>비고</label>
                                <textarea
                                    value={newPest.notes}
                                    onChange={e => setNewPest({ ...newPest, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                                <button type="submit" className="btn btn-primary">저장</button>
                            </div>
                        </form>
                    )}

                    {/* Work Record Modal */}
                    {modalType === 'work' && (
                        <form onSubmit={handleAddWork}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>작업 날짜</label>
                                <input
                                    type="date"
                                    value={newWork.workDate}
                                    onChange={e => setNewWork({ ...newWork, workDate: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>작업 종류</label>
                                <select
                                    value={newWork.workType}
                                    onChange={e => setNewWork({ ...newWork, workType: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                >
                                    <option value="PRUNING">적엽</option>
                                    <option value="THINNING">적과</option>
                                    <option value="HARVESTING">수확</option>
                                    <option value="PEST_CONTROL">방제</option>
                                    <option value="FERTILIZING">관주/시비</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>인원</label>
                                    <input
                                        type="number"
                                        value={newWork.workerCount}
                                        onChange={e => setNewWork({ ...newWork, workerCount: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        required
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>시간 (분)</label>
                                    <input
                                        type="number"
                                        value={newWork.durationMinutes}
                                        onChange={e => setNewWork({ ...newWork, durationMinutes: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>비고</label>
                                <textarea
                                    value={newWork.notes}
                                    onChange={e => setNewWork({ ...newWork, notes: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>취소</button>
                                <button type="submit" className="btn btn-primary">저장</button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Confirm Dialog */}
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    variant="danger"
                />
                <NutrientRecordModal
                    isOpen={isModalOpen && modalType === 'nutrient'}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleNutrientSubmit}
                    farmId={selectedFarm}
                    crops={crops}
                    plantings={allPlantings}
                    initialData={editingNutrient}
                />
            </div>
        </div>
    );
};

export default CultivationManagement;
