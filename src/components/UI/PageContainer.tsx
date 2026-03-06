import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * PageContainer Component
 * Provides consistent padding and entry animation (fade-in) for all pages.
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
    const location = useLocation();
    const isNoPaddingRoute = location.pathname.includes('/farm/work-management');

    const paddingClass = isNoPaddingRoute
        ? 'p-0 h-full flex flex-col'
        : 'px-4 md:px-6 lg:px-10 pt-6 md:pt-10';

    return (
        <div className={`max-w-full animate-in fade-in duration-500 ${paddingClass} ${className} ${isNoPaddingRoute ? 'flex-1 h-full' : ''}`}>
            {children}
        </div>
    );
};

export default PageContainer;
