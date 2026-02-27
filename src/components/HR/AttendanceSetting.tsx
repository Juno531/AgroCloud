import { useState, useEffect, useCallback, Suspense } from 'react';
import { MapPin, Save, Search, Settings, RefreshCw, Info, Trash, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { FarmService } from '../../services/api';
import KakaoMap from '../../components/Map/KakaoMap';
import SuspenseLoader from '../../components/UI/SuspenseLoader';





/* ─────────────────────────────────────────────────────────────────── */

const AttendanceSetting: React.FC = () => {
    const { user } = useAuth();
    const { fields, refreshData, loading: contextLoading } = useFarm();
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
    const [farmData, setFarmData] = useState<any>(null);
    const [isManualUpdate, setIsManualUpdate] = useState(false);

    useEffect(() => {
        if (fields && fields.length > 0 && !selectedFarmId) {
            const firstFarm = fields[0];
            if (firstFarm) {
                setSelectedFarmId(firstFarm.id);
            }
        }
    }, [fields, selectedFarmId]);

    useEffect(() => {
        if (isManualUpdate) return; // 저장 직후엔 fields로 덮어쓰지 않음
        if (selectedFarmId && fields.length > 0) {
            const selected = fields.find(f => f.id === Number(selectedFarmId));
            if (selected) {
                setFarmData({ ...selected });
            }
        }
    }, [selectedFarmId, fields, isManualUpdate]);


    const handleFarmUpdate = useCallback(async () => {
        if (!farmData) return;
        setSaveLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await FarmService.updateFarm(farmData.id, farmData);
            const updated = response.data.data;
            // API 응답값으로 직접 갱신 (refreshData의 fields 덮어쓰기 방지)
            setIsManualUpdate(true);
            setFarmData((prev: any) => ({
                ...prev,
                attendanceRadius: updated.attendanceRadius ?? prev.attendanceRadius,
                attendanceIpAddress: updated.attendanceIpAddress ?? prev.attendanceIpAddress,
            }));
            await refreshData();
            setMessage({ type: 'success', text: `[${farmData.name}] 출퇴근 설정이 정상적으로 저장되었습니다.` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to update attendance setting:', error);
            setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
        } finally {
            setSaveLoading(false);
            setIsManualUpdate(false);
        }
    }, [farmData, refreshData]);


    const filteredFarms = fields.filter(farm =>
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farm.location && farm.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Info className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">접근 권한 없음</h3>
                    <p className="text-slate-500">인사 관리자 권한이 필요합니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Interactive List */}
                <div className="lg:w-[320px] flex flex-col gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col h-fit max-h-[calc(100vh-200px)] min-h-[200px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <Settings className="text-primary" size={20} /> 설정 대상 농장
                            </h3>
                            <button
                                onClick={() => refreshData()}
                                className={`p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg transition-all text-slate-500 ${contextLoading ? 'animate-spin' : ''}`}
                                title="목록 새로고침"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="농장 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                            {filteredFarms.map(farm => (
                                <button
                                    key={farm.id}
                                    onClick={() => setSelectedFarmId(farm.id)}
                                    className={`
                                        group relative w-full p-3.5 rounded-xl text-left transition-all duration-200
                                        ${selectedFarmId === farm.id
                                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800 border-transparent hover:border-slate-200'
                                        } border
                                    `}
                                >
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate mb-1">{farm.name}</div>
                                    <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <MapPin size={10} /> {farm.location || '주소 없음'}
                                    </div>
                                </button>
                            ))}
                            {filteredFarms.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-sm text-slate-400">등록된 농장이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Settings Panel */}
                <div className="flex-1 flex flex-col gap-6">
                    {farmData ? (
                        <div className="flex flex-col gap-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{farmData.name} 출퇴근 인증 설정</h2>
                                    <p className="text-slate-500 text-sm">GPS 반경을 통한 출퇴근 허용 범위를 지정합니다.</p>
                                </div>
                                <button
                                    onClick={handleFarmUpdate}
                                    disabled={saveLoading}
                                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {saveLoading ? '저장 중...' : '설정 저장'}
                                </button>
                            </div>

                            {message.text && (
                                <div className={`
                                    p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300
                                    ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}
                                `}>
                                    <Info size={18} />
                                    <span className="font-semibold text-sm">{message.text}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                                {/* GPS Setting Column */}
                                <div className="xl:col-span-5 flex flex-col gap-4">
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 h-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><MapPin size={16} /></div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">GPS 기반 허용 반경 설정</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6">농장 중심 좌표로부터 직원이 출퇴근을 인증할 수 있는 최대 반경 거리를 설정합니다.</p>

                                        <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">허용 반경 거리</label>
                                                <span className="text-2xl font-black text-emerald-600">{farmData.attendanceRadius || 100}<span className="text-sm ml-1 opacity-70">m</span></span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="1000"
                                                step="10"
                                                value={farmData.attendanceRadius || 100}
                                                onChange={(e) => setFarmData({ ...farmData, attendanceRadius: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>50m</span>
                                                <span>500m</span>
                                                <span>1000m</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                                                <Info size={12} className="inline mr-1 mb-1" />
                                                우측 지도의 원형 영역 내에서만 출퇴근 인증이 가능합니다.
                                                농장의 크기와 지형지물을 고려하여 적절한 반경을 설정해 주세요.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Column */}
                                <div className="xl:col-span-7 h-[500px] min-h-[400px]">
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-sm border border-slate-200 dark:border-zinc-800 h-full relative">
                                        <div className="h-full rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
                                            <Suspense fallback={<SuspenseLoader />}>
                                                <KakaoMap
                                                    latitude={Number(farmData.latitude) || 37.566826}
                                                    longitude={Number(farmData.longitude) || 126.9786567}
                                                    markerPosition={{
                                                        lat: Number(farmData.latitude) || 37.566826,
                                                        lng: Number(farmData.longitude) || 126.9786567
                                                    }}
                                                    draggableMarker={false}
                                                    address={farmData.location}
                                                    circleRadius={farmData.attendanceRadius || 100}
                                                    height="100%"
                                                />
                                            </Suspense>
                                            <div className="absolute top-5 right-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-2 flex items-center gap-2 rounded-xl shadow-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                                                <MapPin size={14} className="text-emerald-500" /> {farmData.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[500px]">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <Settings size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">농장을 선택해 주세요</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">설정을 변경할 대상을 좌측 목록에서 선택해 주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceSetting;
