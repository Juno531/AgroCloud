import React from 'react';
import { useLayout } from '../../context/LayoutContext';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { setTitle } = useLayout();
    const { user } = useAuth();
    const isPartTime = user?.employmentType === 'PART_TIME';
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    React.useEffect(() => {
        setTitle('대시보드');
    }, [setTitle]);

    return (
        <div className="flex-1 flex flex-col min-w-0">


            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 w-full">
                    <div className="flex-1">
                        <span className="text-primary font-bold">{formattedDate}</span>
                    </div>
                </div>

                {/* <div className={`grid grid-cols-1 md:grid-cols-2 ${isPartTime ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 mb-6 w-full`}>
                    <div className={`col-span-1 md:col-span-2 ${isPartTime ? 'lg:col-span-1' : ''} bg-gradient-to-br from-blue-500 to-blue-700 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group`}>
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

                </div> */}

                <div className={`grid grid-cols-1 ${isPartTime ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 w-full items-start`}>

                    <div className={`${isPartTime ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-primary/10 w-full overflow-hidden`}>
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
                                            { title: '4구역 조루 관주', time: '오전 06:00', icon: 'water_drop', bg: 'bg-blue-100', color: 'text-blue-600', person: '지준호', priority: '높음', pColor: 'text-primary bg-primary/10' },
                                            { title: '흰가루 방제', time: '오전 10:30', icon: 'science', bg: 'bg-emerald-100', color: 'text-emerald-600', person: '홍길동', priority: '보통', pColor: 'text-slate-500 bg-slate-100' },
                                            { title: '무인방제기 정비', time: '오후 02:00', icon: 'build', bg: 'bg-amber-100', color: 'text-amber-600', person: '김철수', priority: '보통', pColor: 'text-slate-500 bg-slate-100' }
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
        </div >
    );
};

export default Dashboard;
