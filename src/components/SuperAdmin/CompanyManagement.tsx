import React, { useState, useEffect } from 'react';
import { CompanyService } from '../../services/api';
import { Company, CompanyCreateRequest } from '../../types';
import { Plus, Search, Building2, MapPin, Phone, MoreHorizontal } from 'lucide-react';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCompany, setNewCompany] = useState<CompanyCreateRequest>({
        name: '',
        code: '',
        businessNumber: '',
        address: '',
        phoneNumber: ''
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await CompanyService.getAllCompanies();
            // API 응답 구조에 따라 데이터 추출 (직접 배열이 오는지, data 속성에 있는지)
            if (Array.isArray(response.data)) {
                setCompanies(response.data);
            } else if (response.data && Array.isArray((response.data as any).data)) {
                setCompanies((response.data as any).data);
            } else {
                // 백엔드 listCompanies가 List<CompanyDto.Response>를 반환하므로 바로 배열일 수도 있고
                // ApiResponse<List> 일 수도 있음. api.ts에서 ApiResponse<Company[]>로 정의했으므로 response.data.data 일 가능성 높음
                // 하지만 ApiResponse 제네릭 사용법에 따라 다름. 여기서는 response.data가 실제 데이터라고 가정하거나 안전하게 처리
                setCompanies(response.data as any);
            }
        } catch (error) {
            console.error('Failed to fetch companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await CompanyService.createCompany(newCompany);
            setIsModalOpen(false);
            setNewCompany({ name: '', code: '', businessNumber: '', address: '', phoneNumber: '' });
            fetchCompanies();
            alert('회사가 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('Failed to create company:', error);
            alert('회사 등록에 실패했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="회사명 또는 코드 검색..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    새 회사 등록
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
                        <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Building2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{company.name}</h3>
                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                            {company.code}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${company.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {company.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                {company.businessNumber && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500 w-20">사업자번호</span>
                                        <span>{company.businessNumber}</span>
                                    </div>
                                )}
                                {company.phoneNumber && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{company.phoneNumber}</span>
                                    </div>
                                )}
                                {company.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{company.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button className="text-gray-500 hover:text-blue-600 p-2 hover:bg-gray-50 rounded-full transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Company Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-bold mb-4">새 회사 등록</h3>
                        <form onSubmit={handleCreateCompany} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">회사명 *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCompany.name}
                                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">회사 코드 (영문/숫자) *</label>
                                <input
                                    type="text"
                                    required
                                    value={newCompany.code}
                                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">사업자 등록번호</label>
                                <input
                                    type="text"
                                    value={newCompany.businessNumber}
                                    onChange={(e) => setNewCompany({ ...newCompany, businessNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                                <input
                                    type="text"
                                    value={newCompany.phoneNumber}
                                    onChange={(e) => setNewCompany({ ...newCompany, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                                <input
                                    type="text"
                                    value={newCompany.address}
                                    onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    등록
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
