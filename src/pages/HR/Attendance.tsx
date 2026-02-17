import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, XCircle, Camera } from 'lucide-react';
import { AttendanceService } from '../../services/api';
import { useLayout } from '../../context/LayoutContext';
import '../../styles/Attendance.css';


interface ScanResult {
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    farmId: number;
    timestamp: number;
}

const Attendance = () => {
    const { user } = useAuth();
    const { setTitle } = useLayout();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setTitle('출퇴근 기록');
    }, [setTitle]);
    const [isScanning, setIsScanning] = useState(false);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [scanResult, setScanResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
    const [lastAction, setLastAction] = useState<{ type: string; time: string } | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; data: ScanResult | null }>({ isOpen: false, data: null });

    // Request camera permission explicitly
    const requestCameraPermission = async () => {
        setIsRequestingPermission(true);

        // Check if running on HTTPS or localhost
        const isSecure = window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        console.log('🔍 Environment check:', {
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            isSecure,
            userAgent: navigator.userAgent
        });

        if (!isSecure) {
            setScanResult({
                status: 'error',
                message: '⚠️ 카메라 접근을 위해서는 HTTPS 연결이 필요합니다. HTTPS로 접속해주세요.'
            });
            setIsRequestingPermission(false);
            return;
        }

        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('❌ MediaDevices API not available');
            setScanResult({
                status: 'error',
                message: '⚠️ 이 브라우저는 카메라 접근을 지원하지 않습니다.'
            });
            setIsRequestingPermission(false);
            return;
        }

        setScanResult({
            status: 'success',
            message: '📸 카메라 접근 권한을 요청하고 있습니다. 브라우저 팝업에서 "허용"을 클릭해주세요.'
        });

        try {
            console.log('📷 Requesting camera permission...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            console.log('✅ Camera permission granted:', stream.getTracks());

            // Stop the stream immediately - we just needed to request permission
            stream.getTracks().forEach(track => {
                console.log('🛑 Stopping track:', track.label);
                track.stop();
            });

            setScanResult(null);
            setIsScanning(true);
        } catch (error: any) {
            console.error('❌ Camera permission error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);

            let errorMessage = '카메라 접근 권한이 거부되었습니다.';

            if (error.name === 'NotAllowedError') {
                errorMessage = '⚠️ 카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = '⚠️ 카메라를 찾을 수 없습니다. 기기에 카메라가 있는지 확인해주세요.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = '⚠️ 카메라에 접근할 수 없습니다. 다른 앱에서 카메라를 사용 중인지 확인해주세요.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = '⚠️ 카메라 설정이 지원되지 않습니다. 다른 카메라로 시도해주세요.';
            } else if (error.name === 'TypeError') {
                errorMessage = '⚠️ 카메라 접근 설정 오류입니다. HTTPS로 접속했는지 확인해주세요.';
            }

            setScanResult({
                status: 'error',
                message: errorMessage
            });
        } finally {
            setIsRequestingPermission(false);
        }
    };

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleScan = async (scannerResult: any) => {
        if (!scannerResult || !scannerResult[0]) return;

        const rawValue = scannerResult[0].rawValue;

        try {
            const data: ScanResult = JSON.parse(rawValue);

            // Simple validation
            if (data.type !== 'CLOCK_IN' && data.type !== 'CLOCK_OUT') {
                throw new Error('Invalid QR Code type');
            }

            // Stop scanning and show confirmation dialog
            setIsScanning(false);
            setConfirmDialog({ isOpen: true, data });

        } catch (error: any) {
            console.error(error);
            setScanResult({
                status: 'error',
                message: error.message || '유효하지 않은 QR 코드입니다.'
            });
            setIsScanning(false);
        }
    };

    const handleConfirmAttendance = async () => {
        if (!confirmDialog.data) return;

        const data = confirmDialog.data;
        setConfirmDialog({ isOpen: false, data: null });

        try {
            // Check current status
            const statusResponse = await AttendanceService.getUserStatus();
            const currentStatus = statusResponse.data;

            // Validate status
            if (currentStatus === 'CLOCK_IN' && data.type === 'CLOCK_IN') {
                setScanResult({
                    status: 'error',
                    message: '⚠️ 이미 출근 상태입니다. 퇴근 QR 코드를 스캔해주세요.'
                });
                return;
            }

            if (currentStatus === 'CLOCK_OUT' && data.type === 'CLOCK_OUT') {
                setScanResult({
                    status: 'error',
                    message: '⚠️ 이미 퇴근 상태입니다. 출근 QR 코드를 스캔해주세요.'
                });
                return;
            }

            // Call real API
            const response = await AttendanceService.recordAttendance({
                type: data.type,
                farmId: data.farmId
            });

            const result = response.data;
            const actionName = data.type === 'CLOCK_IN' ? '출근' : '퇴근';
            const timeStr = new Date(result.timestamp).toLocaleTimeString();

            setLastAction({
                type: actionName,
                time: timeStr
            });

            setScanResult({
                status: 'success',
                message: `✅ ${actionName} 처리가 완료되었습니다. (${timeStr})`
            });

        } catch (error: any) {
            console.error(error);
            setScanResult({
                status: 'error',
                message: error.response?.data?.message || error.message || '출퇴근 처리 중 오류가 발생했습니다.'
            });
        }
    };

    const handleError = (error: any) => {
        console.error(error);
        setScanResult({
            status: 'error',
            message: '카메라 접근에 실패했습니다.'
        });
        setIsScanning(false);
    };

    return (
        <div className="attendance-container" style={{ paddingTop: 'var(--spacing-lg)' }}>

            <div className="attendance-content">
                {scanResult && (
                    <div className={`status-message ${scanResult.status}`}>
                        {scanResult.status === 'success' ? <CheckCircle /> : <XCircle />}
                        <span>{scanResult.message}</span>
                    </div>
                )}

                {!isScanning ? (
                    <div className="action-card">
                        <div className="scan-placeholder">
                            <Camera size={48} />
                            <p>QR 코드를 스캔하여 출퇴근을 기록하세요</p>
                        </div>
                        <button
                            className="scan-button"
                            onClick={requestCameraPermission}
                            disabled={isRequestingPermission}
                        >
                            {isRequestingPermission ? '카메라 권한 요청 중...' : 'QR 스캔 시작'}
                        </button>
                    </div>
                ) : (
                    <div className="scanner-wrapper">
                        <div className="scanner-container">
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                components={{
                                    onOff: true,
                                    torch: true,
                                    zoom: true,
                                    finder: true
                                }}
                                styles={{
                                    container: { width: '100%', maxWidth: '400px', margin: '0 auto', aspectRatio: '1' }
                                }}
                            />
                        </div>
                        <button
                            className="cancel-button"
                            onClick={() => setIsScanning(false)}
                        >
                            취소
                        </button>
                    </div>
                )}

                {lastAction && (
                    <div className="last-action-info">
                        <h3>최근 활동</h3>
                        <div className="action-row">
                            <span className="action-type">{lastAction.type}</span>
                            <span className="action-time">{lastAction.time}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.isOpen && confirmDialog.data && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', textAlign: 'center' }}>
                            {confirmDialog.data.type === 'CLOCK_IN' ? '🟢 출근' : '🔴 퇴근'}
                        </h3>
                        <p style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
                            {confirmDialog.data.type === 'CLOCK_IN' ? '출근하시겠습니까?' : '퇴근하시겠습니까?'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, data: null })}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmAttendance}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: confirmDialog.data.type === 'CLOCK_IN' ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
