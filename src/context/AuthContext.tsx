import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api, { AuthService } from '../services/api';
import type { User, AuthContextType, LoginRequest, RegisterRequest } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('token') || sessionStorage.getItem('token')
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Check localStorage first, then sessionStorage
                    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (error) {
                    console.error("Auth initialization failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();

        const handleAuthLogout = () => {
            logout();
        };
        window.addEventListener('auth:logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth:logout', handleAuthLogout);
        };
    }, [token]);

    const login = async (data: LoginRequest, rememberMe: boolean = false): Promise<void> => {
        try {
            const response = await AuthService.login(data);
            const { token: newToken, refreshToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);

            if (rememberMe) {
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(userData));
                if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            } else {
                sessionStorage.setItem('token', newToken);
                sessionStorage.setItem('user', JSON.stringify(userData));
                if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest): Promise<void> => {
        try {
            const response = await AuthService.register(data);
            const { token: newToken, refreshToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
            console.error("Register failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
