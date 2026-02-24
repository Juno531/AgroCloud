import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, Calendar,
    Shield, User, MapPin, Briefcase,
    Edit, Trash2, DollarSign, CreditCard
} from 'lucide-react';
import { EmployeeService } from '../../services/api';
import { EmployeeProfile } from '../../types';
import { useLayout } from '../../context/LayoutContext';
import EmployeeForm from '../../components/HR/EmployeeForm';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const EmployeeDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setTitle } = useLayout();
    const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setTitle('직원 상세 정보');
        fetchEmployee();
    }, [id, setTitle]);

    const fetchEmployee = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await EmployeeService.getEmployee(parseInt(id));
            setEmployee(response.data);
        } catch (err: any) {
            console.error('Failed to fetch employee details:', err);
            setError(err.response?.data?.message || '직원 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!employee) return;
        try {
            await EmployeeService.deleteEmployee(employee.id);
            navigate('/hr/employees');
        } catch (err) {
            console.error('Failed to delete employee:', err);
            alert('직원 삭제에 실패했습니다.');
        }
    };

    const handleEditSuccess = () => {
        setIsEditMode(false);
        fetchEmployee();
    };

    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || amount === null) return '-';
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-text-secondary)' }}>
                <div className="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent text-primary rounded-full mb-4"></div>
                <div style={{ fontSize: '1.25rem' }}>데이터를 불러오는 중...</div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '3rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <p style={{ color: 'var(--color-danger)', fontSize: '1.25rem', marginBottom: '2rem' }}>{error || '직원을 찾을 수 없습니다.'}</p>
                    <button onClick={() => navigate('/hr/employees')} className="btn btn-primary">
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
            {/* Navigation Header */}
            <div style={{
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => navigate('/hr/employees')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-text-secondary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.9375rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                >
                    <ArrowLeft size={18} />
                    목록으로 돌아가기
                </button>

                {!isEditMode && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="btn btn-outline"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            <Edit size={16} />
                            수정
                        </button>
                        <button
                            onClick={() => setIsConfirmDialogOpen(true)}
                            className="btn btn-outline"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                color: 'var(--color-danger)',
                                borderColor: 'var(--color-danger)'
                            }}
                        >
                            <Trash2 size={16} />
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {isEditMode ? (
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: isMobile ? '1rem' : '2rem'
                }}>
                    <EmployeeForm
                        employee={employee}
                        isInline={true}
                        onClose={() => setIsEditMode(false)}
                        onSuccess={handleEditSuccess}
                    />
                </div>
            ) : (
                <>
                    {/* Profile Summary Card */}
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        padding: '2.5rem',
                        borderRadius: 'var(--radius-xl)',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: 'var(--radius-lg)',
                                backgroundColor: employee.role === 'ADMIN' ? 'var(--color-warning)' : 'var(--color-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
                            }}>
                                {employee.name ? employee.name.charAt(0) : '?'}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0 }}>{employee.name}</h1>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: employee.employmentType === 'PART_TIME' ? '#fef3c7' : '#dbeafe',
                                        color: employee.employmentType === 'PART_TIME' ? '#92400e' : '#1e40af',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {employee.employmentType === 'PART_TIME' ? '비정규직(알바)' : '정규직'}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem', margin: 0 }}>
                                    {employee.role === 'ADMIN' ? '팜 관리자(ADMIN)' : '현장 작업자(USER)'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
                        {/* Basic Info */}
                        <div className="card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <User size={20} className="text-primary" />
                                기본 정보
                            </h3>
                            <div className="info-grid">
                                <InfoItem label="이메일" value={employee.email} icon={<Mail size={16} />} />
                                <InfoItem label="연락처" value={employee.phone} icon={<Phone size={16} />} />
                                <InfoItem label="입사일" value={formatDate(employee.hireDate)} icon={<Calendar size={16} />} />
                                <InfoItem label="직급" value={employee.role === 'ADMIN' ? '관리자' : '일반'} icon={<Briefcase size={16} />} />
                                <InfoItem label="거주지" value={employee.address || '미등록'} icon={<MapPin size={16} />} />
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="card">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <Shield size={20} className="text-primary" />
                                권한 및 보안
                            </h3>
                            <div className="info-grid">
                                <InfoItem
                                    label="역할"
                                    value={employee.role === 'ADMIN' ? '관리자 (Admin)' : '직원 (User)'}
                                    highlight={employee.role === 'ADMIN' ? 'warning' : 'success'}
                                    icon={<Shield size={16} />}
                                />
                                <InfoItem
                                    label="이메일 인증"
                                    value={employee.isEmailVerified ? '인증됨' : '미인증'}
                                    highlight={employee.isEmailVerified ? 'success' : 'warning'}
                                />
                            </div>
                        </div>

                        {/* Salary Info - Added back based on user request */}
                        <div className="card" style={{ gridColumn: isMobile ? 'auto' : '1 / -1' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <DollarSign size={20} className="text-primary" />
                                급여 및 결제 정보
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                                <div style={{
                                    backgroundColor: 'var(--color-background)',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>기본급 / 시급</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(employee.hourlyWage)}</p>
                                </div>
                                <div style={{
                                    backgroundColor: 'var(--color-background)',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>급여 지급일</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>매월 {employee.paymentDate}일</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="info-grid" style={{ height: '100%', justifyContent: 'center' }}>
                                        <InfoItem label="은행" value={employee.bankAccount?.split(' ')[0] || '미등록'} icon={<CreditCard size={16} />} />
                                        <InfoItem label="계좌번호" value={employee.bankAccount || '미등록'} />
                                        <InfoItem label="예금주" value={employee.accountHolder || '미등록'} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .card {
                    background-color: var(--color-surface);
                    padding: 2rem;
                    borderRadius: var(--radius-lg);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--color-border);
                }
                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
            `}</style>

            {/* Delete Confirm Dialog */}
            {employee && (
                <ConfirmDialog
                    isOpen={isConfirmDialogOpen}
                    onClose={() => setIsConfirmDialogOpen(false)}
                    onConfirm={handleDelete}
                    title="직원 삭제"
                    message={`"${employee.name}" 직원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
                    variant="danger"
                />
            )}
        </div>
    );
};

const InfoItem = ({ label, value, icon, highlight }: { label: string, value: string | number | undefined, icon?: React.ReactNode, highlight?: 'success' | 'warning' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)' }}>
            {icon}
            <span style={{ fontSize: '0.9375rem' }}>{label}</span>
        </div>
        <span style={{
            fontWeight: 500,
            color: highlight === 'success' ? '#059669' : highlight === 'warning' ? '#d97706' : 'inherit',
            backgroundColor: highlight ? (highlight === 'success' ? '#ecfdf5' : '#fffbeb') : 'transparent',
            padding: highlight ? '0.125rem 0.5rem' : 0,
            borderRadius: highlight ? 'var(--radius-full)' : 0
        }}>{value || '-'}</span>
    </div>
);

export default EmployeeDetail;
