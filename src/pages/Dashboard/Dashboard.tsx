import React from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';
import TodayAttendanceWidget from '../../components/HR/TodayAttendanceWidget';
import PendingApprovalsWidget from '../../components/HR/PendingApprovalsWidget';
// import DashboardNoticeWidget from '../../components/Board/DashboardNoticeWidget';

const Dashboard = () => {
    const { setTitle } = useLayout();
    const { user } = useAuth();
    // ADMIN / MASTER_ADMIN에게만 대시보드 관리 위젯 표시
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MASTER_ADMIN';
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    React.useEffect(() => {
        setTitle('대시보드');
    }, [setTitle]);

    return (
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 w-full">
                    <div className="flex-1">
                        <span className="text-primary font-bold">{formattedDate}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 w-full">
                    {/* 공지사항 위젯 (모든 사용자 공통) - 1컬럼 차지 */}
                    {/* <div className="lg:col-span-1">
                        <DashboardNoticeWidget />
                    </div> */}

                    {/* 관리자 전용 위젯 (2컬럼 차지) */}
                    {isAdmin && (
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <TodayAttendanceWidget />
                            <PendingApprovalsWidget />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
