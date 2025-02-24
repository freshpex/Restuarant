import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../redux/selectors';
import { checkTokenValidity } from '../utils/authUtils';
import { clearCredentials } from '../redux/slices/authSlice';
import LoadingSpinner from '../Components/LoadingSpinner';

const PrivateRouter = ({ children }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(state => state.auth.loading);

    useEffect(() => {
        if (isAuthenticated && !checkTokenValidity()) {
            dispatch(clearCredentials());
        }
    }, [dispatch, isAuthenticated]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signIn" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRouter;