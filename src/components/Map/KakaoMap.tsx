import React, { useEffect, useRef, useState, memo } from 'react';

// Declare kakao property on window
declare global {
    interface Window {
        kakao: any;
    }
}

interface KakaoMapProps {
    latitude: number;
    longitude: number;
    level?: number;
    onMapClick?: (lat: number, lng: number) => void;
    markerPosition?: { lat: number; lng: number };
    address?: string; // Optional: To display address
    draggableMarker?: boolean; // New prop: Is the marker draggable?
    onMarkerDragEnd?: (lat: number, lng: number) => void; // New prop: Callback for when marker drag ends
    onAddressChange?: (address: string) => void; // New prop: Callback when address is fetched
    circleRadius?: number; // New prop for drawing the attendance radius circle
    height?: string | number;
    className?: string; // Optional className for custom styling
    onMapLoad?: (map: any) => void;
}

const KakaoMapBase: React.FC<KakaoMapProps> = ({
    latitude,
    longitude,
    level = 5,
    onMapClick,
    markerPosition,
    address,
    draggableMarker = false,
    onMarkerDragEnd,
    onAddressChange,
    circleRadius,
    height = '100%',
    className = '',
    onMapLoad
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const circleRef = useRef<any>(null);
    const infowindowRef = useRef<any>(null);

    // Use refs for callbacks to avoid stale closures in event listeners
    const callbacksRef = useRef({ onMapClick, onMarkerDragEnd, onAddressChange });
    useEffect(() => {
        callbacksRef.current = { onMapClick, onMarkerDragEnd, onAddressChange };
    }, [onMapClick, onMarkerDragEnd, onAddressChange]);

    // Helper to get address from coords
    const getAddress = (lat: number, lng: number) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
        const geocoder = new window.kakao.maps.services.Geocoder();

        // First try to get the detailed address (parcel/road)
        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK && callbacksRef.current.onAddressChange) {
                const parcelAddress = result[0].address ? result[0].address.address_name : '';
                const roadAddress = result[0].road_address ? result[0].road_address.address_name : '';

                const finalAddress = parcelAddress || roadAddress;

                if (finalAddress) {
                    callbacksRef.current.onAddressChange(finalAddress);
                } else {
                    // Fallback to administrative region code if no address is found
                    geocoder.coord2RegionCode(lng, lat, (regResult: any, regStatus: any) => {
                        if (regStatus === window.kakao.maps.services.Status.OK) {
                            let adminAddress = '';
                            for (let i = 0; i < regResult.length; i++) {
                                if (regResult[i].region_type === 'H') {
                                    adminAddress = regResult[i].address_name;
                                    break;
                                }
                            }
                            if (!adminAddress) adminAddress = regResult[0].address_name;
                            callbacksRef.current.onAddressChange(adminAddress);
                        }
                    });
                }
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                // If ZERO_RESULT, directly try region code
                geocoder.coord2RegionCode(lng, lat, (regResult: any, regStatus: any) => {
                    if (regStatus === window.kakao.maps.services.Status.OK && callbacksRef.current.onAddressChange) {
                        let adminAddress = '';
                        for (let i = 0; i < regResult.length; i++) {
                            if (regResult[i].region_type === 'H') {
                                adminAddress = regResult[i].address_name;
                                break;
                            }
                        }
                        if (!adminAddress) adminAddress = regResult[0].address_name;
                        callbacksRef.current.onAddressChange(adminAddress);
                    }
                });
            }
        });
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const initializeMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                setError('카카오 맵 API를 불러올 수 없습니다.');
                setIsLoading(false);
                return;
            }

            // Official Guide initialization
            window.kakao.maps.load(() => {
                if (!containerRef.current) return;

                // Clear any existing map content (React 18 Strict Mode cleanup)
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }

                try {
                    // Use markerPosition as priority for initialization if available
                    const startLat = markerPosition?.lat || latitude;
                    const startLng = markerPosition?.lng || longitude;

                    const centerPosition = new window.kakao.maps.LatLng(startLat, startLng);
                    const options = {
                        center: centerPosition,
                        level: level
                    };

                    // 지도 생성 및 객체 리턴
                    const map = new window.kakao.maps.Map(containerRef.current, options);

                    // Store instances
                    mapRef.current = map;

                    // Initialize marker immediately on load
                    const mPos = new window.kakao.maps.LatLng(startLat, startLng);
                    markerRef.current = new window.kakao.maps.Marker({
                        position: mPos,
                        map: map,
                        draggable: draggableMarker
                    });

                    if (draggableMarker) {
                        window.kakao.maps.event.addListener(markerRef.current, 'dragend', () => {
                            const newPos = markerRef.current.getPosition();
                            if (callbacksRef.current.onMarkerDragEnd) {
                                callbacksRef.current.onMarkerDragEnd(newPos.getLat(), newPos.getLng());
                            }
                            getAddress(newPos.getLat(), newPos.getLng());
                        });
                    }

                    setIsLoading(false);
                    if (onMapLoad) onMapLoad(map);

                    // Relayout to ensure proper rendering
                    setTimeout(() => map.relayout(), 100);

                    // Map Click Event
                    window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
                        const latlng = mouseEvent.latLng;
                        if (callbacksRef.current.onMapClick) {
                            callbacksRef.current.onMapClick(latlng.getLat(), latlng.getLng());
                        }
                        getAddress(latlng.getLat(), latlng.getLng());
                    });

                } catch (err) {
                    console.error('Map initialization error:', err);
                    setError('지도 초기화에 실패했습니다.');
                    setIsLoading(false);
                }
            });
        };

        // Don't initialize until we have a valid non-default coordinate (e.g., from API)
        const hasValidCoords = latitude !== 0 && longitude !== 0;

        if (!hasValidCoords) {
            // If coords aren't ready yet, show loading but don't init
            return;
        }

        // Check if script is already loaded
        if (window.kakao && window.kakao.maps) {
            initializeMap();
        } else {
            // Polling approach in case script takes time to load in index.html
            let attempts = 0;
            const checker = setInterval(() => {
                attempts++;
                if (window.kakao && window.kakao.maps) {
                    clearInterval(checker);
                    initializeMap();
                } else if (attempts > 50) { // 5 seconds
                    clearInterval(checker);
                    setError('카카오 맵 API 로딩 시간 초과');
                    setIsLoading(false);
                }
            }, 100);

            return () => clearInterval(checker);
        }
    }, [latitude, longitude, markerPosition]); // Re-run if coords change while map is not yet initialized

    // Update center, marker, and radius when props change
    useEffect(() => {
        if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

        const map = mapRef.current;
        const targetLat = markerPosition?.lat || latitude;
        const targetLng = markerPosition?.lng || longitude;
        const currentCenter = new window.kakao.maps.LatLng(targetLat, targetLng);

        // Update map center smoothly if map is already initialized
        map.setCenter(currentCenter);

        // Update Marker
        const mPos = new window.kakao.maps.LatLng(targetLat, targetLng);

        if (!markerRef.current) {
            // Create new marker if it doesn't exist yet but map is ready
            markerRef.current = new window.kakao.maps.Marker({
                position: mPos,
                map: map,
                draggable: draggableMarker
            });

            if (draggableMarker) {
                window.kakao.maps.event.addListener(markerRef.current, 'dragend', () => {
                    const newPos = markerRef.current.getPosition();
                    if (callbacksRef.current.onMarkerDragEnd) {
                        callbacksRef.current.onMarkerDragEnd(newPos.getLat(), newPos.getLng());
                    }
                    getAddress(newPos.getLat(), newPos.getLng());
                });
            }
        } else {
            // Update existing marker
            markerRef.current.setMap(map);
            markerRef.current.setPosition(mPos);
            markerRef.current.setDraggable(draggableMarker);
        }

        // InfoWindow logic removed per user request

        // Update Circle
        if (circleRadius) {
            if (!circleRef.current) {
                // Create new circle
                circleRef.current = new window.kakao.maps.Circle({
                    center: currentCenter,
                    radius: circleRadius,
                    strokeWeight: 2,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.8,
                    strokeStyle: 'dashed',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    map: map
                });
            } else {
                // Update existing circle
                circleRef.current.setMap(map);
                circleRef.current.setPosition(currentCenter);
                circleRef.current.setRadius(circleRadius);
            }
        } else if (circleRef.current) {
            circleRef.current.setMap(null);
            circleRef.current = null;
        }

        // Extra layout check
        map.relayout();

    }, [latitude, longitude, markerPosition, circleRadius, draggableMarker, address]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }
            if (circleRef.current) {
                circleRef.current.setMap(null);
                circleRef.current = null;
            }
            if (infowindowRef.current) {
                infowindowRef.current.close();
                infowindowRef.current = null;
            }
            mapRef.current = null;
        };
    }, []);

    return (
        <div
            className={className}
            style={{
                width: '100%',
                height: height,
                position: 'relative',
                minHeight: '400px',
                borderRadius: 'inherit',
                overflow: 'hidden' // Ensure map doesn't overflow rounded corners
            }}
        >
            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 10,
                        gap: '8px'
                    }}
                >
                    <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', marginBottom: '0.75rem' }} />
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>지도 불러오는 중...</p>
                </div>
            )}

            {error && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fef2f2',
                        zIndex: 10,
                        padding: '12px',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
                        {error}
                    </p>
                </div>
            )}

            {/* The actual map container */}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '200px'
                }}
            />
        </div>
    );
};

export default memo(KakaoMapBase);
