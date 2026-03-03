import React, { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '../../services/api';

interface PendingItem {
    id: number;
    userId: number;
    userName: string;
    type: string;
    timestamp: string;
    reason: string;
}

const PendingApprovalsWidget: React.FC = () => {
    const [items, setItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await DashboardService.getPendingApprovals();
            setItems(res.data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAction = useCallback(async (id: number, status: 'APPROVED' | 'REJECTED') => {
        setProcessingId(id);
        try {
            await DashboardService.updateApprovalStatus(id, status);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch {
            // 실패 시 목록 재조회
            fetchData();
        } finally {
            setProcessingId(null);
        }
    }, [fetchData]);

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 dark:text-white">대기 중인 근무 승인</h3>
                    {items.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32 text-slate-400 text-sm">로딩 중...</div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <span className="material-icons-round text-4xl text-slate-200 dark:text-zinc-700">check_circle</span>
                    <p className="text-sm text-slate-400">대기 중인 승인 요청이 없습니다</p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {items.map(item => (
                        <li
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            {/* 아이콘 */}
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-icons-round text-amber-500 text-xl">schedule</span>
                            </div>

                            {/* 내용 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
                                        {item.userName}
                                    </span>
                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                        {item.type === 'CLOCK_IN' ? '출근' : '퇴근'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{formatTime(item.timestamp)}</p>
                                {item.reason && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                        사유: {item.reason}
                                    </p>
                                )}
                            </div>

                            {/* 버튼 */}
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                                <button
                                    disabled={processingId === item.id}
                                    onClick={() => handleAction(item.id, 'APPROVED')}
                                    className="px-3 py-1 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                                >
                                    승인
                                </button>
                                <button
                                    disabled={processingId === item.id}
                                    onClick={() => handleAction(item.id, 'REJECTED')}
                                    className="px-3 py-1 text-[11px] font-bold bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                    거절
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingApprovalsWidget;
