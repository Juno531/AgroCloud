import { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import EmployeeList from '../../components/HR/EmployeeList';
import AttendanceLog from '../../components/HR/AttendanceLog';
import AttendanceSetting from '../../components/HR/AttendanceSetting';
import AttendanceManagement from '../../components/HR/AttendanceManagement';
import { useLayout } from '../../context/LayoutContext';

const HRManagement = () => {
    const location = useLocation();
    const { setTitle } = useLayout();

    const getPageTitle = () => {
        if (location.pathname.includes('/hr/employees')) return '직원 관리';
        if (location.pathname.includes('/hr/attendance-log')) return '출퇴근 기록';
        if (location.pathname.includes('/hr/attendance-settings')) return '출퇴근 설정';
        if (location.pathname.includes('/hr/attendance-management')) return '근태 관리';
        return '인사 관리';
    };

    useEffect(() => {
        setTitle(getPageTitle());
    }, [location.pathname, setTitle]);

    if (location.pathname === '/hr' || location.pathname === '/hr/') {
        return <Navigate to="/hr/employees" replace />;
    }

    const renderContent = () => {
        if (location.pathname.includes('/hr/employees')) return <EmployeeList />;
        if (location.pathname.includes('/hr/attendance-log')) return <AttendanceLog />;
        if (location.pathname.includes('/hr/attendance-settings')) return <AttendanceSetting />;
        if (location.pathname.includes('/hr/attendance-management')) return <AttendanceManagement />;
        return <EmployeeList />;
    };

    return (
        <div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default HRManagement;
