import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/api';
import { User, Lock, ArrowRight, UserPlus, Key, Building2, Users } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [registerType, setRegisterType] = useState<'admin' | 'worker'>('admin');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                navigate(from, { replace: true });
            } else {
                // Register and use the returned token
                const response = await AuthService.register({
                    email,
                    password,
                    name,
                    inviteCode: registerType === 'admin' ? inviteCode : '',  // 관리자만 inviteCode 사용
                    farmInviteCode: registerType === 'worker' ? inviteCode : undefined,  // 작업자는 farmInviteCode 사용
                    registerType
                });

                if (response.data && response.data.token) {
                    // 역할 결정 (백엔드에서 이미 설정됨)
                    const role = response.data.user.role;

                    // Store token and user info with role
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    // Navigate based on role
                    if (role === 'ADMIN') {
                        navigate('/', { replace: true });
                    } else {
                        navigate('/attendance', { replace: true });
                    }
                    // Reload to update auth context
                    window.location.reload();
                } else {
                    throw new Error('No token returned from registration');
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            console.error('Error response:', err.response?.data);

            // 더 구체적인 에러 메시지 표시
            if (isLogin) {
                if (err.response?.status === 401) {
                    setError('계정이 존재하지 않거나 비밀번호가 일치하지 않습니다.');
                } else {
                    setError('로그인에 실패했습니다. 다시 시도해주세요.');
                }
            } else {
                // 회원가입 에러 처리
                const errorMessage = err.response?.data?.message || err.message;

                if (err.response?.status === 409 || errorMessage?.includes('already')) {
                    setError('이미 존재하는 이메일입니다.');
                } else if (errorMessage?.includes('Invalid admin invite code')) {
                    setError('기업 코드가 올바르지 않습니다.');
                } else if (errorMessage?.includes('Invalid farm invite code')) {
                    setError('농장 코드가 올바르지 않습니다.');
                } else if (errorMessage?.includes('Invalid register type')) {
                    setError('가입 유형을 선택해주세요.');
                } else {
                    setError('회원가입에 실패했습니다. 다시 시도해주세요.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                        padding: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem'
                    }}>
                        {isLogin ? <User size={32} /> : <UserPlus size={32} />}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Farm ERP</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {isLogin ? '로그인하여 농장을 관리하세요' : '새로운 계정을 생성하세요'}
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
                {!isLogin && (
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
                                <span>작업자</span>
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
                )}

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

                    {!isLogin && (
                        <>
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
                                    {registerType === 'admin' ? '기업 코드' : '농장 코드'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                                    <input
                                        type="text"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        style={inputStyle}
                                        placeholder={registerType === 'admin' ? '기업 코드 입력' : '농장 코드 입력'}
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
                                        : '기업으로부터 받은 농장 코드를 입력하세요'}
                                </p>
                            </div>
                        </>
                    )}

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
                        {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setInviteCode('');
                            setRegisterType('admin');
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            textDecoration: 'underline'
                        }}
                    >
                        {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
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

export default Login;
