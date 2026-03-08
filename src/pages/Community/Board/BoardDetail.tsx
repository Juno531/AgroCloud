import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getBoardById, deleteBoard } from '../../../services/board';
import { BoardPost } from '../../../types/board';
import { ArrowLeft, Clock, Eye, User as UserIcon, Edit, Trash2 } from 'lucide-react';

const BoardDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [board, setBoard] = useState<BoardPost | null>(null);
    const [loading, setLoading] = useState(true);

    const isMasterOrSuper = user?.role === 'MASTER_ADMIN' || user?.role === 'SUPER_ADMIN';
    const isAuthor = board?.author.id === user?.id; // Assuming user context has id
    const canEditOrDelete = isMasterOrSuper || (user?.role === 'ADMIN' && isAuthor);

    useEffect(() => {
        if (!id) return;
        
        const fetchBoard = async () => {
            try {
                setLoading(true);
                const data = await getBoardById(Number(id));
                setBoard(data);
            } catch (error) {
                console.error('Failed to fetch board details:', error);
                alert('게시글을 불러올 수 없습니다.');
                navigate('/board');
            } finally {
                setLoading(false);
            }
        };

        fetchBoard();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!id || !board) return;
        
        if (window.confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            try {
                await deleteBoard(Number(id));
                navigate('/board');
            } catch (error) {
                console.error('Failed to delete board:', error);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <div className="p-6 text-slate-500">데이터를 불러오는 중입니다...</div>;
    }

    if (!board) return null;

    return (
        <div className="flex flex-col flex-1 h-full p-6 animate-in fade-in max-w-5xl mx-auto w-full">
            <button 
                onClick={() => navigate('/board')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-6 w-fit"
            >
                <ArrowLeft className="w-5 h-5" />
                목록으로 돌아가기
            </button>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 mb-4">
                        {board.isNotice && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                공지사항
                            </span>
                        )}
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-tight">
                            {board.title}
                        </h1>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">{board.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(board.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>조회수 {board.viewCount}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 min-h-[400px]">
                    <div 
                        className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: board.content.replace(/\n/g, '<br />') }}
                    />
                </div>

                {/* Footer Actions */}
                {canEditOrDelete && (
                    <div className="p-6 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                        <button 
                            onClick={() => navigate(`/board/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            수정
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            삭제
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardDetail;
