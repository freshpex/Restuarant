import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSpinner, FaCopy, FaTimes, FaCheckCircle, 
  FaExclamationCircle, FaMoneyBillWave, FaClock 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CustomPaymentModal = ({ 
  isOpen, 
  onClose, 
  amount,
  orderId,
  orderReference,
  onConfirmSuccess,
  apiUrl
}) => {
  const [stage, setStage] = useState('initial');
  const [checkCount, setCheckCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  
  // Bank details (in a real app, this would come from your API)
  const bankDetails = {
    bankName: "Standard Chartered Bank",
    accountNumber: "5004521821",
    accountName: "Tim's Kitchen Limited",
    amount: amount
  };
  
  // Handle copying to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`${type} copied to clipboard`);
      })
      .catch(() => {
        toast.error(`Failed to copy ${type}`);
      });
  };
  
  // Handle the "I've made payment" button
  const handleConfirmPayment = () => {
    setStage('confirming');
    startPolling();
  };
  
  // Setup polling to check payment status with a small delay
  const startPolling = () => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    // Add a small delay before first check to ensure order is in database
    setTimeout(() => {
      // Check initially once after delay
      checkPaymentStatus();
      
      // Then continue checking every 12 seconds
      intervalRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 12000);
    }, 2000);
    
    // Set a timeout for 5 minutes
    timeoutRef.current = setTimeout(() => {
      if (!paymentConfirmed) {
        setStage('timeout');
        clearInterval(intervalRef.current);
        clearInterval(timerRef.current);
      }
    }, 5 * 60 * 1000);
  };
  
  // Check payment status with the backend without requiring authentication token
  const checkPaymentStatus = async () => {
    setCheckCount(prev => prev + 1);
    
    try {
      // Remove the Authorization header since we made the endpoint public
      const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }
      
      const data = await response.json();
      
      if (data.paymentStatus === 'paid') {
        handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentConfirmed(true);
    setStage('success');
    
    // Clear all timers and intervals
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    
    setTimeout(() => {
      onConfirmSuccess();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);
  
  const formatTimeElapsed = () => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle attempt to close the dialog
  const handleCloseAttempt = () => {
    if (stage === 'confirming') {
      const confirmed = window.confirm(
        'Are you sure you want to leave? We are still confirming your payment. Closing this window may result in payment verification issues.'
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
        >
          {/* Header */}
          <div className="bg-yellow-50 p-4 rounded-t-lg border-b border-yellow-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-yellow-800 flex items-center">
              <FaMoneyBillWave className="mr-2 text-yellow-600" /> 
              Tim's Kitchen Payment
            </h2>
            <button 
              onClick={handleCloseAttempt}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {stage === 'initial' && (
              <div>
                <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                    <FaExclamationCircle className="mr-2" /> Payment Instructions
                  </h3>
                  <ol className="list-decimal pl-5 text-blue-700 space-y-2">
                    <li>Transfer exactly ₦{amount} to the account below</li>
                    <li>Use reference: <span className="font-mono font-bold">{orderReference}</span></li>
                    <li>Click "I've Sent Payment" after making the transfer</li>
                    <li>Wait for confirmation (usually takes 1-3 minutes)</li>
                  </ol>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Bank Name</span>
                      <button 
                        onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-lg">{bankDetails.bankName}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Account Number</span>
                      <button 
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-lg font-mono">{bankDetails.accountNumber}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Account Name</span>
                      <button 
                        onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                    </div>
                    <p className="font-bold">{bankDetails.accountName}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-yellow-700">Amount to Pay</span>
                      <button 
                        onClick={() => copyToClipboard(`₦${amount}`, 'Amount')}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                    </div>
                    <p className="font-bold text-xl text-yellow-800">₦{amount}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleConfirmPayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium flex items-center justify-center"
                >
                  <FaCheckCircle className="mr-2" /> I've Sent Payment
                </button>
              </div>
            )}
            
            {stage === 'confirming' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-yellow-600 text-4xl"
                  >
                    <FaSpinner />
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">Confirming Your Payment</h3>
                <p className="text-gray-600 mb-6">
                  Please wait while we confirm your transfer. This usually takes 1-3 minutes.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center">
                  <FaExclamationCircle className="text-blue-600 mr-3 text-xl flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    Please do not close this window. We are actively verifying your payment with our bank.
                  </p>
                </div>
                
                <div className="flex justify-center items-center space-x-8 mb-6">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Time Elapsed</p>
                    <p className="font-mono font-bold text-lg flex items-center justify-center">
                      <FaClock className="mr-2 text-gray-600" /> {formatTimeElapsed()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Status Checks</p>
                    <p className="font-mono font-bold text-lg">{checkCount}</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <motion.div 
                    className="bg-yellow-600 h-2 rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: ["5%", "98%"] }}
                    transition={{ duration: 180, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-gray-500 text-sm">
                  Checking with bank...
                </p>
              </div>
            )}
            
            {stage === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="flex justify-center mb-6"
                >
                  <FaCheckCircle className="text-green-500 text-6xl" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-green-700 mb-3">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your payment has been confirmed and your order is now being processed.
                </p>
                
                <p className="text-sm text-gray-500">
                  Redirecting you to order confirmation...
                </p>
              </motion.div>
            )}
            
            {stage === 'timeout' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <FaExclamationCircle className="text-yellow-600 text-4xl" />
                </div>
                
                <h3 className="text-xl font-bold mb-3">Verification Taking Longer</h3>
                <p className="text-gray-600 mb-6">
                  We haven't confirmed your payment yet. This could be due to:
                </p>
                
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Bank processing delays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Incorrect amount or reference number</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Payment hasn't been made yet</span>
                  </li>
                </ul>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setStage('confirming');
                      startPolling();
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-md font-medium"
                  >
                    Keep Waiting
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/track-order/${orderReference}`;
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
                  >
                    Track Order Status
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Order Reference</p>
                <p className="text-sm font-mono font-medium">{orderReference}</p>
              </div>
              {stage === 'initial' && (
                <button
                  onClick={handleCloseAttempt}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CustomPaymentModal;
