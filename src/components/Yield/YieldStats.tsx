import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const YieldStats = ({ data, activeFarm }) => {
    const stats = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                totalYield: 0,
                avgQuality: '데이터 없음',
                topField: '데이터 없음',
                topFieldAmount: 0
            };
        }

        // Filter by active farm
        const filteredData = activeFarm === 'All'
            ? data
            : data.filter(item => item.field === activeFarm);

        // Calculate total yield
        const totalYield = filteredData.reduce((sum, item) => {
            const amount = parseFloat(item.amount.replace(/,/g, '').replace('kg', '').trim());
            return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Calculate quality distribution
        const qualityCount = filteredData.reduce((acc, item) => {
            acc[item.quality] = (acc[item.quality] || 0) + 1;
            return acc;
        }, {});

        const totalItems = filteredData.length;
        const premiumCount = (qualityCount['최상'] || 0) + (qualityCount['상'] || 0);
        const premiumPercent = totalItems > 0 ? Math.round((premiumCount / totalItems) * 100) : 0;

        // Find top performing field
        const fieldYields = filteredData.reduce((acc, item) => {
            const amount = parseFloat(item.amount.replace(/,/g, '').replace('kg', '').trim());
            if (!isNaN(amount)) {
                acc[item.field] = (acc[item.field] || 0) + amount;
            }
            return acc;
        }, {});

        let topField = '데이터 없음';
        let topFieldAmount = 0;
        Object.entries(fieldYields).forEach(([field, amount]) => {
            if (amount > topFieldAmount) {
                topField = field;
                topFieldAmount = amount;
            }
        });

        return {
            totalYield: totalYield.toLocaleString(),
            avgQuality: premiumPercent > 80 ? '최상' : premiumPercent > 60 ? '상' : '중',
            premiumPercent,
            topField,
            topFieldAmount: topFieldAmount.toLocaleString()
        };
    }, [data, activeFarm]);

    return (
        <div className="yield-stats-grid">
            <div className="stat-card">
                <span className="stat-label">총 수확량 (이번 달)</span>
                <span className="stat-value">{stats.totalYield} kg</span>
                <span className="stat-trend trend-up">
                    <TrendingUp size={16} />
                    <span>{activeFarm === 'All' ? '전체 농장' : activeFarm}</span>
                </span>
            </div>

            <div className="stat-card">
                <span className="stat-label">평균 품질</span>
                <span className="stat-value">{stats.avgQuality}</span>
                <span className="stat-label" style={{ fontSize: '0.75rem' }}>{stats.premiumPercent}% 프리미엄</span>
            </div>

            <div className="stat-card">
                <span className="stat-label">최고 생산 구역</span>
                <span className="stat-value">{stats.topField}</span>
                <span className="stat-trend trend-up">
                    <TrendingUp size={16} />
                    <span>{stats.topFieldAmount} kg 수확</span>
                </span>
            </div>
        </div>
    );
};

export default YieldStats;
