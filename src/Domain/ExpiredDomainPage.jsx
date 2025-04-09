import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExpiredDomainPage() {
  const navigate = useNavigate();
  
  const handleRenewDomain = () => {
    navigate('/domain');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-4">
          <h1 className="text-white text-xl font-bold text-center">Domain Expired</h1>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-gray-800 text-lg font-semibold text-center mb-4">This domain has expired</h2>
          
          <p className="text-gray-600 mb-6 text-center">
            The domain registration has expired and is pending renewal or deletion.
          </p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="text-gray-700 font-medium mb-2">Domain Information:</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Status:</span>
              <span className="col-span-2 text-red-600 font-medium">Expired</span>
              
              <span className="text-gray-500">Expired on:</span>
              <span className="col-span-2">4/12/2025</span>
              
              <span className="text-gray-500">Action Required:</span>
              <span className="col-span-2">Immediate renewal</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>URGENT:</strong> Your website is currently offline. To restore service immediately, please renew your domain within the next 7 days before permanent deletion.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={handleRenewDomain}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150 ease-in-out"
            >
              Renew Domain Now
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Need assistance? Contact your domain administrator for help.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This is an automated message from the domain registrar system.</p>
        <p className="mt-1">© 2025 Domain Registration Services</p>
      </div>
    </div>
  );
}