import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import EmployeeList from '../../components/HR/EmployeeList';
import AttendanceQRCode from '../../components/HR/AttendanceQRCode';

import AttendanceLog from '../../components/HR/AttendanceLog';
import QRScanner from '../../components/HR/QRScanner';

import { useLayout } from '../../context/LayoutContext';

const HRManagement = () => {
    const location = useLocation();
    const { setTitle } = useLayout();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const getPageTitle = () => {
        if (location.pathname.includes('/hr/employees')) return '직원 관리';

        if (location.pathname.includes('/hr/qr')) return '출퇴근 QR';
        if (location.pathname.includes('/hr/attendance-log')) return '출퇴근 기록';
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

        if (location.pathname.includes('/hr/qr')) return <AttendanceQRCode />;
        if (location.pathname.includes('/hr/scan')) return <QRScanner />;
        if (location.pathname.includes('/hr/attendance-log')) return <AttendanceLog />;
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
