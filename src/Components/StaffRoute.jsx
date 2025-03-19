import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthLoading,
} from "../redux/selectors";
import { fetchUserProfile } from "../redux/slices/authSlice";
import StaffLayout from "../Pages/Staff/StaffLayout";
import LoadingSpinner from "./LoadingSpinner";

const StaffRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isPermissionVerified, setIsPermissionVerified] = useState(false);
  const token = localStorage.getItem("token");

  const isStaff =
    currentUser &&
    ["admin", "manager", "chef", "cashier"].includes(currentUser.role);

  useEffect(() => {
    // Check auth only once per component mount
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

  // Only redirect after we're sure about the authentication state
  if (!isAuthenticated) {
    return (
      <Navigate to="/signIn" state={{ from: location.pathname }} replace />
    );
  }

  if (!isStaff) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return (
    <StaffLayout>
      <Outlet />
    </StaffLayout>
  );
};

export default StaffRoute;
