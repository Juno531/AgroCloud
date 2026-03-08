import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getBoards } from '../../../services/board';
import { BoardResponse } from '../../../types/board';
import { PlusCircle, Megaphone, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const BoardList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState<BoardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN' || user?.role === 'SUPER_ADMIN';

    const fetchBoards = async (pageNumber: number) => {
        try {
            setLoading(true);
            const res = await getBoards({ page: pageNumber, size: 10 });
            setData(res);
        } catch (error) {
            console.error('Failed to fetch boards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards(page);
    }, [page]);

    const handleRowClick = (id: number) => {
        navigate(`/board/${id}`);
    };

    return (
        <div className="flex flex-col flex-1 h-full p-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">게시판</h1>
                        <p className="text-sm text-slate-500 mt-1">공지사항 및 소식을 확인하세요</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => navigate('/board/write')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20"
                    >
                        <PlusCircle className="w-5 h-5" />
                        글쓰기
                    </button>
                )}
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-medium">번호</th>
                                <th className="px-6 py-4 font-medium w-full">제목</th>
                                <th className="px-6 py-4 font-medium text-center">작성자</th>
                                <th className="px-6 py-4 font-medium text-center">작성일</th>
                                <th className="px-6 py-4 font-medium text-center">조회수</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                            {/* 공지사항 항상 최상단 고정 */}
                            {data?.notices.map((notice) => (
                                <tr
                                    key={`notice-${notice.id}`}
                                    onClick={() => handleRowClick(notice.id)}
                                    className="bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 text-center text-sm text-slate-400">-</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0">
                                                <Megaphone className="w-3 h-3" />
                                                공지
                                            </span>
                                            <span className="font-bold text-slate-800 dark:text-white">{notice.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{notice.author.name}</td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">{new Date(notice.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center text-sm text-slate-500">{notice.viewCount}</td>
                                </tr>
                            ))}

                            {/* 일반 게시글 렌더링 */}
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        데이터를 불러오는 중입니다...
                                    </td>
                                </tr>
                            ) : data?.boards.length === 0 && (!data.notices || data.notices.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        등록된 게시글이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                data?.boards.map((board, index) => (
                                    <tr
                                        key={board.id}
                                        onClick={() => handleRowClick(board.id)}
                                        className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                                            {data.totalElements - (page * 10) - index}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                                            {board.title}
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-slate-400">{board.author.name}</td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">{new Date(board.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center text-sm text-slate-500">{board.viewCount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.totalPages > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/30">
                        <span className="text-sm text-slate-500">
                            총 <span className="font-medium text-slate-900 dark:text-white">{data.totalElements}</span>개
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {page + 1} / {data.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                                disabled={page >= data.totalPages - 1}
                                className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardList;
