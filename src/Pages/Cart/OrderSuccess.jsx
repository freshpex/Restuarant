import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaShoppingBag, FaClock, FaMotorcycle, FaUtensils, FaSpinner } from 'react-icons/fa';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, isPaid, contactPhone, isProcessing } = location.state || {};
  const [processing, setProcessing] = useState(isProcessing || false);
  
  useEffect(() => {
    if (processing) {
      const timer = setTimeout(() => {
        setProcessing(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [processing]);
  
  if (!orderId) {
    return <Navigate to="/" replace />;
  }
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 45);
  const deliveryTimeString = estimatedDelivery.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Order Successful</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            {processing ? (
              <div className="py-4">
                <FaSpinner className="mx-auto animate-spin text-yellow-600 text-6xl mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Finalizing Your Order...</h2>
                <p className="text-gray-600">
                  Your payment was successful! We're setting up your order...
                </p>
              </div>
            ) : (
              <>
                <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We've received your request and will begin preparing now.
                </p>
                
                {/* Order details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-700 mb-1">Order Reference: <span className="font-medium">{orderId}</span></p>
                  <p className="text-sm text-gray-700 mb-1">
                    Contact Phone: {contactPhone ? (
                      <span className="font-medium text-gray-900">{contactPhone}</span>
                    ) : (
                      <span className="text-red-500">Not provided</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700">
                    Payment Status: {' '}
                    {isPaid ? (
                      <span className="text-green-600 font-medium">Paid</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Pending Payment</span>
                    )}
                  </p>
                </div>
                
                {/* New preparation and delivery information section */}
                <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-lg mb-6">
                  <h2 className="text-xl font-bold text-yellow-700 mb-3">Your Food is Being Prepared!</h2>
                  
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
                  {isPaid 
                    ? "Your payment has been processed successfully. You'll receive updates about your order via the provided contact number."
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
                  to={`/track-order/${orderId}`}
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
