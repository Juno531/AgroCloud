import React from 'react';
import { useLayout } from '../../context/LayoutContext';

const Dashboard = () => {
    const { toggleSidebar, setTitle } = useLayout();

    React.useEffect(() => {
        setTitle('대시보드');
    }, [setTitle]);

    return (
        <div className="flex-1 flex flex-col min-w-0">


            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 w-full">
                    <div className="flex-1">
                        <p className="text-slate-500 font-medium text-sm sm:text-base mt-1">SP Agri 모니터링 • <span className="text-primary font-bold">2023년 10월 24일</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full">
                    <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-icons-round text-sm">location_on</span>
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">서산시 음암면</span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold">현재 날씨</h3>
                                </div>
                                <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-[10px] sm:text-xs font-bold">2분 전 업데이트</div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 my-8">
                                <div className="flex items-center gap-6">
                                    <span className="material-icons-round text-6xl sm:text-7xl text-yellow-300 drop-shadow-lg">wb_sunny</span>
                                    <span className="text-6xl sm:text-7xl font-light tracking-tighter">23<span className="text-3xl sm:text-4xl">°C</span></span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full sm:w-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs uppercase font-bold opacity-60">습도</span>
                                        <span className="text-base sm:text-lg font-bold">42%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs uppercase font-bold opacity-60">풍속</span>
                                        <span className="text-base sm:text-lg font-bold">3.8 m/s</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs uppercase font-bold opacity-60">강수 확률</span>
                                        <span className="text-base sm:text-lg font-bold">5%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] sm:text-xs uppercase font-bold opacity-60">자외선 지수</span>
                                        <span className="text-base sm:text-lg font-bold text-yellow-300">높음 (7)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                                {[
                                    { time: '오후 3시', icon: 'wb_sunny', temp: '24°', color: 'text-yellow-300' },
                                    { time: '오후 4시', icon: 'wb_sunny', temp: '23°', color: 'text-yellow-300' },
                                    { time: '오후 5시', icon: 'filter_drama', temp: '21°', color: 'text-slate-300' },
                                    { time: '오후 6시', icon: 'filter_drama', temp: '19°', color: 'text-slate-300' },
                                    { time: '오후 7시', icon: 'nights_stay', temp: '17°', color: 'text-slate-400' }
                                ].map((item, id) => (
                                    <div key={id} className="min-w-[80px] bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 flex-shrink-0 transition-colors">
                                        <span className="text-[10px] font-medium opacity-80">{item.time}</span>
                                        <span className={`material-icons-round text-2xl ${item.color}`}>{item.icon}</span>
                                        <span className="text-base font-bold">{item.temp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
                        <div className="absolute left-1/2 -bottom-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">자원 현황</h3>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                <span className="material-icons-round">more_horiz</span>
                            </button>
                        </div>
                        <div className="space-y-8 flex-1">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">NPK 비료</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">420 kg</p>
                                    </div>
                                    <span className="text-amber-500 font-extrabold text-sm">22%</span>
                                </div>
                                <div className="w-full h-4 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: '22%' }}></div>
                                </div>
                                <p className="text-[11px] text-amber-500 font-bold mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 w-fit px-3 py-1 rounded-full">
                                    <span className="material-icons-round text-sm">warning</span> 보충 필요함
                                </p>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">농업용수</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">12,500 L</p>
                                    </div>
                                    <span className="text-primary font-extrabold text-sm">78%</span>
                                </div>
                                <div className="w-full h-4 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-green-600 rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-10 py-4 bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary/20 transition-all text-sm group">
                            재고 관리 시스템 <span className="material-icons-round text-xs ml-1 align-middle group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">일일 생산량</h3>
                            <div className="flex gap-2">
                                <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full tracking-wider uppercase">정상</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            {[
                                { label: '수확 목표', value: '94%', offset: '12.8' },
                                { label: '품질 등급', value: '81%', offset: '40.5' },
                                { label: '자원 효율', value: '88%', offset: '25.6' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-3xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10">
                                    <div className="relative flex items-center justify-center mb-4 scale-110 sm:scale-125">
                                        <svg className="w-16 h-16 -rotate-90">
                                            <circle className="text-slate-200 dark:text-zinc-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                                            <circle className="text-primary transition-all duration-1000 ease-out" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={item.offset} strokeWidth="6" strokeLinecap="round"></circle>
                                        </svg>
                                        <span className="absolute text-[13px] font-black text-slate-800 dark:text-white">{item.value}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase text-center mt-2 group-hover:text-primary transition-colors">{item.label}</span>
                                </div>
                            ))}
                            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary to-green-600 text-white rounded-3xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30 group">
                                <span className="material-icons-round text-4xl mb-2 group-hover:rotate-12 transition-transform">insights</span>
                                <span className="text-[10px] font-black uppercase text-center leading-tight">상세<br />통계 리포트</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10 w-full overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">오늘의 농작업</h3>
                            <button className="bg-primary/10 text-primary font-bold text-xs px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all">전체 일정</button>
                        </div>
                        <div className="overflow-x-auto -mx-6 sm:mx-0">
                            <div className="inline-block min-w-full align-middle p-6 sm:p-0">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-extrabold tracking-widest">
                                        <tr>
                                            <th className="px-6 py-5">작업 상세</th>
                                            <th className="px-6 py-5">담당자</th>
                                            <th className="px-6 py-5">우선순위</th>
                                            <th className="px-6 py-5 text-right">상세</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {[
                                            { title: '4구역 관개 작업', time: '오전 06:00', icon: 'water_drop', bg: 'bg-blue-100', color: 'text-blue-600', person: '김민수', priority: '높음', pColor: 'text-primary bg-primary/10' },
                                            { title: '2단계 비료 살포', time: '오전 10:30', icon: 'science', bg: 'bg-emerald-100', color: 'text-emerald-600', person: '이영희', priority: '보통', pColor: 'text-slate-500 bg-slate-100' },
                                            { title: '트랙터 정비', time: '오후 02:00', icon: 'build', bg: 'bg-amber-100', color: 'text-amber-600', person: '박철수', priority: '보통', pColor: 'text-slate-500 bg-slate-100' }
                                        ].map((task, id) => (
                                            <tr key={id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl ${task.bg} dark:bg-opacity-20 ${task.color} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                                            <span className="material-icons-round text-2xl">{task.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-base text-slate-800 dark:text-white">{task.title}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{task.time}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                    <span className="hover:text-primary transition-colors">{task.person}</span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className={`${task.pColor} text-[10px] font-black px-3 py-1.5 rounded-full`}>{task.priority}</span>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                                                        <span className="material-icons-round">arrow_forward</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
