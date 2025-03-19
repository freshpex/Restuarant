import React from "react";
import { useSelector } from "react-redux";

const GlobalLoadingSpinner = () => {
  const globalLoading = useSelector(
    (state) => state.ui?.globalLoading || false,
  );

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-8 border-b-8 border-yellow-600 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
      </div>
      <p className="absolute bottom-1/4 text-white text-xl font-semibold">
        Loading Tim's Kitchen...
      </p>
    </div>
  );
};

export default GlobalLoadingSpinner;
