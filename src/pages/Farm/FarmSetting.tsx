import { useState, useEffect, useCallback, Suspense } from 'react';
import { MapPin, Navigation, Save, Search, Settings, RefreshCw, Ruler, Info, Plus } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';
import { useFarm } from '../../context/FarmContext';
import { FarmService } from '../../services/api';
import DaumPostcode from 'react-daum-postcode';
import KakaoMap from '../../components/Map/KakaoMap';
import SuspenseLoader from '../../components/UI/SuspenseLoader';

/**
 * FarmSetting Page Component
 * Refactored to follow modern frontend guidelines:
 * - Uses shared KakaoMap component for consistency and stability
 * - Leverages Suspense for loading states
 * - Memoized handlers with useCallback
 * - Uses Tailwind-like styling via standard CSS
 */
const FarmSetting: React.FC = () => {
    const { setTitle } = useLayout();
    const { user } = useAuth();
    const { fields, refreshData, loading: contextLoading, removeField } = useFarm();
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
    const [farmData, setFarmData] = useState<any>(null);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    useEffect(() => {
        setTitle('농장 설정');
    }, [setTitle]);

    // Set initial selected farm from context fields
    useEffect(() => {
        if (fields && fields.length > 0 && !selectedFarmId) {
            const firstFarm = fields[0];
            if (firstFarm) {
                setSelectedFarmId(firstFarm.id);
            }
        }
    }, [fields, selectedFarmId]);

    // Sync local farmData when selection changes
    useEffect(() => {
        if (selectedFarmId && fields.length > 0) {
            const selected = fields.find(f => f.id === Number(selectedFarmId));
            if (selected) {
                setFarmData({ ...selected }); // Clone to avoid direct mutation
            }
        }
    }, [selectedFarmId, fields]);


    const handleFarmUpdate = useCallback(async () => {
        if (!farmData) return;
        setSaveLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await FarmService.updateFarm(farmData.id, farmData);
            await refreshData(); // Refresh global farm context
            setMessage({ type: 'success', text: `[${farmData.name}] 설정이 성공적으로 저장되었습니다.` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to update farm data:', error);
            setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
        } finally {
            setSaveLoading(false);
        }
    }, [farmData, refreshData]);

    const handleCompletePostcode = useCallback((data: any) => {
        let fullAddress = data.address;
        if (data.addressType === 'R') {
            let extraAddress = '';
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setFarmData((prev: any) => ({ ...prev, location: fullAddress }));
        setIsPostcodeOpen(false);

        // Geocode the address to coordinates
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(fullAddress, (result: any, status: any) => {
                console.log('Geocoder result:', status, result);
                if (status === window.kakao.maps.services.Status.OK) {
                    const lat = parseFloat(result[0].y);
                    const lng = parseFloat(result[0].x);
                    console.log('Parsed coordinates:', lat, lng);
                    setFarmData((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));

                    // Reverse geocode to strictly get the administrative (parcel) address
                    geocoder.coord2Address(lng, lat, (reverseResult: any, reverseStatus: any) => {
                        if (reverseStatus === window.kakao.maps.services.Status.OK && reverseResult.length > 0) {
                            // Strictly prioritize 'address' (parcel/administrative address) for farms
                            // Parcel address is more accurate for farm locations in rural areas.
                            const parcelAddress = reverseResult[0].address ? reverseResult[0].address.address_name : '';
                            const roadAddress = reverseResult[0].road_address ? reverseResult[0].road_address.address_name : '';

                            // Prefer parcel address for farm data consistency
                            setFarmData((prev: any) => ({
                                ...prev,
                                location: parcelAddress || roadAddress || fullAddress
                            }));
                        } else {
                            console.warn('Reverse geocoding failed for coordinates:', lat, lng, reverseStatus);
                        }
                    });
                } else {
                    console.warn('Geocoding failed for address:', fullAddress, status);
                }
            });
        } else {
            console.error('Kakao maps services not loaded');
        }
    }, []);

    const handleDeleteFarm = useCallback(async () => {
        if (!farmData || !selectedFarmId) return;

        if (window.confirm(`'${farmData.name}' 농장을 정말 삭제하시겠습니까?\n삭제된 농장은 복구할 수 없습니다.`)) {
            try {
                await removeField(Number(selectedFarmId));
                setMessage({ type: 'success', text: '농장이 성공적으로 삭제되었습니다.' });
                setSelectedFarmId(''); // Clear selection
                setFarmData(null); // Clear data
            } catch (error) {
                console.error('Failed to delete farm:', error);
                setMessage({ type: 'error', text: '농장 삭제 중 오류가 발생했습니다.' });
            }
        }
    }, [farmData, selectedFarmId, removeField]);

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
                    <p className="text-slate-500">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left: Interactive List */}
                <div className="lg:w-[380px] flex flex-col gap-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-zinc-800 flex flex-col h-fit max-h-[calc(100vh-140px)] min-h-[200px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                                <Settings className="text-primary" size={24} /> 농장 설정
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.location.href = '/farm/setting/add'}
                                    className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-all text-primary"
                                    title="농장 추가"
                                >
                                    <Plus size={20} />
                                </button>
                                <button
                                    onClick={() => refreshData()}
                                    className={`p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-full transition-all ${contextLoading ? 'animate-spin' : ''}`}
                                    title="목록 새로고침"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
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

                {/* Right: Detailed Settings Panel */}
                <div className="flex-1 flex flex-col gap-6">
                    {farmData ? (
                        <>
                            {/* Header Widget */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-1">[{farmData.name}] 설정</h2>

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

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                                {/* Settings Column */}
                                <div className="xl:col-span-5 flex flex-col gap-6">
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
                                        <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <Ruler className="text-primary" size={20} /> 주소 설정
                                        </h4>

                                        {/* Address Section */}
                                        <div className="mb-8">
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">농장 대표 주소</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="text"
                                                        value={farmData.location || ''}
                                                        readOnly
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm outline-none font-semibold cursor-default"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setIsPostcodeOpen(true)}
                                                    className="px-4 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                                                >
                                                    <Search size={20} />
                                                </button>
                                            </div>
                                            {isPostcodeOpen && (
                                                <div className="mt-3 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden animate-in zoom-in-95">
                                                    <DaumPostcode onComplete={handleCompletePostcode} />
                                                    <button
                                                        onClick={() => setIsPostcodeOpen(false)}
                                                        className="w-full py-2 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-100 dark:border-zinc-800"
                                                    >
                                                        닫기
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Farm Main Address Information (Visual Highlight) */}
                                        <div className="mb-8">
                                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">설정된 농장 주소</label>
                                            <div className="p-5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg text-primary mt-1">
                                                        <MapPin size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-2">
                                                            {farmData.location || '주소를 설정해주세요'}
                                                        </p>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                                <span className="w-8 font-bold text-slate-400">LAT</span> {farmData.latitude?.toFixed(7) || '-'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                                <span className="w-8 font-bold text-slate-400">LNG</span> {farmData.longitude?.toFixed(7) || '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                                                지도의 마커를 움직이면 주소와 좌표가 자동으로 갱신됩니다.
                                                <br />정확한 위치를 확인한 후 상단의 [설정 저장] 버튼을 눌러주세요.
                                            </p>
                                        </div>


                                    </div>

                                    {/* Danger Zone */}
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-rose-100 dark:border-rose-900/30">
                                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                            농장을 삭제하면 관련된 설정이 영구적으로 제거될 수 있습니다.
                                        </p>
                                        <button
                                            onClick={handleDeleteFarm}
                                            className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-colors border border-rose-100 hover:border-rose-200"
                                        >
                                            농장 삭제하기
                                        </button>
                                    </div>
                                </div>

                                {/* Map Column */}
                                <div className="xl:col-span-7 h-[400px] xl:h-[600px] min-h-[500px]">
                                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-zinc-800 h-full relative group">
                                        <div className="w-full h-full rounded-[24px] overflow-hidden flex flex-col border border-slate-100 dark:border-zinc-800">
                                            <div className="flex-1 relative">
                                                <Suspense fallback={<SuspenseLoader />}>
                                                    <KakaoMap
                                                        latitude={Number(farmData.latitude) || 37.566826}
                                                        longitude={Number(farmData.longitude) || 126.9786567}
                                                        markerPosition={{
                                                            lat: Number(farmData.latitude) || 37.566826,
                                                            lng: Number(farmData.longitude) || 126.9786567
                                                        }}
                                                        draggableMarker={true}
                                                        onMapClick={(lat: number, lng: number) => {
                                                            setFarmData((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));
                                                        }}
                                                        onMarkerDragEnd={(lat: number, lng: number) => {
                                                            setFarmData((prev: any) => ({ ...prev, latitude: lat, longitude: lng }));
                                                        }}
                                                        onAddressChange={(address: string) => {
                                                            setFarmData((prev: any) => ({ ...prev, location: address }));
                                                        }}
                                                        address={farmData.location}
                                                        circleRadius={farmData.attendanceRadius || 300}
                                                        height="100%"
                                                    />
                                                </Suspense>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between pointer-events-none">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                                        <Navigation size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Drag Marker</div>
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">마커를 드래그하여 정확한 출퇴근 위치를 조정하세요.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[600px]">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                                <MapPin size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">농장을 선택해 주세요</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mb-8">좌측 목록에서 설정을 변경할 농장을 선택하면 상세 설정 및 반경 조정이 가능합니다.</p>
                            <div className="flex gap-4">
                                <div className="animate-bounce text-primary"><Search size={24} /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FarmSetting;
