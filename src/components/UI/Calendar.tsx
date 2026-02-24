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
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    onDateClick?: (date: Date) => void;
    renderCell?: (date: Date) => React.ReactNode;
    selectedDate?: Date;
}

const Calendar = ({ onDateClick, renderCell, selectedDate }: CalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="bg-white dark:bg-neutral-bg2 rounded-3xl shadow-xl border border-slate-100 dark:border-neutral-bg4 overflow-hidden w-full transition-colors duration-300">
            {/* Calendar Header */}
            <div className="px-6 py-6 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent border-b border-slate-50 dark:border-neutral-bg4/50">
                <div className="flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-0.5">Work Calendar</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-bg3 text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-100 dark:hover:border-neutral-bg4"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-bg3 text-slate-500 hover:text-primary transition-all border border-transparent hover:border-slate-100 dark:hover:border-neutral-bg4"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div
                className="grid grid-cols-7 bg-slate-50/50 dark:bg-neutral-bg1/30"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    width: '100%'
                }}
            >
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className={`py-3 text-center text-[10px] font-black uppercase tracking-widest
                            ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}
                        `}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid Wrapper */}
            <div className="overflow-x-auto w-full">
                <div
                    className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-neutral-bg4 p-px min-w-[700px] lg:min-w-full"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '1px',
                        width: '100%'
                    }}
                >
                    {calendarDays.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isOutsideMonth = !isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => !isOutsideMonth && onDateClick?.(day)}
                                className={`
                                    bg-white dark:bg-neutral-bg2 p-1.5 sm:p-2.5 transition-all relative group flex flex-col
                                    ${isOutsideMonth ? 'opacity-20 select-none' : 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-neutral-bg3'}
                                    ${isSelected ? 'ring-2 ring-inset ring-primary z-10' : ''}
                                `}
                                style={{ minHeight: '120px' }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`
                                        flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-bold transition-all
                                        ${isTodayDate ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' :
                                            isSelected ? 'text-primary font-black' :
                                                (day.getDay() === 0 ? 'text-rose-400' : day.getDay() === 6 ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400')}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-1 mt-1 sm:mt-2 overflow-y-auto custom-scrollbar">
                                    {renderCell?.(day)}
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
