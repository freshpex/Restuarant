import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaShareSquare } from 'react-icons/fa';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOS);
    
    const promptDismissedTime = localStorage.getItem('pwaPromptDismissed');
    const showAgain = !promptDismissedTime || (Date.now() - parseInt(promptDismissedTime) > 7 * 24 * 60 * 60 * 1000); // 7 days
    
    if (!isIOS) {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        if (showAgain) {
          setShowPrompt(true);
        }
      };
      
      window.addEventListener('beforeinstallprompt', handler);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    } else {
      const isInStandaloneMode = window.navigator.standalone === true;
      if (!isInStandaloneMode && showAgain) {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isSafari) {
          setShowPrompt(true);
        }
      }
    }
  }, []);

  const installApp = () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg p-4 z-50 border-t border-gray-200 dark:border-gray-700">
      {isIOS ? (
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-800 dark:text-gray-200">
              Install Tim's Kitchen App
            </h3>
            <button 
              onClick={dismissPrompt}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Dismiss"
            >
              <FaTimes className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center mb-2">
            <FaShareSquare className="text-blue-500 text-lg mr-2" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Tap the <span className="font-bold">Share</span> button at the bottom of Safari
            </p>
          </div>
          
          <div className="flex items-center">
            <FaDownload className="text-blue-500 text-lg mr-2" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Scroll down and tap <span className="font-bold">Add to Home Screen</span>
            </p>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Note: Tim's Kitchen can only be installed from Safari browser on iOS
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex-1">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Install Tim's Kitchen App
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Install our app for a better experience
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={dismissPrompt}
              className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              Not now
            </button>
            <button 
              onClick={installApp}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center"
            >
              <FaDownload className="mr-1" /> Install
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
