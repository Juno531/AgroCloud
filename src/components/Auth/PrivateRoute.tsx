import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: ('ADMIN' | 'USER' | 'SUPER_ADMIN')[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-based access control
    if (allowedRoles && user) {
        // SUPER_ADMIN은 모든 ADMIN 경로에 접근 가능하도록 설정하거나 별도 처리
        const userRole = user.role as 'ADMIN' | 'USER' | 'SUPER_ADMIN';
        const isAuthorized = allowedRoles.includes(userRole) ||
            (userRole === 'SUPER_ADMIN' && allowedRoles.includes('ADMIN'));

        if (!isAuthorized) {
            // Redirect based on user role
            if (userRole === 'SUPER_ADMIN') {
                return <Navigate to="/super-admin" replace />;
            } else if (userRole === 'ADMIN') {
                return <Navigate to="/" replace />;
            } else {
                return <Navigate to="/attendance" replace />;
            }
        }
    }

    return <>{children}</>;
};

export default PrivateRoute;
