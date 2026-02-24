import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * PageContainer Component
 * Provides consistent padding and entry animation (fade-in) for all pages.
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`max-w-full px-4 md:px-10 pt-6 md:pt-10 animate-in fade-in duration-500 ${className}`}>
            {children}
        </div>
    );
};

export default PageContainer;
