import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getBoardById, createBoard, updateBoard } from '../../../services/board';
import { Save, X, ArrowLeft } from 'lucide-react';

const BoardForm = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isNotice, setIsNotice] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN' || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        if (!isAdmin) {
            alert('접근 권한이 없습니다.');
            navigate('/board');
            return;
        }

        if (isEdit && id) {
            const fetchBoard = async () => {
                try {
                    setLoading(true);
                    const data = await getBoardById(Number(id));
                    
                    // 권한 체크: MASTER_ADMIN 이상이거나, 본인이 작성한 글인 경우만 수정 가능
                    const isMasterOrSuper = user?.role === 'MASTER_ADMIN' || user?.role === 'SUPER_ADMIN';
                    if (!isMasterOrSuper && data.author.id !== user?.id) {
                        alert('본인이 작성한 글만 수정할 수 있습니다.');
                        navigate(`/board/${id}`);
                        return;
                    }
                    
                    setTitle(data.title);
                    setContent(data.content);
                    setIsNotice(data.isNotice ?? false);
                } catch (error) {
                    console.error('Failed to fetch board:', error);
                    alert('게시글을 불러올 수 없습니다.');
                    navigate('/board');
                } finally {
                    setLoading(false);
                }
            };

            fetchBoard();
        }
    }, [id, isEdit, navigate, isAdmin, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            alert('내용을 입력해주세요.');
            return;
        }

        try {
            setSaving(true);
            const requestData = { title, content, isNotice };
            
            if (isEdit && id) {
                await updateBoard(Number(id), requestData);
                alert('수정되었습니다.');
                navigate(`/board/${id}`);
            } else {
                await createBoard(requestData);
                alert('등록되었습니다.');
                navigate('/board');
            }
        } catch (error) {
            console.error('Failed to save board:', error);
            alert('저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-slate-500">데이터를 불러오는 중입니다...</div>;
    }

    if (!isAdmin) return null;

    return (
        <div className="flex flex-col flex-1 h-full p-6 animate-in fade-in max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => navigate(isEdit ? `/board/${id}` : '/board')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    돌아가기
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {isEdit ? '게시글 수정' : '새 게시글 작성'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    {/* 공지 설정 */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700/50">
                        <input
                            type="checkbox"
                            id="isNotice"
                            checked={isNotice}
                            onChange={(e) => setIsNotice(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                        />
                        <label htmlFor="isNotice" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
                            공지사항으로 등록하기
                        </label>
                        <span className="text-xs text-slate-500 ml-2">목록 상단에 고정됩니다.</span>
                    </div>

                    {/* 제목 입력 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            제목
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="게시글 제목을 입력하세요"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            maxLength={200}
                        />
                    </div>

                    {/* 내용 입력 */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            내용
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="게시글 내용을 입력하세요"
                            rows={15}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={() => navigate(isEdit ? `/board/${id}` : '/board')}
                        className="px-6 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors font-medium flex items-center gap-2"
                        disabled={saving}
                    >
                        <X className="w-5 h-5" />
                        취소
                    </button>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BoardForm;
