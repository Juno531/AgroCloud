import { useState, useEffect } from 'react';
import Calendar from '../../components/UI/Calendar';
import { AttendanceService, LeaveService } from '../../services/api';
import { format, isSameDay, parseISO } from 'date-fns';
import { useLayout } from '../../context/LayoutContext';
import { Clock, Coffee } from 'lucide-react';

const MyAttendance = () => {
    const { setTitle } = useLayout();
    const [records, setRecords] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle('근태 현황');
        fetchData();
    }, [setTitle]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attRes, leaveRes] = await Promise.all([
                AttendanceService.getMyAttendance(),
                LeaveService.getMyLeaves()
            ]);
            setRecords(attRes.data);
            setLeaves(leaveRes.data);
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderCell = (date: Date) => {
        const dayRecords = records.filter(r => isSameDay(parseISO(r.timestamp), date));
        const dayLeaves = leaves.find(l => isSameDay(parseISO(l.leaveDate), date));

        const clockIn = dayRecords.find(r => r.type === 'CLOCK_IN');
        const clockOut = dayRecords.find(r => r.type === 'CLOCK_OUT');

        if (dayLeaves) {
            return (
                <div className="flex flex-col gap-0.5 mt-0.5">
                    {/* 모바일: dot만 표시 */}
                    <div className="sm:hidden flex items-center gap-0.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    </div>
                    {/* sm 이상: 아이콘 + 텍스트 배지 */}
                    <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md border border-amber-100 dark:border-amber-800/50">
                        <Coffee size={10} className="flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase">휴무</span>
                    </div>
                </div>
            );
        }

        if (dayRecords.length === 0) return null;

        return (
            <div className="flex flex-col gap-0.5 mt-0.5">
                {/* 모바일: dot만 표시 */}
                <div className="sm:hidden flex items-center gap-0.5">
                    {clockIn && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />}
                    {clockOut && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />}
                </div>
                {/* sm 이상: 아이콘 + 시간 배지 */}
                <div className="hidden sm:flex flex-col gap-0.5">
                    {clockIn && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20">
                            <Clock size={9} className="flex-shrink-0" />
                            <span className="text-[9px] font-bold">{format(parseISO(clockIn.timestamp), 'HH:mm')}</span>
                        </div>
                    )}
                    {clockOut && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md border border-rose-500/20">
                            <Clock size={9} className="flex-shrink-0" />
                            <span className="text-[9px] font-bold">{format(parseISO(clockOut.timestamp), 'HH:mm')}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-20">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">근태 달력</h1>
                    <p className="text-slate-500 mt-1">본인의 출퇴근 기록과 휴무 내역을 확인할 수 있습니다.</p>
                </div>

                <div className="flex gap-4 p-4 bg-white dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">출근 정보</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">퇴근 정보</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">휴무</span>
                    </div>
                </div>
            </div>

            <Calendar renderCell={renderCell} />
        </div>
    );
};

export default MyAttendance;
