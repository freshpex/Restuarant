import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaShoppingBag, FaClock, FaMotorcycle, FaUtensils, FaSpinner, FaCopy, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, orderReference, isPaid, contactPhone, isProcessing, paymentPending } = location.state || {};
  const [processing, setProcessing] = useState(isProcessing || false);
  const [paymentStatus, setPaymentStatus] = useState(isPaid ? 'paid' : 'pending');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  
  const trackingReference = orderReference || orderId;

  useEffect(() => {
    if (trackingReference && !trackingReference.includes('temp-') && !processing) {
      setVerifyingPayment(true);
      
      fetch(`${import.meta.env.VITE_API_URL}/order/track?reference=${encodeURIComponent(trackingReference)}`)
        .then(response => {
          if (!response.ok) throw new Error('Could not verify order status');
          return response.json();
        })
        .then(data => {
          if (data.success && data.order) {
            setPaymentStatus(data.order.paymentStatus);
            setOrderStatus(data.order.status);
            
            if (isPaid && (data.order.paymentStatus === 'processing' || data.order.paymentStatus === 'unpaid')) {
              console.warn('Payment status mismatch - Frontend: paid, Backend:', data.order.paymentStatus);
              toast.warning('Payment is being processed. Please check the order status later.', {
                duration: 6000,
              });
            }
          }
        })
        .catch(error => {
          console.error('Error fetching order status:', error);
        })
        .finally(() => {
          setVerifyingPayment(false);
        });
    }
  }, [trackingReference, processing, isPaid]);
  
  useEffect(() => {
    if (processing) {
      const timer = setTimeout(() => {
        setProcessing(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [processing]);

  if (!orderId && !orderReference) {
    return <Navigate to="/" replace />;
  }
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);
  const deliveryTimeString = estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const copyTrackingReference = () => {
    navigator.clipboard.writeText(trackingReference)
      .then(() => {
        toast.success('Tracking reference copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy tracking reference');
      });
  };

  // Helper to determine if payment is actually confirmed
  const isPaymentConfirmed = paymentStatus === 'paid';
  const isPaymentProcessing = paymentStatus === 'processing';
  
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Order {isPaymentConfirmed ? 'Successful' : 'Placed'}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            {processing || verifyingPayment ? (
              <div className="py-4">
                <FaSpinner className="mx-auto animate-spin text-yellow-600 text-6xl mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {processing ? 'Finalizing Your Order...' : 'Verifying Payment Status...'}
                </h2>
                <p className="text-gray-600">
                  {processing 
                    ? 'Your payment was successful! We\'re setting up your order...' 
                    : 'Please wait while we verify your payment status...'}
                </p>
              </div>
            ) : (
              <>
                {isPaymentConfirmed ? (
                  <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-6" />
                ) : isPaymentProcessing ? (
                  <FaSpinner className="mx-auto text-yellow-600 text-6xl mb-6" />
                ) : (
                  <FaShoppingBag className="mx-auto text-yellow-500 text-6xl mb-6" />
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {isPaymentConfirmed 
                    ? 'Order Placed & Payment Confirmed!' 
                    : isPaymentProcessing
                      ? 'Order Placed - Processing Payment'
                      : 'Order Placed Successfully!'}
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We've received your request and will begin preparing now.
                </p>
                
                {/* Highlight the tracking reference prominently */}
                <div className="bg-yellow-50 p-6 rounded-lg mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">Your Order Tracking Reference</h2>
                  <div className="flex items-center justify-center space-x-2 bg-white py-3 px-4 rounded-md border border-yellow-200">
                    <span className="text-lg font-mono font-bold text-yellow-700">{trackingReference}</span>
                    <button 
                      onClick={copyTrackingReference} 
                      className="text-yellow-600 hover:text-yellow-800 ml-2"
                      title="Copy tracking reference"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Please save this reference number to track your order status
                  </p>
                </div>
                
                {/* Payment status alert */}
                {isPaymentProcessing && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaExclamationTriangle className="text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Your payment is currently being processed. The order status will update automatically when the payment is confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Order details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700 mb-1">
                    Order Reference: <span className="font-medium">{trackingReference}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Contact Phone: {contactPhone ? (
                      <span className="font-medium text-gray-900">{contactPhone}</span>
                    ) : (
                      <span className="text-red-500">Not provided</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700">
                    Payment Status: {' '}
                    {isPaymentConfirmed ? (
                      <span className="text-green-600 font-medium">Paid</span>
                    ) : isPaymentProcessing ? (
                      <span className="text-yellow-600 font-medium">Processing</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Pending Payment</span>
                    )}
                  </p>
                </div>
                
                {/* New preparation and delivery information section */}
                <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-lg mb-6">
                  <h2 className="text-xl font-bold text-yellow-700 mb-3">
                    {isPaymentConfirmed 
                      ? 'Your Food is Being Prepared!' 
                      : 'Order Received!'}
                  </h2>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-3">
                        <FaUtensils className="text-yellow-600 text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-yellow-800">Preparation Time</p>
                        <p className="text-sm text-yellow-700">~30 minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-3">
                        <FaMotorcycle className="text-yellow-600 text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-yellow-800">Delivery Time</p>
                        <p className="text-sm text-yellow-700">~15 minutes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-3 rounded-full mr-3">
                        <FaClock className="text-yellow-600 text-xl" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-yellow-800">Estimated Delivery</p>
                        <p className="text-sm text-yellow-700">By {deliveryTimeString}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-yellow-700 text-sm bg-yellow-100 p-4 rounded-lg">
                    At Tim's Kitchen, we take pride in preparing your food freshly made. 
                    Our chefs will begin preparing your meal with fresh ingredients right away. 
                    This will take about 30 minutes for preparation, plus 15 minutes for delivery. 
                    This ensures you receive the highest quality, freshly-made meal delivered right to your doorstep.
                  </p>
                </div>
                
                <p className="text-gray-600 mb-8">
                  {isPaymentConfirmed 
                    ? "Your payment has been processed successfully. You'll receive updates about your order via the provided contact number."
                    : isPaymentProcessing
                      ? "Your payment is being processed. We'll update you once it's confirmed."
                      : "Please complete your payment to confirm your order. You can pay via WhatsApp or online through your order history."}
                </p>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                to="/orderFood" 
                className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium"
              >
                View My Orders
              </Link>
              {!processing ? (
                <Link 
                  to={`/track-order/${trackingReference}`}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                >
                  Track This Order
                </Link>
              ) : (
                <button
                  disabled
                  className="py-2 px-4 bg-gray-400 text-white rounded-md font-medium cursor-not-allowed"
                  title="Order is still processing"
                >
                  Order Processing...
                </button>
              )}
              <Link 
                to="/" 
                className="py-2 px-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
