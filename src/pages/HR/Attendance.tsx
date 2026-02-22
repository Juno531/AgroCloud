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
    const [locationName, setLocationName] = useState<string>('위치 확인 중...');
    const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
    const [currentIp, setCurrentIp] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(true);
    const watchIdRef = useRef<number | null>(null);

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
            if (response.data && response.data !== 'NONE') {
                setCurrentStatus(response.data as 'CLOCK_IN' | 'CLOCK_OUT');
            } else {
                setCurrentStatus('CLOCK_OUT'); // Default if no record, assume clocked out
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

    const handleAttendance = async (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
        if (!selectedFarmId) {
            setStatusMessage({ type: 'error', text: '농장을 선택해주세요.' });
            return;
        }

        if (isLocating || !currentCoordinates) {
            setStatusMessage({ type: 'error', text: '정확한 위치 정보를 가져오는 중입니다. 잠시 후 ↻ 버튼을 눌러 다시 시도해주세요.' });
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
                longitude
            });

            const actionName = type === 'CLOCK_IN' ? '출근' : '퇴근';
            const timeStr = new Date(response.data.timestamp).toLocaleTimeString();

            setStatusMessage({ type: 'success', text: `✅ ${actionName} 처리가 완료되었습니다. (${timeStr})` });
            setCurrentStatus(type);

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

    return (
        <div className="attendance-container" style={{ paddingTop: 'var(--spacing-lg)' }}>
            <div className="attendance-content">
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-800 dark:to-zinc-900 text-white p-8 rounded-3xl shadow-xl w-full max-w-[430px] mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-2 text-slate-300 mb-2 z-10">
                        <Clock size={18} className="text-primary-400" />
                        <span className="font-bold tracking-wider text-sm">{currentTime.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-black tracking-tighter z-10 font-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h2>
                </div>

                <div className="w-full max-w-[430px] bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex items-center gap-4 mb-6 border border-indigo-100 dark:border-indigo-800/30 shadow-sm relative overflow-hidden">
                    {/* Ripple animation layer when actively scanning GPS */}
                    {isLocating && (
                        <div className="absolute inset-0 bg-indigo-500/5 animate-pulse -z-0"></div>
                    )}

                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center flex-shrink-0 shadow-inner z-10 relative">
                        {isLocating ? (
                            <Crosshair size={24} className="text-indigo-600 dark:text-indigo-400 animate-[spin_3s_linear_infinite]" />
                        ) : (
                            <MapPin size={24} className="text-indigo-600 dark:text-indigo-400" />
                        )}

                        {/* Status dot */}
                        <span className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-indigo-50 dark:border-[#1E1B4B] shadow-sm
                            ${isLocating ? 'bg-amber-400' : (currentCoordinates?.accuracy && currentCoordinates.accuracy <= 50) ? 'bg-emerald-500' : 'bg-rose-500'}
                        `}></span>
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                                현재 내 위치
                                {isLocating && <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping ml-1"></span>}
                            </p>
                            {currentCoordinates && !isLocating && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md 
                                    ${currentCoordinates.accuracy <= 50 ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}
                                `}>
                                    오차 ±{Math.round(currentCoordinates.accuracy)}m
                                </span>
                            )}
                        </div>
                        <p className={`text-sm font-bold truncate transition-colors duration-300
                            ${isLocating ? 'text-indigo-400 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}
                        `}>
                            {locationName}
                        </p>
                        {/* Show IP Address below location */}
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <Globe size={10} />
                            IP: {currentIp || '불러오는 중...'}
                        </div>
                    </div>
                    <button
                        onClick={refreshLocationManually}
                        disabled={isLocating}
                        className={`p-3 rounded-xl transition-all active:scale-95 z-10
                            ${isLocating
                                ? 'text-indigo-300 bg-transparent cursor-not-allowed'
                                : 'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 bg-white/50 dark:bg-black/20'}
                        `}
                        title="GPS 재탐색"
                    >
                        <RefreshCw size={20} className={isLocating ? "animate-spin" : ""} />
                    </button>

                    {/* Accuracy warning overlay */}
                    {!isLocating && currentCoordinates && currentCoordinates.accuracy > 100 && (
                        <div className="absolute font-bold items-center gap-1.5 bottom-0 left-0 right-0 bg-rose-500/90 text-white text-[10px] py-1 px-3 flex justify-center z-20 backdrop-blur-sm">
                            <AlertTriangle size={12} />
                            오차가 매우 큽니다. 창가로 가시거나 Wi-Fi를 켜주세요.
                        </div>
                    )}
                </div>

                <div className="farm-selector" style={{
                    marginBottom: '24px',
                    width: '100%',
                    maxWidth: '430px',
                    backgroundColor: 'white',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    border: '1px solid #f1f5f9'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        color: '#1e293b'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={20} className="text-primary" />
                            근무 농장 선택
                        </div>
                        {distanceInfo && (
                            <span style={{
                                fontSize: '0.85rem',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                backgroundColor: distanceInfo.isWithinRadius ? '#dcfce7' : '#fee2e2',
                                color: distanceInfo.isWithinRadius ? '#166534' : '#991b1b',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {distanceInfo.isWithinRadius ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                {distanceInfo.distance > 1000
                                    ? `${(distanceInfo.distance / 1000).toFixed(1)}km`
                                    : `${distanceInfo.distance}m`}
                            </span>
                        )}
                    </label>
                    <select
                        value={selectedFarmId}
                        onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                        disabled={farms.length === 0}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            fontSize: '16px',
                            backgroundColor: farms.length === 0 ? '#f8fafc' : 'white',
                            color: '#0f172a',
                            fontWeight: '500',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px center',
                            backgroundSize: '18px',
                            cursor: farms.length === 0 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {farms.length === 0 ? (
                            <option value="">배정된 농장이 없습니다</option>
                        ) : (
                            farms.map(farm => (
                                <option key={farm.id} value={farm.id}>
                                    {farm.name} {farm.location ? `(${farm.location})` : ''}
                                </option>
                            ))
                        )}
                    </select>

                    {distanceInfo && !distanceInfo.isWithinRadius && (
                        <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} /> 허용 반경({distanceInfo.radius}m)을 벗어났습니다.
                        </p>
                    )}
                </div>

                {statusMessage && (
                    <div className={`status-message ${statusMessage.type}`} style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: statusMessage.type === 'error' ? '#fee2e2' : statusMessage.type === 'success' ? '#d1fae5' : '#e0f2fe',
                        color: statusMessage.type === 'error' ? '#b91c1c' : statusMessage.type === 'success' ? '#047857' : '#0369a1'
                    }}>
                        {statusMessage.type === 'error' ? <XCircle /> : statusMessage.type === 'success' ? <CheckCircle /> : <AlertTriangle />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '400px' }}>
                    <button
                        className={`attendance-btn check-in ${currentStatus === 'CLOCK_IN' ? 'disabled' : ''}`}
                        onClick={() => handleAttendance('CLOCK_IN')}
                        disabled={isLoading || currentStatus === 'CLOCK_IN'}
                        style={{
                            padding: '20px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: currentStatus === 'CLOCK_IN' ? '#e5e7eb' : '#10b981',
                            color: currentStatus === 'CLOCK_IN' ? '#9ca3af' : 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: currentStatus === 'CLOCK_IN' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <MapPin size={32} />
                        출근하기
                    </button>

                    <button
                        className={`attendance-btn check-out ${currentStatus === 'CLOCK_OUT' ? 'disabled' : ''}`}
                        onClick={() => handleAttendance('CLOCK_OUT')}
                        disabled={isLoading || currentStatus === 'CLOCK_OUT'}
                        style={{
                            padding: '20px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: currentStatus === 'CLOCK_OUT' ? '#e5e7eb' : '#ef4444',
                            color: currentStatus === 'CLOCK_OUT' ? '#9ca3af' : 'white',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: currentStatus === 'CLOCK_OUT' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <MapPin size={32} />
                        퇴근하기
                    </button>
                </div>

                <div className="info-text" style={{ marginTop: '20px', color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
                    <p>📍 현재 위치를 기반으로 출퇴근을 기록합니다.</p>
                    <p>브라우저의 위치 정보 권한을 허용해주세요.</p>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
