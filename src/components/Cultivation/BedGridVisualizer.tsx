import React from 'react';

const BedGridVisualizer = ({ beds, onBedClick, selectedBedId }) => {
    if (!beds || beds.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>베드 데이터가 없습니다.</div>;
    }

    // Group beds by line if available, otherwise just list them
    // Assuming beds have lineId or we can infer structure

    // For now, let's display them in a grid
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
        }}>
            {beds.map(bed => (
                <div
                    key={bed.id}
                    onClick={() => onBedClick && onBedClick(bed)}
                    style={{
                        border: `2px solid ${selectedBedId === bed.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        backgroundColor: selectedBedId === bed.id ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{bed.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        {bed.lengthMeters}m
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BedGridVisualizer;
