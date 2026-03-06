import React, { useState, useEffect } from 'react';
import { CultivationService } from '../../../services/api';
import { Plus, Edit2, Trash2, PlusCircle } from 'lucide-react';

interface Props {
    farmId: number;
}

interface Keyword {
    id: number;
    name: string;
    colorCode: string;
}

const KeywordSettings: React.FC<Props> = ({ farmId }) => {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(false);

    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#13ec13');

    // Edit state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#13ec13');

    const [sortBy, setSortBy] = useState('recent');

    useEffect(() => {
        fetchKeywords();
    }, [farmId]);

    const fetchKeywords = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getWorkKeywords(farmId);
            if (Array.isArray(res.data)) {
                setKeywords(res.data);
            } else if (res.data?.success && Array.isArray(res.data.data)) {
                setKeywords(res.data.data);
            } else {
                setKeywords([]);
            }
        } catch (error) {
            console.error('Error fetching keywords:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddKeyword = async () => {
        if (!newName.trim()) return;
        try {
            await CultivationService.createWorkKeyword(farmId, {
                farmId,
                name: newName,
                colorCode: newColor
            });
            setNewName('');
            setNewColor('#13ec13');
            fetchKeywords();
        } catch (error) {
            console.error('Error adding keyword:', error);
            alert('키워드 추가 실패');
        }
    };

    const handleUpdateKeyword = async () => {
        if (!selectedKeywordId || !editName.trim()) return;
        try {
            await CultivationService.updateWorkKeyword(farmId, selectedKeywordId, {
                farmId,
                name: editName,
                colorCode: editColor
            });
            setIsModalOpen(false);
            fetchKeywords();
        } catch (error) {
            console.error('Error updating keyword:', error);
            alert('키워드 수정 실패');
        }
    };

    const handleDeleteKeyword = async () => {
        if (!selectedKeywordId) return;
        if (!window.confirm('정말 삭제하시겠습니까? 관련 데이터의 키워드 정보가 유실될 수 있습니다.')) return;
        try {
            await CultivationService.deleteWorkKeyword(farmId, selectedKeywordId);
            setIsModalOpen(false);
            fetchKeywords();
        } catch (error) {
            console.error('Error deleting keyword:', error);
            alert('키워드 삭제 실패');
        }
    };

    const handleKeywordClick = (keyword: Keyword) => {
        setSelectedKeywordId(keyword.id);
        setEditName(keyword.name);
        setEditColor(keyword.colorCode);
        setIsModalOpen(true);
    };

    const sortedKeywords = React.useMemo(() => {
        const sorted = [...keywords];
        if (sortBy === 'alphabetical') {
            return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        }
        // recent
        return sorted.sort((a, b) => b.id - a.id);
    }, [keywords, sortBy]);

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">작업 키워드 관리</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold mt-1">작업 라벨을 설정하고 더 나은 워크플로우 분류를 위해 구성하세요.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8 mb-6 md:mb-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <PlusCircle className="text-primary w-6 h-6" />
                    새 키워드 생성
                </h3>

                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4">
                    <div className="flex-1 w-full sm:min-w-[240px]">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">키워드 이름</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            placeholder="예: 토양 준비"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-auto shrink-0 flex items-center justify-between sm:block gap-4">
                        <div className="flex-1 sm:flex-none">
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">라벨 색상</label>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 h-[50px] px-3">
                                <input
                                    type="color"
                                    className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent"
                                    value={newColor}
                                    onChange={e => setNewColor(e.target.value)}
                                />
                                <span className="text-xs font-bold text-slate-500 font-mono uppercase">{newColor}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddKeyword}
                        disabled={!newName.trim()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 sm:mt-0"
                    >
                        <Plus size={20} />
                        <span>키워드 추가</span>
                    </button>
                </div>
            </div>

            {/* Keyword List */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">현재 활성 키워드 ({keywords.length})</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">정렬 기준:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest p-0 focus:ring-0 cursor-pointer"
                        >
                            <option value="recent">최근 등록순</option>
                            <option value="alphabetical">가나다순</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-slate-500 py-8">로딩 중...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedKeywords.map(keyword => (
                            <div
                                key={keyword.id}
                                onClick={() => handleKeywordClick(keyword)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md hover:scale-[1.02] transition-all group"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4">
                                    <div className="w-3 sm:w-4 h-3 sm:h-4 rounded-full shadow-sm shrink-0" style={{ backgroundColor: keyword.colorCode }}></div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-800 dark:text-white truncate">{keyword.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-tight">{keyword.colorCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-xl">
                                        settings
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Delete Modal */}
            {isModalOpen && selectedKeywordId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">키워드 정보 변경</h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">키워드 이름</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">라벨 색상</label>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 h-[50px] px-3">
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent shadow-sm"
                                        value={editColor}
                                        onChange={e => setEditColor(e.target.value)}
                                    />
                                    <span className="text-xs font-bold text-slate-500 font-mono uppercase flex-1">{editColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeleteKeyword}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-500 font-black rounded-2xl hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={16} />
                                삭제
                            </button>
                            <button
                                onClick={handleUpdateKeyword}
                                disabled={!editName.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                <Edit2 size={16} />
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeywordSettings;
