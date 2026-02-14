import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/api';
import { User, Lock, ArrowRight, Key, Building2, Users } from 'lucide-react';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [registerType, setRegisterType] = useState<'admin' | 'worker'>('admin');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Register and use the returned token
            // inviteCode는 RegisterRequest 인터페이스에서 string 필수이므로 undefined 대신 빈 문자열 전송
            const response = await AuthService.register({
                email,
                password,
                name,
                // 관리자는 입력된 inviteCode 사용, 작업자는 빈 문자열 (백엔드에서 무시됨)
                inviteCode: registerType === 'admin' ? inviteCode : '',
                // 작업자는 입력된 inviteCode를 farmInviteCode로 사용
                farmInviteCode: registerType === 'worker' ? inviteCode : undefined,
                registerType
            });

            if (response.data && response.data.token) {
                // ... (rest of success logic)
                const role = response.data.user.role;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if (role === 'ADMIN') {
                    navigate('/', { replace: true });
                } else {
                    navigate('/attendance', { replace: true });
                }
                window.location.reload();
            } else {
                throw new Error('No token returned from registration');
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            console.error('Error response:', err.response?.data);

            const errorMessage = err.response?.data?.message || err.message;

            if (err.response?.status === 409 || errorMessage?.includes('already')) {
                setError('이미 존재하는 이메일입니다.');
            } else if (errorMessage?.includes('Invalid admin invite code')) {
                setError('기업 코드가 올바르지 않습니다.');
            } else if (errorMessage?.includes('Invalid farm invite code') || errorMessage?.includes('유효하지 않은 농장 초대 코드')) {
                setError('유효하지 않은 농장 코드입니다. (직원은 농장 ID 숫자를 입력해야 합니다)');
            } else if (errorMessage?.includes('Invalid register type')) {
                setError('가입 유형을 선택해주세요.');
            } else {
                setError('회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    // ... (rest of component)
    const inputStyle = {
        width: '100%',
        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500 as const
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.1) 0%, transparent 50%)',
            padding: 'var(--spacing-md)'
        }}>
            <div className="login-container" style={{
                width: '100%',
                maxWidth: '420px',
                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        marginBottom: '1rem'
                    }}>
                        <img src="/logo.svg" alt="Farm ERP" style={{ width: '64px', height: '64px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Farm ERP</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        새로운 계정을 생성하세요
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: '0.75rem',
                        marginBottom: '1.5rem',
                        backgroundColor: 'var(--color-error-bg)',
                        color: 'var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {/* 회원가입 타입 선택 */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>가입 유형 선택</label>
                    <div className="register-type-buttons" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setRegisterType('admin');
                                setInviteCode('');
                                setError('');
                            }}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: registerType === 'admin'
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid var(--color-border)',
                                backgroundColor: registerType === 'admin'
                                    ? 'rgba(74, 222, 128, 0.1)'
                                    : 'var(--color-background)',
                                color: registerType === 'admin'
                                    ? 'var(--color-primary)'
                                    : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: registerType === 'admin' ? 600 : 400
                            }}
                        >
                            <Building2 size={20} />
                            <span>기업</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRegisterType('worker');
                                setInviteCode('');
                                setError('');
                            }}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: registerType === 'worker'
                                    ? '2px solid var(--color-primary)'
                                    : '1px solid var(--color-border)',
                                backgroundColor: registerType === 'worker'
                                    ? 'rgba(74, 222, 128, 0.1)'
                                    : 'var(--color-background)',
                                color: registerType === 'worker'
                                    ? 'var(--color-primary)'
                                    : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: registerType === 'worker' ? 600 : 400
                            }}
                        >
                            <Users size={20} />
                            <span>직원</span>
                        </button>
                    </div>
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        marginTop: '0.5rem',
                        textAlign: 'center'
                    }}>
                        {registerType === 'admin'
                            ? '농장을 생성하고 관리합니다. 기업 전용 코드가 필요합니다.'
                            : '농장에 소속되어 출퇴근을 기록합니다. 농장 코드가 필요합니다.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>이메일</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={inputStyle}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>비밀번호</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={inputStyle}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>이름</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={inputStyle}
                                placeholder="홍길동"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>
                            {registerType === 'admin' ? '기업 코드' : '농장 ID (숫자)'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                            <input
                                type={registerType === 'admin' ? 'text' : 'number'}
                                value={inviteCode}
                                onChange={(e) => setInviteCode(registerType === 'admin' ? e.target.value.toUpperCase() : e.target.value)}
                                style={inputStyle}
                                placeholder={registerType === 'admin' ? '기업 코드 입력' : '농장 ID 입력 (예: 1)'}
                                required
                            />
                        </div>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-secondary)',
                            marginTop: '0.5rem'
                        }}>
                            {registerType === 'admin'
                                ? '발급받은 기업 코드를 입력하세요'
                                : '기업 관리자에게 문의하여 농장 ID(숫자)를 입력하세요'}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: 'clamp(0.75rem, 3vw, 0.875rem)',
                            fontSize: '1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minHeight: 'var(--min-touch-target)'
                        }}
                    >
                        {isLoading ? '처리 중...' : '회원가입'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            textDecoration: 'underline'
                        }}
                    >
                        이미 계정이 있으신가요? 로그인
                    </button>
                </div>
            </div>
            <style>{`
                @media (max-width: 767px) {
                    .login-container {
                        margin: 0 !important;
                    }
                    
                    .register-type-buttons {
                        flex-direction: column !important;
                    }
                    
                    .register-type-buttons button {
                        width: 100% !important;
                        min-height: var(--min-touch-target) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
