import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
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
            await login({ email, password }, rememberMe);

            // Get user role from storage to determine redirect path
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.role === 'SUPER_ADMIN') {
                    navigate('/super-admin', { replace: true });
                } else if (userData.role === 'ADMIN' || userData.role === 'MASTER_ADMIN') {
                    navigate('/', { replace: true });
                } else {
                    navigate('/attendance', { replace: true });
                }
            } else {
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error('Auth error:', err);

            if (err.response?.status === 401) {
                setError('계정이 존재하지 않거나 비밀번호가 일치하지 않습니다.');
            } else {
                setError('로그인에 실패했습니다. 다시 시도해주세요.');
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
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        marginBottom: '1.25rem',
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: '1.25rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                    }}>
                        <span className="material-icons-round" style={{ fontSize: '32px' }}>filter_drama</span>
                    </div>
                    <h1 style={{
                        fontSize: '2.25rem',
                        fontWeight: 800,
                        marginBottom: '0.25rem',
                        letterSpacing: '-0.025em',
                        color: 'var(--color-text)'
                    }}>
                        Agro<span style={{ color: 'var(--color-primary)' }}>Cloud</span>
                    </h1>
                    <p style={{
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        농장 관리 시스템
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

                    <div style={{ marginBottom: '1.5rem' }}>
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

                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{
                                    width: '1rem',
                                    height: '1rem',
                                    borderRadius: '4px',
                                    accentColor: 'var(--color-primary)',
                                    cursor: 'pointer'
                                }}
                            />
                            로그인 상태 유지
                        </label>
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
                        {isLoading ? '처리 중...' : '로그인'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>


            </div>
            <style>{`
                @media (max-width: 767px) {
                    .login-container {
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
