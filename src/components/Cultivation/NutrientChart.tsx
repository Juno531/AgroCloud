import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NutrientRecord {
    id: number;
    recordDate: string;
    supplyEc: number;
    drainEc: number;
    supplyPh: number;
    drainPh: number;
    drainRate: number;
}

interface NutrientChartProps {
    records: NutrientRecord[];
}

type MetricType = 'ec' | 'ph' | 'drainRate';

const NutrientChart: React.FC<NutrientChartProps> = ({ records }) => {
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('ec');

    const chartData = useMemo(() => {
        // Sort by date and format for chart
        return [...records]
            .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
            .map(record => ({
                date: record.recordDate,
                supplyEc: record.supplyEc,
                drainEc: record.drainEc,
                supplyPh: record.supplyPh,
                drainPh: record.drainPh,
                drainRate: record.drainRate
            }));
    }, [records]);

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
                    표시할 데이터가 없습니다
                </div>
            );
        }

        switch (selectedMetric) {
            case 'ec':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'EC', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="supplyEc" name="급액EC" stroke="#8884d8" strokeWidth={2} />
                            <Line type="monotone" dataKey="drainEc" name="배액EC" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'ph':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'pH', angle: -90, position: 'insideLeft' }} domain={[0, 14]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="supplyPh" name="급액pH" stroke="#ffc658" strokeWidth={2} />
                            <Line type="monotone" dataKey="drainPh" name="배액pH" stroke="#ff8042" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'drainRate':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: '배액율 (%)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="drainRate" name="배액율" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div>
            {/* Metric Selection */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                    className={`btn ${selectedMetric === 'ec' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedMetric('ec')}
                >
                    EC 트렌드
                </button>
                <button
                    className={`btn ${selectedMetric === 'ph' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedMetric('ph')}
                >
                    pH 트렌드
                </button>
                <button
                    className={`btn ${selectedMetric === 'drainRate' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedMetric('drainRate')}
                >
                    배액율 트렌드
                </button>
            </div>

            {/* Chart Display */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {renderChart()}
            </div>
        </div>
    );
};

export default NutrientChart;
