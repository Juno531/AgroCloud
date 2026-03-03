import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, MapPin, AlertTriangle, RefreshCw, Crosshair, Globe } from 'lucide-react';
import { AttendanceService, FarmService } from '../../services/api';
import { useLayout } from '../../context/LayoutContext';
import '../../styles/Attendance.css';

interface Farm {
    id: number;
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
    attendanceRadius?: number;
}

const Attendance = () => {
    const { setTitle } = useLayout();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [farms, setFarms] = useState<Farm[]>([]);
    const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [currentStatus, setCurrentStatus] = useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);
    const [recordStatus, setRecordStatus] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>('위치 확인 중...');
    const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
    const [currentIp, setCurrentIp] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const watchIdRef = useRef<number | null>(null);
    const pressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isPressing, setIsPressing] = useState(false);
    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [reasonText, setReasonText] = useState('');
    const [actionType, setActionType] = useState<'CLOCK_IN' | 'CLOCK_OUT' | null>(null);

    useEffect(() => {
        setTitle('출퇴근 기록');
        fetchFarms();
        fetchUserStatus();
        fetchCurrentIp();
    }, [setTitle]);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Start high-precision location tracking on mount
    useEffect(() => {
        startLocationTracking();
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const fetchLocationName = async (lat: number, lon: number, accuracy?: number) => {
        try {
            console.log(`Fetching address for Lat: ${lat}, Lon: ${lon}, Accuracy: ${accuracy}m`);
            // Add zoom level 18 for better precision and language preference
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=ko`);
            const data = await res.json();

            if (data && data.address) {
                const addr = data.address;
                // Korean address components: city (city/county), suburb (dong/eup/myeon), road (road name)
                const city = addr.city || addr.town || addr.city_district || '';
                const suburb = addr.suburb || addr.neighbourhood || addr.village || '';
                const road = addr.road || '';
                const houseNumber = addr.house_number || '';

                const formattedAddress = [city, suburb, road, houseNumber].filter(Boolean).join(' ');
                setLocationName(`${formattedAddress || data.display_name.split(',').slice(0, 3).reverse().join(' ')} (오차: ±${Math.round(accuracy || 0)}m)`);
            } else if (data && data.display_name) {
                const parts = data.display_name.split(', ');
                const shortAddress = parts.slice(0, 3).reverse().join(' ');
                setLocationName(`${shortAddress} (오차: ±${Math.round(accuracy || 0)}m)`);
            } else {
                setLocationName(`위도: ${lat.toFixed(4)}, 경도: ${lon.toFixed(4)} (오차: ±${Math.round(accuracy || 0)}m)`);
            }
        } catch (e) {
            console.error('Reverse geocoding error:', e);
            setLocationName(`위도: ${lat.toFixed(4)}, 경도: ${lon.toFixed(4)} (오차: ±${Math.round(accuracy || 0)}m)`);
        }
    };

    const fetchCurrentIp = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            if (data.ip) {
                setCurrentIp(data.ip);
            }
        } catch (e) {
            console.error('Failed to fetch IP:', e);
        }
    };

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            setLocationName('브라우저가 위치 정보를 지원하지 않습니다.');
            setIsLocating(false);
            return;
        }

        setIsLocating(true);
        setLocationName('고정밀 GPS/Wi-Fi 탐색 중...');

        // Clear existing watch if any
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        // Use watchPosition for continuous, high-accuracy tracking
        // OS Level API will use GPS chipset + Wi-Fi AP database when enableHighAccuracy is true
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                console.log(`[Location Update] Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}, Accuracy: ${pos.coords.accuracy}m`);
                setCurrentCoordinates({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                });

                // Only reverse geocode if accuracy is reasonable (or if it's the first time) to avoid API spam
                // We'll update coordinates silently, but fetch the Korean address roughly
                fetchLocationName(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
                setIsLocating(false);
            },
            (err) => {
                console.error('Location tracking error:', err);
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationName('위치 정보 권한이 거부되었습니다.');
                } else {
                    setLocationName('위치 신호를 찾을 수 없습니다.');
                }
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true, // Forces hardware GPS + Wi-Fi scanning
                timeout: 20000,           // Wait up to 20s for a lock
                maximumAge: 0             // Do not use cached positions, force fresh read
            }
        );
    };

    const refreshLocationManually = () => {
        // Prevent spam clicking
        if (isLocating) return;

        if (locationName === '위치 정보 권한이 거부되었습니다.') {
            alert('위치 정보 권한이 거부된 상태입니다.\n브라우저 주소창 왼쪽의 자물쇠(또는 설정) 아이콘을 눌러 위치 권한을 허용으로 변경한 뒤 다시 시도해주세요.');
        }

        setIsLocating(true);
        setLocationName('위치 정보 재탐색 중...');

        // Re-start tracking to force a fresh hard-lock
        startLocationTracking();
    };

    const fetchFarms = async () => {
        try {
            // Request a larger size to ensure all company farms are listed in the dropdown
            const response = await FarmService.getAllFarms({ size: 100 });
            const farmList = response.data.data.content || [];
            setFarms(farmList);
            if (farmList.length > 0) {
                // If there's only one farm, select it automatically. 
                // Otherwise, let the user choose (or default to first).
                setSelectedFarmId(farmList[0].id);
            } else {
                setStatusMessage({ type: 'info', text: '등록된 농장이 없습니다. 관리자에게 문의하세요.' });
            }
        } catch (error) {
            console.error("Failed to fetch farms:", error);
            setStatusMessage({ type: 'error', text: '농장 정보를 불러오는데 실패했습니다.' });
        }
    };

    const fetchUserStatus = async () => {
        try {
            const response = await AttendanceService.getUserStatus();
            if (response.data) {
                setCurrentStatus(response.data.type as 'CLOCK_IN' | 'CLOCK_OUT');
                setRecordStatus(response.data.status);
            } else {
                setCurrentStatus('CLOCK_OUT');
                setRecordStatus(null);
            }
        } catch (error) {
            console.error("Failed to fetch status:", error);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    const getDistanceText = () => {
        if (!selectedFarmId || !currentCoordinates || farms.length === 0) return null;

        const selectedFarm = farms.find(f => f.id === selectedFarmId);
        if (!selectedFarm || !selectedFarm.latitude || !selectedFarm.longitude) return null;

        const distance = calculateDistance(
            currentCoordinates.lat,
            currentCoordinates.lon,
            selectedFarm.latitude,
            selectedFarm.longitude
        );

        const radius = selectedFarm.attendanceRadius || 300;
        const isWithinRadius = distance <= radius;

        return {
            distance: Math.round(distance),
            isWithinRadius,
            radius
        };
    };

    const distanceInfo = getDistanceText();

    const handleAttendance = async (type: 'CLOCK_IN' | 'CLOCK_OUT', reason?: string, remarks?: string, isForceOutside = false) => {
        if (!selectedFarmId) {
            setStatusMessage({ type: 'error', text: '농장을 선택해주세요.' });
            return;
        }

        if (isLocating || !currentCoordinates) {
            setStatusMessage({ type: 'error', text: '정확한 위치 정보를 가져오는 중입니다. 잠시 후 ↻ 버튼을 눌러 다시 시도해주세요.' });
            return;
        }

        if (!distanceInfo?.isWithinRadius && !isForceOutside) {
            setStatusMessage({ type: 'error', text: '반경 밖입니다. 외근 등의 사유가 있다면 버튼을 길게 눌러주세요.' });
            return;
        }

        setIsLoading(true);
        setStatusMessage({ type: 'info', text: '서버에 요청 중입니다...' });

        try {
            const { lat: latitude, lon: longitude } = currentCoordinates;

            const response = await AttendanceService.recordAttendance({
                type,
                farmId: Number(selectedFarmId),
                latitude,
                longitude,
                reason,
                remarks,
                isForceOutside
            });

            const actionName = type === 'CLOCK_IN' ? '출근' : '퇴근';
            const timeStr = new Date(response.data.timestamp).toLocaleTimeString();

            if (response.data.status === 'PENDING') {
                setStatusMessage({ type: 'info', text: `⏳ ${actionName} 승인 대기 중입니다. 관리자 승인 시 완료됩니다. (${timeStr})` });
            } else {
                setStatusMessage({ type: 'success', text: `✅ ${actionName} 처리가 완료되었습니다. (${timeStr})` });
            }
            setCurrentStatus(type);
            setRecordStatus(response.data.status);

        } catch (error: any) {
            console.error('Attendance recording failed:', error);
            if (error.response) {
                console.error('Server response data:', error.response.data);
                console.error('Server response status:', error.response.status);
            }

            let errorMessage = '출퇴근 처리 중 오류가 발생했습니다.';

            if (error.code === 1) errorMessage = '위치 정보 권한이 거부되었습니다.';
            else if (error.code === 2) errorMessage = '위치 정보를 가져올 수 없습니다.';
            else if (error.code === 3) errorMessage = '위치 정보 확인 시간이 초과되었습니다.';
            else if (error.response?.data?.message) errorMessage = error.response.data.message;

            setStatusMessage({ type: 'error', text: `❌ ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressStart = () => {
        if (isLoading || isLocating) return;
        setIsPressing(true);
        pressTimer.current = setTimeout(() => {
            setIsPressing(false);
            pressTimer.current = null;
            // 길게 누르면 무조건 사유 입력 모달이 뜨도록 설정 (테스트 및 예외 처리 용이)
            setActionType(currentStatus === 'CLOCK_IN' ? 'CLOCK_OUT' : 'CLOCK_IN');
            setIsReasonModalOpen(true);
        }, 800); // 0.8초 누르면 작동
    };

    const handlePressEnd = () => {
        setIsPressing(false);
        if (pressTimer.current) {
            // 짧게 누른경우
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
            handleAttendance(currentStatus === 'CLOCK_IN' ? 'CLOCK_OUT' : 'CLOCK_IN');
        }
    };

    const handleReasonSubmit = () => {
        if (!reasonText.trim()) {
            setStatusMessage({ type: 'error', text: '사유를 입력해주세요.' });
            return;
        }
        setIsReasonModalOpen(false);
        if (actionType) {
            handleAttendance(actionType, reasonText, undefined, true);
        }
        setReasonText('');
        setActionType(null);
    };

    return (
        <div className="flex flex-col items-center w-full min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 font-sans">
            <div className="w-full max-w-[430px] flex flex-col gap-4">

                {/* ── 1. 현재 시간 (Refined Organic Light) ── */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 z-10">
                        <Clock size={18} />
                        <span className="font-bold tracking-wider text-sm">
                            {currentTime.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-black tracking-tighter text-slate-800 dark:text-white z-10 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h2>
                </div>

                {/* ── 2. 내 위치 정보 ── */}
                <div className="w-full bg-white dark:bg-zinc-900 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    {isLocating && (
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse -z-0"></div>
                    )}

                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-zinc-700 z-10 relative">
                        {isLocating ? (
                            <Crosshair size={24} className="text-emerald-500 animate-[spin_3s_linear_infinite]" />
                        ) : (
                            <MapPin size={24} className="text-emerald-600 dark:text-emerald-400" />
                        )}

                        <span className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm
                            ${isLocating ? 'bg-amber-400' : (currentCoordinates?.accuracy && currentCoordinates.accuracy <= 50) ? 'bg-emerald-500' : 'bg-rose-500'}
                        `}></span>
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                현재 내 위치
                                {isLocating && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping ml-1"></span>}
                            </p>
                            {currentCoordinates && !isLocating && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md 
                                    ${currentCoordinates.accuracy <= 50 ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-700 bg-rose-50 dark:bg-rose-500/10'}
                                `}>
                                    오차 ±{Math.round(currentCoordinates.accuracy)}m
                                </span>
                            )}
                        </div>
                        <p className={`text-sm font-bold truncate transition-colors duration-300
                            ${isLocating ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}
                        `}>
                            {locationName}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            <Globe size={10} />
                            IP: {currentIp || '확인 중...'}
                        </div>
                    </div>
                    <button
                        onClick={refreshLocationManually}
                        disabled={isLocating}
                        className={`p-3 rounded-xl transition-all active:scale-95 z-10
                            ${isLocating
                                ? 'text-slate-300 bg-transparent cursor-not-allowed'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'}
                        `}
                        title="GPS 재탐색"
                    >
                        <RefreshCw size={20} className={isLocating ? "animate-spin" : ""} />
                    </button>

                    {!isLocating && currentCoordinates && currentCoordinates.accuracy > 100 && (
                        <div className="absolute font-bold items-center gap-1.5 bottom-0 left-0 right-0 bg-rose-500/90 text-white text-[10px] py-1 px-3 flex justify-center z-20 backdrop-blur-sm">
                            <AlertTriangle size={12} />
                            오차가 큽니다. Wi-Fi를 켜주세요.
                        </div>
                    )}
                </div>

                {/* ── 3. 근무 농장 선택 ── */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-teal-500/5 blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/20 flex items-center justify-center">
                                <MapPin size={16} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">근무 농장 선택</span>
                        </div>

                        {distanceInfo && (
                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${distanceInfo.isWithinRadius
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                }`}>
                                {distanceInfo.isWithinRadius
                                    ? <CheckCircle size={13} />
                                    : <AlertTriangle size={13} />}
                                {distanceInfo.distance > 1000
                                    ? `${(distanceInfo.distance / 1000).toFixed(1)}km`
                                    : `${distanceInfo.distance}m`}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <select
                            value={selectedFarmId}
                            onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                            disabled={farms.length === 0}
                            className={`w-full px-4 py-3 sm:py-3.5 pr-10 rounded-xl text-xs sm:text-sm font-medium
                                bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700
                                text-slate-800 dark:text-white placeholder-slate-400
                                appearance-none outline-none
                                transition-all duration-200
                                focus:border-teal-500/60 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-teal-500/20
                                ${farms.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-300'}
                            `}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%230f766e' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 14px center',
                                backgroundSize: '16px',
                            }}
                        >
                            {farms.length === 0 ? (
                                <option value="">배정된 농장이 없습니다</option>
                            ) : (
                                farms.map(farm => (
                                    <option key={farm.id} value={farm.id} className="text-slate-800 dark:text-zinc-200">
                                        {farm.name} {farm.location ? `(${farm.location})` : ''}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {distanceInfo && !distanceInfo.isWithinRadius && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                            <AlertTriangle size={12} />
                            허용 반경({distanceInfo.radius}m)을 벗어났습니다.
                        </div>
                    )}
                </div>

                {/* 상태 메시지 알람 */}
                {statusMessage && (
                    <div className={`p-4 rounded-2xl mb-2 flex items-center gap-3 text-sm font-bold border shadow-sm
                        ${statusMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'}
                    `}>
                        {statusMessage.type === 'error' ? <XCircle size={20} /> : statusMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* ── 4. 가로형 상태 바 & 출퇴근 버튼 ── */}
                <div className="w-full mt-4 mb-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-1.5 shadow-xl border border-slate-100 dark:border-zinc-800 flex items-stretch gap-2 min-h-[100px] overflow-hidden relative">
                        {/* Glass Layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 dark:from-zinc-900/40 dark:to-zinc-900/10 backdrop-blur-sm -z-0"></div>

                        {/* Current Status Section */}
                        <div className="flex-1 flex flex-col justify-center items-center p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-800/50 border border-slate-100/50 dark:border-zinc-700/50 z-10">
                            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-2">현재 상태</span>
                            <div className="flex items-center gap-2">
                                {recordStatus === 'PENDING' ? (
                                    <>
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"></div>
                                        <span className="text-lg font-black text-orange-600 dark:text-orange-400">승인 대기</span>
                                    </>
                                ) : currentStatus === 'CLOCK_IN' ? (
                                    <>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">근무 중</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-600"></div>
                                        <span className="text-lg font-black text-slate-600 dark:text-zinc-400">퇴근 상태</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Button Section */}
                        <button
                            onMouseDown={handlePressStart}
                            onMouseUp={handlePressEnd}
                            onMouseLeave={handlePressEnd}
                            onTouchStart={handlePressStart}
                            onTouchEnd={handlePressEnd}
                            disabled={isLoading || isLocating || recordStatus === 'PENDING'}
                            className={`
                                flex-[1.2] flex flex-col items-center justify-center p-4 rounded-2xl z-10
                                transition-all duration-300 active:scale-[0.98] 
                                ${recordStatus === 'PENDING'
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                                    : currentStatus === 'CLOCK_IN'
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                                        : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                {currentStatus === 'CLOCK_IN' ? <Clock size={20} /> : <CheckCircle size={20} />}
                                <span className="text-xl font-black">{currentStatus === 'CLOCK_IN' ? '퇴근하기' : '출근하기'}</span>
                            </div>
                            <span className={`text-[10px] font-bold mt-1 opacity-80 ${isPressing ? 'animate-bounce' : ''}`}>
                                {recordStatus === 'PENDING' ? '처리 대기 중' : '길게 누르면 사유 입력'}
                            </span>

                            {/* Inner Progress for Long Press */}
                            {isPressing && (
                                <div className="absolute bottom-0 left-0 h-1 bg-white/40 animate-[progress_0.8s_linear]" style={{ width: '100%' }}></div>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full text-slate-400 dark:text-slate-500 text-[13px] font-medium text-center pb-8 gap-1">
                    <p>📍 현재 위치를 기반으로 행동이 기록됩니다.</p>
                    <p>정확성을 위해 Wi-Fi를 켜두는 것을 권장합니다.</p>
                </div>

            </div>

            {/* 사유 입력 모달 */}
            {isReasonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-4">
                            <Clock size={24} />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                                {actionType === 'CLOCK_IN' ? '출근' : '퇴근'} 사유 입력 (외근 등)
                            </h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            근무지 반경을 벗어났습니다. 외근 등의 사유를 선택하여 승인을 요청해주세요.
                        </p>
                        <textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none mb-6 dark:text-white"
                            placeholder="사유를 입력해주세요."
                        ></textarea>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsReasonModalOpen(false);
                                    setReasonText('');
                                    setActionType(null);
                                }}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-700 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleReasonSubmit}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                승인 요청
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
