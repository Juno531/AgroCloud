import { useState, useEffect } from 'react';
import Calendar from '../../components/UI/Calendar';
import { LeaveService } from '../../services/api';
import { format, isSameDay, parseISO } from 'date-fns';
import { useLayout } from '../../context/LayoutContext';
import { Coffee, Loader2, Info } from 'lucide-react';

const MyLeave = () => {
    const { setTitle } = useLayout();
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        setTitle('내 휴무 관리');
        fetchLeaves();
    }, [setTitle]);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await LeaveService.getMyLeaves();
            setLeaves(response.data);
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = async (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const existingLeave = leaves.find(l => isSameDay(parseISO(l.leaveDate), date));

        try {
            setProcessing(dateStr);
            if (existingLeave) {
                // Delete leave
                await LeaveService.deleteLeave(dateStr);
                setLeaves(prev => prev.filter(l => !isSameDay(parseISO(l.leaveDate), date)));
            } else {
                // Save leave
                const response = await LeaveService.saveLeave({ leaveDate: dateStr, reason: 'Personal Leave' });
                setLeaves(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Failed to update leave:', error);
            alert('휴무 정보 업데이트에 실패했습니다.');
        } finally {
            setProcessing(null);
        }
    };

    const renderCell = (date: Date) => {
        const dayLeave = leaves.find(l => isSameDay(parseISO(l.leaveDate), date));
        const dateStr = format(date, 'yyyy-MM-dd');
        const isProcessing = processing === dateStr;

        if (isProcessing) {
            return (
                <div className="mt-2 flex justify-center">
                    <Loader2 size={16} className="text-primary animate-spin" />
                </div>
            );
        }

        if (dayLeave) {
            return (
                <div className="flex flex-col gap-0.5 mt-0.5">
                    {/* 모바일: dot만 표시 */}
                    <div className="sm:hidden flex items-center gap-0.5">
                        {/* <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" /> */}
                        <Coffee size={10} className="flex-shrink-0 text-amber-400" />
                        {/* <span className="text-[9px] font-black uppercase text-amber-400">휴무</span> */}

                    </div>
                    {/* sm 이상: 아이콘 + 텍스트 배지 */}
                    <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md border border-amber-100 dark:border-amber-800/50">
                        <Coffee size={10} className="flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase">휴무</span>
                    </div>
                </div>
            );
        }



        return (
            <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <div className="flex items-center justify-center py-1 bg-slate-100 dark:bg-neutral-bg3 text-slate-400 dark:text-slate-500 rounded-lg text-[9px] font-bold">
                    지정
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        휴무 설정
                    </h1>
                    <p className="text-slate-500 mt-1">달력의 날짜를 클릭하여 본인의 휴무일을 관리할 수 있습니다.</p>
                </div>

                <div className="flex flex-col gap-3 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 max-w-sm">
                    <div className="flex items-start gap-3">
                        <Info size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                            <p className="font-bold mb-1">안내사항</p>
                            <ul className="list-disc ml-4 space-y-1">
                                <li>이미 지정된 휴무일을 다시 클릭하면 취소됩니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Calendar renderCell={renderCell} onDateClick={handleDateClick} />
        </div>
    );
};

export default MyLeave;
