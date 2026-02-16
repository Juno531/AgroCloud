import React, { useState, useEffect } from 'react';
import { CompanyService, RegistrationCodeService } from '../../services/api';
import { Company, RegistrationCode, CodeGenerateRequest } from '../../types';
import { Plus, Copy, Trash2, RefreshCw } from 'lucide-react';

const RegistrationCodeManagement = () => {
    const [codes, setCodes] = useState<RegistrationCode[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);

    // Create Code State
    const [isCreating, setIsCreating] = useState(false);
    const [newCodeData, setNewCodeData] = useState<CodeGenerateRequest>({
        companyId: 0,
        type: 'EMPLOYEE'
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    useEffect(() => {
        fetchCodes();
    }, [selectedCompanyId]);

    const fetchCompanies = async () => {
        try {
            const response = await CompanyService.getAllCompanies();
            // 데이터 추출 로직 (API 구조에 따라 조정 필요)
            const data = Array.isArray(response.data) ? response.data : (response.data as any).data || response.data;
            setCompanies(data as Company[]);
            if (data && data.length > 0 && !selectedCompanyId) {
                // 기본값으로 첫 번째 회사 선택하지 않음 (전체 보기)
            }
        } catch (error) {
            console.error('Failed to fetch companies', error);
        }
    };

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const response = await RegistrationCodeService.getCodes(selectedCompanyId);
            const data = Array.isArray(response.data) ? response.data : (response.data as any).data || response.data;
            setCodes(data as RegistrationCode[]);
        } catch (error) {
            console.error('Failed to fetch codes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCode = async () => {
        if (!newCodeData.companyId) {
            alert('회사를 선택해주세요.');
            return;
        }
        try {
            setIsCreating(true);
            await RegistrationCodeService.generateCode(newCodeData);
            await fetchCodes();
            // Reset form partly
            alert('코드가 생성되었습니다.');
        } catch (error) {
            console.error('Code generation failed', error);
            alert('코드 생성 실패');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCode = async (id: number) => {
        if (!window.confirm('정말 이 코드를 삭제하시겠습니까?')) return;
        try {
            await RegistrationCodeService.deleteCode(id);
            fetchCodes();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('코드가 복사되었습니다: ' + text);
    };

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold mb-4">가입 코드 생성</h3>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">대상 회사</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCodeData.companyId}
                            onChange={(e) => setNewCodeData({ ...newCodeData, companyId: Number(e.target.value) })}
                        >
                            <option value={0}>회사 선택...</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name} ({company.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">코드 타입</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCodeData.type}
                            onChange={(e) => setNewCodeData({ ...newCodeData, type: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
                        >
                            <option value="EMPLOYEE">일반 직원 (EMPLOYEE)</option>
                            <option value="ADMIN">회사 관리자 (ADMIN)</option>
                        </select>
                    </div>
                    <button
                        onClick={handleCreateCode}
                        disabled={isCreating || !newCodeData.companyId}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors ${isCreating || !newCodeData.companyId ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {isCreating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        코드 생성
                    </button>
                </div>
            </div>

            {/* List Filter */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <span className="text-gray-600 font-medium">필터:</span>
                <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={selectedCompanyId || ''}
                    onChange={(e) => setSelectedCompanyId(e.target.value ? Number(e.target.value) : undefined)}
                >
                    <option value="">전체 회사</option>
                    {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
                <div className="ml-auto">
                    <button
                        onClick={fetchCodes}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-50"
                        title="새로고침"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Codes List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회사명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">생성일</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : codes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    생성된 가입 코드가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            codes.map((code) => (
                                <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {code.companyName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                                        {code.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.type === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {code.type === 'ADMIN' ? '관리자' : '직원'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                code.status === 'USED' ? 'bg-gray-100 text-gray-500 line-through' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {code.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(code.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => copyToClipboard(code.code)}
                                                className="text-gray-400 hover:text-blue-600 p-1"
                                                title="코드 복사"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCode(code.id)}
                                                className="text-gray-400 hover:text-red-600 p-1"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RegistrationCodeManagement;
