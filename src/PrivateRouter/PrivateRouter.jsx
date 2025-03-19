import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "../Components/LoadingSpinner";

const PrivateRouter = ({ children }) => {
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/signIn" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRouter;
