import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { DashboardService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PendingItem {
    id: number;
    userId: number;
    userName: string;
    type: string;
    timestamp: string;
    reason: string;
}

/** 경과 시간을 'N분 전' 형식으로 반환 */
const timeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    return `${Math.floor(diff / 60)}시간 전`;
};

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<PendingItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';

    const fetchData = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const res = await DashboardService.getPendingApprovals(1);
            setItems(res.data);
        } catch (error) {
            console.error('Failed to fetch pending approvals:', error);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCardClick = () => {
        setIsOpen(false);
        navigate('/hr/attendance-management');
    };

    if (!isAdmin) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 벨 아이콘 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="icon-btn relative"
                style={{ color: 'var(--color-text)' }}
            >
                <Bell size={20} />
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {items.length}
                    </span>
                )}
            </button>

            {/* 드롭다운 패널 */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[340px] rounded-2xl z-50 overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        border: '1px solid rgba(200,200,200,0.3)',
                    }}
                >
                    {/* 헤더 */}
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">알림</span>
                        {items.length > 0 && (
                            <span className="text-[11px] text-slate-400">{items.length}건 대기 중</span>
                        )}
                    </div>

                    {/* 알림 카드 목록 */}
                    <div className="flex flex-col gap-1.5 px-2 pb-3 max-h-[420px] overflow-y-auto custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell size={28} className="mx-auto mb-2 text-slate-200" />
                                <p className="text-sm text-slate-400">새 알림이 없습니다</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={handleCardClick}
                                    className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.98]"
                                    style={{ background: 'rgba(255,255,255,0.7)' }}
                                >
                                    {/* 앱 아이콘 영역 */}
                                    <div className="w-11 h-11 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                        <span className="text-white text-xl">⏱</span>
                                    </div>

                                    {/* 텍스트 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-[13px] text-slate-800 truncate">
                                                {item.userName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                                                {timeAgo(item.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-slate-500 font-medium">
                                            {item.type === 'CLOCK_IN' ? '출근' : '퇴근'} 승인 요청
                                        </p>
                                        {item.reason && (
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                {item.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
