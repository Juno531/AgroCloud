import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { useLayout } from '../../context/LayoutContext';
import DaumPostcode from 'react-daum-postcode';
import KakaoMap from '../../components/Map/KakaoMap';
import SuspenseLoader from '../../components/UI/SuspenseLoader';

/**
 * FarmAdd Page Component
 * Refactored to follow modern frontend guidelines:
 * - Separated Map logic into KakaoMap component
 * - Used Suspense for loading state
 * - Memoized handlers with useCallback
 * - Strict props and types
 */
const FarmAdd: React.FC = () => {
    const navigate = useNavigate();
    const { addField } = useFarm();
    const { setTitle } = useLayout();

    const [newFarm, setNewFarm] = useState({
        name: '',
        location: '',
        area: '',
        latitude: '37.566826', // Default Seol
        longitude: '126.9786567'
    });

    const [loading, setLoading] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    useEffect(() => {
        setTitle('새 농장 등록');
    }, [setTitle]);


    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert('이 브라우저에서는 GPS를 지원하지 않습니다.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setNewFarm(prev => ({
                    ...prev,
                    latitude: String(lat),
                    longitude: String(lng)
                }));
            },
            (error) => {
                console.warn('Geolocation error:', error);
                alert('위치 정보를 가져올 수 없습니다.');
            }
        );
    }, []);

    const handleCompletePostcode = useCallback((data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        // The provided snippet for role check was syntactically incorrect and out of context for this function.
        // Assuming the intent was to add a role check *somewhere* and the snippet was a placeholder or error.
        // As there's no 'user' context here, and the instruction was to "update role check ... if present",
        // and no such check is present, I cannot faithfully apply the malformed snippet.
        // If a role check is needed, it should be implemented with proper context (e.g., from an auth hook)
        // and correct syntax.
        // For now, I will proceed with the original logic of the function.

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setNewFarm((prev) => ({ ...prev, location: fullAddress }));
        setIsPostcodeOpen(false);

        // Geocode the address to coordinates
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(fullAddress, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    setNewFarm(prev => ({
                        ...prev,
                        latitude: String(result[0].y),
                        longitude: String(result[0].x)
                    }));
                }
            });
        }
    }, []);

    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newFarm.name.trim()) {
            alert('농장명을 입력해주세요.');
            return;
        }

        if (!newFarm.latitude || !newFarm.longitude) {
            alert('주소를 검색하여 농장 위치를 지정해 주세요.');
            return;
        }

        setLoading(true);
        try {
            await addField({
                name: newFarm.name,
                size: newFarm.area,
                location: newFarm.location,
                latitude: newFarm.latitude,
                longitude: newFarm.longitude
            });
            alert('농장이 성공적으로 등록되었습니다.');
            navigate('/farm/setting');
        } catch (error: any) {
            console.error('Error creating farm:', error);
            if (error.response && error.response.status === 409) {
                alert('이미 존재하는 농장 이름입니다. 다른 이름을 사용해 주세요.');
            } else {
                alert('농장 등록 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    }, [addField, navigate, newFarm]);

    return (
        <div className="farm-add-page responsive-padding" style={{ paddingTop: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--spacing-lg)' }}>
                <button
                    type="button"
                    onClick={() => navigate('/farm/setting')}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem', borderRadius: '50%', minWidth: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>새 농장 등록</h2>
            </div>

            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
            }}>
                {/* Left: Form */}
                <div style={{ flex: '1 1 400px' }}>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>농장명 <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                            <input
                                type="text"
                                value={newFarm.name}
                                onChange={e => setNewFarm({ ...newFarm, name: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem' }}
                                placeholder="예: 행복농장"
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>주소 (위치)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newFarm.location}
                                    readOnly
                                    onClick={() => setIsPostcodeOpen(true)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#f9fafb' }}
                                    placeholder="주소 검색"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPostcodeOpen(true)}
                                    className="btn btn-outline"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1rem' }}
                                >
                                    <Search size={16} /> 검색
                                </button>
                            </div>
                            {isPostcodeOpen && (
                                <div style={{ marginTop: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                                    <DaumPostcode onComplete={handleCompletePostcode} />
                                    <button
                                        type="button"
                                        onClick={() => setIsPostcodeOpen(false)}
                                        style={{ width: '100%', padding: '0.5rem', background: '#f5f5f5', border: 'none', borderTop: '1px solid #ddd', cursor: 'pointer' }}
                                    >
                                        닫기
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>면적 (m²)</label>
                            <input
                                type="number"
                                value={newFarm.area}
                                onChange={e => setNewFarm({ ...newFarm, area: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                placeholder="예: 1000"
                            />
                        </div>



                        <div style={{ marginTop: '1rem' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Save size={20} />
                                {loading ? '등록 중...' : '농장 등록하기'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right: Map */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={18} className="text-primary" />
                            위의 주소 검색 버튼을 눌러 농장 위치를 지정해 주세요.
                        </span>
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            className="btn btn-sm btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                        >
                            <Navigation size={14} /> 현위치
                        </button>
                    </div>

                    <Suspense fallback={<SuspenseLoader />}>
                        <KakaoMap
                            latitude={Number(newFarm.latitude)}
                            longitude={Number(newFarm.longitude)}
                            markerPosition={{ lat: Number(newFarm.latitude), lng: Number(newFarm.longitude) }}
                            height="400px"
                        />
                    </Suspense>

                    <div style={{
                        marginTop: 'auto',
                        padding: '1rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: '12px',
                        border: '1px dashed var(--color-border)',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '0.75rem'
                    }}>
                        <AlertCircle size={18} className="text-primary" style={{ marginTop: '2px' }} />
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.25rem' }}>도움말</p>
                            <p>주소 검색을 이용하면 지도가 해당 위치로 자동 이동하며 좌표가 설정됩니다. 보안을 위해 지도를 직접 클릭하거나 위치를 수동으로 변경하는 기능은 제한됩니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmAdd;
