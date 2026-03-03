import React, { useState, useEffect, useMemo } from 'react';
import { CultivationService } from '../../services/api';
import { useFarm } from '../../context/FarmContext';
import { Hammer, Plus, Calendar, Trash2, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import Modal from '../../components/UI/Modal';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { useLayout } from '../../context/LayoutContext';

const WorkManagement = () => {
    const { setTitle } = useLayout();
    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [workRecords, setWorkRecords] = useState<any[]>([]);
    // Filters
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal & Dialog
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Form State
    const [newWork, setNewWork] = useState({
        workDate: new Date().toISOString().split('T')[0],
        workType: 'PRUNING',
        notes: '',
        completionStatus: 'PLANNED'
    });

    useEffect(() => {
        setTitle('작업 관리');
    }, [setTitle]);

    useEffect(() => {
        if (fields.length > 0 && !selectedFarm) {
            setSelectedFarm(fields[0]?.id);
        }
    }, [fields]);

    useEffect(() => {
        if (selectedFarm) {
            fetchWorkRecords();
        }
    }, [selectedFarm, filterDate]);

    const fetchWorkRecords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getWorkRecordsByFarmAndDate(selectedFarm!, filterDate);
            if (res.data.success) {
                setWorkRecords(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching work records:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWork = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CultivationService.createWorkRecord({
                ...newWork,
                workType: 'OTHER',
                farmId: selectedFarm
            });
            setIsModalOpen(false);
            fetchWorkRecords();
            setNewWork({
                workDate: new Date().toISOString().split('T')[0],
                workType: 'OTHER',
                notes: '',
                completionStatus: 'PLANNED'
            });
        } catch (error) {
            console.error("Error creating work record:", error);
            alert("작업 등록에 실패했습니다.");
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await CultivationService.updateWorkRecordStatus(id, status);
            fetchWorkRecords();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDeleteWork = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: '작업 삭제',
            message: '이 작업 기록을 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    await CultivationService.deleteWorkRecord(id);
                    fetchWorkRecords();
                } catch (error) {
                    console.error("Error deleting work record:", error);
                }
            }
        });
    };

    const stats = useMemo(() => {
        const total = workRecords.length;
        const completed = workRecords.filter(r => r.completionStatus === 'COMPLETED').length;
        const pending = total - completed;
        return { total, completed, pending };
    }, [workRecords]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'PLANNED': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Hammer className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">작업 관리</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">농장 내 작업 일정을 관리하고 기록합니다.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>새 작업 등록</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">전체 작업</p>
                        <h3 className="text-2xl font-bold dark:text-white">{stats.total}건</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                        <Hammer size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">완료된 작업</p>
                        <h3 className="text-2xl font-bold dark:text-white">{stats.completed}건</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mb-1">진행/예정</p>
                        <h3 className="text-2xl font-bold dark:text-white">{stats.pending}건</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">농장 선택</label>
                    <select
                        value={selectedFarm || ''}
                        onChange={(e) => setSelectedFarm(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 dark:text-white"
                    >
                        {fields.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">날짜 선택</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-xl p-3 pl-10 focus:ring-2 focus:ring-primary/20 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Work List Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">작업 내용 (Description)</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">상태</th>
                                <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-zinc-500">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">데이터를 불러오는 중...</td>
                                </tr>
                            ) : workRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">해당 날짜에 등록된 작업이 없습니다.</td>
                                </tr>
                            ) : workRecords
                                .map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="p-4 text-sm dark:text-white">
                                            {record.notes || <span className="text-slate-400 dark:text-zinc-500 italic">내용 없음</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(record.completionStatus)}`}>
                                                    {record.completionStatusKorean}
                                                </span>
                                                {record.completionStatus !== 'COMPLETED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(record.id, record.completionStatus === 'PLANNED' ? 'IN_PROGRESS' : 'COMPLETED')}
                                                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-primary transition-all"
                                                        title="상태 변경"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDeleteWork(record.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="새 작업 등록">
                <form onSubmit={handleAddWork} className="space-y-4 p-1">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">작업 날짜</label>
                        <input
                            type="date"
                            required
                            value={newWork.workDate}
                            onChange={(e) => setNewWork({ ...newWork, workDate: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-zinc-800 border-none rounded-xl p-3 dark:text-white"
                        />
                    </div>


                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">작업 내용 (상세)</label>
                        <textarea
                            required
                            value={newWork.notes}
                            onChange={(e) => setNewWork({ ...newWork, notes: e.target.value })}
                            className="w-full bg-slate-100 dark:bg-zinc-800 border-none rounded-xl p-3 min-h-[150px] dark:text-white"
                            placeholder="어떤 작업을 하시는지 상세히 적어주세요..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold py-3 rounded-xl transition-all"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all"
                        >
                            등록하기
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </div>
    );
};

export default WorkManagement;
