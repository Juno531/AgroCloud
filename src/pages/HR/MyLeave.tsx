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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [leaveType, setLeaveType] = useState('연차');
    const [leaveReasonText, setLeaveReasonText] = useState('');

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
                // Add default leave
                const response = await LeaveService.saveLeave({ leaveDate: dateStr, reason: '[휴무]' });
                setLeaves(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error('Failed to update leave:', error);
            alert('휴무 정보 업데이트에 실패했습니다.');
        } finally {
            setProcessing(null);
        }
    };

    const handleDateLongPress = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
        setLeaveType('연차');
        setLeaveReasonText('');
    };

    const handleModalSubmit = async () => {
        if (!selectedDate) return;

        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const fullReason = leaveReasonText.trim() ? `[${leaveType}] ${leaveReasonText}` : `[${leaveType}]`;

        setIsModalOpen(false);
        try {
            setProcessing(dateStr);
            const response = await LeaveService.saveLeave({ leaveDate: dateStr, reason: fullReason });
            setLeaves(prev => {
                const filtered = prev.filter(l => !isSameDay(parseISO(l.leaveDate), selectedDate));
                return [...filtered, response.data];
            });
        } catch (error) {
            console.error('Failed to update leave:', error);
            alert('휴무 정보 업데이트에 실패했습니다.');
        } finally {
            setProcessing(null);
            setSelectedDate(null);
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
                <div className="flex flex-col gap-0.5 mt-0.5 max-w-full overflow-hidden">
                    {/* 모바일: dot만 표시 */}
                    <div className="sm:hidden flex items-center gap-0.5">
                        <Coffee size={10} className="flex-shrink-0 text-amber-400" />
                    </div>
                    {/* sm 이상: 아이콘 + 텍스트 배지 */}
                    <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md border border-amber-100 dark:border-amber-800/50 w-full">
                        <Coffee size={10} className="flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase truncate">{dayLeave.reason ? dayLeave.reason : '휴무'}</span>
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

            <Calendar renderCell={renderCell} onDateClick={handleDateClick} onDateLongPress={handleDateLongPress} />

            {/* 사유 입력 모달 */}
            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            휴무 지정 ({format(selectedDate, 'M월 d일')})
                        </h3>
                        <div className="space-y-4">
                            <select
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-white"
                            >
                                <option value="연차">연차</option>
                                <option value="휴무">휴무</option>
                            </select>
                            <textarea
                                value={leaveReasonText}
                                onChange={(e) => setLeaveReasonText(e.target.value)}
                                placeholder="상세 사유 (선택사항)"
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 h-24 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-white"
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                                >
                                    등록
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLeave;
