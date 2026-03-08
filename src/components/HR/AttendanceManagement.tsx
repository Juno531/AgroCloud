import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, getISOWeek, startOfISOWeek, endOfISOWeek, startOfYear, endOfYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Calendar, Filter, MapPin, CalendarDays, Check, Users, UserCheck, UserX } from 'lucide-react';
import { AttendanceService, EmployeeService, LeaveService } from '../../services/api';
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
    status?: string;
    reason?: string;
}

interface LeaveRecordResponse {
    id: number;
    userId: number;
    userName: string;
    leaveDate: string;
    reason: string;
}

const AttendanceManagement = () => {
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
    const [leaves, setLeaves] = useState<LeaveRecordResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [actionModal, setActionModal] = useState<{
        recordId: number;
        userName: string;
        pendingType: 'CLOCK_IN' | 'CLOCK_OUT';
        reason: string | null;
        timestamp: string | null;
    } | null>(null);

    const [editModal, setEditModal] = useState<{
        userId: number;
        userName: string;
        date: string;
        clockInRecordId: number | null;
        clockOutRecordId: number | null;
        checkInTime: string;
        checkOutTime: string;
        status: string;
        reason: string;
    } | null>(null);

    // Filter states
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

            let leavesPromise;

            if (companyCodeToUse) {
                attendancePromise = AttendanceService.getCompanyAttendance(companyCodeToUse as string, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByCompany(companyCodeToUse as string);
                leavesPromise = LeaveService.getLeavesByCompany(companyCodeToUse as string, startDateStr.split('T')[0]!, endDateStr.split('T')[0]!);
            } else {
                attendancePromise = AttendanceService.getFarmAttendance(farmToUse!, startDateStr, endDateStr);
                employeesPromise = EmployeeService.getEmployeesByFarm(farmToUse!);
                leavesPromise = LeaveService.getLeavesByFarm(farmToUse!, startDateStr.split('T')[0]!, endDateStr.split('T')[0]!);
            }

            const [attendanceRes, employeesRes, leavesRes] = await Promise.all([
                attendancePromise,
                employeesPromise,
                leavesPromise
            ]);

            setRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
            setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
            setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);

        } catch (error: any) {
            console.error("Failed to fetch attendance data:", error);
            setRecords([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };


    const handleStatusUpdate = async (id: number, newStatus: 'APPROVED' | 'REJECTED', type?: 'CLOCK_IN' | 'CLOCK_OUT') => {
        const typeText = type === 'CLOCK_OUT' ? '퇴근' : '출근';
        const statusText = newStatus === 'APPROVED' ? '승인' : '거절';
        const actionText = `${typeText} ${statusText}`;

        if (!window.confirm(`해당 요청을 ${actionText} 처리하시겠습니까?`)) return;
        try {
            await AttendanceService.updateStatus(id, newStatus);
            alert(`${actionText} 처리되었습니다.`);
            fetchData();
        } catch (error) {
            console.error(`Failed to update status to ${newStatus}`, error);
            alert(`${actionText} 처리 중 오류가 발생했습니다.`);
        }
    };

    const handleSaveEdit = async () => {
        if (!editModal) return;

        if (!window.confirm('저장하시겠습니까?')) {
            return;
        }

        try {
            const dateStr = editModal.date;

            // Update Clock In
            if (editModal.clockInRecordId) {
                const ts = editModal.checkInTime.length === 5 ? `${dateStr}T${editModal.checkInTime}:00` : (editModal.checkInTime ? `${dateStr}T${editModal.checkInTime}` : undefined);
                await AttendanceService.updateRecord(editModal.clockInRecordId, {
                    timestamp: ts,
                    status: editModal.status,
                    reason: editModal.reason
                });
            } else if (editModal.checkInTime) {
                const ts = editModal.checkInTime.length === 5 ? `${dateStr}T${editModal.checkInTime}:00` : `${dateStr}T${editModal.checkInTime}`;
                await AttendanceService.createAdminRecord({
                    userId: editModal.userId,
                    type: 'CLOCK_IN',
                    timestamp: ts,
                    status: editModal.status,
                    reason: editModal.reason
                });
            }

            // Update Clock Out
            if (editModal.clockOutRecordId) {
                const ts = editModal.checkOutTime.length === 5 ? `${dateStr}T${editModal.checkOutTime}:00` : (editModal.checkOutTime ? `${dateStr}T${editModal.checkOutTime}` : undefined);
                await AttendanceService.updateRecord(editModal.clockOutRecordId, {
                    timestamp: ts,
                    status: editModal.clockInRecordId ? undefined : editModal.status,
                    reason: editModal.clockInRecordId ? undefined : editModal.reason
                });
            } else if (editModal.checkOutTime) {
                const ts = editModal.checkOutTime.length === 5 ? `${dateStr}T${editModal.checkOutTime}:00` : `${dateStr}T${editModal.checkOutTime}`;
                await AttendanceService.createAdminRecord({
                    userId: editModal.userId,
                    type: 'CLOCK_OUT',
                    timestamp: ts,
                    status: editModal.status,
                    reason: editModal.clockInRecordId ? undefined : editModal.reason
                });
            }

            alert('출퇴근 기록이 수정/저장되었습니다.');
            setEditModal(null);
            fetchData();
        } catch (error: any) {
            console.error('Failed to update attendance record:', error);
            alert(`출퇴근 기록 저장에 실패했습니다: ${error?.response?.data?.message || '알 수 없는 오류'}`);
        }
    };

    const handleCancelClockOut = async () => {
        if (!editModal || !editModal.clockOutRecordId) return;

        if (!window.confirm('퇴근 기록을 삭제하시겠습니까? (출근 상태로 변경됩니다)')) {
            return;
        }

        try {
            await AttendanceService.deleteRecord(editModal.clockOutRecordId);
            alert('퇴근 기록이 삭제되었습니다.');
            setEditModal(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete clock out record:", error);
            alert('퇴근 기록 삭제 중 오류가 발생했습니다.');
        }
    };

    // Calculate start & end dates based on viewMode
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentDate(new Date(e.target.value));
    };

    const processedData = useMemo(() => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const currentMonthStr = format(currentDate, 'yyyy-MM');
        const currentYearStr = format(currentDate, 'yyyy');

        const filteredEmployees = employees.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchEmploymentType = employmentTypeFilters.length === 0 || (emp.employmentType && employmentTypeFilters.includes(emp.employmentType));
            return matchSearch && matchEmploymentType;
        });

        let result = [];

        if (viewMode === 'daily') {
            result = filteredEmployees.map(emp => {
                const userDayRecords = records.filter(r => {
                    const recordDate = format(new Date(r.timestamp), 'yyyy-MM-dd');
                    return r.userId === emp.userId && recordDate === dateStr;
                });

                const userDayLeaves = leaves.filter(l => {
                    return l.userId === emp.userId && l.leaveDate === dateStr;
                });

                const d = new Date(dateStr);
                let clockIn = null;
                let clockOut = null;
                let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'CLOCK_OUT' | 'PENDING' | 'REJECTED' | 'APPROVED_CLOCK_IN' | 'APPROVED_CLOCK_OUT' = 'ABSENT';
                let latestRecord: any = null;
                let sortedRecords: any[] = [];
                let weekInfo = `${getISOWeek(d)}주차 (${format(d, 'E', { locale: ko })})`;

                if (userDayRecords.length > 0) {
                    sortedRecords = [...userDayRecords].sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );

                    latestRecord = sortedRecords[0]!;
                    weekInfo = `${latestRecord.weekNumber || getISOWeek(d)}주차 ${latestRecord.workingDayIndex || 1}일차 (${format(d, 'E', { locale: ko })})`;

                    if (latestRecord.type === 'CLOCK_IN') {
                        clockIn = latestRecord;
                        clockOut = null;
                        status = 'PRESENT';
                    } else {
                        clockOut = latestRecord;
                        clockIn = sortedRecords.find(r => r.type === 'CLOCK_IN');
                        status = 'CLOCK_OUT';
                    }

                    // PENDING 처리
                    const isPending = sortedRecords.some(r => r.status === 'PENDING');
                    const isRejected = sortedRecords.some(r => r.status === 'REJECTED');
                    const approvedRecord = sortedRecords.find(r => r.status === 'APPROVED');

                    if (isPending) status = 'PENDING';
                    else if (approvedRecord) {
                        status = approvedRecord.type === 'CLOCK_IN' ? 'APPROVED_CLOCK_IN' : 'APPROVED_CLOCK_OUT';
                    } else if (isRejected) {
                        status = 'REJECTED';
                    }
                } else if (userDayLeaves.length > 0) {
                    status = 'LEAVE';
                }

                const pendingOrRejectedRecord = sortedRecords.find(r => r.status === 'PENDING' || r.status === 'REJECTED');
                const approvalRecordId = pendingOrRejectedRecord ? pendingOrRejectedRecord.id : (latestRecord ? latestRecord.id : null);

                const actionReason = (pendingOrRejectedRecord && pendingOrRejectedRecord.reason)
                    ? pendingOrRejectedRecord.reason
                    : (latestRecord && (latestRecord.status === 'PENDING' || latestRecord.status === 'REJECTED') ? latestRecord.reason : (userDayLeaves[0]?.reason || null));

                const clockInFarmName = clockIn ? (fields?.find(f => f.id === clockIn.farmId)?.name || '알 수 없음') : '-';
                const clockInFarmId = clockIn ? clockIn.farmId : null;
                const clockOutFarmName = clockOut ? (fields?.find(f => f.id === clockOut.farmId)?.name || '알 수 없음') : '-';
                const clockOutFarmId = clockOut ? clockOut.farmId : null;

                return {
                    id: (latestRecord && latestRecord.id) || -(emp.id! || emp.userId! || Math.random()),
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
                    clockInRecordId: clockIn ? clockIn.id : null,
                    clockOutRecordId: clockOut ? clockOut.id : null,
                    status: status as any,
                    reason: actionReason,
                    recordId: approvalRecordId,
                    pendingType: pendingOrRejectedRecord ? pendingOrRejectedRecord.type : (latestRecord ? latestRecord.type : null),
                    timestamp: pendingOrRejectedRecord ? pendingOrRejectedRecord.timestamp : (latestRecord ? latestRecord.timestamp : null),
                    workDuration: (clockIn && clockOut)
                        ? Math.floor((new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime()) / 60000)
                        : null
                };
            });
        } else {
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
                        clockInRecordId: r.type === 'CLOCK_IN' ? r.id : null,
                        clockOutRecordId: r.type === 'CLOCK_OUT' ? r.id : null,
                        status: r.status === 'PENDING' ? 'PENDING' : r.status === 'REJECTED' ? 'REJECTED' : (r.status === 'APPROVED' ? (r.type === 'CLOCK_IN' ? 'APPROVED_CLOCK_IN' : 'APPROVED_CLOCK_OUT') : ((r.type === 'CLOCK_IN' ? 'PRESENT' : 'CLOCK_OUT') as any)),
                        reason: (r.status === 'PENDING' || r.status === 'REJECTED') ? r.reason : null,
                        recordId: r.id,
                        pendingType: r.type,
                        timestamp: r.timestamp,
                        workDuration: null
                    };
                });
        }

        return result.filter(r => {
            const matchClockIn = clockInFilters.length === 0 || (r.clockInFarmId !== null && clockInFilters.includes(r.clockInFarmId));
            const matchClockOut = clockOutFilters.length === 0 || (r.clockOutFarmId !== null && clockOutFilters.includes(r.clockOutFarmId));
            const matchStatus = statusFilters.length === 0 || statusFilters.includes(r.status);
            return matchClockIn && matchClockOut && matchStatus;
        });
    }, [records, employees, leaves, viewMode, currentDate, searchTerm, fields, clockInFilters, clockOutFilters, statusFilters, employmentTypeFilters]);

    const stats = useMemo(() => {
        const filteredEmployeesCount = employees.filter(emp => {
            const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchEmploymentType = employmentTypeFilters.length === 0 || (emp.employmentType && employmentTypeFilters.includes(emp.employmentType));
            return matchSearch && matchEmploymentType;
        }).length;

        let total = filteredEmployeesCount;
        let present = 0;
        let leave = 0;

        if (viewMode === 'daily') {
            present = processedData.filter(r => r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'APPROVED_CLOCK_IN').length;
            leave = processedData.filter(r => r.status === 'ABSENT' || r.status === 'LEAVE').length;
        } else {
            const activeUserIds = new Set(processedData.map(r => r.userId));
            present = activeUserIds.size;
            leave = total - present;
        }

        return { total, present, leave };
    }, [employees, processedData, viewMode, searchTerm, employmentTypeFilters]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PRESENT': return 'bg-green-100 text-green-700';
            case 'APPROVED_CLOCK_IN': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'LATE': return 'bg-yellow-100 text-yellow-700';
            case 'ABSENT': return 'bg-red-100 text-red-700';
            case 'LEAVE': return 'bg-blue-100 text-blue-700';
            case 'CLOCK_OUT': return 'bg-indigo-100 text-indigo-700';
            case 'APPROVED_CLOCK_OUT': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
            case 'PENDING': return 'bg-orange-100 text-orange-700';
            case 'REJECTED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PRESENT': return '정상 출근';
            case 'APPROVED_CLOCK_IN': return '정상 출근 (승인됨)';
            case 'LATE': return '지각';
            case 'ABSENT': return '결근';
            case 'LEAVE': return '휴가';
            case 'CLOCK_OUT': return '퇴근 완료';
            case 'APPROVED_CLOCK_OUT': return '정상 퇴근 (승인됨)';
            case 'PENDING': return '승인 대기';
            case 'REJECTED': return '승인 거절';
            default: return '미확인';
        }
    };

    return (
        <div className="flex flex-col space-y-4 md:space-y-6 h-full min-h-0">
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

            {/* Header Controls - Sticky with Glassmorphism */}
            <div className="flex-1 sticky top-0 z-[30] -mx-3 sm:-mx-6 px-3 sm:px-6 py-4 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 transition-all duration-300">
                <div className="max-w-full flex flex-col gap-4 bg-white/70 dark:bg-zinc-900/70 p-4 rounded-2xl shadow-sm border border-white dark:border-zinc-800/50 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
                                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${viewMode === mode
                                            ? 'bg-white dark:bg-zinc-700 text-primary shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                            }`}
                                    >
                                        {mode === 'daily' ? '일간' : mode === 'weekly' ? '주간' : mode === 'monthly' ? '월간' : '연간'}
                                    </button>
                                ))}
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
                                            const yearValue = parseInt(e.target.value);
                                            if (yearValue >= 2020 && yearValue <= 2099) {
                                                setCurrentDate(new Date(yearValue, 0, 1));
                                            }
                                        } else {
                                            handleDateChange(e);
                                        }
                                    }}
                                    className="w-full md:w-auto pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
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
                                    <>
                                        {/* Overlay to close filter when clicking outside */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsFilterOpen(false)}
                                        />
                                        <div
                                            className="fixed sm:absolute top-[20%] sm:top-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2 w-[90%] max-w-[320px] sm:w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-slate-200 dark:border-zinc-700 p-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[calc(100vh-12rem)]"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">필터</h4>
                                                <button
                                                    onClick={() => {
                                                        setClockInFilters([]);
                                                        setClockOutFilters([]);
                                                        setStatusFilters([]);
                                                        setEmploymentTypeFilters([]);
                                                    }}
                                                    className="text-[11px] font-medium text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-zinc-700/50 hover:bg-primary/10 px-2 py-1 rounded-md"
                                                >
                                                    초기화
                                                </button>
                                            </div>

                                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">출결 상태</label>
                                                    <div className="space-y-1">
                                                        {[
                                                            { value: 'PRESENT', label: '정상 출근' },
                                                            { value: 'LATE', label: '지각' },
                                                            { value: 'CLOCK_OUT', label: '퇴근 완료' },
                                                            { value: 'ABSENT', label: '결근' },
                                                            { value: 'LEAVE', label: '휴가' },
                                                            { value: 'PENDING', label: '승인 대기' },
                                                            { value: 'REJECTED', label: '승인 거절' }
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
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative flex-1 md:w-64 min-w-[150px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="직원 이름 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* List/Table Content */}
                <div className="flex-1 mt-2 flex flex-col min-h-0 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            출퇴근 데이터를 불러오는 중...
                        </div>
                    ) : processedData.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            조회된 출퇴근 기록이 없습니다.
                        </div>
                    ) : (
                        <div className="flex-1 overflow-auto space-y-4 md:space-y-6">
                            {/* Mobile List View */}
                            <div className="block md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
                                {processedData.map((record) => (
                                    <div key={`${record.userId}-${record.date}-${record.id}`} className="p-4 flex flex-col gap-3">
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

                                        <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">출근</p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{record.checkInTime || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">퇴근</p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{record.checkOutTime || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {record.reason && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-slate-100 dark:border-zinc-700/50">
                                                    <span className="font-bold mr-1">사유:</span>{record.reason}
                                                </p>
                                            )}
                                            {record.status === 'PENDING' && record.recordId && (
                                                <button
                                                    onClick={() => setActionModal({
                                                        recordId: record.recordId!,
                                                        userName: record.userName,
                                                        pendingType: record.pendingType!,
                                                        reason: record.reason || null,
                                                        timestamp: record.timestamp || null
                                                    })}
                                                    className="w-full py-3 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm"
                                                >
                                                    승인 대기 중 (클릭하여 처리)
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    let normalizedStatus = record.status as string;
                                                    if (normalizedStatus.startsWith('APPROVED')) {
                                                        normalizedStatus = normalizedStatus === 'APPROVED_CLOCK_IN' ? 'PRESENT' : 'CLOCK_OUT';
                                                    } else if (normalizedStatus === 'NORMAL' || normalizedStatus === 'PENDING' || normalizedStatus === 'REJECTED') {
                                                        normalizedStatus = 'PRESENT';
                                                    }

                                                    setEditModal({
                                                        userId: record.userId!,
                                                        userName: record.userName,
                                                        date: record.date,
                                                        clockInRecordId: record.clockInRecordId,
                                                        clockOutRecordId: record.clockOutRecordId,
                                                        checkInTime: record.checkInTime?.substring(0, 5) || '',
                                                        checkOutTime: record.checkOutTime?.substring(0, 5) || '',
                                                        status: normalizedStatus,
                                                        reason: record.reason || ''
                                                    });
                                                }}
                                                translate="no"
                                                className="w-full py-2 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                                            >
                                                {record.status === 'ABSENT' ? '기록 생성' : '수정'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block flex-1 min-h-0">
                                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                            <tr>
                                                <th className="px-6 py-4">이름</th>
                                                <th className="px-6 py-4">출근지</th>
                                                <th className="px-6 py-4">퇴근지</th>
                                                <th className="px-6 py-4">기준일(주차)</th>
                                                <th className="px-6 py-4">상태</th>
                                                <th className="px-6 py-4">사유</th>
                                                <th className="px-6 py-4">출근 시간</th>
                                                <th className="px-6 py-4">퇴근 시간</th>
                                                <th className="px-6 py-4 text-center">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                            {processedData.map((record) => (
                                                <tr key={`${record.userId}-${record.date}-${record.id}`} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                                {record.userName.charAt(0)}
                                                            </div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{record.userName}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            {record.clockInFarmName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            {record.clockOutFarmName}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        <div className="font-medium text-slate-900 dark:text-white">{record.date}</div>
                                                        <div className="text-[11px] text-slate-400 mt-0.5">{record.weekInfo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(record.status)}`}>
                                                            {getStatusText(record.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 min-w-[150px]">
                                                        {record.reason ? (
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-950/30 px-2 py-1 rounded-md block whitespace-normal break-words max-w-[200px] border border-slate-100 dark:border-zinc-800">
                                                                {record.reason}
                                                            </span>
                                                        ) : <span className="text-slate-300">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold whitespace-nowrap uppercase tracking-wider text-[11px]">
                                                        {record.checkInTime || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold whitespace-nowrap uppercase tracking-wider text-[11px]">
                                                        {record.checkOutTime || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        {record.status === 'PENDING' && record.recordId && (
                                                            <button
                                                                onClick={() => setActionModal({
                                                                    recordId: record.recordId!,
                                                                    userName: record.userName,
                                                                    pendingType: record.pendingType!,
                                                                    reason: record.reason || null,
                                                                    timestamp: record.timestamp || null
                                                                })}
                                                                className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-[11px] font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm"
                                                            >
                                                                승인 대기 중
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                let normalizedStatus = record.status as string;
                                                                if (normalizedStatus.startsWith('APPROVED')) {
                                                                    normalizedStatus = normalizedStatus === 'APPROVED_CLOCK_IN' ? 'PRESENT' : 'CLOCK_OUT';
                                                                } else if (normalizedStatus === 'NORMAL' || normalizedStatus === 'PENDING' || normalizedStatus === 'REJECTED') {
                                                                    normalizedStatus = 'PRESENT';
                                                                }

                                                                setEditModal({
                                                                    userId: record.userId!,
                                                                    userName: record.userName,
                                                                    date: record.date,
                                                                    clockInRecordId: record.clockInRecordId,
                                                                    clockOutRecordId: record.clockOutRecordId,
                                                                    checkInTime: record.checkInTime?.substring(0, 5) || '',
                                                                    checkOutTime: record.checkOutTime?.substring(0, 5) || '',
                                                                    status: normalizedStatus,
                                                                    reason: record.reason || ''
                                                                });
                                                            }}
                                                            translate="no"
                                                            className="ml-2 px-3 py-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 text-[11px] font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                                                        >
                                                            수정
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </div>
            {/* Action Modal with Glassmorphism */}
            {actionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
                        onClick={() => setActionModal(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden transform transition-all">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold mb-2 ${actionModal.pendingType === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {actionModal.pendingType === 'CLOCK_IN' ? '출근 요청' : '퇴근 요청'}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {actionModal.userName}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setActionModal(null)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Request Details */}
                            <div className="bg-slate-50/50 dark:bg-black/20 rounded-xl p-4 mb-6 border border-slate-100 dark:border-white/5">
                                <div className="mb-3">
                                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">요청 시간</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {actionModal.timestamp ? format(new Date(actionModal.timestamp), 'yyyy년 MM월 dd일 HH:mm', { locale: ko }) : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">요청 사유</span>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                                        {actionModal.reason || '사유 미작성'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        handleStatusUpdate(actionModal.recordId, 'REJECTED', actionModal.pendingType);
                                        setActionModal(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                >
                                    {actionModal.pendingType === 'CLOCK_IN' ? '출근 거절' : '퇴근 거절'}
                                </button>
                                <button
                                    onClick={() => {
                                        handleStatusUpdate(actionModal.recordId, 'APPROVED', actionModal.pendingType);
                                        setActionModal(null);
                                    }}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                >
                                    {actionModal.pendingType === 'CLOCK_IN' ? '출근 승인' : '퇴근 승인'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
                        onClick={() => setEditModal(null)}
                    ></div>

                    <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl shadow-xl transform transition-all border border-slate-200 dark:border-zinc-800">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/30">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    출퇴근 기록 수정
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">{editModal.userName} - {editModal.date}</p>
                            </div>
                            <button
                                onClick={() => setEditModal(null)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors bg-white dark:bg-zinc-800 shadow-sm border border-slate-200 dark:border-zinc-700"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">출근 시간</label>
                                <input
                                    type="time"
                                    value={editModal.checkInTime}
                                    onChange={(e) => setEditModal(prev => prev ? { ...prev, checkInTime: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">퇴근 시간</label>
                                <input
                                    type="time"
                                    value={editModal.checkOutTime}
                                    onChange={(e) => setEditModal(prev => prev ? { ...prev, checkOutTime: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">출결 상태</label>
                                <select
                                    value={editModal.status}
                                    onChange={(e) => setEditModal(prev => prev ? { ...prev, status: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                                >
                                    <option value="PRESENT">정상 출근</option>
                                    <option value="LATE">지각</option>
                                    <option value="ABSENT">결근</option>
                                    <option value="LEAVE">휴가</option>
                                    <option value="CLOCK_OUT">퇴근 완료</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">사유</label>
                                <textarea
                                    value={editModal.reason}
                                    onChange={(e) => setEditModal(prev => prev ? { ...prev, reason: e.target.value } : null)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
                                    rows={3}
                                    placeholder="사유를 입력하세요"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-wrap gap-2">
                            <button
                                onClick={() => setEditModal(null)}
                                className="flex-1 min-w-[80px] px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                취소
                            </button>
                            {editModal.clockOutRecordId && (
                                <button
                                    onClick={handleCancelClockOut}
                                    className="flex-1 min-w-[100px] px-4 py-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 rounded-lg text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                >
                                    퇴근 취소
                                </button>
                            )}
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 min-w-[80px] px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all border border-transparent shadow-primary/25 hover:shadow-primary/40"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AttendanceManagement;
