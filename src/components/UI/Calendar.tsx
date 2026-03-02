import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getKoreanHolidayName } from '../../utils/koreanHolidays';

interface CalendarProps {
    onDateClick?: (date: Date) => void;
    onDateLongPress?: (date: Date) => void;
    renderCell?: (date: Date) => React.ReactNode;
    selectedDate?: Date;
    onMonthChange?: (date: Date) => void;
}

const Calendar = ({ onDateClick, onDateLongPress, renderCell, selectedDate, onMonthChange }: CalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate ?? new Date());

    const nextMonth = () => {
        const next = addMonths(currentMonth, 1);
        setCurrentMonth(next);
        onMonthChange?.(next);
    };
    const prevMonth = () => {
        const prev = subMonths(currentMonth, 1);
        setCurrentMonth(prev);
        onMonthChange?.(prev);
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);

    const handlePressStart = (day: Date, isOutsideMonth: boolean) => {
        if (isOutsideMonth) return;
        setIsLongPressTriggered(false);
        const timer = setTimeout(() => {
            setIsLongPressTriggered(true);
            onDateLongPress?.(day);
        }, 500); // 500ms 롱프레스 기준
        setPressTimer(timer);
    };

    const handlePressEnd = (day: Date, isOutsideMonth: boolean) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        if (!isLongPressTriggered && !isOutsideMonth) {
            onDateClick?.(day);
        }
    };

    const handlePressCancel = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
    };



    return (
        <div className="bg-white dark:bg-neutral-bg2 rounded-3xl shadow-xl border border-slate-100 dark:border-neutral-bg4 overflow-hidden w-full transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                        {currentMonth.getFullYear()}년 <span className="text-primary">{currentMonth.getMonth() + 1}월</span>
                    </h2>
                    <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                        <button
                            onClick={prevMonth}
                            className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all text-slate-600 dark:text-slate-400"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-all text-slate-600 dark:text-slate-400"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const now = new Date();
                        setCurrentMonth(now);
                        onMonthChange?.(now);
                    }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all"
                >
                    오늘
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2 border-b border-slate-100 dark:border-zinc-800 pb-2 px-6"> {/* Added px-6 */}
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div
                        key={day}
                        className={`text-center text-[11px] sm:text-xs font-black uppercase tracking-widest ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="w-full px-6 pb-6"> {/* Added px-6 pb-6 */}
                <div
                    className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-neutral-bg4 p-px w-full"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', width: '100%' }}
                >
                    {calendarDays.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isOutsideMonth = !isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);
                        const dayOfWeek = day.getDay(); // 0=일, 6=토
                        const holidayName = getKoreanHolidayName(day);
                        const isHoliday = holidayName !== null;
                        const isSunday = dayOfWeek === 0;
                        const isSaturday = dayOfWeek === 6;
                        // 빨간날: 일요일 or 공휴일
                        const isRedDay = isSunday || isHoliday;

                        return (
                            <div
                                key={day.toString()}
                                onMouseDown={() => handlePressStart(day, isOutsideMonth)}
                                onMouseUp={() => handlePressEnd(day, isOutsideMonth)}
                                onMouseLeave={handlePressCancel}
                                onTouchStart={() => handlePressStart(day, isOutsideMonth)}
                                onTouchEnd={(e) => {
                                    e.preventDefault(); // onClick 중복 방지
                                    handlePressEnd(day, isOutsideMonth);
                                }}
                                onTouchCancel={handlePressCancel}
                                className={`
                                    bg-white dark:bg-neutral-bg2 p-1 sm:p-2 transition-all relative group flex flex-col
                                    h-16 sm:h-28 lg:h-32
                                    ${isOutsideMonth ? 'opacity-20 select-none' : 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-neutral-bg3'}
                                    ${isSelected ? 'ring-2 ring-inset ring-primary z-10' : ''}
                                    ${isRedDay && !isOutsideMonth ? 'bg-rose-50/40 dark:bg-rose-900/5' : ''}
                                `}
                            >
                                {/* 날짜 + 공휴일명 헤더 */}
                                <div className="flex items-start justify-between mb-0.5 sm:mb-1 gap-0.5 flex-shrink-0">
                                    <span className={`
                                        flex items-center justify-center w-5 h-5 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs sm:text-sm font-bold transition-all flex-shrink-0
                                        ${isTodayDate
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 sm:scale-110'
                                            : isSelected
                                                ? 'text-primary font-black'
                                                : isRedDay
                                                    ? 'text-rose-500 dark:text-rose-400 font-extrabold'
                                                    : isSaturday
                                                        ? 'text-blue-500 dark:text-blue-400 font-bold'
                                                        : 'text-slate-500 dark:text-slate-400'
                                        }
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {/* 공휴일 이름: sm 이상에서만 표시 */}
                                    {isHoliday && !isOutsideMonth && (
                                        <span className="hidden sm:block text-[9px] font-bold text-rose-400 dark:text-rose-400 leading-tight text-right truncate max-w-[60%]">
                                            {holidayName}
                                        </span>
                                    )}
                                </div>

                                {/* 콘텐츠 영역: overflow-hidden으로 셀 크기 고정 */}
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <div className="h-full overflow-y-auto sm:overflow-hidden space-y-0.5 sm:space-y-1">
                                        {renderCell?.(day)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
