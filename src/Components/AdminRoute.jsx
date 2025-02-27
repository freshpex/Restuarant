import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAdmin, selectIsAuthenticated, selectCurrentUser } from '../redux/selectors';

const AdminRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const UserLoggedIN = useSelector(selectCurrentUser);
    console.log("The user logged is", UserLoggedIN);
    const isAdmin = useSelector(selectIsAdmin);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signIn" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        // Redirect to unauthorized page if authenticated but not admin
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return children;
};

export default AdminRoute;
