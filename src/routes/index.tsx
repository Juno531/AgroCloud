import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import PrivateRoute from '../components/Auth/PrivateRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const YieldManagement = lazy(() => import('../pages/Farm/YieldManagement'));
const SalesManagement = lazy(() => import('../pages/Farm/SalesManagement'));
const CultivationManagement = lazy(() => import('../pages/Farm/CultivationManagement'));
const ProductionManagement = lazy(() => import('../pages/Farm/ProductionManagement'));
const FarmAdd = lazy(() => import('../pages/Farm/FarmAdd'));
const FarmSetting = lazy(() => import('../pages/Farm/FarmSetting'));
const MySecurity = lazy(() => import('../pages/MyPage/MySecurity'));
const HRManagement = lazy(() => import('../pages/HR/HRManagement'));
const Attendance = lazy(() => import('../pages/HR/Attendance'));
const SuperAdmin = lazy(() => import('../pages/SuperAdmin/SuperAdmin'));
const Login = lazy(() => import('../pages/Auth/Login'));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Wrapper for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<PageLoader />}>
        {children}
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <SuspenseWrapper><Login /></SuspenseWrapper>,
    },
    {
        // Routes requiring SUPER_ADMIN
        element: <PrivateRoute allowedRoles={['SUPER_ADMIN']} />,
        children: [
            {
                element: <Layout />,
                children: [
                    { path: '/super-admin/*', element: <SuspenseWrapper><SuperAdmin /></SuspenseWrapper> },
                ]
            }
        ]
    },
    {
        // Routes requiring ADMIN
        element: <PrivateRoute allowedRoles={['ADMIN']} />,
        children: [
            {
                element: <Layout />,
                children: [
                    { path: '/', element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
                    { path: '/farm/cultivation', element: <SuspenseWrapper><CultivationManagement /></SuspenseWrapper> },
                    { path: '/farm/sales', element: <SuspenseWrapper><SalesManagement /></SuspenseWrapper> },
                    { path: '/farm/setting/add', element: <SuspenseWrapper><FarmAdd /></SuspenseWrapper> },
                    { path: '/farm/production', element: <SuspenseWrapper><ProductionManagement /></SuspenseWrapper> },
                    { path: '/farm/yield', element: <SuspenseWrapper><YieldManagement /></SuspenseWrapper> },
                    { path: '/hr/*', element: <SuspenseWrapper><HRManagement /></SuspenseWrapper> },
                ]
            }
        ]
    },
    {
        // Routes requiring ADMIN or USER
        element: <PrivateRoute allowedRoles={['ADMIN', 'USER']} />,
        children: [
            {
                element: <Layout />,
                children: [
                    { path: '/farm/setting', element: <SuspenseWrapper><FarmSetting /></SuspenseWrapper> },
                ]
            }
        ]
    },
    {
        // Routes requiring ADMIN, USER, or SUPER_ADMIN
        element: <PrivateRoute allowedRoles={['ADMIN', 'USER', 'SUPER_ADMIN']} />,
        children: [
            {
                element: <Layout />,
                children: [
                    { path: '/mypage/mysecurity', element: <SuspenseWrapper><MySecurity /></SuspenseWrapper> },
                ]
            }
        ]
    },
    {
        // Routes requiring ANY authenticated user
        element: <PrivateRoute />,
        children: [
            {
                element: <Layout />,
                children: [
                    { path: '/attendance', element: <SuspenseWrapper><Attendance /></SuspenseWrapper> },
                ]
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to="/" replace />
    }
]);
