import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CompanyManagement from '../../components/SuperAdmin/CompanyManagement';
import { useLayout } from '../../context/LayoutContext';

const SuperAdmin = () => {
    const location = useLocation();
    const { setTitle } = useLayout();

    const getTitleAndDescription = () => {
        const path = location.pathname;
        if (path.includes('/companies')) {
            return {
                title: '회사 관리',
                description: '등록된 회사를 관리하고 새로운 회사를 추가합니다.'
            };
        }

        if (path.includes('/users')) {
            return {
                title: '사용자 관리',
                description: '전체 사용자를 조회하고 관리합니다.'
            };
        }
        if (path.includes('/settings')) {
            return {
                title: '시스템 설정',
                description: '시스템 전역 설정을 변경합니다.'
            };
        }
        return { title: '슈퍼 어드민', description: '관할 구역 및 자원을 관리합니다.' };
    };

    const { title, description } = getTitleAndDescription();

    useEffect(() => {
        setTitle(title);
    }, [title, setTitle]);

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Dynamic Content Area */}
            <main className="flex-1 overflow-auto">
                {description && (
                    <div className="mb-6">
                        <p className="text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                )}
                <Routes>
                    <Route path="companies" element={<CompanyManagement />} />
                    <Route path="users" element={<div className="p-6 text-center text-gray-500">사용자 관리 기능 준비 중 (Phase 4)</div>} />
                    <Route path="settings" element={<div className="p-6 text-center text-gray-500">시스템 설정 기능 준비 중 (Phase 4)</div>} />
                    <Route path="/" element={<Navigate to="companies" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default SuperAdmin;
