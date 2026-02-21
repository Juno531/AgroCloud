import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import { LayoutProvider } from '../../context/LayoutContext';

interface LayoutProps {
    children?: React.ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden w-full relative">
                <Header />
                <div className="flex-1 overflow-auto pb-20 md:pb-0">
                    {children ? children : <Outlet />}
                </div>
                <BottomNav />
            </main>
        </div>
    );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <LayoutProvider>
            <LayoutContent>{children}</LayoutContent>
        </LayoutProvider>
    );
};

export default Layout;
