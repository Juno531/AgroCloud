import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardService } from '../../services/api';

interface AttendanceSummary {
    total: number;
    present: number;
    absent: number;
}

const COLORS = ['#4f8cff', '#e2e8f0'];

const TodayAttendanceWidget: React.FC = () => {
    const [data, setData] = useState<AttendanceSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await DashboardService.getTodayAttendance();
            setData(res.data);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const chartData = data
        ? [
            { name: '출근', value: data.present },
            { name: '미출근', value: data.absent },
        ]
        : [];

    const rate = data && data.total > 0
        ? Math.round((data.present / data.total) * 100)
        : 0;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base text-slate-800 dark:text-white">오늘 출근 현황</h3>
                <span className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">로딩 중...</div>
            ) : !data ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">데이터 없음</div>
            ) : (
                <div className="flex items-center gap-6">
                    {/* 도넛 차트 */}
                    <div className="relative w-32 h-32 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={36}
                                    outerRadius={52}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {chartData.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value}명`, '']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* 중앙 퍼센트 */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-extrabold text-primary">{rate}%</span>
                            <span className="text-[10px] text-slate-400">출근율</span>
                        </div>
                    </div>

                    {/* 수치 요약 */}
                    <div className="flex flex-col gap-3 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[0] }} />
                            <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">출근</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.present}명</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[1] }} />
                            <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">미출근</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.absent}명</span>
                        </div>
                        <div className="mt-1 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                            <span className="text-sm text-slate-400 flex-1">전체 직원</span>
                            <span className="font-bold text-slate-800 dark:text-white">{data.total}명</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodayAttendanceWidget;
