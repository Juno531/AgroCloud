import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Check localStorage for saved theme, default to light
        const savedTheme = localStorage.getItem('farm-erp-theme');
        return (savedTheme as 'light' | 'dark') || 'light';
    });

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('farm-erp-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
