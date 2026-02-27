import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import PrivateRoute from '../components/Auth/PrivateRoute';
import RouteErrorPage from '../components/UI/RouteErrorPage';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const CultivationManagement = lazy(() => import('../pages/Farm/CultivationManagement'));
const FarmAdd = lazy(() => import('../pages/Farm/FarmAdd'));
const FarmSetting = lazy(() => import('../pages/Farm/FarmSetting'));
const MySecurity = lazy(() => import('../pages/MyPage/MySecurity'));
const HRManagement = lazy(() => import('../pages/HR/HRManagement'));
const EmployeeDetail = lazy(() => import('../pages/HR/EmployeeDetail'));
const Attendance = lazy(() => import('../pages/HR/Attendance'));
const SuperAdmin = lazy(() => import('../pages/SuperAdmin/SuperAdmin'));
const Login = lazy(() => import('../pages/Auth/Login'));
const MyAttendance = lazy(() => import('../pages/HR/MyAttendance'));
const MyLeave = lazy(() => import('../pages/HR/MyLeave'));
const AttendanceExport = lazy(() => import('../components/HR/AttendanceExport'));

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
        errorElement: <RouteErrorPage />,
        children: [
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
                            { path: '/farm/setting/add', element: <SuspenseWrapper><FarmAdd /></SuspenseWrapper> },
                            { path: '/hr/*', element: <SuspenseWrapper><HRManagement /></SuspenseWrapper>, errorElement: <RouteErrorPage /> },
                            { path: '/hr/employees/:id', element: <SuspenseWrapper><EmployeeDetail /></SuspenseWrapper> },
                            { path: '/hr/attendance-export', element: <SuspenseWrapper><AttendanceExport /></SuspenseWrapper> },
                        ]
                    }
                ]
            },
            {
                // Routes requiring ADMIN or USER
                element: <PrivateRoute allowedRoles={['ADMIN']} />,
                children: [
                    {
                        element: <Layout />,
                        children: [
                            { path: '/farm/cultivation', element: <SuspenseWrapper><CultivationManagement /></SuspenseWrapper> },
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
                            { path: '/hr/my-attendance', element: <SuspenseWrapper><MyAttendance /></SuspenseWrapper> },
                            { path: '/hr/my-leave', element: <SuspenseWrapper><MyLeave /></SuspenseWrapper> },
                        ]
                    }
                ]
            },
            {
                path: '*',
                element: <Navigate to="/" replace />
            }
        ]
    }
]);
