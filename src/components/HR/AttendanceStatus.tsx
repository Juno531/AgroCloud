import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '../../services/api';
import Calendar from '../UI/Calendar';
import { format } from 'date-fns';

interface EmployeeSummary {
    userId: number;
    name: string;
    employmentType?: 'FULL_TIME' | 'PART_TIME';
    reason?: string;
}

interface DaySummary {
    date: string;
    workerCount: number;
    leaveCount: number;
    absenteeCount: number;
    fullTimeScheduledCount: number;   // 정규직 근무예정자 수
    partTimeScheduledCount: number;   // 비정규직 근무예정자 수
    workers: EmployeeSummary[];
    leaves: EmployeeSummary[];
    absentees: EmployeeSummary[];
    scheduledWorkers: EmployeeSummary[]; // 전체직원 - 휴무자
}

interface ModalState {
    isOpen: boolean;
    date: string;
    workers: EmployeeSummary[];
    leaves: EmployeeSummary[];
    absentees: EmployeeSummary[];
    scheduledWorkers: EmployeeSummary[];
}



const AttendanceStatus = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [activeTab, setActiveTab] = useState<'attendance' | 'leave'>('leave');
    const [summaryMap, setSummaryMap] = useState<Map<string, DaySummary>>(new Map());
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<ModalState>({ isOpen: false, date: '', workers: [], leaves: [], absentees: [], scheduledWorkers: [] });

    // 오늘/내일 날짜 키
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(today.getDate() + 1);
    const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AttendanceService.getMonthlySummary({ year, month });
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


    // 현황 카드 렌더링 헬퍼
    const renderStatusCard = (label: string, dateStr: string, isToday: boolean) => {
        const s = summaryMap.get(dateStr);
        const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
        const d = isToday ? today : tomorrowDate;
        const wdLabel = WEEKDAYS[d.getDay()];
        const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;

        return (
            <div className={`flex-1 rounded-2xl border p-2.5 sm:p-4 space-y-1.5 sm:space-y-2 min-w-0 ${isToday
                ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30'
                : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`text-[10px] sm:text-xs font-black px-1.5 sm:py-0.5 rounded-full ${isToday ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300'
                            }`}>{label}</span>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{mmdd} ({wdLabel})</span>
                    </div>
                </div>
                {s ? (
                    <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-0.5">
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                            <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-400">
                                <span className="sm:hidden">정 </span>
                                <span className="hidden sm:inline">정규직 </span>
                                {s.fullTimeScheduledCount}명
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0"></span>
                            <span className="text-[10px] sm:text-xs font-bold text-purple-700 dark:text-purple-400">
                                <span className="sm:hidden">비 </span>
                                <span className="hidden sm:inline">비정규직 </span>
                                {s.partTimeScheduledCount}명
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                            <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
                                <span className="sm:hidden">휴 </span>
                                <span className="hidden sm:inline">휴무 </span>
                                {s.leaveCount}명
                            </span>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">데이터 없음</p>
                )}
            </div>
        );
    };

    return (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* 헤더 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">근태 관리</h2>
                    {/* 탭 버튼 */}
                    <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-fit">
                        <button
                            onClick={() => setActiveTab('leave')}
                            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'leave'
                                ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            휴무 현황
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'attendance'
                                ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            근태 현황
                        </button>
                    </div>
                </div>

                {/* 오늘/내일 현황 카드 */}
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto sm:max-w-sm flex-1 sm:flex-initial">
                    {renderStatusCard('오늘', todayStr, true)}
                    {renderStatusCard('내일', tomorrowStr, false)}
                </div>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] sm:text-sm">
                {activeTab === 'attendance' ? (
                    <>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">근무</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500"></span>
                            <span className="text-slate-600 dark:text-slate-400">결근</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400"></span>
                            <span className="text-slate-600 dark:text-slate-400">휴무</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-500"></span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">정규직</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-purple-500"></span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">비정규직</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400"></span>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">휴무</span>
                        </div>
                    </>
                )}
            </div>

            {/* 캘린더 */}
            {loading ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-lg overflow-hidden h-64 sm:h-96 flex items-center justify-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <Calendar
                    selectedDate={new Date(year, month - 1, today.getDate())}
                    onMonthChange={(date) => {
                        setYear(date.getFullYear());
                        setMonth(date.getMonth() + 1);
                    }}
                    onDateClick={(date) => {
                        const key = format(date, 'yyyy-MM-dd');
                        const summary = summaryMap.get(key);
                        setModal({
                            isOpen: true,
                            date: format(date, 'yyyy년 M월 d일'),
                            workers: summary?.workers ?? [],
                            leaves: summary?.leaves ?? [],
                            absentees: summary?.absentees ?? [],
                            scheduledWorkers: summary?.scheduledWorkers ?? [],
                        });
                    }}
                    renderCell={(date) => {
                        const key = format(date, 'yyyy-MM-dd');
                        const summary = summaryMap.get(key);
                        if (!summary) return null;

                        const fullTimeCount = summary.fullTimeScheduledCount;
                        const partTimeCount = summary.partTimeScheduledCount;
                        const leaveCount = summary.leaveCount;

                        return activeTab === 'attendance' ? (
                            <>
                                {/* 모바일: 조건부 dot 세로 나열 */}
                                <div className="sm:hidden flex flex-col gap-0.5">
                                    {summary.workerCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 leading-none">{summary.workerCount}</span>
                                        </div>
                                    )}
                                    {summary.absenteeCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 leading-none">{summary.absenteeCount}</span>
                                        </div>
                                    )}
                                    {leaveCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-none">{leaveCount}</span>
                                        </div>
                                    )}
                                </div>
                                {/* sm 이상: 배지 형태 - 950px 부근에서도 잘 보이지 않도록 함 */}
                                <div className="hidden sm:flex flex-col gap-0.5 lg:gap-1 w-full">
                                    {summary.workerCount > 0 && (
                                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-emerald-500 text-[9px] lg:text-[11px]">person</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 truncate">
                                                근무 {summary.workerCount}
                                            </span>
                                        </div>
                                    )}
                                    {summary.absenteeCount > 0 && (
                                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-rose-500 text-[9px] lg:text-[11px]">person_off</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-rose-700 dark:text-rose-400 truncate">
                                                결근 {summary.absenteeCount}
                                            </span>
                                        </div>
                                    )}
                                    {leaveCount > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-amber-500 text-[9px] lg:text-[11px]">event_busy</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-amber-600 dark:text-amber-400 truncate">
                                                휴무 {leaveCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 모바일: flex-row로 수평 나열 — 셀 높이 변동 최소화 */}
                                <div className="sm:hidden flex flex-wrap items-center gap-x-1 gap-y-0.5">
                                    {fullTimeCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                            <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 leading-none">{fullTimeCount}</span>
                                        </div>
                                    )}
                                    {partTimeCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                            <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 leading-none">{partTimeCount}</span>
                                        </div>
                                    )}
                                    {leaveCount > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 leading-none">{leaveCount}</span>
                                        </div>
                                    )}
                                </div>
                                {/* sm 이상: 세로 배지 (공간 최적화 및 휴무 표시 보장) */}
                                <div className="hidden sm:flex flex-col gap-0.5 lg:gap-1 w-full">
                                    {fullTimeCount > 0 && (
                                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-blue-500 text-[9px] lg:text-[11px]">person</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-blue-700 dark:text-blue-400 truncate">정 {fullTimeCount}</span>
                                        </div>
                                    )}
                                    {partTimeCount > 0 && (
                                        <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-purple-500 text-[9px] lg:text-[11px]">person_outline</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-purple-700 dark:text-purple-400 truncate">비 {partTimeCount}</span>
                                        </div>
                                    )}
                                    {leaveCount > 0 && (
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-1.5 py-0.5">
                                            <span className="material-icons-round text-amber-500 text-[9px] lg:text-[11px]">event_busy</span>
                                            <span className="text-[9px] lg:text-[11px] font-extrabold text-amber-600 dark:text-amber-400 truncate">휴 {leaveCount}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    }}
                />
            )}
            {!loading && <div className="h-0" />} {/* Layout spacing anchor */}

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

                        {activeTab === 'attendance' ? (
                            <>
                                {/* 결근자 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                            결근 ({modal.absentees.length}명)
                                        </p>
                                    </div>
                                    {modal.absentees.length > 0 && (
                                        <div className="space-y-1 pl-4 mb-4">
                                            {modal.absentees.map(a => (
                                                <div key={a.userId} className="flex items-center gap-2 py-1.5 px-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                                                    <span className="material-icons-round text-rose-500 text-sm">person_off</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{a.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                        <p className="text-sm text-slate-400 pl-4 mb-4">근무 기록 없음</p>
                                    ) : (
                                        <div className="space-y-1 pl-4 mb-4">
                                            {modal.workers.map(w => (
                                                <div key={w.userId} className="flex items-center gap-2 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                                    <span className="material-icons-round text-emerald-500 text-sm">person</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* 휴무자 */}
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
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {l.name} {l.reason && <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md ml-1">{l.reason}</span>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 정규직 근무예정자 */}
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                            정규직 근무예정 ({modal.scheduledWorkers.filter(w => w.employmentType === 'FULL_TIME').length}명)
                                        </p>
                                    </div>
                                    {modal.scheduledWorkers.filter(w => w.employmentType === 'FULL_TIME').length === 0 ? (
                                        <p className="text-sm text-slate-400 pl-4">없음</p>
                                    ) : (
                                        <div className="space-y-1 pl-4">
                                            {modal.scheduledWorkers.filter(w => w.employmentType === 'FULL_TIME').map(w => (
                                                <div key={w.userId} className="flex items-center gap-2 py-1.5 px-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                    <span className="material-icons-round text-blue-500 text-sm">person</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 비정규직 근무예정자 */}
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                            비정규직 근무예정 ({modal.scheduledWorkers.filter(w => w.employmentType === 'PART_TIME').length}명)
                                        </p>
                                    </div>
                                    {modal.scheduledWorkers.filter(w => w.employmentType === 'PART_TIME').length === 0 ? (
                                        <p className="text-sm text-slate-400 pl-4">없음</p>
                                    ) : (
                                        <div className="space-y-1 pl-4">
                                            {modal.scheduledWorkers.filter(w => w.employmentType === 'PART_TIME').map(w => (
                                                <div key={w.userId} className="flex items-center gap-2 py-1.5 px-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                                    <span className="material-icons-round text-purple-500 text-sm">person_outline</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{w.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 휴무자 */}
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
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {l.name} {l.reason && <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded-md ml-1">{l.reason}</span>}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceStatus;
