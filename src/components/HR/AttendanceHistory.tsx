import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, LogIn, LogOut, MapPin } from 'lucide-react';
import { EmployeeService, AttendanceService } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AttendanceRecord {
    id: number;
    userId: number;
    userName: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    timestamp: string;
    farmId: number;
    reason?: string | null;
}

const AttendanceHistory = () => {
    const { fields: farms } = useFarm();
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedFarmId, setSelectedFarmId] = useState<number | ''>('');
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

    // Set initial farm
    useEffect(() => {
        if (farms && farms.length > 0 && selectedFarmId === '') {
            setSelectedFarmId(farms[0]?.id || '');
        }
    }, [farms, selectedFarmId]);

    useEffect(() => {
        if (selectedUserId && selectedFarmId) {
            fetchAttendanceRecords();
        }
    }, [selectedUserId, selectedFarmId, startDate, endDate]);

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
        if (!selectedUserId || !selectedFarmId) return;

        setLoading(true);
        try {
            const startDateTime = `${startDate}T00:00:00`;
            const endDateTime = `${endDate}T23:59:59`;

            const response = await AttendanceService.getFarmAttendance(Number(selectedFarmId), startDateTime, endDateTime);
            const filteredRecords = response.data.filter(
                (record: AttendanceRecord) => record.userId === selectedUserId
            );
            setRecords(filteredRecords);
        } catch (error: any) {
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
        <div className="space-y-4 md:space-y-6">
            {/* Sticky Header with Filters */}
            <div className="sticky top-0 z-40 -mx-3 sm:-mx-6 px-3 sm:px-6 py-4 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/70 dark:bg-zinc-900/70 p-4 rounded-2xl shadow-sm border border-white dark:border-zinc-800/50">
                    {/* Farm Select */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <MapPin size={14} />
                            농장 선택
                        </label>
                        <select
                            value={selectedFarmId}
                            onChange={(e) => setSelectedFarmId(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                        >
                            {farms && farms.map(farm => (
                                <option key={farm.id} value={farm.id}>{farm.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Employee Select */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <Search size={14} />
                            직원 선택
                        </label>
                        <select
                            value={selectedUserId || ''}
                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.userId}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <Calendar size={14} />
                            시작일
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            <Calendar size={14} />
                            종료일
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="mt-2 space-y-6">
                {/* Employee Info Card */}
                {selectedEmployee && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/20">
                                {(selectedEmployee.name || '?').charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                    {selectedEmployee.name || '미등록'}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {selectedEmployee.phone || '-'} <span className="mx-2 opacity-30">|</span> 시급: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(selectedEmployee.hourlyWage || 0).toLocaleString()}원</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Records List */}
                {loading ? (
                    <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        데이터를 불러오는 중...
                    </div>
                ) : Object.keys(groupedRecords).length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-slate-400">선택한 기간에 출퇴근 기록이 없습니다</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedRecords).map(([date, dayRecords]) => {
                            const sortedRecords = dayRecords.sort((a, b) =>
                                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            );

                            const clockInRecord = sortedRecords.find(r => r.type === 'CLOCK_IN');
                            const clockOutRecord = sortedRecords.find(r => r.type === 'CLOCK_OUT');
                            const workDuration = clockInRecord && clockOutRecord
                                ? calculateWorkDuration(
                                    new Date(clockInRecord.timestamp),
                                    new Date(clockOutRecord.timestamp)
                                )
                                : null;

                            return (
                                <div key={date} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-200 dark:hover:border-zinc-700">
                                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-zinc-800/30 flex justify-between items-center border-b border-slate-100 dark:border-zinc-800">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{date}</h4>
                                        {workDuration && (
                                            <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full">
                                                <Clock size={14} />
                                                근무시간: {workDuration}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-3">
                                        {sortedRecords.map(record => {
                                            const time = new Date(record.timestamp);
                                            const isClockIn = record.type === 'CLOCK_IN';

                                            return (
                                                <div
                                                    key={record.id}
                                                    className={`group p-4 rounded-xl border transition-all duration-200 ${isClockIn
                                                        ? 'bg-emerald-50/20 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10'
                                                        : 'bg-rose-50/20 dark:bg-rose-500/5 border-rose-100/50 dark:border-rose-500/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isClockIn
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                                            }`}>
                                                            {isClockIn ? <LogIn size={20} /> : <LogOut size={20} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-bold text-slate-900 dark:text-white">
                                                                    {isClockIn ? '출근' : '퇴근'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded-md">
                                                                    <MapPin size={10} />
                                                                    {farms?.find(f => f.id === record.farmId)?.name || '근무지 미상'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                                {format(time, 'aa hh:mm:ss', { locale: ko })}
                                                            </p>
                                                            {record.reason && (
                                                                <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-slate-100 dark:border-white/5">
                                                                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">사유</p>
                                                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                        {record.reason}
                                                                    </p>
                                                                </div>
                                                            )}
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
        </div>
    );
};

export default AttendanceHistory;
