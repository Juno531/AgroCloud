import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFarm } from '../../context/FarmContext';

const YieldHistory = ({ data }) => {
    const { fields, crops } = useFarm();
    const [historyFilters, setHistoryFilters] = useState({
        crop: '',
        field: '',
        days: '30' // Default to last 30 days
    });

    // Filter data based on local history filters
    const filteredHistoryData = useMemo(() => {
        const now = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - parseInt(historyFilters.days));

        return data.filter(item => {
            const itemDate = new Date(item.date);
            const matchCrop = historyFilters.crop ? item.crop === historyFilters.crop : true;
            const matchField = historyFilters.field ? item.field === historyFilters.field : true;
            const matchDate = itemDate >= cutoffDate;
            return matchCrop && matchField && matchDate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [data, historyFilters]);

    const chartData = filteredHistoryData.map(item => ({
        date: item.date,
        amount: parseInt(item.amount.replace(/[^0-9]/g, '')),
        crop: item.crop,
        field: item.field
    }));

    return (
        <div className="history-container" style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--spacing-xl)',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Yield History Trend</h3>

                {/* History Filters */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select
                        value={historyFilters.crop}
                        onChange={(e) => setHistoryFilters({ ...historyFilters, crop: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">All Crops</option>
                        {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>

                    <select
                        value={historyFilters.field}
                        onChange={(e) => setHistoryFilters({ ...historyFilters, field: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="">All Fields</option>
                        {fields.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                    </select>

                    <select
                        value={historyFilters.days}
                        onChange={(e) => setHistoryFilters({ ...historyFilters, days: e.target.value })}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 3 Months</option>
                        <option value="365">Last Year</option>
                    </select>
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-secondary)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-text-secondary)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'var(--color-primary)' }}
                            activeDot={{ r: 6 }}
                            name="Yield Amount (kg)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default YieldHistory;
