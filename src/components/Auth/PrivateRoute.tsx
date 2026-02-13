import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: ('ADMIN' | 'USER')[];
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
        if (!allowedRoles.includes(user.role as 'ADMIN' | 'USER')) {
            // Redirect based on user role
            if (user.role === 'USER') {
                // Workers can only access attendance
                return <Navigate to="/attendance" replace />;
            } else {
                // Admins can access everything, but if somehow blocked, go to dashboard
                return <Navigate to="/" replace />;
            }
        }
    }

    return <>{children}</>;
};

export default PrivateRoute;
