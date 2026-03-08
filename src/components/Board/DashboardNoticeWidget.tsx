import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '../../services/board';
import { BoardPost } from '../../types/board';
import { Megaphone, ChevronRight, Clock } from 'lucide-react';

const DashboardNoticeWidget: React.FC = () => {
    const navigate = useNavigate();
    const [notices, setNotices] = useState<BoardPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotices = useCallback(async () => {
        try {
            setLoading(true);
            // 공지사항을 가져오기 위해 첫 페이지 요청 (getBoards는 notices와 boards를 함께 반환)
            const res = await getBoards({ page: 0, size: 5 });
            setNotices(res.notices || []);
        } catch (error) {
            console.error('Failed to fetch notices for dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Megaphone className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-white">공지사항</h3>
                </div>
                <button 
                    onClick={() => navigate('/board')}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                    전체보기
                    <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="flex-1 space-y-4">
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2">
                                <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-50 dark:bg-zinc-800/50 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                ) : notices.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-8 text-slate-400 text-sm">
                        등록된 공지사항이 없습니다.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                        {notices.map((notice) => (
                            <button
                                key={notice.id}
                                onClick={() => navigate(`/board/${notice.id}`)}
                                className="w-full text-left py-3 first:pt-0 last:pb-0 group transition-all"
                            >
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary line-clamp-1 mb-1 transition-colors">
                                    {notice.title}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(notice.createdAt).toLocaleDateString()}
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-zinc-700"></span>
                                    <span>{notice.author.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardNoticeWidget;
