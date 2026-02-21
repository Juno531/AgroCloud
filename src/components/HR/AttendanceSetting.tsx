import { useState, useEffect, useCallback, Suspense } from 'react';
import { MapPin, Save, Search, Settings, RefreshCw, Info, Trash, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { FarmService } from '../../services/api';
import KakaoMap from '../../components/Map/KakaoMap';
import SuspenseLoader from '../../components/UI/SuspenseLoader';

const AttendanceSetting: React.FC = () => {
    const { user } = useAuth();
    const { fields, refreshData, loading: contextLoading } = useFarm();
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
    const [farmData, setFarmData] = useState<any>(null);
    const [isFetchingIp, setIsFetchingIp] = useState(false);

    useEffect(() => {
        if (fields && fields.length > 0 && !selectedFarmId) {
            const firstFarm = fields[0];
            if (firstFarm) {
                setSelectedFarmId(firstFarm.id);
            }
        }
    }, [fields, selectedFarmId]);

    useEffect(() => {
        if (selectedFarmId && fields.length > 0) {
            const selected = fields.find(f => f.id === Number(selectedFarmId));
            if (selected) {
                setFarmData({ ...selected });
            }
        }
    }, [selectedFarmId, fields]);

    const handleFarmUpdate = useCallback(async () => {
        if (!farmData) return;
        setSaveLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await FarmService.updateFarm(farmData.id, farmData);
            await refreshData();
            setMessage({ type: 'success', text: `[${farmData.name}] 출퇴근 설정이 정상적으로 저장되었습니다.` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to update attendance setting:', error);
            setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
        } finally {
            setSaveLoading(false);
        }
    }, [farmData, refreshData]);

    const handleFetchCurrentIp = async () => {
        setIsFetchingIp(true);
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            if (data.ip) {
                setFarmData((prev: any) => ({
                    ...prev,
                    attendanceIpAddress: data.ip
                }));
                setMessage({ type: 'success', text: `현재 공인 IP(${data.ip})를 불러왔습니다. 우측 상단의 설정을 저장하세요.` });
            }
        } catch (error) {
            console.error('Failed to fetch IP', error);
            setMessage({ type: 'error', text: '공인 IP 주소를 가져오는데 실패했습니다.' });
        } finally {
            setIsFetchingIp(false);
        }
    };

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
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
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
                                    <div className="mt-2 flex gap-1">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded text-slate-600 font-medium">GPS: {farm.attendanceRadius || 100}m</span>
                                        {farm.attendanceIpAddress && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 rounded text-purple-600 font-medium truncate max-w-[100px]">IP: On</span>
                                        )}
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
                        <>
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{farmData.name} 출퇴근 인증 설정</h2>
                                    <p className="text-slate-500 text-sm">GPS 반경 또는 특정 Wi-Fi 연결을 통한 출퇴근 허용 범위를 지정합니다.</p>
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

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                                {/* GPS Setting */}
                                <div className="flex flex-col gap-4">
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800 h-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><MapPin size={16} /></div>
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">GPS 기반 허용 반경 설정</h4>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6">농장 중심 좌표로부터 직원이 출퇴근을 인증할 수 있는 최대 반경 거리를 설정합니다.</p>

                                        <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700 mb-6">
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

                                        <div className="h-[200px] rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 relative">
                                            <Suspense fallback={<SuspenseLoader />}>
                                                <KakaoMap
                                                    latitude={Number(farmData.latitude) || 37.566826}
                                                    longitude={Number(farmData.longitude) || 126.9786567}
                                                    markerPosition={{
                                                        lat: Number(farmData.latitude) || 37.566826,
                                                        lng: Number(farmData.longitude) || 126.9786567
                                                    }}
                                                    draggableMarker={false}
                                                    circleRadius={farmData.attendanceRadius || 100}
                                                    height="100%"
                                                />
                                            </Suspense>
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 flex items-center gap-1 rounded shadow text-[10px] font-bold text-slate-600">
                                                <MapPin size={10} className="text-emerald-500" /> {farmData.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* IP Setting */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Globe size={16} /></div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">지정 IP 인증 설정 (사내 망)</h4>
                                </div>
                                <p className="text-sm text-slate-500 mb-6">특정 공인 IP(회사 인터넷)에서만 출퇴근이 가능하게 엄격히 통제합니다. IP가 등록되어 있으면 해당 IP에서만 출근/퇴근 기록이 가능합니다.</p>

                                {/* Current IP Status */}
                                <div className="mb-6">
                                    {farmData.attendanceIpAddress ? (
                                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl relative overflow-hidden">
                                            <div className="absolute right-0 top-0 h-full w-2 bg-purple-500"></div>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="text-xs text-purple-600 font-bold mb-1 uppercase tracking-wider">현재 허용된 인증 IP</div>
                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                                                        {farmData.attendanceIpAddress}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setFarmData({ ...farmData, attendanceIpAddress: null })}
                                                    className="p-2 hover:bg-white rounded transition-colors text-slate-400 hover:text-rose-500"
                                                    title="등록 취소"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-dashed border-slate-300 dark:border-zinc-600 flex items-center gap-3">
                                            <Globe className="text-slate-400" size={24} />
                                            <div>
                                                <div className="font-bold text-slate-600 dark:text-slate-300 text-sm">등록된 지정 IP가 없습니다.</div>
                                                <div className="text-xs text-slate-500 mt-1">아래 입력창에 IP를 직접 입력하거나 자동 불러오기를 누르세요.</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">허용할 공인 IP 주소</label>
                                        <input
                                            type="text"
                                            value={farmData.attendanceIpAddress || ''}
                                            onChange={(e) => setFarmData({ ...farmData, attendanceIpAddress: e.target.value })}
                                            placeholder="예: 123.456.78.90 (비워두면 IP 통제 사용 안 함, 콤마(,)로 여러개 구분 가능)"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleFetchCurrentIp}
                                        disabled={isFetchingIp}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[42px]"
                                    >
                                        <RefreshCw size={16} className={isFetchingIp ? 'animate-spin' : ''} />
                                        <span>내 기기 IP 불러오기</span>
                                    </button>
                                </div>
                                <div className="mt-3 text-[10px] flex items-start gap-1 text-slate-400">
                                    <Info size={12} className="flex-shrink-0 mt-0.5" />
                                    <p>[내 기기 IP 불러오기]를 누르면 현재 관리자가 접속 중인 유무선 네트워크의 외부 공인 IP가 자동으로 기입됩니다. 회사 사무실의 와이파이 환경에서 이 버튼을 눌러 쉽게 세팅하세요.</p>
                                </div>
                            </div>
                        </>
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
