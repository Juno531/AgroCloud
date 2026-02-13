import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Menu } from 'lucide-react';

const FarmListSidebar = ({ activeFarm, onFarmSelect }) => {
    const { fields } = useFarm();
    const [isOpen, setIsOpen] = useState(false);

    const handleFarmSelect = (farmName: string) => {
        onFarmSelect(farmName);
        setIsOpen(false); // Close on mobile after selection
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="farm-sidebar-toggle mobile-only"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    left: '1rem',
                    bottom: '1rem',
                    zIndex: 1000,
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    cursor: 'pointer',
                    display: 'none'
                }}
            >
                <Menu size={24} />
            </button>

            {/* Overlay */}
            <div
                className={`farm-sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`farm-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="farm-listing">
                    <div className="farm-listing-header">
                        <h3>농장 구역</h3>
                    </div>

                    <div className="farm-list">
                        {/* All Farms Option */}
                        <div
                            className={`farm-item ${activeFarm === 'All' ? 'active' : ''}`}
                            onClick={() => handleFarmSelect('All')}
                        >
                            <div className="farm-info">
                                <div className="farm-name">전체 농장</div>
                                <div className="farm-details">전체 현황</div>
                            </div>
                            <div className="farm-stat">{fields.length}</div>
                        </div>

                        {/* Individual Farms */}
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className={`farm-item ${activeFarm === field.name ? 'active' : ''}`}
                                onClick={() => handleFarmSelect(field.name)}
                            >

                                <div className="farm-info">
                                    <div className="farm-name">{field.name}</div>
                                    <div className="farm-details">{field.size}</div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default FarmListSidebar;
