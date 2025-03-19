import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const OfflineDetector = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const location = useLocation();

  useEffect(() => {
    // Store the current path in sessionStorage for offline recovery
    sessionStorage.setItem("lastPath", location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("You are back online!");
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are offline. Some features may be limited.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
      You are currently offline. Some features may not be available.
    </div>
  );
};

export default OfflineDetector;
