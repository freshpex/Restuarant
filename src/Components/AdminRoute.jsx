import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAdmin, selectIsAuthenticated, selectCurrentUser, selectAuthLoading } from '../redux/selectors';
import { fetchUserProfile } from '../redux/slices/authSlice';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isAdmin = useSelector(selectIsAdmin);
    const loading = useSelector(selectAuthLoading);
    const currentUser = useSelector(selectCurrentUser);
    const location = useLocation();
    const dispatch = useDispatch();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isPermissionVerified, setIsPermissionVerified] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const checkAuth = async () => {
            if (token && !currentUser?.role) {
                try {
                    await dispatch(fetchUserProfile()).unwrap();
                    setIsPermissionVerified(true);
                } catch (error) {
                    console.error("Failed to restore user session:", error);
                    setIsPermissionVerified(false);
                }
            } else {
                // Already have role info or no token
                setIsPermissionVerified(true);
            }
            setIsCheckingAuth(false);
        };
        
        checkAuth();
    }, [dispatch, currentUser, token]);

    // Show loading state while checking auth
    if (loading || isCheckingAuth || !isPermissionVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Verifying your access...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/signIn" state={{ from: location.pathname }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/unauthorized" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default AdminRoute;
