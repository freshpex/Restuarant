import React, { useEffect } from 'react';
import { FaWhatsapp, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onWhatsAppChat, 
  onPayOnline, 
  orderDetails,
  isPaymentLoading
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !orderDetails) return null;

  // Calculate the total price correctly
  const unitPrice = parseFloat(orderDetails.foodPrice);
  const quantity = parseInt(orderDetails.quantity);
  const totalPrice = orderDetails.totalPrice || (unitPrice * quantity).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md mx-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Order</h2>
          <button 
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            disabled={isPaymentLoading}
            aria-label="Close modal"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 my-4">
          <p className="text-gray-700 mb-4">
            Choose how you would like to proceed with your order:
          </p>
          
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="font-medium text-gray-800">Order Summary:</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">{orderDetails.foodName}</p>
                <p className="text-sm text-gray-600">₦{orderDetails.foodPrice} × {quantity}</p>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                <p className="font-medium text-gray-800">Total:</p>
                <p className="font-bold text-gray-800">₦{totalPrice}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onWhatsAppChat}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all"
            disabled={isPaymentLoading}
          >
            <FaWhatsapp size={20} className="mr-2" />
            Chat with Chef on WhatsApp
          </button>
          
          <button
            onClick={onPayOnline}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all ${isPaymentLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isPaymentLoading}
          >
            {isPaymentLoading ? (
              <>
                <FaSpinner size={20} className="animate-spin mr-2" />
                Initializing Payment...
              </>
            ) : (
              <>
                <FaCreditCard size={20} className="mr-2" />
                Pay Online Now
              </>
            )}
          </button>
        </div>
        
        {isPaymentLoading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              Please wait while we connect to the payment service...
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center mt-4">
          You can chat with our chef for customization or pay online to confirm your order immediately.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
