import React, { useState, useEffect, useRef } from 'react';
import { CultivationService, EmployeeService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    farmId: number | null;
    initialData?: any;
}

const WorkAddModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, farmId, initialData }) => {
    const { user } = useAuth();
    const [keywords, setKeywords] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]); // 정규직 직원 목록
    // 복수 키워드 선택 지원
    const [selectedKeywordIds, setSelectedKeywordIds] = useState<string[]>([]);
    const overlayRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        taskName: '',
        workDate: new Date().toISOString().split('T')[0],
        notes: '',
        manager: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        if (initialData) {
            let extractedTaskName = '';
            let parsedNotes = initialData?.notes || '';
            
            if (parsedNotes.startsWith('[')) {
                const endIdx = parsedNotes.indexOf(']');
                if (endIdx > 0) {
                    extractedTaskName = parsedNotes.substring(1, endIdx);
                    parsedNotes = parsedNotes.substring(endIdx + 1).trim();
                }
            }
            
            const keywordRegex = /^관련 키워드:.*?\n?/;
            parsedNotes = parsedNotes.replace(keywordRegex, '').trim();

            setForm({
                taskName: extractedTaskName,
                workDate: initialData.workDate || new Date().toISOString().split('T')[0],
                notes: parsedNotes,
                manager: initialData.manager || ''
            });

            if (initialData.keywordId) {
                setSelectedKeywordIds([String(initialData.keywordId)]);
            } else if (initialData.workKeyword) {
                setSelectedKeywordIds([String(initialData.workKeyword.id)]);
            } else {
                setSelectedKeywordIds([]);
            }
        } else {
            setForm({
                taskName: '',
                workDate: new Date().toISOString().split('T')[0],
                notes: '',
                manager: ''
            });
            setSelectedKeywordIds([]);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (isOpen && farmId) {
            // 작업 키워드 불러오기
            CultivationService.getWorkKeywords(farmId)
                .then(res => {
                    const data = res.data.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
                    setKeywords(data);
                })
                .catch(err => console.error(err));

            // 회사 전체 정규직 직원 목록 불러오기 (검색 범위 확대)
            const companyCode = user?.companyCode;
            if (companyCode) {
                EmployeeService.getEmployeesByCompany(companyCode)
                    .then(res => {
                        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                        // FULL_TIME 고용 유형만 필터링 (대소문자 무시)
                        const regular = data.filter((e: any) =>
                            !e.employmentType || 
                            String(e.employmentType).toUpperCase() === 'FULL_TIME'
                        );
                        setEmployees(regular);
                    })
                    .catch(err => console.error('Failed to fetch employees for search:', err));
            } else {
                // companyCode가 없는 경우 farmId로 시도
                EmployeeService.getEmployeesByFarm(farmId)
                    .then(res => {
                        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                        const regular = data.filter((e: any) =>
                            !e.employmentType || 
                            String(e.employmentType).toUpperCase() === 'FULL_TIME'
                        );
                        setEmployees(regular);
                    })
                    .catch(err => console.error(err));
            }
        }
    }, [isOpen, farmId, user?.companyCode]);

    // body scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 키워드 추가 (중복 제외)
    const handleAddKeyword = (id: string | number) => {
        const sid = String(id);
        setSelectedKeywordIds(prev => prev.includes(sid) ? prev : [...prev, sid]);
    };

    // 키워드 제거
    const handleRemoveKeyword = (id: string) => {
        setSelectedKeywordIds(prev => prev.filter(k => k !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!farmId) return;
        try {
            // 선택된 첫 번째 키워드를 keywordId로 사용, 나머지는 notes에 포함
            const [firstKeywordId, ...restKeywordIds] = selectedKeywordIds;
            const extraKeywordNames = restKeywordIds
                .map(id => keywords.find(k => String(k.id) === id)?.name)
                .filter(Boolean)
                .join(', ');

            const combinedNotes = [
                form.taskName ? `[작업명: ${form.taskName}]` : '',
                extraKeywordNames ? `[추가 키워드: ${extraKeywordNames}]` : '',
                form.notes
            ].filter(Boolean).join('\n');

            const payload = {
                farmId,
                workDate: form.workDate,
                keywordId: firstKeywordId ? Number(firstKeywordId) : undefined,
                notes: combinedNotes,
                manager: form.manager,
                completionStatus: initialData ? initialData.completionStatus : 'PLANNED',
                startTime: initialData ? initialData.startTime : undefined,
                endTime: initialData ? initialData.endTime : undefined,
                durationMinutes: initialData ? initialData.durationMinutes : 0
            };

            if (initialData && initialData.id) {
                await CultivationService.updateWorkRecord(initialData.id, payload);
            } else {
                await CultivationService.createWorkRecord(payload);
            }

            onClose();
            if (onSuccess) onSuccess();
            setForm({ taskName: '', workDate: new Date().toISOString().split('T')[0], notes: '', manager: '' });
            setSelectedKeywordIds([]);
            setEmployees([]);
        } catch (error) {
            console.error('Error creating work record:', error);
            alert('작업 등록 실패');
        }
    };

    // 추천 키워드: 아직 선택되지 않은 키워드만 표시
    const suggestedKeywords = keywords.filter(k => !selectedKeywordIds.includes(String(k.id))).slice(0, 6);

    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEmployees = employees.filter(emp => {
        if (!searchTerm) return true;
        const nameMatch = emp.name && emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || emailMatch;
    });

    const handleSelectEmployee = (empName: string) => {
        setForm(prev => ({ ...prev, manager: empName }));
        setSearchTerm('');
        setIsDropdownOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { 
                if (e.target === overlayRef.current) {
                    onClose(); 
                }
            }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">

                {/* 헤더 */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="size-12 text-primary bg-primary/10 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">add_task</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {initialData ? '작업 내용 수정' : '새 작업 기록'}
                            </h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">간단 작업 입력</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                {/* 폼 본문 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 작업명 */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">작업명</label>
                            <input
                                name="taskName"
                                value={form.taskName}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="예: 적엽 작업"
                                type="text"
                            />
                        </div>

                        {/* 작업 키워드 (복수 선택) */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">작업 키워드</label>
                            <div className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-3 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all min-h-[56px]">
                                <div className="flex flex-wrap gap-2 items-center">
                                    {selectedKeywordIds.length === 0 && (
                                        <span className="text-sm font-semibold text-slate-400 ml-1">아래에서 키워드를 선택하세요...</span>
                                    )}
                                    {selectedKeywordIds.map(id => {
                                        const kw = keywords.find(k => String(k.id) === id);
                                        if (!kw) return null;
                                        return (
                                            <span
                                                key={id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border"
                                                style={{
                                                    backgroundColor: `${kw.colorCode}20`,
                                                    borderColor: kw.colorCode,
                                                    color: kw.colorCode
                                                }}
                                            >
                                                {kw.name}
                                                <button
                                                    onClick={() => handleRemoveKeyword(id)}
                                                    className="hover:opacity-70 transition-opacity"
                                                    type="button"
                                                >
                                                    <span className="material-symbols-outlined text-sm leading-none">close</span>
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* 추천 키워드 버튼 */}
                            {suggestedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-1 items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">추가하려면 클릭:</span>
                                    {suggestedKeywords.map(kw => (
                                        <button
                                            key={kw.id}
                                            onClick={() => handleAddKeyword(kw.id)}
                                            type="button"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: `${kw.colorCode}15`,
                                                borderColor: `${kw.colorCode}60`,
                                                color: kw.colorCode
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-sm leading-none">add</span>
                                            {kw.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {keywords.length === 0 && (
                                <p className="text-xs text-slate-400 ml-1 mt-1">등록된 키워드가 없습니다. 키워드 설정 탭에서 추가하세요.</p>
                            )}
                        </div>

                        {/* 날짜 / 관리자 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">날짜</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">calendar_today</span>
                                    <input
                                        name="workDate"
                                        required
                                        value={form.workDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-slate-900 dark:text-white"
                                        type="date"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">관리자</label>
                                <div className="relative" ref={dropdownRef}>
                                    <div 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-10 py-4 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all font-semibold text-slate-900 dark:text-white cursor-pointer flex items-center min-h-[58px]"
                                    >
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">account_circle</span>
                                        <span className={form.manager ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                                            {form.manager || '관리자 선택'}
                                        </span>
                                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            {isDropdownOpen ? 'expand_less' : 'expand_more'}
                                        </span>
                                    </div>

                                    {/* 검색 가능한 드롭다운 메뉴 */}
                                    {isDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="relative">
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                                    <input 
                                                        type="text"
                                                        placeholder="이름 또는 직책 검색..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        autoFocus
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-9 pr-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-primary/20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                {filteredEmployees.length > 0 ? (
                                                    filteredEmployees.map(emp => (
                                                        <div 
                                                            key={emp.id}
                                                            onClick={() => handleSelectEmployee(emp.name)}
                                                            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                                    {emp.name.substring(0, 1)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</p>
                                                                    {emp.position && <p className="text-[10px] text-slate-500 font-bold uppercase">{emp.position}</p>}
                                                                </div>
                                                            </div>
                                                            {form.manager === emp.name && (
                                                                <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-8 text-center">
                                                        <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">person_search</span>
                                                        <p className="text-xs font-bold text-slate-400 uppercase">검색 결과가 없습니다</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 세부 내용 */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">세부 내용</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                                placeholder="상세 작업 요건, 특정 구역, 또는 필요한 장비를 입력하세요..."
                                rows={4}
                            />
                        </div>

                    </form>
                </div>

                {/* 하단 버튼바 */}
                <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        className="px-8 py-4 text-slate-600 dark:text-slate-400 font-black hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">save</span>
                        작업 저장
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WorkAddModal;
