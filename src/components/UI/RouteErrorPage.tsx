import { useRouteError, useNavigate } from 'react-router-dom';

const RouteErrorPage = () => {
    const error = useRouteError() as any;
    const navigate = useNavigate();

    const isChunkLoadFailed =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.stack?.includes('Failed to fetch dynamically imported module');

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-zinc-950">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-200 dark:border-zinc-800 p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-icons-round text-4xl text-rose-500">error_outline</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {isChunkLoadFailed ? '페이지 로드 실패' : '오류가 발생했습니다'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isChunkLoadFailed
                            ? '새로운 업데이트가 있거나 연결이 불안정하여 페이지를 불러오지 못했습니다.'
                            : '서비스 이용 중 예상치 못한 오류가 발생했습니다.'}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-icons-round text-lg">refresh</span>
                        새로고침
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-4 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all"
                    >
                        메인으로 이동
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && error && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left overflow-auto max-h-40">
                        <p className="text-xs font-mono text-rose-500 break-all">
                            {error.message || JSON.stringify(error)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteErrorPage;
