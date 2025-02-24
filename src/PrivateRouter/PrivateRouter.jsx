import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../redux/selectors';
import LoadingSpinner from '../Components/LoadingSpinner';

const PrivateRouter = ({ children }) => {
    window.scrollTo(0,0)
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(state => state.auth.loading);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signIn" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRouter;