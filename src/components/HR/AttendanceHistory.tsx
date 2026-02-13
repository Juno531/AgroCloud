import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, LogIn, LogOut } from 'lucide-react';
import { EmployeeService, AttendanceService } from '../../services/api';

interface AttendanceRecord {
    id: number;
    userId: number;
    userName: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    timestamp: string;
    farmId: number;
}

const AttendanceHistory = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchAttendanceRecords();
        }
    }, [selectedUserId, startDate, endDate]);

    const fetchEmployees = async () => {
        try {
            const response = await EmployeeService.getAllEmployees();
            setEmployees(response.data);
            if (response.data.length > 0) {
                setSelectedUserId(response.data[0].userId);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    const fetchAttendanceRecords = async () => {
        if (!selectedUserId) return;

        setLoading(true);
        try {
            // Fetch all farm attendance and filter by user
            const response = await AttendanceService.getFarmAttendance(1, startDate, endDate);
            const filteredRecords = response.data.filter(
                (record: AttendanceRecord) => record.userId === selectedUserId
            );
            setRecords(filteredRecords);
        } catch (error) {
            console.error('Failed to fetch attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateWorkDuration = (clockIn: Date, clockOut: Date) => {
        const duration = clockOut.getTime() - clockIn.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}시간 ${minutes}분`;
    };

    const groupRecordsByDate = () => {
        const grouped: { [date: string]: AttendanceRecord[] } = {};
        records.forEach(record => {
            const date = new Date(record.timestamp).toLocaleDateString('ko-KR');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(record);
        });
        return grouped;
    };

    const selectedEmployee = employees.find(emp => emp.userId === selectedUserId);
    const groupedRecords = groupRecordsByDate();

    return (
        <div>
            {/* Filters */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-lg)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {/* Employee Select */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Search size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            작업자 선택
                        </label>
                        <select
                            value={selectedUserId || ''}
                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem',
                                backgroundColor: 'white'
                            }}
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.userId}>
                                    {emp.userName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            시작일
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            종료일
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Employee Info Card */}
            {selectedEmployee && (
                <div style={{
                    backgroundColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-lg)',
                    border: '1px solid var(--color-primary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            {selectedEmployee.userName.charAt(0)}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {selectedEmployee.userName}
                            </h3>
                            <p style={{ color: 'var(--color-text-secondary)' }}>
                                {selectedEmployee.phone} | 시급: {selectedEmployee.hourlyWage.toLocaleString()}원
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Records */}
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
            ) : Object.keys(groupedRecords).length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-secondary)'
                }}>
                    <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>선택한 기간에 출퇴근 기록이 없습니다</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(groupedRecords).map(([date, dayRecords]) => {
                        const sortedRecords = dayRecords.sort((a, b) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );

                        // Calculate work duration for the day
                        const clockInRecord = sortedRecords.find(r => r.type === 'CLOCK_IN');
                        const clockOutRecord = sortedRecords.find(r => r.type === 'CLOCK_OUT');
                        const workDuration = clockInRecord && clockOutRecord
                            ? calculateWorkDuration(
                                new Date(clockInRecord.timestamp),
                                new Date(clockOutRecord.timestamp)
                            )
                            : null;

                        return (
                            <div
                                key={date}
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    padding: 'var(--spacing-lg)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                    paddingBottom: '0.75rem',
                                    borderBottom: '2px solid var(--color-border)'
                                }}>
                                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                        {date}
                                    </h4>
                                    {workDuration && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--color-primary)',
                                            fontWeight: 600
                                        }}>
                                            <Clock size={16} />
                                            근무시간: {workDuration}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {sortedRecords.map(record => {
                                        const time = new Date(record.timestamp);
                                        const isClockIn = record.type === 'CLOCK_IN';

                                        return (
                                            <div
                                                key={record.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem',
                                                    backgroundColor: 'var(--color-background)',
                                                    borderRadius: 'var(--radius-md)',
                                                    borderLeft: `4px solid ${isClockIn ? '#10b981' : '#ef4444'}`
                                                }}
                                            >
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isClockIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: isClockIn ? '#10b981' : '#ef4444'
                                                }}>
                                                    {isClockIn ? <LogIn size={20} /> : <LogOut size={20} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        {isClockIn ? '출근' : '퇴근'}
                                                    </div>
                                                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                                        {time.toLocaleTimeString('ko-KR')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AttendanceHistory;
