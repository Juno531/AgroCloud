import React, { useState } from 'react';
import { MoreHorizontal, Filter, Download, Plus, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

const YieldTable = ({ data, onAddClick, onEdit, onDelete, onExport, filters, setFilters }) => {
    const { fields, crops } = useFarm();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle numeric amount sorting
                if (sortConfig.key === 'amount') {
                    aValue = parseFloat(aValue.replace(/[^0-9.]/g, ''));
                    bValue = parseFloat(bValue.replace(/[^0-9.]/g, ''));
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return <ArrowUpDown size={14} style={{ marginLeft: '5px', opacity: 0.5 }} />;
        if (sortConfig.direction === 'ascending') return <ArrowUp size={14} style={{ marginLeft: '5px' }} />;
        return <ArrowDown size={14} style={{ marginLeft: '5px' }} />;
    };

    return (
        <div className="table-container">
            <div className="table-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="table-title">Harvest Records</h3>
                    <div className="table-actions">
                        <button className="btn btn-outline" onClick={onExport}>
                            <Download size={16} style={{ marginRight: '8px' }} />
                            Export XLSX
                        </button>
                        <button className="btn btn-primary" onClick={onAddClick}>
                            <Plus size={16} style={{ marginRight: '8px' }} />
                            Add Yield
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                    <select
                        className="filter-select"
                        value={filters.crop}
                        onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">All Crops</option>
                        {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <select
                        className="filter-select"
                        value={filters.field}
                        onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">All Fields</option>
                        {fields.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>

                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                        placeholder="End Date"
                    />
                    {(filters.crop || filters.field || filters.startDate || filters.endDate) && (
                        <button
                            className="btn btn-outline"
                            onClick={() => setFilters({ crop: '', field: '', startDate: '', endDate: '' })}
                            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th onClick={() => requestSort('date')} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Date {getSortIcon('date')}</div>
                        </th>
                        <th onClick={() => requestSort('crop')} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Crop {getSortIcon('crop')}</div>
                        </th>
                        <th onClick={() => requestSort('field')} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Field {getSortIcon('field')}</div>
                        </th>
                        <th onClick={() => requestSort('amount')} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Amount {getSortIcon('amount')}</div>
                        </th>
                        <th onClick={() => requestSort('quality')} style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>Quality {getSortIcon('quality')}</div>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row) => (
                        <tr key={row.id}>
                            <td>{row.date}</td>
                            <td>{row.crop}</td>
                            <td>{row.field}</td>
                            <td>{row.amount}</td>
                            <td>
                                <span className={`status-badge status-${row.status || 'good'}`}>
                                    {row.quality}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="icon-btn"
                                        onClick={() => onEdit(row)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={() => onDelete(row.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {sortedData.length === 0 && (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                No yield records found matching your filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default YieldTable;
