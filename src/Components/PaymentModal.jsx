import React, { useEffect } from 'react';
import { FaWhatsapp, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { formatPrice, capitalizeWords } from '../utils/formatUtils';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onWhatsAppChat, 
  onPayOnline, 
  orderDetails,
  isPaymentLoading
}) => {
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && !isPaymentLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose, isPaymentLoading]);
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isPaymentLoading) {
      onClose();
    }
  };

  if (!isOpen || !orderDetails) return null;

  // Calculate the total price correctly
  const unitPrice = parseFloat(orderDetails.foodPrice);
  const quantity = parseInt(orderDetails.quantity);
  const deliveryFee = parseFloat(orderDetails.deliveryFee || 0);
  const totalPrice = orderDetails.totalPrice || (unitPrice * quantity).toFixed(2) + deliveryFee;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-md mx-auto shadow-2xl">
        <button 
          type="button" 
          onClick={onClose}
          disabled={isPaymentLoading}
          className={`absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 
          ${isPaymentLoading ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
          aria-label="Close modal"
        >
          <IoMdClose size={24} />
        </button>
        
        <div className="mt-2 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Order</h2>
          {isPaymentLoading && (
            <p className="text-sm text-yellow-600 mt-1">
              Payment in progress, please don't close this window
            </p>
          )}
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
                <p className="text-sm text-gray-600">
                  {formatPrice(orderDetails.foodPrice, false)} × {quantity}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-gray-600">
                  Delivery to {capitalizeWords(orderDetails.deliveryLocation || 'Not specified')}
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(orderDetails.deliveryFee || 0)}
                </p>
              </div>
              {orderDetails.fullAddress && (
                <div className="text-sm text-gray-600 border-t border-gray-200 pt-1 mt-1">
                  <p className="font-medium">Delivery Address:</p>
                  <p>{orderDetails.fullAddress}</p>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                <p className="font-medium text-gray-800">Total:</p>
                <p className="font-bold text-gray-800">{formatPrice(totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onWhatsAppChat}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-all"
          >
            <FaWhatsapp size={20} className="mr-2" />
            Chat with Chef on WhatsApp
          </button>
          
          {/* Pay online button - Disabled during payment */}
          <button
            onClick={onPayOnline}
            disabled={isPaymentLoading}
            className={`py-3 px-4 flex justify-center items-center w-full text-white rounded-lg transition-all 
              ${isPaymentLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-yellow-600 hover:bg-yellow-700'}`}
          >
            {isPaymentLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <FaCreditCard className="mr-2" />
                Pay Online
              </>
            )}
          </button>
          
          {/* Cancel button */}
          <button
            onClick={() => {
              if (isPaymentLoading) {
                if (window.confirm('Payment is in progress. Cancelling now may result in a failed transaction. Are you sure you want to cancel?')) {
                  onClose();
                }
              } else {
                onClose();
              }
            }}
            className="py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg mt-2"
          >
            {isPaymentLoading ? 'Cancel Payment' : 'Cancel Order'}
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
        
        {orderDetails.paymentStatus && (
          <p className={`text-sm ${orderDetails.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'} mt-2 text-center font-medium`}>
            {orderDetails.paymentStatus === 'paid' 
              ? '✓ Payment Completed' 
              : '⚠ Payment Pending'}
          </p>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          You can chat with our chef for customization or pay online to confirm your order immediately.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
