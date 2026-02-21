import { useState, useEffect } from 'react';
import { Lock, Save } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/api';

const MySecurity = () => {
    const { setTitle } = useLayout();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [isVerified, setIsVerified] = useState(false);

    const [verifiedPassword, setVerifiedPassword] = useState('');

    // false | true
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        setTitle('내 정보 관리');
    }, [setTitle]);

    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await AuthService.verifyPassword(passwordData.currentPassword);
            setIsVerified(true);
            setVerifiedPassword(passwordData.currentPassword); // 인증된 비밀번호 저장
            // 패스워드 데이터 초기화 (현재 비밀번호는 확인용이었으므로 지움)
            setPasswordData({ ...passwordData, currentPassword: '' });
        } catch (error: any) {
            // 에러 메시지가 객체인 경우 처리
            const errorMsg = error.response?.data?.message || '비밀번호가 일치하지 않습니다.';
            setMessage({ type: 'error', text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // 변경 API 호출 시 현재 비밀번호는 필요 없음 (이미 위에서 검증됨, 하지만 API 스펙상 필요하다면 입력받아야 함)
            // 보안상 변경 시에도 현재 비밀번호를 요구하는 것이 일반적이므로, 변경 폼에 '현재 비밀번호' 필드를 추가하거나
            // 아니면 API가 세션(토큰) 기반으로 처리하고 현재 비번을 요구하지 않는지 확인 필요.
            // 기존 API: changePassword(current, new). 
            // 따라서 변경 폼에서도 '현재 비밀번호'를 입력받아야 함.

            // 인증 단계에서 저장한 비밀번호 사용
            await AuthService.changePassword({
                currentPassword: verifiedPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
            // 성공 후 인증 정보 및 폼 초기화
            setVerifiedPassword('');
            setIsVerified(false); // 다시 인증하도록 리셋 (보안 강화)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || '비밀번호 변경에 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isVerified) {
        return (
            <div style={{ padding: 'var(--spacing-lg)', maxWidth: '600px', margin: '4rem auto' }}>
                {message.text && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8',
                        color: message.type === 'success' ? '#03543f' : '#9b1c1c',
                        fontSize: '0.875rem'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '3rem 2rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Lock size={30} className="text-primary" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>비밀번호 확인</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        회원님의 소중한 정보를 보호하기 위해<br />현재 비밀번호를 다시 한 번 확인합니다.
                    </p>

                    <form onSubmit={handleVerifyPassword} style={{ maxWidth: '400px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                placeholder="비밀번호를 입력해주세요"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '1rem'
                                }}
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                justifyContent: 'center'
                            }}
                        >
                            {loading ? '확인 중...' : '확인'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--spacing-lg)', maxWidth: '800px', margin: '0 auto' }}>
            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? '#def7ec' : '#fde8e8',
                    color: message.type === 'success' ? '#03543f' : '#9b1c1c',
                    fontSize: '0.875rem'
                }}>
                    {message.text}
                </div>
            )}

            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
                    비밀번호 변경
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    {user?.lastPasswordChangedAt && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>마지막 변경</span>
                            <span style={{ fontWeight: 500 }}>
                                {new Date(user.lastPasswordChangedAt).toLocaleDateString()}
                            </span>
                        </div>
                    )}

                    {!user?.lastPasswordChangedAt && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: '#f0f7ff',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid #3b82f6',
                            color: '#1e40af',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}>
                            <span className="material-icons-round" style={{ fontSize: '1.1rem' }}>info</span>
                            <p style={{ margin: 0 }}>보안을 위해 비밀번호를 주기적으로 변경해주세요.</p>
                        </div>
                    )}

                    {!isChangingPassword ? (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            style={{
                                color: 'var(--color-primary)',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                backgroundColor: 'transparent',
                                padding: '0',
                                cursor: 'pointer'
                            }}
                        >
                            변경하기
                        </button>
                    ) : (
                        <form onSubmit={handlePasswordChange} style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>새 비밀번호</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        placeholder="새 비밀번호를 입력하세요"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>새 비밀번호 확인</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        placeholder="새 비밀번호를 다시 입력하세요"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary"
                                    >
                                        <Save size={18} style={{ marginRight: '0.5rem' }} /> {loading ? '변경 중...' : '저장하기'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        className="btn btn-outline"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
export default MySecurity;
