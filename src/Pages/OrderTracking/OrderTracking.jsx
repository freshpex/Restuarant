import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaSearch, FaSpinner, FaBox, FaCheck, FaTimes, FaShoppingBag, FaUtensils, FaMotorcycle, FaTruck, FaClipboard, FaExclamationTriangle, FaGlassWhiskey, FaHamburger, FaCocktail } from 'react-icons/fa';
import { formatPrice } from '../../utils/formatUtils';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/selectors';
import { Link } from 'react-router-dom';

const OrderTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = orderId || queryParams.get('id') || '';
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const [trackingId, setTrackingId] = useState(searchQuery);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  
  useEffect(() => {
    if (searchQuery) {
      handleTrackOrder();
    }
  }, []);

  useEffect(() => {
    setIsGuest(!isAuthenticated);
  }, [isAuthenticated]);  
  
  const handleTrackOrder = async () => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking reference');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSearchAttempted(true);
    
    try {
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/order/track?reference=${encodeURIComponent(trackingId.trim())}`
      );
      
      if (!response.ok) {
        let errorMessage = 'Failed to retrieve order information';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Order not found');
      }
      
      setOrder(data.order);
      
      if (orderId !== trackingId) {
        navigate(`/track-order/${trackingId}`, { replace: true });
      }
      
    } catch (error) {
      console.error('Order tracking error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusStep = (status) => {
    const steps = ['pending', 'preparing', 'ready', 'delivered'];
    return steps.indexOf(status) + 1;
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackOrder();
    }
  };

  // Get the appropriate item name based on type (food or drink)
  const getItemName = (item) => {
    return item.itemName || item.foodName || item.drinkName || 'Unknown Item';
  };
  
  // Get the appropriate item image based on type
  const getItemImage = (item) => {
    return item.image || item.foodImage || item.drinkImage || null;
  };
  
  // Determine if an item is a food or drink
  const getItemType = (item) => {
    if (item.type) return item.type;
    if (item.foodId || item.foodName) return 'food';
    if (item.drinkId || item.drinkName) return 'drink';
    return 'unknown';
  };
  
  // Get appropriate icon based on item type
  const getItemIcon = (item) => {
    const type = getItemType(item);
    if (type === 'food') return <FaHamburger className="text-yellow-500" />;
    if (type === 'drink') return <FaGlassWhiskey className="text-blue-500" />;
    return <FaShoppingBag className="text-gray-500" />;
  };
  
  const getItemTypeCounts = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      if (order) {
        if (order.foodId || order.foodName) return { food: 1, drink: 0 };
        if (order.drinkId || order.drinkName) return { food: 0, drink: 1 };
      }
      return { food: 0, drink: 0 };
    }
    
    return items.reduce((counts, item) => {
      const type = getItemType(item);
      if (type === 'food') counts.food += 1;
      else if (type === 'drink') counts.drink += 1;
      return counts;
    }, { food: 0, drink: 0 });
  };

  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Order Tracking</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            <p className="mt-2 text-gray-600">
              Enter your order reference number to check your order status
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your tracking reference (e.g., TK-240808-1234)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={handleTrackOrder}
                disabled={loading || !trackingId.trim()}
                className={`px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center
                  ${(loading || !trackingId.trim()) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSearch className="mr-2" />
                )}
                Track Order
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <p>Enter the order reference from your receipt or confirmation email (starting with "TK-")</p>
            </div>
          </div>
          
          {error && !loading && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <FaTimes className="text-red-600 text-3xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
                <p className="text-gray-600 text-center max-w-md">
                  {error} Please double-check your order reference number and try again.
                </p>
              </div>
            </div>
          )}
          
          {order && !loading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-yellow-50 border-b border-yellow-100 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <FaClipboard className="text-yellow-600 mr-2" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        Order Reference: {order.orderReference || order.orderGroupId || order._id}
                      </h2>
                    </div>
                    <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 bg-gray-100 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">
                      Status: {' '}
                      <span 
                        className={`
                          ${order.status === 'pending' ? 'text-yellow-600' : ''}
                          ${order.status === 'processing' ? 'text-blue-600' : ''}
                          ${order.status === 'preparing' ? 'text-blue-600' : ''}
                          ${order.status === 'ready' ? 'text-green-600' : ''}
                          ${order.status === 'delivered' ? 'text-green-700' : ''}
                          ${order.status === 'cancelled' ? 'text-red-600' : ''}
                        `}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              {(() => {
                const { food: foodCount, drink: drinkCount } = getItemTypeCounts(order.items);
                
                return (
                  <div className="px-6 pt-3">
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-2">
                        {foodCount > 0 && (
                          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                            <FaHamburger className="text-yellow-600 mr-1" />
                            <span className="text-sm font-medium text-yellow-700">{foodCount} Food</span>
                          </div>
                        )}
                        {drinkCount > 0 && (
                          <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                            <FaGlassWhiskey className="text-blue-600 mr-1" />
                            <span className="text-sm font-medium text-blue-700">{drinkCount} Drink{drinkCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Order Progress */}
              <div className="px-6 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Progress</h3>
                <div className="relative">
                  <div className="overflow-hidden h-2 mb-6 text-xs flex rounded bg-gray-200">
                    <div 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500`}
                      style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 1 ? 'text-green-600' : ''}`}>
                      <div className={`rounded-full p-1 ${getStatusStep(order.status) >= 1 ? 'bg-green-100' : 'bg-gray-100'} mb-1`}>
                        <FaShoppingBag className={`${getStatusStep(order.status) >= 1 ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span>Confirmed</span>
                    </div>
                    <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 2 ? 'text-green-600' : ''}`}>
                      <div className={`rounded-full p-1 ${getStatusStep(order.status) >= 2 ? 'bg-green-100' : 'bg-gray-100'} mb-1`}>
                        <FaUtensils className={`${getStatusStep(order.status) >= 2 ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span>Preparing</span>
                    </div>
                    <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 3 ? 'text-green-600' : ''}`}>
                      <div className={`rounded-full p-1 ${getStatusStep(order.status) >= 3 ? 'bg-green-100' : 'bg-gray-100'} mb-1`}>
                        <FaBox className={`${getStatusStep(order.status) >= 3 ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span>Ready</span>
                    </div>
                    <div className={`flex flex-col items-center ${getStatusStep(order.status) >= 4 ? 'text-green-600' : ''}`}>
                      <div className={`rounded-full p-1 ${getStatusStep(order.status) >= 4 ? 'bg-green-100' : 'bg-gray-100'} mb-1`}>
                        <FaMotorcycle className={`${getStatusStep(order.status) >= 4 ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Details */}
              <div className="p-6 border-t border-gray-200 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
                
                <div className="divide-y divide-gray-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="py-4 flex items-start">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                          {getItemImage(item) ? (
                            <img
                              src={getItemImage(item)}
                              alt={getItemName(item)}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              {getItemIcon(item)}
                            </div>
                          )}
                        </div>
                        
                        {/* Item details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="text-base font-medium text-gray-900">
                                {getItemName(item)}
                                <span className="ml-2 text-xs px-2 py-1 rounded-full inline-block align-middle">
                                  {getItemType(item) === 'food' ? (
                                    <span className="bg-yellow-100 text-yellow-800">Food</span>
                                  ) : getItemType(item) === 'drink' ? (
                                    <span className="bg-blue-100 text-blue-800">Drink</span>
                                  ) : null}
                                </span>
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.totalPrice || (item.price * item.quantity))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Single item order
                    <div className="py-4">
                      <div className="flex items-start">
                        {/* Handle both food and drink images */}
                        {(order.foodImage || order.drinkImage) && (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
                            <img
                              src={order.foodImage || order.drinkImage}
                              alt={order.foodName || order.drinkName}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-base font-medium text-gray-900">
                            {order.foodName || order.drinkName}
                            <span className="ml-2 text-xs px-2 py-1 rounded-full inline-block align-middle">
                              {order.foodName ? (
                                <span className="bg-yellow-100 text-yellow-800">Food</span>
                              ) : order.drinkName ? (
                                <span className="bg-blue-100 text-blue-800">Drink</span>
                              ) : null}
                            </span>
                          </h4>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                            <p className="text-sm font-medium text-gray-900">{formatPrice(order.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment & Delivery Info */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Information</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                        <p className="text-gray-900">{order.paymentMethod || 'N/A'}</p>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                        <p className={`${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'} font-medium`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                        </p>
                      </div>
                      {order.transactionRef && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Transaction Reference:</span>
                          <p className="text-gray-900 break-words">{order.transactionRef}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Information</h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Delivery Address:</span>
                        <p className="text-gray-900">{order.fullAddress}</p>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">Delivery Location:</span>
                        <p className="text-gray-900">{order.deliveryLocation}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Contact Number:</span>
                        <p className="text-gray-900">{order.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 font-medium">{formatPrice(order.subtotal || order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="text-gray-900 font-medium">{formatPrice(order.deliveryFee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatPrice(order.total || (parseFloat(order.totalPrice) + parseFloat(order.deliveryFee || 0)))}</span>
                  </div>
                </div>
              </div>
              {isGuest && order && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Want easier order tracking?</h3>
                      <div className="mt-1 text-sm text-blue-700">
                        <p>Create an account to easily track all your orders and save your delivery information for future orders.</p>
                        <div className="mt-3">
                          <Link 
                            to="/signup" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium inline-block"
                          >
                            Sign Up Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!order && !error && !loading && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 text-center">
              <FaSearch className="mx-auto text-yellow-500 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Enter your order details</h3>
              <p className="text-gray-600">
                Enter your order ID, reference number or transaction ID to track your order
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
