import React, { useState, useEffect, useMemo } from 'react';
import { CultivationService } from '../../../services/api';
import { ChevronLeft, ChevronRight, Plus, ClipboardList, CheckCircle, Clock, Timer, Users, User, CheckCheck, PlayCircle, Pencil, Trash2 } from 'lucide-react';

interface Props {
    farmId: number;
    onAddClick: () => void;
    onEditClick?: (record: any) => void;
    refreshTrigger: number;
}

const DailyTasks: React.FC<Props> = ({ farmId, onAddClick, onEditClick, refreshTrigger }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [workRecords, setWorkRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        fetchDailyRecords();
    }, [farmId, selectedDate, refreshTrigger]);

    const fetchDailyRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getWorkRecordsByFarm(farmId);
            // res.data가 배열이거나 { success, data } 형태일 때 모두 대응
            const data = res.data.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            
            if (data) {
                const sorted = data.sort((a: any, b: any) => {
                    const dateA = new Date(a.workDate || 0).getTime();
                    const dateB = new Date(b.workDate || 0).getTime();
                    return dateB - dateA;
                });
                setWorkRecords(sorted);
            }
        } catch (error) {
            console.error('Error fetching work records:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (id: number, status: string) => {
        try {
            await CultivationService.updateWorkRecordStatus(id, status);
            fetchDailyRecords();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('정말 이 작업을 삭제하시겠습니까?')) {
            try {
                await CultivationService.deleteWorkRecord(id);
                fetchDailyRecords();
            } catch (err) {
                console.error(err);
                alert('작업 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // Calculate Days for Sidebar (3 days before, selected, 3 days after)
    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = -3; i <= 3; i++) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }, [selectedDate]);

    const changeMonth = (offset: number) => {
        const d = new Date(selectedDate);
        d.setMonth(d.getMonth() + offset);
        setSelectedDate(d);
    };

    const formatDayName = (d: Date) => d.toLocaleDateString('ko-KR', { weekday: 'short' });
    const formatMonthShort = (d: Date) => `${d.getMonth() + 1}월`;

    // Stats
    const stats = useMemo(() => {
        const total = workRecords.length;
        const completed = workRecords.filter(r => r.completionStatus === 'COMPLETED').length;
        const inProgress = workRecords.filter(r => r.completionStatus === 'IN_PROGRESS').length;
        const planned = workRecords.filter(r => r.completionStatus === 'PLANNED').length;
        // Calculate mock man-hours
        const manHours = workRecords.reduce((acc, curr) => {
            if (curr.startTime && curr.endTime) {
                const s = curr.startTime.split(':');
                const e = curr.endTime.split(':');
                const hours = (Number(e[0]) + Number(e[1]) / 60) - (Number(s[0]) + Number(s[1]) / 60);
                const totalWorkers = (curr.regularWorkerCount || 0) + (curr.dailyWorkerCount || 0);
                return acc + (hours > 0 ? hours * totalWorkers : 0);
            }
            return acc;
        }, 0);

        return { total, completed, inProgress, planned, manHours: manHours.toFixed(1) };
    }, [workRecords]);

    // Calendar Generation for Popover
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Fill empty days for the first row
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const calendarDates = useMemo(() => getDaysInMonth(selectedDate), [selectedDate.getFullYear(), selectedDate.getMonth()]);

    return (
        <div className="flex flex-col md:flex-row w-full h-full overflow-hidden relative">
            {/* Left Sidebar Calendar Stack */}
            <aside className="md:w-32 w-full md:border-r md:border-b-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex md:flex-col flex-row shrink-0">
                <div className="p-4 flex flex-col items-center justify-center md:border-b md:border-slate-100 md:dark:border-slate-800/50 mb-0 md:mb-2 shrink-0 md:w-full min-w-[120px] border-r border-slate-100 dark:border-slate-800/50 md:border-r-0 relative">
                    <div className="flex items-center justify-center gap-2 mb-1 w-full relative">
                        <button
                            onClick={() => changeMonth(-1)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            aria-label="이전 달"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="text-[14px] font-black text-slate-900 dark:text-white hover:text-primary transition-colors px-1"
                            >
                                {formatMonthShort(selectedDate)}
                            </button>

                            {/* Simple Calendar Popover */}
                            {showCalendar && (
                                <div className="absolute top-10 left-1 z-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in duration-200 overflow-hidden">
                                    {/* Month/Year Selection Row */}
                                    <div className="flex items-center justify-between gap-2 mb-4">
                                        <select
                                            value={selectedDate.getFullYear()}
                                            onChange={(e) => {
                                                const d = new Date(selectedDate);
                                                d.setFullYear(Number(e.target.value));
                                                setSelectedDate(d);
                                            }}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold px-2 py-1 focus:ring-1 focus:ring-primary/30"
                                        >
                                            {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}년</option>)}
                                        </select>
                                        <select
                                            value={selectedDate.getMonth()}
                                            onChange={(e) => {
                                                const d = new Date(selectedDate);
                                                d.setMonth(Number(e.target.value));
                                                setSelectedDate(d);
                                            }}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs font-bold px-2 py-1 focus:ring-1 focus:ring-primary/30"
                                        >
                                            {Array.from({ length: 12 }).map((_, m) => <option key={m} value={m}>{m + 1}월</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                            <span key={d} className="text-[11px] font-bold text-slate-400 uppercase">{d}</span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {calendarDates.map((d: Date | null, i: number) => (
                                            <div key={i} className="aspect-square flex items-center justify-center text-xs">
                                                {d ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDate(d);
                                                            setShowCalendar(false);
                                                        }}
                                                        className={`w-full h-full rounded-lg flex items-center justify-center transition-all
                                                            ${d.toDateString() === selectedDate.toDateString()
                                                                ? 'bg-primary text-white font-black shadow-md shadow-primary/20 scale-105'
                                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                            }
                                                        `}
                                                    >
                                                        {d.getDate()}
                                                    </button>
                                                ) : <span />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="text-[12px] font-extrabold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => changeMonth(1)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            aria-label="다음 달"
                        >
                            <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block mt-1">{selectedDate.getFullYear()}</div>
                </div>

                <div className="flex-1 overflow-x-auto md:overflow-y-auto overflow-y-hidden custom-scrollbar px-4 flex md:flex-col flex-row gap-3 py-3 md:py-4 items-center">
                    {calendarDays.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedDate(d)}
                                className={`w-14 sm:w-16 md:w-full shrink-0 py-2 sm:py-3 rounded-2xl flex flex-col items-center gap-1 transition-all
                                    ${isSelected
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10 scale-105 z-10'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                <span className={`text-[10px] uppercase ${isSelected ? 'font-bold opacity-80' : 'font-bold text-slate-500'}`}>
                                    {formatDayName(d)}
                                </span>
                                <span className={`font-black ${isSelected ? 'text-xl' : 'text-lg text-slate-900 dark:text-white'}`}>
                                    {d.getDate()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 bg-background-light dark:bg-background-dark overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
                <div className="w-full">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                전체 작업 현황
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-semibold mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse min-w-[8px]"></span>
                                총 {stats.total}개의 작업 중 {stats.inProgress + stats.planned}개가 예정/진행 중입니다
                            </p>
                        </div>
                        <button
                            onClick={onAddClick}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white font-black rounded-xl sm:rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                        >
                            <Plus size={20} />
                            <span>새 작업 추가</span>
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <ClipboardList size={20} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">전체 작업</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{String(stats.total).padStart(2, '0')}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle size={20} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">완료됨</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{String(stats.completed).padStart(2, '0')}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <Clock size={20} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">진행 중 및 예정</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{String(stats.inProgress + stats.planned).padStart(2, '0')}</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Timer size={20} />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">총 작업 시간</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.manHours}시간</div>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-slate-400 font-bold">작업 데이터를 불러오는 중...</div>
                        ) : workRecords.length === 0 ? (
                            <div className="text-center py-10 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed text-slate-400 font-bold">
                                등록된 작업이 없습니다.
                            </div>
                        ) : (
                            workRecords.map(record => {
                                const isCompleted = record.completionStatus === 'COMPLETED';
                                const workerCount = (record.regularWorkerCount || 0) + (record.dailyWorkerCount || 0);

                                return (
                                    <div key={record.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8 transition-all shadow-sm
                                        ${isCompleted ? 'opacity-70 hover:opacity-100' : 'hover:border-primary/40 group'}
                                    `}>
                                        <div className={`flex sm:flex-col flex-row items-center justify-between sm:justify-center rounded-xl sm:rounded-2xl p-3 sm:p-4 sm:min-w-[100px] shrink-0
                                            ${isCompleted ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800 text-primary'}
                                        `}>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-slate-400' : 'text-slate-400'}`}>
                                                {record.workDate ? record.workDate.substring(5).replace('-', '/') : '날짜 없음'}
                                            </span>
                                            <span className={`text-base font-black ${isCompleted ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                                {record.startTime ? record.startTime.substring(0, 5) : '대기'}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0 w-full text-left">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                                    <h4 className={`text-lg sm:text-xl font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                        {record.notes || '이름 없는 작업'}
                                                    </h4>

                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shrink-0
                                                        ${isCompleted ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                            : record.completionStatus === 'IN_PROGRESS'
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                                : 'bg-primary/10 text-primary'}
                                                    `}>
                                                        {record.completionStatusKorean}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 shrink-0 ml-4">
                                                    {onEditClick && (
                                                        <button 
                                                            onClick={() => onEditClick(record)}
                                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                            title="수정"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteClick(record.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-start gap-x-4 sm:gap-x-8 gap-y-2 sm:mt-2">
                                                {record.keywordId && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full" style={{ backgroundColor: record.keywordColorCode }}></span>
                                                        <span className="text-xs sm:text-sm font-bold text-slate-500">{record.workTypeKorean || '키워드 있음'}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                                    <Users size={16} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-slate-400' : 'text-primary'}`} />
                                                    <span className={`text-xs sm:text-sm font-bold ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {workerCount}명 배정됨
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 truncate">
                                                    <User size={16} className={`sm:w-5 sm:h-5 ${isCompleted ? 'text-slate-400' : 'text-primary'}`} />
                                                    <span className={`text-xs sm:text-sm font-bold truncate ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        관리자: {record.manager || '미지정'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                            {isCompleted ? (
                                                <div className="flex mx-auto w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl sm:bg-transparent sm:dark:bg-transparent">
                                                    <CheckCheck size={18} className="text-primary sm:w-5 sm:h-5" />
                                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest sm:block">완료됨</span>
                                                </div>
                                            ) : record.completionStatus === 'PLANNED' ? (
                                                <button
                                                    onClick={() => updateTaskStatus(record.id, 'IN_PROGRESS')}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-500 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 transition-all shadow-sm group-hover:bg-emerald-500 group-hover:text-white border border-emerald-200 dark:border-emerald-800/50 hover:border-transparent group-hover:border-transparent"
                                                >
                                                    <PlayCircle size={18} className="sm:w-5 sm:h-5" />
                                                    <span>작업 시작</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => updateTaskStatus(record.id, 'COMPLETED')}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm group-hover:bg-primary group-hover:text-white border border-slate-200 dark:border-slate-700 hover:border-transparent group-hover:border-transparent"
                                                >
                                                    <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                                                    <span>작업 완료</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DailyTasks;
