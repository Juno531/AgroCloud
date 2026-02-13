import React, { useState, useMemo, useEffect } from 'react';
import YieldStats from '../components/Yield/YieldStats';
import YieldTable from '../components/Yield/YieldTable';
import YieldChart from '../components/Yield/YieldChart';
import YieldHistory from '../components/Yield/YieldHistory';
import Modal from '../components/UI/Modal';
import YieldForm from '../components/Yield/YieldForm';
import * as XLSX from 'xlsx';
import '../styles/yield.css';
import { LayoutDashboard, History } from 'lucide-react';
import { HarvestService, ProductionService } from '../services/api';
import { useFarm } from '../context/FarmContext';

const YieldManagement = ({ activeFarm }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYield, setEditingYield] = useState(null);
    const [yields, setYields] = useState([]);
    const [loading, setLoading] = useState(false);
    const { fields, crops } = useFarm();

    // Context for API
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState('');

    const [filters, setFilters] = useState({
        crop: '',
        field: '',
        startDate: '',
        endDate: ''
    });

    // Determine active farm ID
    const activeFarmId = useMemo(() => {
        if (!activeFarm || activeFarm === 'All') return null;
        const farm = fields.find(f => f.name === activeFarm);
        return farm ? farm.id : null;
    }, [activeFarm, fields]);

    // Fetch Seasons
    useEffect(() => {
        const fetchSeasons = async () => {
            if (activeFarmId) {
                try {
                    const res = await ProductionService.getSeasons(activeFarmId);
                    if (res.data.success) {
                        setSeasons(res.data.data);
                        // Select latest season by default if available
                        if (res.data.data.length > 0) {
                            setSelectedSeason(res.data.data[0].id);
                        } else {
                            setSelectedSeason('');
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch seasons", err);
                    setSeasons([]);
                }
            } else if (activeFarm === 'All' && fields.length > 0) {
                setSeasons([]);
                setSelectedSeason('');
            }
        };
        fetchSeasons();
    }, [activeFarmId, activeFarm, fields]);

    // Fetch Harvest Records
    const fetchYields = async () => {
        setLoading(true);
        try {
            let allRecords = [];

            if (selectedSeason) {
                // Fetch for specific season
                const response = await HarvestService.getHarvestRecords(selectedSeason);
                if (response.data.success) {
                    allRecords = response.data.data;
                }
            } else if (activeFarm === 'All') {
                // If All, we try to fetch for all farms' latest seasons
                for (const field of fields) {
                    try {
                        const seasonsRes = await ProductionService.getSeasons(field.id);
                        if (seasonsRes.data.success && seasonsRes.data.data.length > 0) {
                            const latestSeasonId = seasonsRes.data.data[0].id;
                            const recordsRes = await HarvestService.getHarvestRecords(latestSeasonId);
                            if (recordsRes.data.success) {
                                allRecords = [...allRecords, ...recordsRes.data.data];
                            }
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch records for farm ${field.name}`, e);
                    }
                }
            }

            // Transform data
            const formattedData = allRecords.map(item => {
                const totalAmount = item.details ? item.details.reduce((sum, d) => sum + (d.weightKg || 0), 0) : 0;
                // Determine quality based on details? Or just use 'Good' as default
                const mainGrade = item.details && item.details.length > 0 ? item.details[0].grade : 'Good';

                return {
                    id: item.id,
                    date: item.harvestDate,
                    crop: item.cropName || 'Unknown',
                    field: item.bedName ? `${item.bedName} (${item.seasonName})` : 'Unknown', // Map bed to field column
                    amount: `${totalAmount} kg`,
                    quality: mainGrade,
                    status: 'good', // Logic for status can be added
                    raw: item // Keep raw data for editing
                };
            });

            setYields(formattedData);

        } catch (err) {
            console.error("Failed to fetch yields", err);
            setYields([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchYields();
    }, [selectedSeason, activeFarm, fields]);

    const handleAddYield = async (formData) => {
        // Refresh after add
        await fetchYields();
        setIsModalOpen(false);
    };

    const handleUpdateYield = async (formData) => {
        alert("수정 기능은 아직 서버에서 지원하지 않습니다.");
        setIsModalOpen(false);
        setEditingYield(null);
    };

    const handleDeleteYield = async (id) => {
        if (window.confirm('이 기록을 삭제하시겠습니까?')) {
            alert("삭제 기능은 아직 서버에서 지원하지 않습니다.");
        }
    };

    const handleEditClick = (yieldItem) => {
        setEditingYield(yieldItem.raw);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(yields);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Yields");
        XLSX.writeFile(wb, "farm_yields.xlsx");
    };

    const filteredYields = useMemo(() => {
        return yields.filter(item => {
            const matchCrop = filters.crop ? item.crop === filters.crop : true;
            const matchField = filters.field ? item.field.includes(filters.field) : true;
            const matchStartDate = filters.startDate ? new Date(item.date) >= new Date(filters.startDate) : true;
            const matchEndDate = filters.endDate ? new Date(item.date) <= new Date(filters.endDate) : true;

            return matchCrop && matchField && matchStartDate && matchEndDate;
        });
    }, [yields, filters]);

    return (
        <div className="yield-page">
            {/* Main Tabs: Dashboard vs History */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <LayoutDashboard size={16} style={{ marginRight: '8px' }} />
                        대시보드
                    </button>
                    <button
                        className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <History size={16} style={{ marginRight: '8px' }} />
                        기록 분석
                    </button>
                </div>

                {/* Season Selector for specific farm */}
                {activeFarmId && (
                    <div style={{ marginLeft: 'auto' }}>
                        <select
                            value={selectedSeason}
                            onChange={(e) => setSelectedSeason(e.target.value)}
                            className="form-select"
                            style={{ padding: '0.5rem', borderRadius: '4px' }}
                        >
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            {seasons.length === 0 && <option value="">작기 없음</option>}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : (
                <>
                    {activeTab === 'dashboard' ? (
                        <>
                            <YieldStats data={filteredYields} activeFarm={activeFarm} />
                            <YieldChart data={filteredYields} />
                            <YieldTable
                                data={filteredYields}
                                onAddClick={() => { setEditingYield(null); setIsModalOpen(true); }}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteYield}
                                onExport={handleExport}
                                filters={filters}
                                setFilters={setFilters}
                            />
                        </>
                    ) : (
                        <YieldHistory data={yields} />
                    )}
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingYield(null); }}
                title={editingYield ? "수확 기록 수정" : "새 수확 기록 추가"}
            >
                <YieldForm
                    initialData={editingYield}
                    onSubmit={editingYield ? handleUpdateYield : handleAddYield}
                    onCancel={() => { setIsModalOpen(false); setEditingYield(null); }}
                    farmId={activeFarmId}
                    seasonId={selectedSeason}
                />
            </Modal>
        </div>
    );
};

export default YieldManagement;
