import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, DollarSign, CreditCard } from 'lucide-react';
import { EmployeeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EmployeeFormProps {
    employee?: any | null;
    onClose: () => void;
    onSuccess: () => void;
    isInline?: boolean;
}

interface FormData {
    // Shared fields
    userId?: number;
    name: string;
    phone: string;
    role: 'USER' | 'ADMIN';
    employmentType: 'FULL_TIME' | 'PART_TIME'; // 정규직/비정규직
    // Registration fields
    email?: string;
    password?: string;
    confirmPassword?: string;

    // Profile fields
    hireDate: string;
    hourlyWage: number;
    bankAccount: string;
    accountHolder: string;
    paymentDate: number;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose, onSuccess, isInline = false }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        // For existing employee, use their data. For new, defaults.
        name: employee?.name || '',
        phone: employee?.phone || '',
        role: employee?.role === 'ADMIN' ? 'ADMIN' : 'USER',
        employmentType: employee?.employmentType || 'FULL_TIME',
        email: '',
        password: '',
        confirmPassword: '',
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
                // Update existing
                await EmployeeService.updateEmployee(employee.id, {
                    ...formData,
                    phone: formData.phone,
                    employmentType: formData.employmentType
                });
            } else {
                // Register new
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('비밀번호가 일치하지 않습니다.');
                }

                // Map to EmployeeRegistrationRequest
                const registrationData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phone,
                    role: formData.role,
                    employmentType: formData.employmentType,
                    hireDate: formData.role === 'USER' ? formData.hireDate : null,
                    hourlyWage: formData.role === 'USER' ? formData.hourlyWage : null,
                    bankAccount: formData.role === 'USER' ? formData.bankAccount : null,
                    accountHolder: formData.role === 'USER' ? formData.accountHolder : null,
                    paymentDate: formData.role === 'USER' ? formData.paymentDate : null,
                    companyId: user?.companyId,
                    companyCode: user?.companyCode
                };

                await EmployeeService.createEmployee(registrationData);
            }
            onSuccess();
        } catch (err: any) {
            console.error('Failed to save employee:', err);
            setError(err.message || err.response?.data?.message || '직원 저장에 실패했습니다.');
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
        <div style={isInline ? { width: '100%' } : {
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
                borderRadius: (isInline || !isMobile) ? 'var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) 0 0',
                maxWidth: isInline ? '100%' : (isMobile ? '100%' : '600px'),
                width: '100%',
                maxHeight: isInline ? 'none' : '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isInline ? 'none' : 'var(--shadow-lg)',
                border: isInline ? '1px solid var(--color-border)' : 'none'
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
                        {employee ? '직원 정보 수정' : '직원 등록'}
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

                            {/* Account Info Section */}
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'var(--color-background)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '0.5rem'
                            }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={16} /> 계정 정보
                                </h4>

                                {!employee && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>권한 설정 *</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value="USER"
                                                    checked={formData.role === 'USER'}
                                                    onChange={handleChange}
                                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                                />
                                                <span>직원 (일반)</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value="ADMIN"
                                                    checked={formData.role === 'ADMIN'}
                                                    onChange={handleChange}
                                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                                />
                                                <span>관리자 (Admin)</span>
                                            </label>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                            * 관리자는 시스템 설정 및 모든 메뉴에 접근할 수 있습니다.
                                        </p>
                                    </div>
                                )}

                                {/* 고용 형태 - 등록시에만 선택 가능, 수정시에는 텍스트로 표시 */}
                                {!employee ? (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>고용 형태 *</label>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <label style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                                padding: '0.6rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${formData.employmentType === 'FULL_TIME' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                backgroundColor: formData.employmentType === 'FULL_TIME' ? '#e8f4ff' : 'transparent',
                                                flex: 1
                                            }}>
                                                <input type="radio" name="employmentType" value="FULL_TIME"
                                                    checked={formData.employmentType === 'FULL_TIME'}
                                                    onChange={handleChange}
                                                    style={{ width: '1.1rem', height: '1.1rem' }} />
                                                <span style={{ fontWeight: formData.employmentType === 'FULL_TIME' ? 600 : 400 }}>🏢 정규직</span>
                                            </label>
                                            <label style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                                padding: '0.6rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${formData.employmentType === 'PART_TIME' ? '#f59e0b' : 'var(--color-border)'}`,
                                                backgroundColor: formData.employmentType === 'PART_TIME' ? '#fffbeb' : 'transparent',
                                                flex: 1
                                            }}>
                                                <input type="radio" name="employmentType" value="PART_TIME"
                                                    checked={formData.employmentType === 'PART_TIME'}
                                                    onChange={handleChange}
                                                    style={{ width: '1.1rem', height: '1.1rem' }} />
                                                <span style={{ fontWeight: formData.employmentType === 'PART_TIME' ? 600 : 400 }}>⏰ 비정규직 (알바)</span>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                        <span style={{ display: 'inline-block', fontWeight: 500, marginRight: '1rem', color: 'var(--color-text-secondary)' }}>고용 형태:</span>
                                        <span style={{
                                            fontWeight: 600,
                                            color: formData.employmentType === 'PART_TIME' ? '#d97706' : 'var(--color-primary)'
                                        }}>
                                            {formData.employmentType === 'PART_TIME' ? '⏰ 비정규직 (알바)' : '🏢 정규직'}
                                        </span>
                                    </div>
                                )}

                                {!employee && (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>이메일 (ID) *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required={!employee}
                                                    placeholder="user@example.com"
                                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>비밀번호 *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                                    <input
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required={!employee}
                                                        placeholder="비밀번호"
                                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>비밀번호 확인 *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                                    <input
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        required={!employee}
                                                        placeholder="비밀번호 확인"
                                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Personal Info */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>이름 *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="홍길동"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>연락처 *</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="010-1234-5678"
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                            </div>

                            {formData.role === 'USER' && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>입사일 *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="date"
                                                    name="hireDate"
                                                    value={formData.hireDate}
                                                    onChange={handleChange}
                                                    required={formData.role === 'USER'}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                                {formData.employmentType === 'PART_TIME' ? '시급 (원) *' : '기본급/월급 (원) *'}
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                                <input
                                                    type="number"
                                                    name="hourlyWage"
                                                    value={formData.hourlyWage}
                                                    onChange={handleChange}
                                                    required={formData.role === 'USER'}
                                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>계좌번호 *</label>
                                            <div style={{ position: 'relative' }}>
                                                <CreditCard size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                                <input
                                                    type="text"
                                                    name="bankAccount"
                                                    value={formData.bankAccount}
                                                    onChange={handleChange}
                                                    required={formData.role === 'USER'}
                                                    placeholder="은행 계좌번호"
                                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>예금주 *</label>
                                            <input
                                                type="text"
                                                name="accountHolder"
                                                value={formData.accountHolder}
                                                onChange={handleChange}
                                                required={formData.role === 'USER'}
                                                placeholder="예금주명"
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>급여 지급일 (일) *</label>
                                        <input
                                            type="number"
                                            name="paymentDate"
                                            value={formData.paymentDate}
                                            onChange={handleChange}
                                            min="1"
                                            max="31"
                                            required={formData.role === 'USER'}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                        />
                                    </div>
                                </>
                            )}
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
                            {loading ? '저장 중...' : (employee ? '저장' : '등록')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
