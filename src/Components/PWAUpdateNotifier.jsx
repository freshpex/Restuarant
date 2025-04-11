import React, { useState, useEffect } from 'react';
import { FaSync, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { registerSW } from 'virtual:pwa-register';

const PWAUpdateNotifier = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissedRecently, setDismissedRecently] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);
  
  const RECHECK_INTERVAL = 30 * 60 * 1000;
  
  useEffect(() => {
    const lastDismissed = localStorage.getItem('updateNotificationDismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (dismissedTime > oneHourAgo) {
        setDismissedRecently(true);
        
        // Set a timer to re-enable after the remaining time
        const remainingTime = dismissedTime - oneHourAgo;
        const timer = setTimeout(() => {
          setDismissedRecently(false);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }

    // Register the service worker with update handling
    const swUpdater = registerSW({
      onNeedRefresh() {
        console.log('New content available, reload to update.');
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      }
    });
    
    setUpdateSW(() => swUpdater);
    
    // Check for updates periodically
    const intervalId = setInterval(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update().catch(err => {
            console.error('Error checking for SW updates:', err);
          });
        }
      });
    }, RECHECK_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Apply the update and reload
  const applyUpdate = () => {
    if (updateSW) {
      updateSW(true);
    } else {
      window.location.reload();
    }
  };
  
  // Dismiss the update notification
  const dismissUpdate = () => {
    setUpdateAvailable(false);
    setDismissedRecently(true);
    localStorage.setItem('updateNotificationDismissed', Date.now().toString());
    
    // Re-enable after one hour
    setTimeout(() => {
      setDismissedRecently(false);
    }, 60 * 60 * 1000);
  };
  
  if (!updateAvailable || dismissedRecently) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t-4 border-yellow-500 animate-slide-up">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaInfoCircle className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">App Update Available</h3>
              <p className="text-sm text-gray-600">
                A new version with the latest features is available
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={dismissUpdate}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Later
            </button>
            <button
              onClick={applyUpdate}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center text-sm font-medium"
            >
              <FaSync className="mr-2" /> Update Now
            </button>
            <button
              onClick={dismissUpdate}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotifier;