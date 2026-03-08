import { useState, useEffect, useCallback, Suspense } from 'react';
import { MapPin, Save, Search, Settings, RefreshCw, Info } from 'lucide-react';
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
                attendanceStartTime: updated.attendanceStartTime ?? prev.attendanceStartTime,
                attendanceEndTime: updated.attendanceEndTime ?? prev.attendanceEndTime,
                regularEmployeeStartTime: updated.regularEmployeeStartTime ?? prev.regularEmployeeStartTime,
                partTimeEmployeeStartTime: updated.partTimeEmployeeStartTime ?? prev.partTimeEmployeeStartTime,
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

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'MASTER_ADMIN') {
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
                {/* Left: Interactive List (Synced with FarmSetting Design) */}
                <div className="lg:w-[380px] flex flex-col gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 flex flex-col h-fit max-h-[calc(100vh-140px)] min-h-[200px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                                <Settings className="text-primary" size={24} /> 설정 대상 농장
                            </h3>
                            <button
                                onClick={() => refreshData()}
                                className={`p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-all text-slate-500 ${contextLoading ? 'animate-spin' : ''}`}
                                title="목록 새로고침"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="농장 이름 또는 주소 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                            {filteredFarms.map(farm => (
                                <button
                                    key={farm.id}
                                    onClick={() => setSelectedFarmId(farm.id)}
                                    className={`
                                        group relative w-full p-4 rounded-2xl text-left transition-all duration-300
                                        ${selectedFarmId === farm.id
                                            ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-100 dark:hover:border-zinc-700'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold truncate leading-tight mb-1">{farm.name}</div>
                                            <div className={`text-xs truncate opacity-70 flex items-center gap-1`}>
                                                <MapPin size={10} /> {farm.location || '주소 정보 없음'}
                                            </div>
                                        </div>
                                        <div className={`
                                            px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                            ${selectedFarmId === farm.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}
                                        `}>
                                            -
                                        </div>
                                    </div>
                                    {selectedFarmId === farm.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                                    )}
                                </button>
                            ))}
                            {filteredFarms.length === 0 && (
                                <div className="text-center py-12">
                                    <Search className="mx-auto text-slate-200 mb-2" size={32} />
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
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-1">[{farmData.name}] 출퇴근 설정</h2>
                                    <p className="text-slate-500 text-sm">GPS 반경을 통해 직원이 출퇴근 가능한 구역을 지정합니다.</p>
                                </div>
                                <button
                                    onClick={handleFarmUpdate}
                                    disabled={saveLoading}
                                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    {saveLoading ? '저장 중...' : '설정 저장'}
                                </button>
                            </div>

                            {message.text && (
                                <div className={`
                                    p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300
                                    ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}
                                `}>
                                    <Info size={20} />
                                    <span className="font-semibold text-sm">{message.text}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
                                {/* GPS Setting Column */}
                                <div className="xl:col-span-12 2xl:col-span-5 flex flex-col gap-4">
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800 h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-primary shadow-sm"><MapPin size={24} /></div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">GPS 기반 인증 반경</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">지정된 농장 위치로부터 인증이 가능한 최대 거리를 설정합니다. <br />반경 바깥에서는 출퇴근 버튼이 비활성화되거나 경고가 표시됩니다.</p>

                                        <div className="p-6 bg-slate-50/50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-700 mb-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">인증 허용 반경</label>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-primary">{farmData.attendanceRadius || 100}</span>
                                                    <span className="text-sm font-bold text-slate-400 uppercase">m</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="1000"
                                                step="10"
                                                value={farmData.attendanceRadius || 100}
                                                onChange={(e) => setFarmData({ ...farmData, attendanceRadius: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                <span>50m</span>
                                                <span>500m</span>
                                                <span>1000m</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-2xl">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                <Info size={14} className="inline mr-1.5 mb-0.5 text-primary" />
                                                우측 지도의 <b>파란색 원형 영역</b> 내에서만 출퇴근 인증이 허용됩니다.
                                                <br />정확한 인증을 위해 농장 건물이나 입구를 중심으로 반경을 넉넉히 설정(최소 100~300m 권장)하는 것이 좋습니다.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time Setting Column */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm"><RefreshCw size={24} /></div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">출근 허용 시간</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">직원이 스마트폰으로 출근 인증을 할 수 있는 시간을 지정합니다. <b>비워둘 경우 시간에 구애받지 않고 언제든 출근이 가능합니다.</b></p>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* 출근 시작 시간 선택 */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">출근 시작 시간</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.attendanceStartTime ? farmData.attendanceStartTime.split(':')[0] : ''}
                                                            onChange={(e) => {
                                                                const h = e.target.value;
                                                                if (!h) {
                                                                    setFarmData({ ...farmData, attendanceStartTime: null });
                                                                    return;
                                                                }
                                                                const currentNum = farmData.attendanceStartTime ? farmData.attendanceStartTime.split(':')[1] : '00';
                                                                setFarmData({ ...farmData, attendanceStartTime: `${h}:${currentNum}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 24 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">시</div>
                                                    </div>
                                                    <span className="text-slate-400 font-bold">:</span>
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.attendanceStartTime ? farmData.attendanceStartTime.split(':')[1] : ''}
                                                            onChange={(e) => {
                                                                const m = e.target.value;
                                                                if (!m) {
                                                                    setFarmData({ ...farmData, attendanceStartTime: null });
                                                                    return;
                                                                }
                                                                const currentHr = farmData.attendanceStartTime ? farmData.attendanceStartTime.split(':')[0] : '09';
                                                                setFarmData({ ...farmData, attendanceStartTime: `${currentHr}:${m}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 60 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">분</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 출근 마감 시간 선택 */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">출근 마감 시간</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.attendanceEndTime ? farmData.attendanceEndTime.split(':')[0] : ''}
                                                            onChange={(e) => {
                                                                const h = e.target.value;
                                                                if (!h) {
                                                                    setFarmData({ ...farmData, attendanceEndTime: null });
                                                                    return;
                                                                }
                                                                const currentNum = farmData.attendanceEndTime ? farmData.attendanceEndTime.split(':')[1] : '00';
                                                                setFarmData({ ...farmData, attendanceEndTime: `${h}:${currentNum}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 24 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">시</div>
                                                    </div>
                                                    <span className="text-slate-400 font-bold">:</span>
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.attendanceEndTime ? farmData.attendanceEndTime.split(':')[1] : ''}
                                                            onChange={(e) => {
                                                                const m = e.target.value;
                                                                if (!m) {
                                                                    setFarmData({ ...farmData, attendanceEndTime: null });
                                                                    return;
                                                                }
                                                                const currentHr = farmData.attendanceEndTime ? farmData.attendanceEndTime.split(':')[0] : '18';
                                                                setFarmData({ ...farmData, attendanceEndTime: `${currentHr}:${m}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 60 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">분</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Record Time Setting Column */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm"><Settings size={24} /></div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">기준 출근 기록 시간 지정</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">반경 내 <b>정상출근</b>한 직원의 출결 시간을 지정한 시각으로 기록합니다.<br />비워둘 경우 <b>실제 스마트폰 인증 시각</b>으로 기록됩니다.</p>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* 정규직 기준 시간 선택 */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">정규직 출근 기록</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.regularEmployeeStartTime ? farmData.regularEmployeeStartTime.split(':')[0] : ''}
                                                            onChange={(e) => {
                                                                const h = e.target.value;
                                                                if (!h) {
                                                                    setFarmData({ ...farmData, regularEmployeeStartTime: null });
                                                                    return;
                                                                }
                                                                const currentNum = farmData.regularEmployeeStartTime ? farmData.regularEmployeeStartTime.split(':')[1] : '00';
                                                                setFarmData({ ...farmData, regularEmployeeStartTime: `${h}:${currentNum}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 24 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">시</div>
                                                    </div>
                                                    <span className="text-slate-400 font-bold">:</span>
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.regularEmployeeStartTime ? farmData.regularEmployeeStartTime.split(':')[1] : ''}
                                                            onChange={(e) => {
                                                                const m = e.target.value;
                                                                if (!m) {
                                                                    setFarmData({ ...farmData, regularEmployeeStartTime: null });
                                                                    return;
                                                                }
                                                                const currentHr = farmData.regularEmployeeStartTime ? farmData.regularEmployeeStartTime.split(':')[0] : '08';
                                                                setFarmData({ ...farmData, regularEmployeeStartTime: `${currentHr}:${m}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 60 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">분</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 비정규직 기준 시간 선택 */}
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">비정규직 출근 기록</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.partTimeEmployeeStartTime ? farmData.partTimeEmployeeStartTime.split(':')[0] : ''}
                                                            onChange={(e) => {
                                                                const h = e.target.value;
                                                                if (!h) {
                                                                    setFarmData({ ...farmData, partTimeEmployeeStartTime: null });
                                                                    return;
                                                                }
                                                                const currentNum = farmData.partTimeEmployeeStartTime ? farmData.partTimeEmployeeStartTime.split(':')[1] : '00';
                                                                setFarmData({ ...farmData, partTimeEmployeeStartTime: `${h}:${currentNum}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 24 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">시</div>
                                                    </div>
                                                    <span className="text-slate-400 font-bold">:</span>
                                                    <div className="relative flex-1">
                                                        <select
                                                            value={farmData.partTimeEmployeeStartTime ? farmData.partTimeEmployeeStartTime.split(':')[1] : ''}
                                                            onChange={(e) => {
                                                                const m = e.target.value;
                                                                if (!m) {
                                                                    setFarmData({ ...farmData, partTimeEmployeeStartTime: null });
                                                                    return;
                                                                }
                                                                const currentHr = farmData.partTimeEmployeeStartTime ? farmData.partTimeEmployeeStartTime.split(':')[0] : '08';
                                                                setFarmData({ ...farmData, partTimeEmployeeStartTime: `${currentHr}:${m}` });
                                                            }}
                                                            className="w-full pl-4 pr-1 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono appearance-none"
                                                        >
                                                            <option value="">--</option>
                                                            {Array.from({ length: 60 }).map((_, i) => (
                                                                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs font-bold">분</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Column */}
                                <div className="xl:col-span-12 2xl:col-span-7 h-[500px] xl:h-[600px] 2xl:h-auto min-h-[450px]">
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-zinc-800 h-full relative group">
                                        <div className="h-full rounded-[24px] overflow-hidden border border-slate-100 dark:border-zinc-800">
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
                                            <div className="absolute top-6 right-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2 flex items-center gap-2 rounded-xl shadow-xl border border-white/20 text-xs font-bold text-slate-800 dark:text-slate-200">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                <MapPin size={14} className="text-primary" /> {farmData.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[600px]">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <Settings size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">설정할 농장을 선택해 주세요</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">좌측 목록에서 출퇴근 인증 반경을 설정할 농장을 선택하면 상세 지도와 설정 도구가 나타납니다.</p>
                            <div className="animate-bounce text-primary"><Search size={24} /></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceSetting;
