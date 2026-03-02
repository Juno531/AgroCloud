import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileDown,
    Calendar as CalendarIcon,
    MapPin,
    Search,
    Settings2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronDown,
    User as UserIcon,
    Folder,
    FolderOpen,
    Check
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AttendanceService, FarmService, EmployeeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EmployeeProfile } from '../../types';

const AttendanceExport = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // States
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
    const [selectedFarmIds, setSelectedFarmIds] = useState<number[]>([]);
    const [includeLeaves, setIncludeLeaves] = useState(true);

    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [farms, setFarms] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [expandedFolders, setExpandedFolders] = useState<string[]>(['FULL_TIME', 'PART_TIME']);

    const defaultFields = [
        { id: 'date', label: '날짜', checked: true },
        { id: 'name', label: '이름', checked: true },
        { id: 'reason', label: '사유', checked: true },
        { id: 'remarks', label: '비고', checked: true },
        { id: 'week', label: '주차', checked: true },
        { id: 'days', label: '일수', checked: true },
        { id: 'clockIn', label: '출근시간', checked: true },
        { id: 'clockOut', label: '퇴근시간', checked: true },
        { id: 'workingHours', label: '근무시간', checked: true },
        { id: 'hourlyWage', label: '시급', checked: true },
        { id: 'totalPay', label: '총시급', checked: true }
    ];
    const [exportFields, setExportFields] = useState(defaultFields.map(f => f.id));

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [farmRes, employeeRes] = await Promise.all([
                FarmService.getAllFarms(),
                user?.companyCode
                    ? EmployeeService.getEmployeesByCompany(user.companyCode)
                    : EmployeeService.getAllEmployees()
            ]);

            const farmData = Array.isArray(farmRes.data) ? farmRes.data : (farmRes.data?.data || []);
            setFarms(Array.isArray(farmData) ? farmData : []);
            setEmployees(Array.isArray(employeeRes.data) ? employeeRes.data : []);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            setFarms([]);
            setEmployees([]);
        }
    };

    const groupedEmployees = useMemo(() => {
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
            FULL_TIME: filtered.filter(emp => (emp.employmentType || 'FULL_TIME') === 'FULL_TIME'),
            PART_TIME: filtered.filter(emp => emp.employmentType === 'PART_TIME')
        };
    }, [employees, searchTerm]);

    const handleExport = async () => {
        setIsExporting(true);
        setExportStatus('loading');
        setErrorMessage('');

        try {
            const fileName = `attendance_export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
            let fileHandle = null;

            if ('showSaveFilePicker' in window && window.isSecureContext) {
                try {
                    fileHandle = await (window as any).showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Excel file',
                            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                        }]
                    });
                } catch (pickerErr: any) {
                    if (pickerErr.name === 'AbortError') {
                        setIsExporting(false);
                        setExportStatus('idle');
                        return;
                    }
                }
            }

            const filterRequest = {
                companyCode: user?.companyCode,
                startDate: startDate + 'T00:00:00',
                endDate: endDate + 'T23:59:59',
                employmentTypes: null,
                clockInFarmIds: selectedFarmIds.length > 0 ? selectedFarmIds : null,
                userIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : null,
                searchTerm: searchTerm || null,
                exportFields: exportFields,
                includeLeaves: includeLeaves
            };

            const response = await AttendanceService.exportAttendance(filterRequest);

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || '엑셀 내보내기에 실패했습니다.');
            }

            const blob = new Blob([response.data]);

            if (fileHandle) {
                const writable = await (fileHandle as any).createWritable();
                await writable.write(blob);
                await writable.close();
            } else {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

            setExportStatus('success');
            setTimeout(() => setExportStatus('idle'), 3000);
        } catch (error: any) {
            console.error('Export failed:', error);
            setExportStatus('error');
            setErrorMessage(error.message || '엑셀 생성을 완료하지 못했습니다.');
        } finally {
            setIsExporting(false);
        }
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev =>
            prev.includes(folderId) ? prev.filter(f => f !== folderId) : [...prev, folderId]
        );
    };

    const toggleEmployeeSelection = (userId: number) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleFarm = (id: number) => {
        setSelectedFarmIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const quickSelect = (type: 'current' | 'last') => {
        if (type === 'current') {
            setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
            setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
        } else {
            const lastMonth = subMonths(new Date(), 1);
            setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
            setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        }
    };

    const toggleExportField = (id: string) => {
        setExportFields(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            {/* Top Navigation */}
            <header className="px-6 py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-500"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileDown size={20} className="text-primary" />
                            출퇴근 기록 내보내기
                        </h1>

                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-[0.98] ${isExporting
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                            }`}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileDown size={18} />}
                        {isExporting ? '생성 중...' : '엑셀 내려받기'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: Employee List */}
                <aside className="w-80 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="직원 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <div className="space-y-1">
                            {/* Full-time Folder */}
                            <div>
                                <button
                                    onClick={() => toggleFolder('FULL_TIME')}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg group transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        {expandedFolders.includes('FULL_TIME') ? <FolderOpen size={18} className="text-amber-500" /> : <Folder size={18} className="text-amber-500" />}
                                        <span className="text-sm font-semibold">정규직</span>
                                        <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-400">
                                            {groupedEmployees.FULL_TIME.length}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform text-slate-400 ${expandedFolders.includes('FULL_TIME') ? '' : '-rotate-90'}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expandedFolders.includes('FULL_TIME') && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 mt-1 space-y-0.5"
                                        >
                                            {groupedEmployees.FULL_TIME.map(emp => (
                                                <button
                                                    key={emp.userId}
                                                    onClick={() => toggleEmployeeSelection(emp.userId)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${selectedEmployeeIds.includes(emp.userId)
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedEmployeeIds.includes(emp.userId)
                                                        ? 'bg-primary border-primary'
                                                        : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                                                        }`}>
                                                        {selectedEmployeeIds.includes(emp.userId) && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <UserIcon size={14} className={selectedEmployeeIds.includes(emp.userId) ? 'text-primary' : 'text-slate-400'} />
                                                    <span className="text-sm font-medium">{emp.name}</span>
                                                </button>
                                            ))}
                                            {groupedEmployees.FULL_TIME.length === 0 && (
                                                <p className="text-xs text-slate-400 p-2 italic">해당하는 직원이 없습니다.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Part-time Folder */}
                            <div>
                                <button
                                    onClick={() => toggleFolder('PART_TIME')}
                                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg group transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        {expandedFolders.includes('PART_TIME') ? <FolderOpen size={18} className="text-blue-500" /> : <Folder size={18} className="text-blue-500" />}
                                        <span className="text-sm font-semibold">비정규직</span>
                                        <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-400">
                                            {groupedEmployees.PART_TIME.length}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform text-slate-400 ${expandedFolders.includes('PART_TIME') ? '' : '-rotate-90'}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expandedFolders.includes('PART_TIME') && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 mt-1 space-y-0.5"
                                        >
                                            {groupedEmployees.PART_TIME.map(emp => (
                                                <button
                                                    key={emp.userId}
                                                    onClick={() => toggleEmployeeSelection(emp.userId)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group ${selectedEmployeeIds.includes(emp.userId)
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-400'
                                                        }`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedEmployeeIds.includes(emp.userId)
                                                        ? 'bg-primary border-primary'
                                                        : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                                                        }`}>
                                                        {selectedEmployeeIds.includes(emp.userId) && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <UserIcon size={14} className={selectedEmployeeIds.includes(emp.userId) ? 'text-primary' : 'text-slate-400'} />
                                                    <span className="text-sm font-medium">{emp.name}</span>
                                                </button>
                                            ))}
                                            {groupedEmployees.PART_TIME.length === 0 && (
                                                <p className="text-xs text-slate-400 p-2 italic">해당하는 직원이 없습니다.</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">선택됨</span>
                            <button
                                onClick={() => setSelectedEmployeeIds([])}
                                className="text-[10px] text-primary hover:underline font-bold"
                            >
                                초기화
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedEmployeeIds.map(id => {
                                const emp = employees.find(e => e.userId === id);
                                if (!emp) return null;
                                return (
                                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-md text-[10px] font-bold animate-in fade-in zoom-in duration-200">
                                        {emp.name}
                                        <button onClick={() => toggleEmployeeSelection(id)}><CheckCircle2 size={10} /></button>
                                    </span>
                                );
                            })}
                            {selectedEmployeeIds.length === 0 && (
                                <span className="text-[10px] text-slate-400">전체 직원이 선택됩니다.</span>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Filters & Preview */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Status Alert */}
                        <AnimatePresence>
                            {exportStatus !== 'idle' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${exportStatus === 'success'
                                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                        : exportStatus === 'error'
                                            ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                                            : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-blue-400'
                                        }`}
                                >
                                    {exportStatus === 'loading' && <Loader2 className="animate-spin" size={18} />}
                                    {exportStatus === 'success' && <CheckCircle2 size={18} />}
                                    {exportStatus === 'error' && <AlertCircle size={18} />}
                                    <span className="text-sm font-semibold">
                                        {exportStatus === 'loading' && '엑셀 파일을 생성하는 중입니다. 잠시만 기다려주세요.'}
                                        {exportStatus === 'success' && '엑셀 내보내기가 완료되었습니다!'}
                                        {exportStatus === 'error' && (errorMessage || '엑셀 내보내기 중 오류가 발생했습니다.')}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date Filter */}
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <CalendarIcon size={18} className="text-primary" />
                                    기간 설정
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">시작일</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">종료일</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => quickSelect('current')}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            이번 달
                                        </button>
                                        <button
                                            onClick={() => quickSelect('last')}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            지난 달
                                        </button>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/50 mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeLeaves
                                                ? 'bg-primary border-primary'
                                                : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                                                }`}>
                                                {includeLeaves && <Check size={14} className="text-white" />}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                휴무 기록 포함하기
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={includeLeaves}
                                                onChange={(e) => setIncludeLeaves(e.target.checked)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Farm Filter */}
                            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <MapPin size={18} className="text-primary" />
                                    농장 필터
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {farms.map(farm => (
                                        <button
                                            key={farm.id}
                                            onClick={() => toggleFarm(farm.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFarmIds.includes(farm.id)
                                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            {farm.name}
                                        </button>
                                    ))}
                                    {farms.length === 0 && <p className="text-slate-400 text-xs italic">등록된 농장이 없습니다.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Export Fields Selection */}
                        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Settings2 size={18} className="text-primary" />
                                내보내기 정보 선택
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {defaultFields.map(field => (
                                    <label key={field.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${exportFields.includes(field.id)
                                            ? 'bg-primary border-primary'
                                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700'
                                            }`}>
                                            {exportFields.includes(field.id) && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                            {field.label}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={exportFields.includes(field.id)}
                                            onChange={() => toggleExportField(field.id)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Export Summary Card */}
                        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 mx-auto mb-6">
                                <FileDown size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">기록 생성 준비 완료</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                                {selectedEmployeeIds.length > 0
                                    ? `${selectedEmployeeIds.length}명의 직원을 포함하여 `
                                    : '전체 직원을 대상으로 '}
                                기간 <strong>{startDate} ~ {endDate}</strong>의 데이터를 추출합니다.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">선택 직원</p>
                                    <p className="text-lg font-black text-primary">{selectedEmployeeIds.length === 0 ? '전체' : `${selectedEmployeeIds.length}명`}</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">선택 농장</p>
                                    <p className="text-lg font-black text-primary">{selectedFarmIds.length === 0 ? '전체' : `${selectedFarmIds.length}곳`}</p>
                                </div>
                            </div>
                        </div>

                        {/* Guide Section */}
                        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <Settings2 size={16} className="text-slate-400" />
                                내보내기 상세 가이드
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h5 className="text-[11px] font-bold text-slate-400 uppercase">필터 동작</h5>
                                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>직원을 명시적으로 선택하지 않으면 모든 직원이 포함됩니다.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h5 className="text-[11px] font-bold text-slate-400 uppercase">파일 관련</h5>
                                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                                        <li className="flex gap-2">
                                            <span className="text-primary">•</span>
                                            <span>저장 대화상자가 뜨지 않는 경우 브라우저 팝업 설정을 확인하세요.</span>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AttendanceExport;
