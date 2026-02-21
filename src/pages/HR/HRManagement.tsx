import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import EmployeeList from '../../components/HR/EmployeeList';
import AttendanceLog from '../../components/HR/AttendanceLog';
import AttendanceSetting from '../../components/HR/AttendanceSetting';

import { useLayout } from '../../context/LayoutContext';

const HRManagement = () => {
    const location = useLocation();
    const { setTitle } = useLayout();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const getPageTitle = () => {
        if (location.pathname.includes('/hr/employees')) return '직원 관리';
        if (location.pathname.includes('/hr/attendance-log')) return '출퇴근 기록';
        if (location.pathname.includes('/hr/attendance-settings')) return '출퇴근 설정';
        return '인사 관리';
    };

    useEffect(() => {
        setTitle(getPageTitle());
    }, [location.pathname, setTitle]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redirect to default sub-page if at root /hr
    if (location.pathname === '/hr' || location.pathname === '/hr/') {
        return <Navigate to="/hr/employees" replace />;
    }

    const renderContent = () => {
        if (location.pathname.includes('/hr/employees')) return <EmployeeList />;
        if (location.pathname.includes('/hr/attendance-log')) return <AttendanceLog />;
        if (location.pathname.includes('/hr/attendance-settings')) return <AttendanceSetting />;
        return <EmployeeList />;
    };

    return (
        <div style={{ padding: isMobile ? 'var(--spacing-md)' : 'var(--spacing-lg)' }}>
            {/* Tab Content */}
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default HRManagement;
