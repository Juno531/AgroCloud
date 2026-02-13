import React, { useState, useEffect } from 'react';
import { ProductionService } from '../../services/api';

const CropSelector = ({ value, onChange, required = false }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                const response = await ProductionService.getAllCrops();
                if (response.data && response.data.success) {
                    setCrops(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch crops", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    if (loading) return <div>Loading crops...</div>;

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)'
            }}
        >
            <option value="">작물 선택</option>
            {crops.map(crop => (
                <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.variety})
                </option>
            ))}
        </select>
    );
};

export default CropSelector;
