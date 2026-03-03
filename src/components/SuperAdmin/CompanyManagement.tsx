import React, { useState, useEffect } from 'react';
import { CompanyService } from '../../services/api';
import { Company, CompanyCreateRequest } from '../../types';
import { Plus, Search, Building2, MapPin, Phone, MoreHorizontal, User, Mail, Lock } from 'lucide-react';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCompany, setNewCompany] = useState<CompanyCreateRequest>({
        companyName: '',
        companyCode: '',
        businessNumber: '',
        address: '',
        phoneNumber: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPhone: ''
    });

    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await CompanyService.getAllCompanies();
            // API 응답 구조에 따라 데이터 추출
            if (Array.isArray(response.data)) {
                setCompanies(response.data);
            } else if (response.data && Array.isArray((response.data as any).data)) {
                setCompanies((response.data as any).data);
            } else {
                setCompanies(response.data as any);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setNewCompany({
            companyName: '',
            companyCode: '',
            businessNumber: '',
            address: '',
            phoneNumber: '',
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            adminPhone: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = (company: Company) => {
        setEditingId(company.id);
        setNewCompany({
            companyName: company.name,
            companyCode: company.code,
            businessNumber: company.businessNumber || '',
            address: company.address || '',
            phoneNumber: company.phoneNumber || '',
            // Admin fields are not editable here and not required for update
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            adminPhone: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (companyId: number, companyName: string) => {
        if (window.confirm(`'${companyName}' 회사를 삭제하시겠습니까?\n\n경고: 소속된 모든 사용자와 직원 데이터가 함께 영구 삭제됩니다.`)) {
            try {
                await CompanyService.deleteCompany(companyId);
                fetchCompanies();
                alert('회사가 삭제되었습니다.');
            } catch (error: any) {
                console.error('Failed to delete company:', error);
                alert(error.response?.data?.message || '회사 삭제에 실패했습니다.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            if (editingId) {
                // Update
                await CompanyService.updateCompany(editingId, {
                    name: newCompany.companyName,
                    address: newCompany.address,
                    phoneNumber: newCompany.phoneNumber,
                    businessNumber: newCompany.businessNumber,
                    status: 'ACTIVE' // or maintain existing status
                });
                alert('회사 정보가 수정되었습니다.');
            } else {
                // Create
                console.log('Creating company with:', newCompany);
                await CompanyService.createCompany(newCompany);
                alert('회사와 관리자 계정이 성공적으로 등록되었습니다.');
            }
            setIsModalOpen(false);
            fetchCompanies();
        } catch (error: any) {
            console.error('Failed to save company:', error);
            const msg = error.response?.data?.message || error.message || '저장에 실패했습니다.';
            alert(`오류 발생: ${msg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="회사명 또는 코드 검색..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                    />
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    새 회사 및 관리자 등록
                </button>
            </div>

            {/* Companies Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map((company) => (
                        <div key={company.id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{company.name}</h3>
                                        <span className="text-xs font-mono bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                            {company.code}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                    {company.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {company.businessNumber && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500 dark:text-gray-500 w-20">사업자번호</span>
                                        <span>{company.businessNumber}</span>
                                    </div>
                                )}
                                {company.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <span>{company.phoneNumber}</span>
                                    </div>
                                )}
                                {company.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        <span className="truncate">{company.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-2">
                                <button
                                    onClick={() => handleEdit(company)}
                                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(company.id, company.name)}
                                    className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Company Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl p-6 border border-gray-100 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                            {editingId ? '회사 정보 수정' : '새 회사 및 관리자 등록'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* 회사 정보 섹션 */}
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg space-y-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> 회사 정보
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">회사명 *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCompany.companyName}
                                            onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                            placeholder="예: (주)농업법인"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">회사 코드 (영문/숫자) *</label>
                                        <input
                                            type="text"
                                            required
                                            disabled={!!editingId} // 코드 수정 불가
                                            value={newCompany.companyCode}
                                            onChange={(e) => setNewCompany({ ...newCompany, companyCode: e.target.value.toUpperCase() })}
                                            className={`w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="COMPANY123"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">사업자 등록번호</label>
                                        <input
                                            type="text"
                                            value={newCompany.businessNumber}
                                            onChange={(e) => setNewCompany({ ...newCompany, businessNumber: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                            placeholder="123-45-67890"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">회사 전화번호</label>
                                        <input
                                            type="text"
                                            value={newCompany.phoneNumber}
                                            onChange={(e) => setNewCompany({ ...newCompany, phoneNumber: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                            placeholder="02-1234-5678"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">주소</label>
                                        <input
                                            type="text"
                                            value={newCompany.address}
                                            onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                            placeholder="서울특별시 ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 관리자 정보 섹션 (생성 시에만 표시) */}
                            {!editingId && (
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg space-y-4">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4" /> 관리자(Admin) 계정
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관리자 이름 *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newCompany.adminName}
                                                onChange={(e) => setNewCompany({ ...newCompany, adminName: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                                placeholder="홍길동"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관리자 이메일 (ID) *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={newCompany.adminEmail}
                                                    onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                                    placeholder="admin@company.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관리자 비밀번호 *</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={newCompany.adminPassword}
                                                    onChange={(e) => setNewCompany({ ...newCompany, adminPassword: e.target.value })}
                                                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                                                    placeholder="초기 비밀번호 입력"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">이메일과 비밀번호는 관리자 로그인에 사용됩니다.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                    {isSubmitting ? '처리 중...' : (editingId ? '수정 완료' : '등록 완료')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyManagement;
