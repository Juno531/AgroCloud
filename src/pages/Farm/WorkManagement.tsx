import { useState, useEffect } from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useFarm } from '../../context/FarmContext';
import DailyTasks from '../../components/Farm/Work/DailyTasks';
import WorkStatistics from '../../components/Farm/Work/WorkStatistics';
import KeywordSettings from '../../components/Farm/Work/KeywordSettings';
import WorkAddModal from '../../components/Farm/Work/WorkAddModal';

const WorkManagement = () => {
    const { setTitle } = useLayout();
    const { fields } = useFarm();
    const [selectedFarm, setSelectedFarm] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'tasks' | 'stats' | 'keywords'>('tasks');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleOpenAddModal = () => {
        setEditRecord(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (record: any) => {
        setEditRecord(record);
        setIsAddModalOpen(true);
    };

    useEffect(() => {
        setTitle('작업 관리'); // To match the Stitch design header if desired
    }, [setTitle]);

    useEffect(() => {
        if (fields.length > 0 && !selectedFarm) {
            setSelectedFarm(fields[0]?.id ?? null);
        }
    }, [fields]);

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full bg-background-light dark:bg-background-dark">
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 shrink-0">
                <div className="w-full flex gap-6 md:gap-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                    <button
                        className={`py-4 px-1 text-sm font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${activeTab === 'tasks' ? 'text-primary font-black' : 'text-slate-500 hover:text-primary'}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        전체 작업
                    </button>
                    <button
                        className={`py-4 px-1 text-sm font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${activeTab === 'stats' ? 'text-primary font-black' : 'text-slate-500 hover:text-primary'}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        통계
                    </button>
                    <button
                        className={`py-4 px-1 text-sm font-bold transition-all focus:outline-none whitespace-nowrap shrink-0 ${activeTab === 'keywords' ? 'text-primary font-black' : 'text-slate-500 hover:text-primary'}`}
                        onClick={() => setActiveTab('keywords')}
                    >
                        키워드 설정
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                {selectedFarm && (
                    <>
                        {activeTab === 'tasks' && <DailyTasks farmId={selectedFarm} onAddClick={handleOpenAddModal} onEditClick={handleOpenEditModal} refreshTrigger={refreshTrigger} />}
                        {activeTab === 'stats' && <WorkStatistics farmId={selectedFarm} />}
                        {activeTab === 'keywords' && <KeywordSettings farmId={selectedFarm} />}

                        <WorkAddModal
                            isOpen={isAddModalOpen}
                            onClose={() => {
                                setIsAddModalOpen(false);
                                setEditRecord(null);
                            }}
                            onSuccess={() => {
                                setRefreshTrigger(prev => prev + 1);
                                setIsAddModalOpen(false);
                                setEditRecord(null);
                            }}
                            farmId={selectedFarm}
                            initialData={editRecord}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default WorkManagement;
