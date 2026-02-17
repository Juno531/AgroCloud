import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AttendanceService } from '../../services/api';

const QRScanner = () => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (text: string) => {
        if (text && !loading && !scanResult) {
            setLoading(true);
            try {
                // Assuming QR code contains JSON data with type and farmId
                // e.g. { "type": "CLOCK_IN", "farmId": 1, "timestamp": ... }
                const data = JSON.parse(text);

                if (data.type === 'CLOCK_IN' || data.type === 'CLOCK_OUT') {
                    // Call API to record attendance
                    // Adjust API call based on actual backend requirements
                    // Here assuming we send the parsed data or just the raw text
                    await AttendanceService.recordAttendance(data);
                    setScanResult(`출퇴근 처리가 완료되었습니다: ${data.type === 'CLOCK_IN' ? '출근' : '퇴근'}`);
                } else {
                    setError("유효하지 않은 QR 코드입니다.");
                }
            } catch (err) {
                console.error("QR Scan Error:", err);
                setError("QR 코드 처리 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
                // Reset after delay to allow new scan
                setTimeout(() => {
                    setScanResult(null);
                    setError(null);
                }, 3000);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm text-white absolute top-0 left-0 right-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <h3 className="font-bold text-lg">QR 스캔</h3>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black">
                <Scanner
                    onScan={(result) => {
                        if (result && result[0] && result[0].rawValue) {
                            handleScan(result[0].rawValue);
                        }
                    }}
                    components={{
                        audio: false,
                        onOff: false,
                        torch: true,
                        zoom: true,
                        finder: true
                    }}
                    styles={{
                        container: {
                            width: '100%',
                            height: '100%'
                        }
                    }}
                />

                {/* Overlay Feedback */}
                {(scanResult || error || loading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                        <div className="bg-white p-6 rounded-xl max-w-xs w-full text-center space-y-4 mx-4">
                            {loading && (
                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                            )}
                            {scanResult && (
                                <>
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="material-icons-round">check</span>
                                    </div>
                                    <p className="font-bold text-slate-800">{scanResult}</p>
                                </>
                            )}
                            {error && (
                                <>
                                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                        <span className="material-icons-round">priority_high</span>
                                    </div>
                                    <p className="font-bold text-slate-800">{error}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <p className="absolute bottom-24 left-0 right-0 text-center text-white/70 text-sm z-10 pointer-events-none">
                QR 코드를 사각형 안에 맞춰주세요
            </p>
        </div>
    );
};

export default QRScanner;
