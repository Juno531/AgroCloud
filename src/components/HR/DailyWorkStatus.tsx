import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { EmployeeService, AttendanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


interface DailyWorkRecord {
    userName: string;
    userId: number;
    phone: string;
    hourlyWage: number;
    bankAccount: string;
    accountHolder: string;
    paymentDate: number;
    clockInTime: string | null;
    clockOutTime: string | null;
    workHours: number | null;
    totalPay: number | null;
}

const DailyWorkStatus = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [workRecords, setWorkRecords] = useState<DailyWorkRecord[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDailyStatus();
    }, [selectedDate]);

    const fetchDailyStatus = async () => {
        if (!user?.farmId) return;

        setLoading(true);
        try {
            // Fetch all employees for this farm
            const employeesResponse = await EmployeeService.getEmployeesByFarm(user.farmId);
            const employees = employeesResponse.data;

            // Fetch attendance records for the selected date
            // Convert to ISO datetime format
            const startOfDay = `${selectedDate}T00:00:00`;
            const endOfDay = `${selectedDate}T23:59:59`;

            const attendanceResponse = await AttendanceService.getFarmAttendance(
                user.farmId,
                startOfDay,
                endOfDay
            );
            const attendanceRecords = attendanceResponse.data;

            // Process records for each employee
            const records: DailyWorkRecord[] = employees.map((employee: any) => {
                const userRecords = attendanceRecords.filter(
                    (r: any) => r.userId === employee.userId
                );

                const clockInRecord = userRecords.find((r: any) => r.type === 'CLOCK_IN');
                const clockOutRecord = userRecords.find((r: any) => r.type === 'CLOCK_OUT');

                let workHours = null;
                let totalPay = null;

                if (clockInRecord && clockOutRecord) {
                    const clockIn = new Date(clockInRecord.timestamp);
                    const clockOut = new Date(clockOutRecord.timestamp);
                    const duration = clockOut.getTime() - clockIn.getTime();
                    workHours = duration / (1000 * 60 * 60); // Convert to hours
                    totalPay = workHours * employee.hourlyWage;
                } else if (clockInRecord && !clockOutRecord) {
                    // Still working
                    const clockIn = new Date(clockInRecord.timestamp);
                    const now = new Date();
                    const duration = now.getTime() - clockIn.getTime();
                    workHours = duration / (1000 * 60 * 60);
                    totalPay = null; // Cannot calculate until clock out
                }

                return {
                    userName: employee.name,
                    userId: employee.userId,
                    phone: employee.phone,
                    hourlyWage: employee.hourlyWage,
                    bankAccount: employee.bankAccount,
                    accountHolder: employee.accountHolder,
                    paymentDate: employee.paymentDate,
                    clockInTime: clockInRecord ? clockInRecord.timestamp : null,
                    clockOutTime: clockOutRecord ? clockOutRecord.timestamp : null,
                    workHours,
                    totalPay
                };
            });

            setWorkRecords(records);
        } catch (error) {
            console.error('Failed to fetch daily status:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string | null | undefined) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatHours = (hours: number | null | undefined) => {
        if (hours === null || hours === undefined) return '0.0시간';
        return `${hours.toFixed(1)}시간`;
    };

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return '0원';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    };

    const totalWorkHours = workRecords.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const totalPay = workRecords.reduce((sum, record) => sum + (record.totalPay || 0), 0);
    const activeWorkers = workRecords.filter(r => r.clockInTime && !r.clockOutTime).length;
    const completedWorkers = workRecords.filter(r => r.clockInTime && r.clockOutTime).length;

    return (
        <div>
            {/* Header with Date and Stats */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-lg)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                날짜 선택
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <button
                            onClick={fetchDailyStatus}
                            className="btn btn-outline"
                            style={{ marginTop: '1.5rem' }}
                            disabled={loading}
                        >
                            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                            새로고침
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid #10b981'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            근무 중
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                            {activeWorkers}명
                        </div>
                    </div>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid #3b82f6'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            퇴근 완료
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>
                            {completedWorkers}명
                        </div>
                    </div>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid #f59e0b'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            총 근무시간
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>
                            {totalWorkHours.toFixed(1)}H
                        </div>
                    </div>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid #8b5cf6'
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                            총 급여
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>
                            {formatCurrency(totalPay)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Status Table */}
            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-secondary)'
                }}>
                    로딩 중...
                </div>
            ) : (
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>이름</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>연락처</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>출근시간</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>퇴근시간</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>근무시간</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>시급</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>일급</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>계좌번호</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>예금주</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>급여지급일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workRecords.map((record) => {
                                    const isWorking = record.clockInTime && !record.clockOutTime;

                                    return (
                                        <tr
                                            key={record.userId}
                                            style={{
                                                borderBottom: '1px solid var(--color-border)',
                                                backgroundColor: isWorking ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <strong>{record.userName}</strong>
                                                    {isWorking && (
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#10b981',
                                                            color: 'white',
                                                            borderRadius: '9999px',
                                                            fontWeight: 600
                                                        }}>
                                                            근무 중
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{record.phone}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {formatTime(record.clockInTime)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {formatTime(record.clockOutTime)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>
                                                {formatHours(record.workHours)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                {formatCurrency(record.hourlyWage)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <strong style={{ color: 'var(--color-primary)' }}>
                                                    {formatCurrency(record.totalPay)}
                                                </strong>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{record.bankAccount}</td>
                                            <td style={{ padding: '1rem' }}>{record.accountHolder}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                매월 {record.paymentDate}일
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyWorkStatus;
