import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const YieldChart = ({ data }) => {
    // Process data for the chart
    const chartData = data.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.crop);
        const amount = parseInt(curr.amount.replace(/[^0-9]/g, ''));

        if (existing) {
            existing.yield += amount;
        } else {
            acc.push({ name: curr.crop, yield: amount });
        }
        return acc;
    }, []);

    return (
        <div className="chart-container" style={{
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--spacing-xl)',
            height: '400px'
        }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem', fontWeight: 600 }}>Yield by Crop</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)' }} />
                    <Tooltip
                        cursor={{ fill: 'var(--color-background)' }}
                        contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: '10px' }}
                    />
                    <Bar dataKey="yield" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Yield (kg)" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default YieldChart;
