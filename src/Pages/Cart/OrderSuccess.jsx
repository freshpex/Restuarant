import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, isPaid } = location.state || {};
  
  if (!orderId) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Order Successful</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FaCheckCircle className="mx-auto text-green-500 text-6xl mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've received your request and will process it shortly.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700 mb-1">Order Reference: <span className="font-medium">{orderId}</span></p>
              <p className="text-sm text-gray-700">
                Payment Status: {' '}
                {isPaid ? (
                  <span className="text-green-600 font-medium">Paid</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Pending Payment</span>
                )}
              </p>
            </div>
            <p className="text-gray-600 mb-8">
              {isPaid 
                ? "Your payment has been processed successfully. You'll receive updates about your order via email."
                : "Please complete your payment to confirm your order. You can pay via WhatsApp or online through your order history."}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                to="/orderFood" 
                className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium"
              >
                View My Orders
              </Link>
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
