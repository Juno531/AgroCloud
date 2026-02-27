import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, getISOWeek, startOfISOWeek, endOfISOWeek, startOfYear, endOfYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Download, Users, UserCheck, UserX, Calendar, Filter, MapPin, CalendarDays, Check } from 'lucide-react';
import { AttendanceService, EmployeeService } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { useAuth } from '../../context/AuthContext';
import { EmployeeProfile } from '../../types';

interface AttendanceResponse {
    id: number;
    userId: number;
    userName: string;
    type: 'CLOCK_IN' | 'CLOCK_OUT';
    timestamp: string;
    farmId: number;
    companyCode: string;
    weekNumber: number;
    workingDayIndex: number;
}

const AttendanceLog = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fields } = useFarm();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [clockInFilters, setClockInFilters] = useState<number[]>([]);
    const [clockOutFilters, setClockOutFilters] = useState<number[]>([]);
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [employmentTypeFilters, setEmploymentTypeFilters] = useState<string[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState<AttendanceResponse[]>([]);
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    useEffect(() => {
        // user.companyCode가 있으면 farmId 선정보다 우선함
        if (user?.companyCode) {
            fetchData();
            return;
        }
    }, [fields, user]);

    useEffect(() => {
        if (user?.farmId || user?.companyCode) {
            fetchData();
        }
    }, [user?.farmId, user?.companyCode, currentDate, viewMode]);

    const fetchData = async () => {
        const farmToUse = user?.farmId;
        const companyCodeToUse = user?.companyCode && user.companyCode.trim() !== "" ? user.companyCode : null;

        if (!farmToUse && !companyCodeToUse) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let startDateStr: string;
            let endDateStr: string;

            if (viewMode === 'daily') {
                startDateStr = `${format(currentDate, 'yyyy-MM-dd')}T00:00:00`;
                endDateStr = `${format(currentDate, 'yyyy-MM-dd')}T23:59:59`;
            } else if (viewMode === 'weekly') {
                const sDate = startOfISOWeek(currentDate);
                const eDate = endOfISOWeek(currentDate);
                startDateStr = `${format(sDate, 'yyyy-MM-dd')}T00:00:00`;
                endDateStr = `${format(eDate, 'yyyy-MM-dd')}T23:59:59`;
            } else if (viewMode === 'monthly') {
                const sDate = startOfMonth(currentDate);
                const eDate = endOfMonth(currentDate);
                startDateStr = `${format(sDate, 'yyyy-MM-dd')}T00:00:00`;
                endDateStr = `${format(eDate, 'yyyy-MM-dd')}T23:59:59`;
            } else {
                const sDate = startOfYear(currentDate);
                const eDate = endOfYear(currentDate);
                startDateStr = `${format(sDate, 'yyyy-MM-dd')}T00:00:00`;
                endDateStr = `${format(eDate, 'yyyy-MM-dd')}T23:59:59`;
            }

            let attendancePromise;
            let employeesPromise;

            if (companyCodeToUse) {
                attendancePromise = AttendanceService.getCompanyAttendance(companyCodeToUse, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByCompany(companyCodeToUse);
            } else {
                attendancePromise = AttendanceService.getFarmAttendance(farmToUse!, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByFarm(farmToUse!);
            }

            const [attendanceRes, employeesRes] = await Promise.all([
                attendancePromise,
                employeesPromise
            ]);

            setRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);

        } catch (error: any) {
            console.error("Failed to fetch attendance data:", error);
            setRecords([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        navigate('/hr/attendance-export');
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentDate(new Date(e.target.value));
    };

    // 데이터 병합 및 가공
    const processedData = useMemo(() => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const currentMonthStr = format(currentDate, 'yyyy-MM');
        const currentYearStr = format(currentDate, 'yyyy');

        // 직원 목록 필터링 (검색어 + 고용 형태)
        const filteredEmployees = employees.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchEmploymentType = employmentTypeFilters.length === 0 || (emp.employmentType && employmentTypeFilters.includes(emp.employmentType));
            return matchSearch && matchEmploymentType;
        });

        let result = [];

        if (viewMode === 'daily') {
            result = filteredEmployees.map(emp => {
                // 해당 직원의 해당 날짜 기록들을 찾음
                const userDayRecords = records.filter(r => {
                    const recordDate = format(new Date(r.timestamp), 'yyyy-MM-dd');
                    return r.userId === emp.userId && recordDate === dateStr;
                });

                const d = new Date(dateStr);
                if (userDayRecords.length > 0) {
                    // 시간 역순 정렬 (최신순)
                    const sortedRecords = [...userDayRecords].sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );

                    const latestRecord = sortedRecords[0]!;
                    const weekInfo = `${latestRecord.weekNumber || getISOWeek(d)}주차 ${latestRecord.workingDayIndex || 1}일차 (${format(d, 'E', { locale: ko })})`;

                    let clockIn = null;
                    let clockOut = null;
                    let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'CLOCK_OUT' = 'ABSENT';

                    if (latestRecord.type === 'CLOCK_IN') {
                        // 최신 기록이 출근이면: 퇴근은 아직 안 함 (표시 초기화)
                        clockIn = latestRecord;
                        clockOut = null;
                        status = 'PRESENT';
                    } else {
                        // 최신 기록이 퇴근이면: 해당 퇴근과 매칭되는 가장 최근 출근 찾기
                        clockOut = latestRecord;
                        clockIn = sortedRecords.find(r => r.type === 'CLOCK_IN');
                        status = 'CLOCK_OUT';
                    }

                    const clockInFarmName = clockIn ? (fields?.find(f => f.id === clockIn.farmId)?.name || '알 수 없음') : '-';
                    const clockInFarmId = clockIn ? clockIn.farmId : null;
                    const clockOutFarmName = clockOut ? (fields?.find(f => f.id === clockOut.farmId)?.name || '알 수 없음') : '-';
                    const clockOutFarmId = clockOut ? clockOut.farmId : null;

                    return {
                        id: latestRecord.id || 0,
                        userId: emp.userId,
                        userName: emp.name,
                        date: dateStr,
                        clockInFarmName,
                        clockInFarmId,
                        clockOutFarmName,
                        clockOutFarmId,
                        weekInfo,
                        checkInTime: clockIn ? format(new Date(clockIn.timestamp), 'HH:mm:ss') : null,
                        checkOutTime: clockOut ? format(new Date(clockOut.timestamp), 'HH:mm:ss') : null,
                        status: status,
                        workDuration: (clockIn && clockOut)
                            ? Math.floor((new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime()) / 60000)
                            : null
                    };
                }

                const absentWeekInfo = `${getISOWeek(d)}주차 (${format(d, 'E', { locale: ko })})`;

                return {
                    id: -(emp.id! || emp.userId! || Math.random()),
                    userId: emp.userId,
                    userName: emp.name,
                    date: dateStr,
                    clockInFarmName: '-',
                    clockInFarmId: null,
                    clockOutFarmName: '-',
                    clockOutFarmId: null,
                    weekInfo: absentWeekInfo,
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'ABSENT' as const,
                    workDuration: null
                };
            });
        } else {
            // 주간/월간/연간 뷰: 검색어와 맞는 직원들의 기록만 표시
            const employeeIds = new Set(filteredEmployees.map(e => e.userId));
            result = records
                .filter(r => {
                    if (!employeeIds.has(r.userId)) return false;
                    const recordDate = new Date(r.timestamp);
                    if (viewMode === 'monthly') return format(recordDate, 'yyyy-MM') === currentMonthStr;
                    if (viewMode === 'yearly') return format(recordDate, 'yyyy') === currentYearStr;
                    return true;
                })
                .map(r => {
                    const d = new Date(r.timestamp);
                    const weekInfo = `${r.weekNumber || getISOWeek(d)}주차 ${r.workingDayIndex || 1}일차 (${format(d, 'E', { locale: ko })})`;
                    return {
                        id: r.id,
                        userId: r.userId,
                        userName: r.userName,
                        date: format(d, 'yyyy-MM-dd'),
                        clockInFarmName: r.type === 'CLOCK_IN' ? (fields?.find(f => f.id === r.farmId)?.name || '알 수 없음') : '-',
                        clockInFarmId: r.type === 'CLOCK_IN' ? r.farmId : null,
                        clockOutFarmName: r.type === 'CLOCK_OUT' ? (fields?.find(f => f.id === r.farmId)?.name || '알 수 없음') : '-',
                        clockOutFarmId: r.type === 'CLOCK_OUT' ? r.farmId : null,
                        weekInfo,
                        checkInTime: r.type === 'CLOCK_IN' ? format(d, 'HH:mm:ss') : null,
                        checkOutTime: r.type === 'CLOCK_OUT' ? format(d, 'HH:mm:ss') : null,
                        status: (r.type === 'CLOCK_IN' ? 'PRESENT' : 'CLOCK_OUT') as any,
                        workDuration: null
                    };
                });
        }

        // 필터 적용
        return result.filter(r => {
            const matchClockIn = clockInFilters.length === 0 || (r.clockInFarmId !== null && clockInFilters.includes(r.clockInFarmId));
            const matchClockOut = clockOutFilters.length === 0 || (r.clockOutFarmId !== null && clockOutFilters.includes(r.clockOutFarmId));
            const matchStatus = statusFilters.length === 0 || statusFilters.includes(r.status);
            return matchClockIn && matchClockOut && matchStatus;
        });
    }, [records, employees, viewMode, currentDate, searchTerm, fields, clockInFilters, clockOutFilters, statusFilters]);

    const stats = useMemo(() => {
        const filteredEmployeesCount = employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).length;

        let total = filteredEmployeesCount;
        let present = 0;
        let leave = 0;

        if (viewMode === 'daily') {
            present = processedData.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
            leave = processedData.filter(r => r.status === 'ABSENT' || r.status === 'LEAVE').length;
        } else {
            const activeUserIds = new Set(processedData.map(r => r.userId));
            present = activeUserIds.size;
            leave = total - present;
        }

        return { total, present, leave };
    }, [employees, processedData, viewMode, searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-100 text-green-700';
            case 'LATE': return 'bg-yellow-100 text-yellow-700';
            case 'ABSENT': return 'bg-red-100 text-red-700';
            case 'LEAVE': return 'bg-blue-100 text-blue-700';
            case 'CLOCK_OUT': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PRESENT': return '정상 출근';
            case 'LATE': return '지각';
            case 'ABSENT': return '결근';
            case 'LEAVE': return '휴가';
            case 'CLOCK_OUT': return '퇴근 완료';
            default: return '미확인';
        }
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}시간 ${mins}분`;
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1">
                            {viewMode === 'daily' ? '전체 직원' : '총 기록'}
                        </p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.total}{viewMode === 'daily' ? '명' : '건'}</h3>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center self-end md:self-auto">
                        <Users size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1">출근 현황</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.present}{viewMode === 'daily' ? '명' : '건'}</h3>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center self-end md:self-auto">
                        <UserCheck size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2 col-span-2 lg:col-span-1">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-1">휴무/결근</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">{stats.leave}{viewMode === 'daily' ? '명' : '건'}</h3>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center self-end md:self-auto">
                        <UserX size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
            </div>

            {/* Header Controls */}
            <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 relative z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === 'daily'
                                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                일간
                            </button>
                            <button
                                onClick={() => setViewMode('weekly')}
                                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === 'weekly'
                                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                주간
                            </button>
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === 'monthly'
                                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                월간
                            </button>
                            <button
                                onClick={() => setViewMode('yearly')}
                                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === 'yearly'
                                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                연간
                            </button>
                        </div>

                        <div className="relative flex items-center flex-1 md:flex-none">
                            <div className="absolute left-3 pointer-events-none text-slate-500">
                                <Calendar size={16} />
                            </div>
                            <input
                                type={
                                    (viewMode === 'daily' || viewMode === 'weekly') ? 'date' :
                                        (viewMode === 'monthly' ? 'month' : 'number')
                                }
                                min={viewMode === 'yearly' ? '2020' : undefined}
                                max={viewMode === 'yearly' ? '2099' : undefined}
                                value={
                                    (viewMode === 'daily' || viewMode === 'weekly') ? format(currentDate, 'yyyy-MM-dd') :
                                        (viewMode === 'monthly' ? format(currentDate, 'yyyy-MM') : format(currentDate, 'yyyy'))
                                }
                                onChange={(e) => {
                                    if (viewMode === 'yearly') {
                                        const year = parseInt(e.target.value);
                                        if (year >= 2020 && year <= 2099) {
                                            setCurrentDate(new Date(year, 0, 1));
                                        }
                                    } else {
                                        handleDateChange(e);
                                    }
                                }}
                                className="w-full md:w-auto pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                        {/* 필터 팝오버 */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">필터</span>
                                {(clockInFilters.length > 0 || clockOutFilters.length > 0 || statusFilters.length > 0) && (
                                    <span className="w-2 h-2 rounded-full bg-primary absolute top-2 right-2"></span>
                                )}
                            </button>

                            {isFilterOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-800 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-zinc-900/50 border border-slate-200 dark:border-zinc-700 z-50 p-5 flex flex-col max-h-[80vh]">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-zinc-700/50">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">기록 세부 필터</h4>
                                        <button
                                            onClick={() => {
                                                setClockInFilters([]);
                                                setClockOutFilters([]);
                                                setStatusFilters([]);
                                            }}
                                            className="text-[11px] font-medium text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-zinc-700/50 hover:bg-primary/10 px-2 py-1 rounded-md"
                                        >
                                            초기화
                                        </button>
                                    </div>

                                    <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                        {/* 고용 형태 필터 */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">고용 형태</label>
                                            <div className="space-y-1">
                                                {[
                                                    { value: 'FULL_TIME', label: '정규직' },
                                                    { value: 'PART_TIME', label: '비정규직' }
                                                ].map(et => {
                                                    const checked = employmentTypeFilters.includes(et.value);
                                                    return (
                                                        <label key={et.value} className="flex items-center gap-3 p-1.5 -mx-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700/30 rounded-lg cursor-pointer group transition-colors select-none">
                                                            <div className={`flex-shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center border transition-all duration-200 ${checked ? 'bg-primary border-primary' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 group-hover:border-primary/50'}`}>
                                                                {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm font-medium transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                                                                {et.label}
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={checked}
                                                                onChange={() => {
                                                                    setEmploymentTypeFilters(prev => prev.includes(et.value) ? prev.filter(item => item !== et.value) : [...prev, et.value]);
                                                                }}
                                                            />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 출결 상태 필터 */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">출결 상태</label>
                                            <div className="space-y-1">
                                                {[
                                                    { value: 'PRESENT', label: '정상 출근' },
                                                    { value: 'LATE', label: '지각' },
                                                    { value: 'CLOCK_OUT', label: '퇴근 완료' },
                                                    { value: 'ABSENT', label: '결근/데이터 없음' },
                                                    { value: 'LEAVE', label: '휴가' }
                                                ].map(st => {
                                                    const checked = statusFilters.includes(st.value);
                                                    return (
                                                        <label key={st.value} className="flex items-center gap-3 p-1.5 -mx-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700/30 rounded-lg cursor-pointer group transition-colors select-none">
                                                            <div className={`flex-shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center border transition-all duration-200 ${checked ? 'bg-primary border-primary' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 group-hover:border-primary/50'}`}>
                                                                {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm font-medium transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                                                                {st.label}
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={checked}
                                                                onChange={() => {
                                                                    setStatusFilters(prev => prev.includes(st.value) ? prev.filter(item => item !== st.value) : [...prev, st.value]);
                                                                }}
                                                            />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 출근 위치 필터 */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">출근 위치</label>
                                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                                {fields.length === 0 && <p className="text-xs text-slate-400 pl-1">농장이 없습니다</p>}
                                                {fields.map(f => {
                                                    const checked = clockInFilters.includes(f.id);
                                                    return (
                                                        <label key={f.id} className="flex items-center gap-3 p-1.5 -mx-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700/30 rounded-lg cursor-pointer group transition-colors select-none">
                                                            <div className={`flex-shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center border transition-all duration-200 ${checked ? 'bg-primary border-primary' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 group-hover:border-primary/50'}`}>
                                                                {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm font-medium truncate transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                                                                {f.name}
                                                            </span>
                                                            <input type="checkbox" className="hidden" checked={checked} onChange={() => {
                                                                setClockInFilters(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]);
                                                            }} />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* 퇴근 위치 필터 */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">퇴근 위치</label>
                                            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                                {fields.length === 0 && <p className="text-xs text-slate-400 pl-1">농장이 없습니다</p>}
                                                {fields.map(f => {
                                                    const checked = clockOutFilters.includes(f.id);
                                                    return (
                                                        <label key={f.id} className="flex items-center gap-3 p-1.5 -mx-1.5 hover:bg-slate-50 dark:hover:bg-zinc-700/30 rounded-lg cursor-pointer group transition-colors select-none">
                                                            <div className={`flex-shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center border transition-all duration-200 ${checked ? 'bg-primary border-primary' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600 group-hover:border-primary/50'}`}>
                                                                {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className={`text-sm font-medium truncate transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
                                                                {f.name}
                                                            </span>
                                                            <input type="checkbox" className="hidden" checked={checked} onChange={() => {
                                                                setClockOutFilters(prev => prev.includes(f.id) ? prev.filter(id => id !== f.id) : [...prev, f.id]);
                                                            }} />
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-700/50">
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="w-full text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                                        >
                                            필터 닫기 및 적용
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative flex-1 md:w-64 min-w-[150px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="이름 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">내보내기</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        데이터를 불러오는 중...
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        기록이 없습니다.
                    </div>
                ) : (
                    <>
                        {/* Mobile List View */}
                        <div className="block md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
                            {processedData.map((record) => (
                                <div key={`${record.userId}-${record.date}`} className="p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 font-bold">
                                                {record.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{record.userName}</h4>
                                                <p className="text-xs text-slate-500 mb-1">{record.date}</p>
                                                <div className="flex gap-2">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                        <MapPin size={10} />
                                                        {record.clockInFarmName === record.clockOutFarmName || record.clockOutFarmName === '-'
                                                            ? record.clockInFarmName
                                                            : `${record.clockInFarmName} → ${record.clockOutFarmName}`}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                                        <CalendarDays size={10} /> {record.weekInfo}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(record.status)}`}>
                                            {getStatusText(record.status)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">출근</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{record.checkInTime || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">퇴근</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{record.checkOutTime || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">근무시간</p>
                                            <p className="text-sm font-bold text-primary">{formatDuration(record.workDuration)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                    <tr>
                                        <th className="px-6 py-4">이름</th>
                                        <th className="px-6 py-4">출근지</th>
                                        <th className="px-6 py-4">퇴근지</th>
                                        <th className="px-6 py-4">기준일(주차)</th>
                                        <th className="px-6 py-4">상태</th>
                                        <th className="px-6 py-4">출근 시간</th>
                                        <th className="px-6 py-4">퇴근 시간</th>
                                        <th className="px-6 py-4">근무 시간</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {processedData.map((record) => (
                                        <tr key={`${record.userId}-${record.date}-${record.id}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {record.userName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {record.clockInFarmName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {record.clockOutFarmName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                <div>{record.date}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{record.weekInfo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                    {getStatusText(record.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {record.checkInTime || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {record.checkOutTime || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                {formatDuration(record.workDuration)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceLog;
