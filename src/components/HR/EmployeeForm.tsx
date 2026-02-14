import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EmployeeService } from '../../services/api';

interface EmployeeFormProps {
    employee: any | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    userId: number;
    name: string;
    phone: string;
    hireDate: string;
    hourlyWage: number;
    bankAccount: string;
    accountHolder: string;
    paymentDate: number;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        userId: employee?.userId || 0,
        name: employee?.name || '',
        phone: employee?.phone || '',
        hireDate: employee?.hireDate || new Date().toISOString().split('T')[0],
        hourlyWage: employee?.hourlyWage || 10000,
        bankAccount: employee?.bankAccount || '',
        accountHolder: employee?.accountHolder || '',
        paymentDate: employee?.paymentDate || 25
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (employee) {
                await EmployeeService.updateEmployee(employee.id, formData);
            } else {
                await EmployeeService.createEmployee(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error('Failed to save employee:', err);
            setError(err.response?.data?.message || '작업자 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? 0 : '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: isMobile ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                maxWidth: isMobile ? '100%' : '600px',
                width: '100%',
                maxHeight: isMobile ? '90vh' : '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isMobile ? '1rem' : 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    flexShrink: 0
                }}>
                    <h3 style={{ fontSize: isMobile ? '1.125rem' : '1.25rem', fontWeight: 600, margin: 0 }}>
                        {employee ? '작업자 정보 수정' : '작업자 추가'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            color: 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <X size={isMobile ? 22 : 24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: isMobile ? '1rem' : 'var(--spacing-lg)',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fee',
                                color: '#c33',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--spacing-md)',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: isMobile ? '1rem' : '1rem' }}>
                            {/* User ID */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    사용자 ID *
                                </label>
                                <input
                                    type="number"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    required
                                    disabled={!!employee}
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem',
                                        backgroundColor: employee ? 'var(--color-background)' : 'white'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                    회원가입 시 생성된 사용자 ID를 입력하세요
                                </p>
                            </div>

                            {/* User Name */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    이름 *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    readOnly={!!employee} // Name is not updatable via this form
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem',
                                        backgroundColor: employee ? 'var(--color-background)' : 'white'
                                    }}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    연락처 *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="010-1234-5678"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                            </div>

                            {/* Hire Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    입사일 *
                                </label>
                                <input
                                    type="date"
                                    name="hireDate"
                                    value={formData.hireDate}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                            </div>

                            {/* Hourly Wage */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    시급 (원) *
                                </label>
                                <input
                                    type="number"
                                    name="hourlyWage"
                                    value={formData.hourlyWage}
                                    onChange={handleChange}
                                    min="0"
                                    step="100"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                            </div>

                            {/* Bank Account */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    계좌번호 *
                                </label>
                                <input
                                    type="text"
                                    name="bankAccount"
                                    value={formData.bankAccount}
                                    onChange={handleChange}
                                    placeholder="123-456-789"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                            </div>

                            {/* Account Holder */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    예금주 *
                                </label>
                                <input
                                    type="text"
                                    name="accountHolder"
                                    value={formData.accountHolder}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: isMobile ? '0.9375rem' : '1rem' }}>
                                    급여 지급일 (일) *
                                </label>
                                <input
                                    type="number"
                                    name="paymentDate"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                    min="1"
                                    max="31"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: isMobile ? '0.875rem' : '0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                        fontSize: isMobile ? '1rem' : '1rem'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                    매월 급여를 지급할 날짜 (1-31)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        justifyContent: 'flex-end',
                        padding: isMobile ? '1rem' : 'var(--spacing-lg)',
                        borderTop: '1px solid var(--color-border)',
                        flexShrink: 0,
                        backgroundColor: 'var(--color-surface)'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={loading}
                            style={{
                                flex: isMobile ? 1 : 'none',
                                padding: isMobile ? '0.875rem 1rem' : '0.625rem 1rem'
                            }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                flex: isMobile ? 1 : 'none',
                                padding: isMobile ? '0.875rem 1rem' : '0.625rem 1rem'
                            }}
                        >
                            {loading ? '저장 중...' : (employee ? '수정' : '추가')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
