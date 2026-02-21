import React from 'react';

const SuspenseLoader: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            width: '100%',
            gap: '1rem',
            color: 'var(--color-text-secondary)'
        }}>
            <div className="animate-spin" style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%'
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>불러오는 중...</span>
        </div>
    );
};

export default SuspenseLoader;
