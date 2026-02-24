import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Calendar, Mail, Lock, Search } from 'lucide-react';
import { EmployeeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';

import { EmployeeProfile } from '../../types';



const EmployeeList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'FULL_TIME' | 'PART_TIME'>('ALL');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        fetchEmployees();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [user?.farmId, user?.companyId, user?.companyCode]);

    const fetchEmployees = async () => {
        // Only guard if absolutely no identifying info is available for fetching
        if (user?.role !== 'ADMIN' && !user?.farmId && !user?.companyId && !user?.companyCode) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setFetchError(null);
        try {
            let response;
            if (user?.companyCode) {
                response = await EmployeeService.getEmployeesByCompany(user.companyCode);
            } else if (user?.farmId) {
                response = await EmployeeService.getEmployeesByFarm(user.farmId);
            } else {
                // If admin but no farm/company code yet assigned in context/session
                response = await EmployeeService.getAllEmployees();
            }
            setEmployees(response.data);
        } catch (error: any) {
            console.error('Failed to fetch employees:', error);
            setFetchError(error.message || '직원 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchEmployees();
    };


    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const filteredEmployees = employees.filter((emp: EmployeeProfile) => {
        const matchesSearch = (emp.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const empType = emp.employmentType || 'FULL_TIME';
        const matchesFilter = filterType === 'ALL' || empType === filterType;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <div>데이터를 불러오는 중...</div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                border: '1px solid var(--color-danger)',
                color: 'var(--color-danger)'
            }}>
                <p style={{ marginBottom: '1rem' }}>{fetchError}</p>
                <button
                    onClick={fetchEmployees}
                    className="btn btn-primary"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)'
            }}>
                <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 600, margin: 0 }}>
                    직원 목록 ({employees.length}명)
                </h3>
                <button
                    onClick={() => {
                        setIsFormOpen(true);
                    }}
                    className="btn btn-primary"
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <User size={16} />
                    <span>직원 등록</span>
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem',
                marginBottom: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-secondary)'
                    }} />
                    <input
                        type="text"
                        placeholder="이름 또는 이메일로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-background)',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--color-background)',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    gap: '0.25rem'
                }}>
                    {(['ALL', 'FULL_TIME', 'PART_TIME'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: filterType === type ? 600 : 400,
                                backgroundColor: filterType === type ? 'var(--color-surface)' : 'transparent',
                                color: filterType === type ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                boxShadow: filterType === type ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {type === 'ALL' ? '전체' : type === 'FULL_TIME' ? '정규직' : '비정규직(알바)'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Employee List */}
            {filteredEmployees.length === 0 ? (
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: isMobile ? '2rem 1rem' : '3rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)'
                }}>
                    <Search size={isMobile ? 40 : 48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>{searchTerm || filterType !== 'ALL' ? '검색 결과가 없습니다' : '등록된 직원이 없습니다'}</p>
                    {(searchTerm || filterType !== 'ALL') && (
                        <button
                            onClick={() => { setSearchTerm(''); setFilterType('ALL'); }}
                            style={{
                                marginTop: '1rem',
                                color: 'var(--color-primary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 500,
                                textDecoration: 'underline'
                            }}
                        >
                            필터 초기화
                        </button>
                    )}
                </div>
            ) : isMobile ? (
                // Mobile Card Layout
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredEmployees.map((employee: EmployeeProfile) => (
                        <div
                            key={employee.id}
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '1rem',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--color-border)'
                            }}
                        >
                            {/* Header: Name + Actions */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: employee.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '1.125rem'
                                    }}>
                                        {employee.name ? employee.name.charAt(0) : '?'}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <Link
                                            to={`/hr/employees/${employee.id}`}
                                            style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 700,
                                                color: 'inherit',
                                                textDecoration: 'none'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                                        >
                                            {employee.name || '미등록'}
                                        </Link>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: employee.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                                                fontWeight: employee.role === 'ADMIN' ? 600 : 400
                                            }}>
                                                {employee.role === 'ADMIN' ? '관리자' : '직원'}
                                            </span>
                                            {employee.role !== 'ADMIN' && (
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    padding: '0.1rem 0.5rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: employee.employmentType === 'PART_TIME' ? '#fef3c7' : '#dbeafe',
                                                    color: employee.employmentType === 'PART_TIME' ? '#92400e' : '#1e40af',
                                                    border: `1px solid ${employee.employmentType === 'PART_TIME' ? '#fcd34d' : '#93c5fd'}`
                                                }}>
                                                    {employee.employmentType === 'PART_TIME' ? '⏰ 비정규직(알바)' : '🏢 정규직'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Phone size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9375rem' }}>{employee.phone || '미등록'}</span>
                                </div>
                                {employee.role === 'USER' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Mail size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9375rem' }}>{employee.email || '미등록'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Lock size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>
                                                {employee.password ? '숨김 (해시됨)' : '미등록'}
                                                {employee.password && (
                                                    <span title={employee.password} style={{ marginLeft: '0.5rem', cursor: 'help', textDecoration: 'underline dotted' }}>자세히</span>
                                                )}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Calendar size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.9375rem' }}>입사일: {formatDate(employee.hireDate)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Desktop Table Layout
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--color-border)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>이름/권한</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>계정 정보</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>연락처</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>입사일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee: EmployeeProfile) => (
                                    <tr
                                        key={employee.id}
                                        style={{
                                            borderBottom: '1px solid var(--color-border)',
                                            transition: 'background-color 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: employee.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-primary)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600
                                                }}>
                                                    {(employee.name || '?').charAt(0)}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                                                    <Link
                                                        to={`/hr/employees/${employee.id}`}
                                                        style={{
                                                            fontWeight: 700,
                                                            color: 'inherit',
                                                            textDecoration: 'none',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                                                    >
                                                        {employee.name || '미등록'}
                                                    </Link>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', }}>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            color: employee.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                                                            fontWeight: employee.role === 'ADMIN' ? 600 : 400,
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        }}>
                                                            {employee.role === 'ADMIN' ? '관리자' : '직원'}
                                                        </span>
                                                        {employee.role !== 'ADMIN' && (
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 600,
                                                                padding: '0.1rem 0.45rem',
                                                                borderRadius: '999px',
                                                                backgroundColor: employee.employmentType === 'PART_TIME' ? '#fef3c7' : '#dbeafe',
                                                                color: employee.employmentType === 'PART_TIME' ? '#92400e' : '#1e40af',
                                                                border: `1px solid ${employee.employmentType === 'PART_TIME' ? '#fcd34d' : '#93c5fd'}`,
                                                                whiteSpace: 'nowrap',
                                                                flexShrink: 0
                                                            }}>
                                                                {employee.employmentType === 'PART_TIME' ? '비정규직(알바)' : '정규직'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Mail size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                                    <span style={{ fontSize: '0.875rem' }}>{employee.email}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Lock size={14} style={{ color: 'var(--color-text-secondary)' }} />
                                                    <span
                                                        style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'help' }}
                                                        title={employee.password}
                                                    >
                                                        {employee.password ? '숨김 (해시됨)' : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                                {employee.phone}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                                {employee.role === 'USER' ? formatDate(employee.hireDate) : '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Employee Form Modal (등록 전용) */}
            {isFormOpen && (
                <EmployeeForm
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default EmployeeList;
