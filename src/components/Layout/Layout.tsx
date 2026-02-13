import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import FarmListSidebar from './FarmListSidebar';

const Layout = ({ children }) => {
    const [activeFarm, setActiveFarm] = useState('All');
    const location = useLocation();
    const isDashboard = location.pathname === '/';

    return (
        <div className="app-layout top-nav-layout">
            <TopNav />
            <div className="app-body">
                {isDashboard && <FarmListSidebar activeFarm={activeFarm} onFarmSelect={setActiveFarm} />}
                <main className="app-content">
                    {React.Children.map(children, child =>
                        React.cloneElement(child, { activeFarm, setActiveFarm })
                    )}
                </main>
            </div>
        </div>
    );
};

export default Layout;
