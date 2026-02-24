import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '../../services/api';

interface EmployeeSummary {
    userId: number;
    name: string;
}

interface DaySummary {
    date: string;
    workerCount: number;
    leaveCount: number;
    workers: EmployeeSummary[];
    leaves: EmployeeSummary[];
}

interface ModalState {
    isOpen: boolean;
    date: string;
    workers: EmployeeSummary[];
    leaves: EmployeeSummary[];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const AttendanceManagement = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [summaryMap, setSummaryMap] = useState<Map<string, DaySummary>>(new Map());
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>({ isOpen: false, date: '', workers: [], leaves: [] });

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AttendanceService.getMonthlySummary(year, month);
            const data: DaySummary[] = res.data;
            const map = new Map<string, DaySummary>();
            data.forEach(d => map.set(d.date, d));
            setSummaryMap(map);
        } catch (e) {
            console.error('근태 현황 로드 실패:', e);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const prevMonth = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarCells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (calendarCells.length < 42) calendarCells.push(null);

    const formatDate = (d: number) =>
        `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const handleDayClick = (d: number) => {
        const key = formatDate(d);
        const summary = summaryMap.get(key);
        setModal({
            isOpen: true,
            date: `${year}년 ${month}월 ${d}일`,
            workers: summary?.workers ?? [],
            leaves: summary?.leaves ?? [],
        });
    };

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">근태 관리</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">직원별 월간 근무 및 휴무 현황</p>
                </div>
                {/* 월 네비게이션 */}
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 p-1.5 sm:p-2 shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-primary transition-all"
                    >
                        <span className="material-icons-round text-base sm:text-lg">chevron_left</span>
                    </button>
                    <span className="font-bold text-slate-800 dark:text-white min-w-[90px] sm:min-w-[100px] text-center text-sm sm:text-base">
                        {year}년 {month}월
                    </span>
                    <button
                        onClick={nextMonth}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-primary transition-all"
                    >
                        <span className="material-icons-round text-base sm:text-lg">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* 범례 */}
            <div className="flex gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-slate-600 dark:text-slate-400">근무</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span className="text-slate-600 dark:text-slate-400">휴무</span>
                </div>
            </div>

            {/* 캘린더 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-lg overflow-hidden">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-zinc-800">
                    {WEEKDAYS.map((day, i) => (
                        <div
                            key={day}
                            className={`py-2 sm:py-3 text-center text-[10px] sm:text-xs font-bold tracking-wide
                                ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* 날짜 셀 */}
                {loading ? (
                    <div className="h-64 sm:h-96 flex items-center justify-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {calendarCells.map((day, idx) => {
                            if (!day) {
                                return (
                                    <div
                                        key={`empty-${idx}`}
                                        className="min-h-[60px] sm:min-h-[90px] border-b border-r border-slate-50 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-800/20"
                                    />
                                );
                            }

                            const key = formatDate(day);
                            const summary = summaryMap.get(key);
                            const isToday = key === todayStr;
                            const dayOfWeek = (firstDay + day - 1) % 7;
                            const isSunday = dayOfWeek === 0;
                            const isSaturday = dayOfWeek === 6;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        min-h-[60px] sm:min-h-[90px] p-1.5 sm:p-2 text-left border-b border-r border-slate-100 dark:border-zinc-800
                                        hover:bg-primary/5 dark:hover:bg-primary/10 active:scale-95 transition-all group
                                        ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}
                                    `}
                                >
                                    <div className="flex flex-col h-full gap-0.5 sm:gap-1">
                                        {/* 날짜 번호 */}
                                        <span className={`
                                            w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-sm font-bold transition-all
                                            group-hover:bg-primary group-hover:text-white
                                            ${isToday ? 'bg-primary text-white' : ''}
                                            ${!isToday && isSunday ? 'text-rose-500' : ''}
                                            ${!isToday && isSaturday ? 'text-blue-500' : ''}
                                            ${!isToday && !isSunday && !isSaturday ? 'text-slate-700 dark:text-slate-300' : ''}
                                        `}>
                                            {day}
                                        </span>

                                        {/* 뱃지 - 모바일: 점/아이콘, 데스크탑: 텍스트 포함 */}
                                        {summary && (
                                            <div className="flex flex-col gap-0.5 sm:gap-1 mt-0.5">
                                                {summary.workerCount > 0 && (
                                                    <>
                                                        {/* 모바일: 점 */}
                                                        <div className="sm:hidden flex items-center gap-0.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 truncate">{summary.workerCount}</span>
                                                        </div>
                                                        {/* 데스크탑: 뱃지 */}
                                                        <div className="hidden sm:flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-1.5 py-0.5">
                                                            <span className="material-icons-round text-emerald-500 text-xs">person</span>
                                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{summary.workerCount}명</span>
                                                        </div>
                                                    </>
                                                )}
                                                {summary.leaveCount > 0 && (
                                                    <>
                                                        {/* 모바일: 점 */}
                                                        <div className="sm:hidden flex items-center gap-0.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 truncate">{summary.leaveCount}</span>
                                                        </div>
                                                        {/* 데스크탑: 뱃지 */}
                                                        <div className="hidden sm:flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-1.5 py-0.5">
                                                            <span className="material-icons-round text-amber-500 text-xs">event_busy</span>
                                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{summary.leaveCount}명</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 날짜 클릭 상세 모달 */}
            {modal.isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[72px] sm:pb-4"
                    onClick={() => setModal(m => ({ ...m, isOpen: false }))}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto overscroll-contain"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 모달 드래그 핸들 (모바일) */}
                        <div className="flex justify-center sm:hidden mb-1">
                            <div className="w-10 h-1 bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
                        </div>

                        {/* 모달 헤더 */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">{modal.date}</h3>
                            <button
                                onClick={() => setModal(m => ({ ...m, isOpen: false }))}
                                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
                            >
                                <span className="material-icons-round text-lg">close</span>
                            </button>
                        </div>

                        {/* 근무자 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    근무 ({modal.workers.length}명)
                                </p>
                            </div>
                            {modal.workers.length === 0 ? (
                                <p className="text-sm text-slate-400 pl-4">근무 기록 없음</p>
                            ) : (
                                <div className="space-y-1 pl-4">
                                    {modal.workers.map(w => (
                                        <div key={w.userId} className="flex items-center gap-2 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <span className="material-icons-round text-emerald-500 text-sm">person</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 휴무자 - 노란색 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    휴무 ({modal.leaves.length}명)
                                </p>
                            </div>
                            {modal.leaves.length === 0 ? (
                                <p className="text-sm text-slate-400 pl-4">휴무 기록 없음</p>
                            ) : (
                                <div className="space-y-1 pl-4">
                                    {modal.leaves.map(l => (
                                        <div key={l.userId} className="flex items-center gap-2 py-1.5 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                            <span className="material-icons-round text-amber-500 text-sm">event_busy</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{l.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManagement;
