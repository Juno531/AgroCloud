import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

interface NutrientRecordData {
    id: number;
    recordDate: string;
    bedName: string;
    lineName: string;
    houseName: string;
    cropName: string;
    supplyEc: number;
    drainEc: number;
    supplyPh: number;
    drainPh: number;
    supplyAmount: number;
    drainAmount: number;
    drainRate: number;
    notes: string;
}

interface NutrientDataTableProps {
    records: NutrientRecordData[];
    onEdit: (record: NutrientRecordData) => void;
    onDelete: (id: number, record: NutrientRecordData) => void;
}

type SortDirection = 'asc' | 'desc' | null;

const NutrientDataTable: React.FC<NutrientDataTableProps> = ({ records, onEdit, onDelete }) => {
    const [sortColumn, setSortColumn] = useState<keyof NutrientRecordData | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [filterText, setFilterText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState({
        recordDate: true,
        houseName: true,
        lineName: true,
        bedName: true,
        cropName: true,
        supplyEc: true,
        drainEc: true,
        supplyPh: true,
        drainPh: true,
        supplyAmount: true,
        drainAmount: true,
        drainRate: true,
        notes: true
    });

    const columns = [
        { key: 'recordDate', label: '날짜' },
        { key: 'houseName', label: '하우스' },
        { key: 'lineName', label: '라인' },
        { key: 'bedName', label: '베드' },
        { key: 'cropName', label: '품종' },
        { key: 'supplyEc', label: '급액EC' },
        { key: 'drainEc', label: '배액EC' },
        { key: 'supplyPh', label: '급액pH' },
        { key: 'drainPh', label: '배액pH' },
        { key: 'supplyAmount', label: '급액량' },
        { key: 'drainAmount', label: '배액량' },
        { key: 'drainRate', label: '배액율' },
        { key: 'notes', label: '비고' }
    ];

    const handleSort = (column: keyof NutrientRecordData) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const toggleColumnVisibility = (column: string) => {
        setVisibleColumns(prev => ({ ...prev, [column]: !prev[column] }));
    };

    const filteredAndSortedRecords = useMemo(() => {
        let filtered = records.filter(record => {
            const searchString = filterText.toLowerCase();
            return Object.values(record).some(value =>
                value?.toString().toLowerCase().includes(searchString)
            );
        });

        if (sortColumn && sortDirection) {
            filtered.sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [records, filterText, sortColumn, sortDirection]);

    return (
        <div>
            {/* Filter and Column Visibility Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="검색..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--color-border)',
                        flex: '1',
                        minWidth: '200px'
                    }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {columns.map(col => (
                        <button
                            key={col.key}
                            className="btn btn-sm btn-outline"
                            onClick={() => toggleColumnVisibility(col.key)}
                            style={{
                                opacity: visibleColumns[col.key] ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            {visibleColumns[col.key] ? <Eye size={14} /> : <EyeOff size={14} />}
                            {col.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                            {columns.filter(col => visibleColumns[col.key]).map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key as keyof NutrientRecordData)}
                                    style={{
                                        padding: '0.75rem',
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {col.label}
                                        {sortColumn === col.key && (
                                            sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th style={{ padding: '0.75rem' }}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedRecords.map(record => (
                            <tr key={record.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {visibleColumns.recordDate && <td style={{ padding: '0.75rem' }}>{record.recordDate}</td>}
                                {visibleColumns.houseName && <td style={{ padding: '0.75rem' }}>{record.houseName}</td>}
                                {visibleColumns.lineName && <td style={{ padding: '0.75rem' }}>{record.lineName}</td>}
                                {visibleColumns.bedName && <td style={{ padding: '0.75rem' }}>{record.bedName}</td>}
                                {visibleColumns.cropName && <td style={{ padding: '0.75rem' }}>{record.cropName || '-'}</td>}
                                {visibleColumns.supplyEc && <td style={{ padding: '0.75rem' }}>{record.supplyEc?.toFixed(1) || '-'}</td>}
                                {visibleColumns.drainEc && <td style={{ padding: '0.75rem' }}>{record.drainEc?.toFixed(1) || '-'}</td>}
                                {visibleColumns.supplyPh && <td style={{ padding: '0.75rem' }}>{record.supplyPh?.toFixed(1) || '-'}</td>}
                                {visibleColumns.drainPh && <td style={{ padding: '0.75rem' }}>{record.drainPh?.toFixed(1) || '-'}</td>}
                                {visibleColumns.supplyAmount && <td style={{ padding: '0.75rem' }}>{record.supplyAmount || '-'}</td>}
                                {visibleColumns.drainAmount && <td style={{ padding: '0.75rem' }}>{record.drainAmount || '-'}</td>}
                                {visibleColumns.drainRate && <td style={{ padding: '0.75rem' }}>{record.drainRate ? `${record.drainRate.toFixed(1)}%` : '-'}</td>}
                                {visibleColumns.notes && <td style={{ padding: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.notes || '-'}</td>}
                                <td style={{ padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => onEdit(record)}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => onDelete(record.id, record)}
                                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAndSortedRecords.length === 0 && (
                            <tr>
                                <td colSpan={columns.filter(col => visibleColumns[col.key]).length + 1} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    {filterText ? '검색 결과가 없습니다' : '등록된 양액 기록이 없습니다'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NutrientDataTable;
