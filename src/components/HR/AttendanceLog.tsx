import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Search, Download, Users, UserCheck, UserX, Calendar, Filter } from 'lucide-react';
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
}

interface AttendanceRecord {
    id: number;
    userId: number;
    userName: string;
    date: string; // YYYY-MM-DD
    checkInTime: string | null; // HH:mm:ss
    checkOutTime: string | null; // HH:mm:ss
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'CLOCK_OUT';
    workDuration: number | null; // minutes
}

const AttendanceLog = () => {
    const { user } = useAuth();
    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState<AttendanceResponse[]>([]);
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

    useEffect(() => {
        // user.companyCode가 있으면 farmId 선정보다 우선함
        if (user?.companyCode) {
            fetchData();
            return;
        }

        // farmId 선정 로직
        if (fields && fields.length > 0) {
            if (!selectedFarm) {
                setSelectedFarm(fields[0].id);
            }
        } else if (user?.farmId) {
            // Context에 fields가 없어도 user에 farmId가 있으면 사용
            if (!selectedFarm) {
                setSelectedFarm(user.farmId);
            }
        }
    }, [fields, user, selectedFarm]);

    useEffect(() => {
        if (selectedFarm || user?.companyCode) {
            fetchData();
        }
    }, [selectedFarm, user?.companyCode, currentDate, viewMode]);

    const fetchData = async () => {
        // farmToUse: selectedFarm이 0일 수 있으므로 null/undefined 체크
        const farmToUse = (selectedFarm !== null && selectedFarm !== undefined) ? selectedFarm : user?.farmId;
        const companyCodeToUse = user?.companyCode && user.companyCode.trim() !== "" ? user.companyCode : null;

        console.log("Attempting fetchData - Farm:", farmToUse, "CompanyCode:", companyCodeToUse);

        if (!farmToUse && !companyCodeToUse) {
            console.log("Missing both farmId and companyCode. Aborting fetch.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            let startDateStr: string | undefined;
            let endDateStr: string | undefined;

            // 백엔드 @DateTimeFormat(iso = ISO.DATE_TIME)은 yyyy-MM-ddTHH:mm:ss 형식을 기대함
            const baseDate = format(currentDate, 'yyyy-MM-dd');
            if (viewMode === 'daily') {
                startDateStr = `${baseDate}T00:00:00`;
                endDateStr = `${baseDate}T23:59:59`;
            } else {
                startDateStr = `${format(startOfMonth(currentDate), 'yyyy-MM-dd')}T00:00:00`;
                endDateStr = `${format(endOfMonth(currentDate), 'yyyy-MM-dd')}T23:59:59`;
            }

            console.log("Fetching with criteria:", companyCodeToUse ? `Company=${companyCodeToUse}` : `Farm=${farmToUse}`, "Dates:", startDateStr, "~", endDateStr);

            let attendancePromise;
            let employeesPromise;

            if (companyCodeToUse) {
                attendancePromise = AttendanceService.getCompanyAttendance(companyCodeToUse, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByCompany(companyCodeToUse);
            } else {
                // farmToUse가 명학히 있을 때만 호출 (위의 guard에서 걸러짐)
                attendancePromise = AttendanceService.getFarmAttendance(farmToUse!, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByFarm(farmToUse!);
            }

            const [attendanceRes, employeesRes] = await Promise.all([
                attendancePromise.catch(err => {
                    console.error("Attendance API Error Details:", err.response?.data || err.message);
                    throw err;
                }),
                employeesPromise.catch(err => {
                    console.error("Employees API Error Details:", err.response?.data || err.message);
                    throw err;
                })
            ]);

            console.log("Attendance fetched:", attendanceRes.data?.length || 0);
            console.log("Employees fetched:", employeesRes.data?.length || 0);

            setRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);

        } catch (error: any) {
            console.error("Failed to fetch attendance data:", error);
            // 400 에러 시 원인 파악을 위해 에러 객체 출력
            if (error.response) {
                console.error("Server responded with 400. Data:", error.response.data);
            }
            setRecords([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentDate(new Date(e.target.value));
    };

    // 데이터 병합 및 가공
    const processedData = useMemo(() => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // 검색 필터링된 직원 목록
        const filteredEmployees = employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (viewMode === 'daily') {
            return filteredEmployees.map(emp => {
                // 해당 직원의 해당 날짜 기록들을 찾음
                const userDayRecords = records.filter(r => {
                    const recordDate = format(new Date(r.timestamp), 'yyyy-MM-dd');
                    return r.userId === emp.userId && recordDate === dateStr;
                });

                if (userDayRecords.length > 0) {
                    // 시간 역순 정렬 (최신순)
                    const sortedRecords = [...userDayRecords].sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );

                    const latestRecord = sortedRecords[0];
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

                    return {
                        id: latestRecord?.id || 0,
                        userId: emp.userId,
                        userName: emp.name,
                        date: dateStr,
                        checkInTime: clockIn ? format(new Date(clockIn.timestamp), 'HH:mm:ss') : null,
                        checkOutTime: clockOut ? format(new Date(clockOut.timestamp), 'HH:mm:ss') : null,
                        status: status,
                        workDuration: (clockIn && clockOut)
                            ? Math.floor((new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime()) / 60000)
                            : null
                    };
                }

                return {
                    id: -(emp.id! || emp.userId! || Math.random()),
                    userId: emp.userId,
                    userName: emp.name,
                    date: dateStr,
                    checkInTime: null,
                    checkOutTime: null,
                    status: 'ABSENT' as const,
                    workDuration: null
                };
            });
        } else {
            // 월간 뷰: 검색어에 맞는 직원들의 기록만 표시
            const employeeIds = new Set(filteredEmployees.map(e => e.userId));
            return records
                .filter(r => employeeIds.has(r.userId))
                .map(r => ({
                    id: r.id,
                    userId: r.userId,
                    userName: r.userName,
                    date: format(new Date(r.timestamp), 'yyyy-MM-dd'),
                    checkInTime: r.type === 'CLOCK_IN' ? format(new Date(r.timestamp), 'HH:mm:ss') : null,
                    checkOutTime: r.type === 'CLOCK_OUT' ? format(new Date(r.timestamp), 'HH:mm:ss') : null,
                    status: (r.type === 'CLOCK_IN' ? 'PRESENT' : 'CLOCK_OUT') as any,
                    workDuration: null
                }));
        }
    }, [records, employees, viewMode, currentDate, searchTerm]);

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
            // 월간은 필터링된 범위 내 고유 직원 수 또는 전체 대비 비율 등 고민 필요
            // 일단 요청하신 대로 "직원 인원수" 위주로 표시
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
            <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
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
                                onClick={() => setViewMode('monthly')}
                                className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === 'monthly'
                                    ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                            >
                                월간
                            </button>
                        </div>

                        <div className="relative flex items-center flex-1 md:flex-none">
                            <div className="absolute left-3 pointer-events-none text-slate-500">
                                <Calendar size={16} />
                            </div>
                            <input
                                type={viewMode === 'daily' ? 'date' : 'month'}
                                value={viewMode === 'daily'
                                    ? format(currentDate, 'yyyy-MM-dd')
                                    : format(currentDate, 'yyyy-MM')
                                }
                                onChange={handleDateChange}
                                className="w-full md:w-auto pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        {fields.length > 0 && (
                            <select
                                value={selectedFarm || ''}
                                onChange={(e) => setSelectedFarm(Number(e.target.value))}
                                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 whitespace-nowrap"
                            >
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        )}

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

                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium whitespace-nowrap">
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
                                                <p className="text-xs text-slate-500">{record.date}</p>
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
                                <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">이름</th>
                                        <th className="px-6 py-4">날짜</th>
                                        <th className="px-6 py-4">상태</th>
                                        <th className="px-6 py-4">출근 시간</th>
                                        <th className="px-6 py-4">퇴근 시간</th>
                                        <th className="px-6 py-4">근무 시간</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {processedData.map((record) => (
                                        <tr key={`${record.userId}-${record.date}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                                {record.userName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {record.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                                    {getStatusText(record.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {record.checkInTime || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {record.checkOutTime || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
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
