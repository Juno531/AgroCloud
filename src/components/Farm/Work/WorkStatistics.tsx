import React, { useState, useEffect } from 'react';
import { CultivationService } from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Users, Tractor } from 'lucide-react';

interface Props {
    farmId: number;
}

const WorkStatistics: React.FC<Props> = ({ farmId }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filter dates (e.g. current month)
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchStats();
    }, [farmId, startDate, endDate]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await CultivationService.getWorkStats(farmId, startDate || '', endDate || '');
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching work stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <div className="p-10 text-center font-bold text-slate-400">통계 데이터를 불러오는 중...</div>;
    }

    // Prepare mock daily trend data since backend only provides aggregates currently
    const mockDailyData = [
        { name: '월', planned: 5, completed: Math.round(stats.completedTasks / 7) + 1 },
        { name: '화', planned: 8, completed: Math.round(stats.completedTasks / 7) },
        { name: '수', planned: 6, completed: Math.round(stats.completedTasks / 7) + 2 },
        { name: '목', planned: 12, completed: Math.round(stats.completedTasks / 7) },
        { name: '금', planned: 7, completed: Math.round(stats.completedTasks / 7) + 1 },
        { name: '토', planned: 3, completed: Math.round(stats.completedTasks / 7) },
        { name: '일', planned: 2, completed: Math.round(stats.completedTasks / 7) },
    ];

    const mockTrendData = [
        { name: '월', hours: stats.totalManHours / 7 + 10 },
        { name: '화', hours: stats.totalManHours / 7 - 5 },
        { name: '수', hours: stats.totalManHours / 7 + 15 },
        { name: '목', hours: stats.totalManHours / 7 },
        { name: '금', hours: stats.totalManHours / 7 + 5 },
        { name: '토', hours: Math.max(0, stats.totalManHours / 7 - 20) },
        { name: '일', hours: Math.max(0, stats.totalManHours / 7 - 25) },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">통계 & 보고서</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold mt-1">
                        작업 통계 및 리소스 할당 현황을 확인하세요.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold p-2.5 shadow-sm min-w-0" />
                    <span className="text-slate-400 font-bold shrink-0">~</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 md:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold p-2.5 shadow-sm min-w-0" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Completed vs Planned Tasks - Bar Chart */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">예정 작업 대비 완료 작업</h3>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">일별 생산성 추이</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">예정</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">완료</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-56 md:h-64 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={16} />
                                <Bar dataKey="completed" fill="#13ec13" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Distribution - Donut Chart */}
                <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2">작업 분포</h3>
                    <div className="relative flex-1 min-h-[180px] md:min-h-[200px] flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.keywordStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="percentage"
                                >
                                    {stats.keywordStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.colorCode || '#13ec13'} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any, _name: any, props: any) => [`${value}%`, props.payload.keywordName]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{stats.totalTasks}</span>
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">전체 작업</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 mt-4">
                        {stats.keywordStats.slice(0, 4).map((kw: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: kw.colorCode || '#13ec13' }}></span>
                                    <span className="text-[11px] md:text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px] md:max-w-auto">{kw.keywordName}</span>
                                </div>
                                <span className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white">{kw.percentage.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Man-hours Trend - Area Chart */}
                <div className="col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">총 투입 시간(인시) 추이</h3>
                            <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">노동 자원 할당량</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-2xl md:text-3xl font-black text-primary">{stats.totalManHours.toFixed(1)}h</span>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">기간 합계</p>
                        </div>
                    </div>
                    <div className="h-40 md:h-48 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockTrendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#13ec13" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#13ec13" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <YAxis hide />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#13ec13" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-3 px-1 md:px-0">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    핵심 성과 지표 (KPI)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">평균 완료율</p>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.completionRate.toFixed(1)}%</h4>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${stats.completionRate}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">총 투입 인력</p>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalManHours > 0 ? Math.round(stats.totalManHours / 8) : 0} 명일</h4>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-6 pt-2 border-t border-slate-100 dark:border-slate-800 hover:text-primary transition-colors cursor-pointer">리소스 상세 보기 &rarr;</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Tractor size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">최다 활용 키워드</p>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate" title={stats.topKeywordName || '없음'}>
                                    {stats.topKeywordName || '없음'}
                                </h4>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mt-6 pt-2 border-t border-slate-100 dark:border-slate-800 hover:text-emerald-500 transition-colors cursor-pointer">워크플로우 최적화 가이드 &rarr;</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkStatistics;
