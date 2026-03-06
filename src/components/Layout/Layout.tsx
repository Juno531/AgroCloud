import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import { LayoutProvider } from '../../context/LayoutContext';
import PageContainer from '../UI/PageContainer';

interface LayoutProps {
    children?: React.ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden w-full relative">
                <Header />
                <div className="flex-1 overflow-auto pb-20 md:pb-0 h-full flex flex-col">
                    <PageContainer key={location.pathname} className="flex-1 flex flex-col">
                        {children ? children : <Outlet />}
                    </PageContainer>
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
