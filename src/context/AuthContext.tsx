import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api, { AuthService } from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // Verify token and get user info if endpoint exists
                    // For now, we'll check if there's a stored user
                    const storedUser = localStorage.getItem('user');
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
    }, [token]);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response = await AuthService.login({ email, password });
            const { token: newToken, user: userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    const value: AuthContextType = {
        user,
        token,
        login,
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
