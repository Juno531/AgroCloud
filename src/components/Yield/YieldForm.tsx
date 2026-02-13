import React, { useState, useEffect } from 'react';
import { useFarm } from '../../context/FarmContext';
import { ProductionService, HarvestService } from '../../services/api';

const YieldForm = ({ onSubmit, onCancel, initialData, farmId, seasonId }) => {
    const { fields, crops } = useFarm();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        cropId: '',
        bedId: '',
        amount: '',
        quality: 'Good'
    });

    const [houses, setHouses] = useState([]);
    const [beds, setBeds] = useState([]);
    const [selectedHouse, setSelectedHouse] = useState('');

    useEffect(() => {
        if (initialData) {
            // If editing, we need to populate fields. 
            // But since we don't have full edit support yet, this might be tricky.
            // For now, just set what we can.
            setFormData({
                date: initialData.harvestDate || new Date().toISOString().split('T')[0],
                cropId: initialData.cropId || '',
                bedId: initialData.bedId || '',
                amount: initialData.details && initialData.details.length > 0 ? initialData.details[0].weightKg : '',
                quality: initialData.details && initialData.details.length > 0 ? initialData.details[0].grade : 'Good'
            });
        }
    }, [initialData]);

    // Fetch Houses
    useEffect(() => {
        const fetchHouses = async () => {
            if (farmId) {
                try {
                    const res = await ProductionService.getHouses(farmId);
                    if (res.data.success) {
                        setHouses(res.data.data);
                        if (res.data.data.length > 0) {
                            setSelectedHouse(res.data.data[0].id);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch houses", err);
                }
            }
        };
        fetchHouses();
    }, [farmId]);

    // Fetch Beds
    useEffect(() => {
        const fetchBeds = async () => {
            if (selectedHouse) {
                try {
                    const res = await ProductionService.getBeds(selectedHouse);
                    if (res.data.success) {
                        setBeds(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch beds", err);
                }
            } else {
                setBeds([]);
            }
        };
        fetchBeds();
    }, [selectedHouse]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!seasonId) {
            alert("작기가 선택되지 않았습니다. 대시보드에서 작기를 선택해주세요.");
            return;
        }

        try {
            const payload = {
                seasonId: Number(seasonId),
                bedId: Number(formData.bedId),
                cropId: Number(formData.cropId),
                harvestDate: formData.date,
                workerName: "User", // Placeholder
                note: "",
                details: [
                    {
                        grade: formData.quality,
                        weightKg: parseFloat(formData.amount),
                        boxCount: 0
                    }
                ]
            };

            await HarvestService.createHarvestRecord(payload);
            onSubmit(payload);
        } catch (err) {
            console.error("Failed to create harvest record", err);
            alert("기록 저장 실패: " + (err.response?.data?.message || err.message));
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
        marginBottom: '1rem',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--color-text)'
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label style={labelStyle}>Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                />
            </div>

            <div>
                <label style={labelStyle}>Crop</label>
                <select
                    name="cropId"
                    value={formData.cropId}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                >
                    <option value="">Select Crop</option>
                    {crops.map(crop => (
                        <option key={crop.id} value={crop.id}>{crop.name}</option>
                    ))}
                </select>
            </div>

            {/* House Selection (Intermediate) */}
            <div>
                <label style={labelStyle}>House</label>
                <select
                    value={selectedHouse}
                    onChange={(e) => setSelectedHouse(e.target.value)}
                    style={inputStyle}
                    disabled={!farmId}
                >
                    <option value="">Select House</option>
                    {houses.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={labelStyle}>Bed</label>
                <select
                    name="bedId"
                    value={formData.bedId}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                    disabled={!selectedHouse}
                >
                    <option value="">Select Bed</option>
                    {beds.map(bed => (
                        <option key={bed.id} value={bed.id}>{bed.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label style={labelStyle}>Amount (kg)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="e.g. 1200"
                    required
                />
            </div>

            <div>
                <label style={labelStyle}>Quality</label>
                <select
                    name="quality"
                    value={formData.quality}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-outline"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    {initialData ? 'Update Record' : 'Save Record'}
                </button>
            </div>
        </form>
    );
};

export default YieldForm;
