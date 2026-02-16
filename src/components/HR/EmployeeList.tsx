import { useState, useEffect } from 'react';
import { Edit, Trash2, User, Phone, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { EmployeeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EmployeeForm from './EmployeeForm';
import ConfirmDialog from '../UI/ConfirmDialog';

interface EmployeeProfile {
    id: number;
    userId: number;
    name: string;
    phone: string;
    hireDate: string;
    hourlyWage: number;
    bankAccount: string;
    accountHolder: string;
    paymentDate: number;
}

const EmployeeList = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'danger' as 'danger' | 'info' | 'warning'
    });

    useEffect(() => {
        fetchEmployees();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [user?.farmId]);

    const fetchEmployees = async () => {
        if (!user?.farmId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await EmployeeService.getEmployeesByFarm(user.farmId);
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: EmployeeProfile) => {
        setEditingEmployee(employee);
        setIsFormOpen(true);
    };

    const handleDelete = (employee: EmployeeProfile) => {
        setConfirmDialog({
            isOpen: true,
            title: '작업자 삭제',
            message: `"${employee.name}" 작업자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await EmployeeService.deleteEmployee(employee.id);
                    await fetchEmployees();
                } catch (error) {
                    console.error('Failed to delete employee:', error);
                    alert('작업자 삭제에 실패했습니다.');
                }
            }
        });
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingEmployee(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        fetchEmployees();
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
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                로딩 중...
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
                    작업자 목록 ({employees.length}명)
                </h3>
            </div>

            {/* Employee List */}
            {employees.length === 0 ? (
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: isMobile ? '2rem 1rem' : '3rem',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)'
                }}>
                    <User size={isMobile ? 40 : 48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p>등록된 작업자가 없습니다</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        작업자가 농장 코드로 회원가입하면 자동으로 등록됩니다
                    </p>
                </div>
            ) : isMobile ? (
                // Mobile Card Layout
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {employees.map((employee) => (
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
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '1.125rem'
                                    }}>
                                        {employee.name ? employee.name.charAt(0) : '?'}
                                    </div>
                                    <strong style={{ fontSize: '1.125rem' }}>{employee.name || '미등록'}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem', minWidth: 'auto' }}
                                        title="수정"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee)}
                                        className="btn btn-outline"
                                        style={{
                                            padding: '0.5rem',
                                            minWidth: 'auto',
                                            color: 'var(--color-danger)',
                                            borderColor: 'var(--color-danger)'
                                        }}
                                        title="삭제"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Employee Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Phone size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9375rem' }}>{employee.phone || '미등록'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.9375rem' }}>입사일: {formatDate(employee.hireDate)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <DollarSign size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                    <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>
                                        {formatCurrency(employee.hourlyWage)}
                                    </strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CreditCard size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                                    <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <span>{employee.bankAccount || '미등록'}</span>
                                        {employee.accountHolder && (
                                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                                {employee.accountHolder}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '0.25rem'
                                }}>
                                    급여 지급일: 매월 {employee.paymentDate}일
                                </div>
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
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>이름</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>연락처</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>입사일</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>시급</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>계좌번호</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>예금주</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>급여지급일</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
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
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600
                                                }}>
                                                    {(employee.name || '?').charAt(0)}
                                                </div>
                                                <strong>{employee.name || '미등록'}</strong>
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
                                                {formatDate(employee.hireDate)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <DollarSign size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                                <strong style={{ color: 'var(--color-primary)' }}>
                                                    {formatCurrency(employee.hourlyWage)}
                                                </strong>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <CreditCard size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                                {employee.bankAccount}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{employee.accountHolder}</td>
                                        <td style={{ padding: '1rem' }}>매월 {employee.paymentDate}일</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.5rem', minWidth: 'auto' }}
                                                    title="수정"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee)}
                                                    className="btn btn-outline"
                                                    style={{
                                                        padding: '0.5rem',
                                                        minWidth: 'auto',
                                                        color: 'var(--color-danger)',
                                                        borderColor: 'var(--color-danger)'
                                                    }}
                                                    title="삭제"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Employee Form Modal (수정 전용) */}
            {isFormOpen && (
                <EmployeeForm
                    employee={editingEmployee}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
            />
        </div>
    );
};

export default EmployeeList;
