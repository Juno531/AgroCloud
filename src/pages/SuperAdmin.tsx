import React, { useState } from 'react';
import CompanyManagement from '../components/SuperAdmin/CompanyManagement';
import RegistrationCodeManagement from '../components/SuperAdmin/RegistrationCodeManagement';
import { Layout, Building, Key, Users, Settings } from 'lucide-react';

const SuperAdmin = () => {
    const [activeTab, setActiveTab] = useState('companies');

    const renderContent = () => {
        switch (activeTab) {
            case 'companies':
                return <CompanyManagement />;
            case 'codes':
                return <RegistrationCodeManagement />;
            case 'users':
                return <div className="p-6 text-center text-gray-500">사용자 관리 기능 준비 중 (Phase 4)</div>;
            case 'settings':
                return <div className="p-6 text-center text-gray-500">시스템 설정 기능 준비 중 (Phase 4)</div>;
            default:
                return <CompanyManagement />;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Layout className="w-6 h-6 text-blue-600" />
                        슈퍼 어드민
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'companies'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Building className="w-5 h-5" />
                        회사 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('codes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'codes'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Key className="w-5 h-5" />
                        가입 코드 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Users className="w-5 h-5" />
                        사용자 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Settings className="w-5 h-5" />
                        시스템 설정
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {activeTab === 'companies' && '회사 관리'}
                        {activeTab === 'codes' && '가입 코드 관리'}
                        {activeTab === 'users' && '사용자 관리'}
                        {activeTab === 'settings' && '시스템 설정'}
                    </h2>
                    <p className="text-gray-500 mt-1">
                        {activeTab === 'companies' && '등록된 회사를 관리하고 새로운 회사를 추가합니다.'}
                        {activeTab === 'codes' && '각 회사의 관리자 및 직원 가입 코드를 발급합니다.'}
                        {activeTab === 'users' && '전체 사용자를 조회하고 관리합니다.'}
                        {activeTab === 'settings' && '시스템 전역 설정을 변경합니다.'}
                    </p>
                </header>
                <main className="p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SuperAdmin;
