import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaTrash, FaMinus, FaPlus, FaArrowLeft, FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  selectCartItems, 
  selectCartTotalAmount, 
  updateQuantity, 
  removeItem, 
  clearCart 
} from '../../redux/slices/cartSlice';
import { formatPrice } from '../../utils/formatUtils';
import { selectIsAuthenticated } from '../../redux/selectors';

const showToast = (message, type) => {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message, {
      icon: type === 'warning' ? '⚠️' : 'ℹ️',
      style: {
        borderRadius: '10px',
        background: type === 'warning' ? '#FEF3C7' : '#E0F2FE',
        color: type === 'warning' ? '#92400E' : '#1E40AF',
      },
    });
  }
};

const Cart = () => {
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [deliveryLocation, setDeliveryLocation] = useState('emaudo');
  const [deliveryFee, setDeliveryFee] = useState(500);
  const [fullAddress, setFullAddress] = useState('');
  const [isAddressModified, setIsAddressModified] = useState(false);
  const addressChangeTimeout = useRef(null);
  const [isNightDelivery, setIsNightDelivery] = useState(false);
  
  const deliveryFees = {
    emaudo: 500,
    town: 1000,
    village: 1500,
    irrua: 2500,
    benin: 10000,
    auchi: 10000,
    nightEmaudo: 700,
    nightTown: 1200,
    nightVillage: 1700,
    nightIrrua: 3000
  };
  
  const grandTotal = parseFloat(totalAmount) + deliveryFee;

  // Detect item type and provide the right fields
  const getItemName = (item) => {
    return item.foodName || item.drinkName || 'Unknown Item';
  };
  
  const getItemImage = (item) => {
    return item.foodImage || item.drinkImage || '/default-product.png';
  };

  const getItemPrice = (item) => {
    return item.foodPrice || item.drinkPrice || 0;
  };

  const getItemCategory = (item) => {
    return item.foodCategory || item.drinkCategory || 'Uncategorized';
  };

  const getItemQuantity = (item) => {
    if (item.foodName) {
      return item.foodQuantity || 0;
    } else if (item.drinkName) {
      return item.drinkQuantity || 0;
    }
    return 0;
  };
  
  const getItemType = (item) => {
    if (item.foodName) return 'Food';
    if (item.drinkName) return 'Drink';
    return 'Item';
  };
  
  const handleQuantityChange = (id, currentQty, change) => {
    const newQuantity = Math.max(1, currentQty + change);
    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };
  
  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };
  
  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };
  
  useEffect(() => {
    if (!isAddressModified || !fullAddress.trim()) return;
    
    if (addressChangeTimeout.current) {
      clearTimeout(addressChangeTimeout.current);
    }
    
    addressChangeTimeout.current = setTimeout(() => {
      const addressLower = fullAddress.toLowerCase();
      
      const locationKeywords = {
        emaudo: ['emaudo', 'mount', 'hall 1', 'hall 2', 'hall1', 'hall2'],
        town: ['market square', 'alli square', 'dublous', 'esan', 'town', 'market'],
        irrua: ['irrua', 'clinical', 'hospital', 'isth'],
        benin: ['benin', 'ring road', 'ugbowo', 'ekenwan'],
        auchi: ['auchi', 'poly', 'polytechnic', 'jattu']
      };
      
      let detectedLocation = null;
      
      for (const [location, keywords] of Object.entries(locationKeywords)) {
        if (keywords.some(keyword => addressLower.includes(keyword))) {
          detectedLocation = location;
          break;
        }
      }
      const finalLocation = isNightDelivery && ['emaudo', 'town', 'village', 'irrua'].includes(detectedLocation)
        ? 'night' + detectedLocation.charAt(0).toUpperCase() + detectedLocation.slice(1)
        : detectedLocation;
      
      const newLocation = finalLocation || (isNightDelivery ? 'nightVillage' : 'village');
      
      if (deliveryLocation !== newLocation && newLocation) {
        const oldLocationName = deliveryLocation.replace('night', '')
          .charAt(0).toUpperCase() + deliveryLocation.replace('night', '').slice(1);
        
        const newLocationName = newLocation.replace('night', '')
          .charAt(0).toUpperCase() + newLocation.replace('night', '').slice(1);
        
        setDeliveryLocation(newLocation);
        setDeliveryFee(deliveryFees[newLocation]);
        
        if (oldLocationName !== newLocationName) {
          showToast(
            `Delivery location automatically set to ${newLocationName} based on your address`,
            'info'
          );
        }
      }
    }, 500);
    
    return () => {
      if (addressChangeTimeout.current) {
        clearTimeout(addressChangeTimeout.current);
      }
    };
  }, [fullAddress, isAddressModified, deliveryLocation, deliveryFees, isNightDelivery]);
  
  useEffect(() => {
    const checkNightDeliveryHours = () => {
      const currentHour = new Date().getHours();
      return currentHour >= 19 || currentHour < 6;
    };
    
    const isNight = checkNightDeliveryHours();
    setIsNightDelivery(isNight);
    
    if (isNight) {
      const nightEquivalents = {
        'emaudo': 'nightEmaudo',
        'town': 'nightTown',
        'village': 'nightVillage',
        'irrua': 'nightIrrua'
      };
      
      if (nightEquivalents[deliveryLocation]) {
        setDeliveryLocation(nightEquivalents[deliveryLocation]);
        setDeliveryFee(deliveryFees[nightEquivalents[deliveryLocation]]);
        
        showToast('Night delivery hours (7pm-6am) detected. Additional ₦200 fee applies.', {
          duration: 5000,
          icon: '🌙'
        });
      }
    }
  }, []);
  
  const handleDeliveryLocationChange = (e) => {
    const newLocation = e.target.value;
    setDeliveryLocation(newLocation);
    setDeliveryFee(deliveryFees[newLocation]);
    
    validateLocationWithAddress(newLocation, fullAddress);
  };
  
  const validateLocationWithAddress = (location, address) => {
    if (!address.trim()) return;
    
    const addressLower = address.toLowerCase();
    const locationWithoutNight = location.replace('night', '');
    
    const locationChecks = {
      'emaudo': !addressLower.includes('emaudo') && !addressLower.includes('campus'),
      'town': !['market square', 'alli square', 'dublous', 'town', 'market'].some(k => addressLower.includes(k)),
      'irrua': !addressLower.includes('irrua') && !addressLower.includes('hospital') && !addressLower.includes('isth'),
      'benin': !addressLower.includes('benin'),
      'auchi': !addressLower.includes('auchi') && !addressLower.includes('poly'),
    };
    
    if (locationChecks[locationWithoutNight]) {
      const locationName = locationWithoutNight.charAt(0).toUpperCase() + locationWithoutNight.slice(1);
      showToast(
        `You've selected ${locationName} delivery but your address doesn't mention ${locationName}. ` +
        `Please verify your delivery location is correct.`,
        'warning'
      );
    }
  };
  
  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setFullAddress(newAddress);
    setIsAddressModified(true);
  };
  
  const handleCheckout = () => {
    if (!fullAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        cartItems, 
        totalAmount, 
        deliveryLocation, 
        deliveryFee, 
        fullAddress,
        grandTotal: grandTotal.toFixed(2),
        isGuest: !isAuthenticated
      } 
    });
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Tim's Kitchen | Shopping Cart</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mt-64 text-center">Your Cart</h1>
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center space-y-6">
              <FaShoppingBag className="text-gray-400 text-6xl" />
              <h2 className="text-2xl font-medium text-gray-700">Your cart is empty</h2>
              <p className="text-gray-500">Looks like you haven't added any items to your cart yet.</p>
              <div className="flex space-x-4 mt-4">
                <Link 
                  to="/food"
                  className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Browse Food Menu
                </Link>
                <Link 
                  to="/drink"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Drinks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Shopping Cart</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <button 
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <FaTrash className="text-sm" />
              <span>Clear Cart</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex py-6 flex-col sm:flex-row">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="sm:ml-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{getItemName(item)}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {getItemType(item)} • {getItemCategory(item)}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">Price: {formatPrice(getItemPrice(item))}</p>
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                            className="px-3 py-1 border-r border-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus className={item.quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                            className="px-3 py-1 border-l border-gray-300"
                            disabled={item.quantity >= getItemQuantity(item) && getItemQuantity(item) > 0}
                          >
                            <FaPlus className={item.quantity >= getItemQuantity(item) && getItemQuantity(item) > 0 ? "text-gray-300" : "text-gray-600"} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      {getItemQuantity(item) > 0 && getItemQuantity(item) <= 5 && (
                        <p className="mt-2 text-sm text-yellow-600">
                          Only {getItemQuantity(item)} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-4">
                <Link 
                  to="/food"
                  className="flex items-center text-yellow-600 hover:text-yellow-800"
                >
                  <FaArrowLeft className="mr-2" />
                  Browse More Food
                </Link>
                <Link 
                  to="/drink"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaArrowLeft className="mr-2" />
                  Browse Drinks
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p>{formatPrice(totalAmount)}</p>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="fullAddress" className="block mb-2 text-sm font-medium text-gray-900">
                    Delivery Address*
                  </label>
                  <textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={fullAddress}
                    onChange={handleAddressChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide detailed address for accurate delivery. Include location details (Emaudo, Town, Irrua, etc.)
                  </p>
                </div>
                
                {/* Delivery Location Options */}
                <div className="mt-4">
                  <label htmlFor="deliveryLocation" className="block mb-2 text-sm font-medium text-gray-900">
                    Delivery Location
                    {isNightDelivery && (
                      <span className="ml-2 text-yellow-600 text-xs font-medium">
                        (Night Delivery Hours: 7pm-6am)
                      </span>
                    )}
                  </label>
                  <select
                    id="deliveryLocation"
                    name="deliveryLocation"
                    value={deliveryLocation}
                    onChange={handleDeliveryLocationChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                    required
                  >
                    {isNightDelivery ? (
                      <>
                        <option value="nightEmaudo">Night Emaudo (₦700)</option>
                        <option value="nightTown">Night Town (₦1,200)</option>
                        <option value="nightVillage">Night Village (₦1,700)</option>
                        <option value="nightIrrua">Night Irrua (₦3,000)</option>
                      </>
                    ) : (
                      <>
                        <option value="emaudo">Emaudo (₦500)</option>
                        <option value="town">Town (₦1,000)</option>
                        <option value="village">Village (₦1,500)</option>
                        <option value="irrua">Irrua (₦2,500)</option>
                        <option value="benin">Benin (₦10,000)</option>
                        <option value="auchi">Auchi (₦10,000)</option>
                      </>
                    )}
                  </select>
                  
                  {isNightDelivery && (
                    <p className="mt-1 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                      <strong>Night Delivery:</strong> An additional ₦200 fee applies for deliveries between 7pm and 6am for your safety and convenience.
                    </p>
                  )}
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Delivery fee will be added to your order total. We'll try to auto-detect your location from your address.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <p>Delivery Fee</p>
                  <p>{formatPrice(deliveryFee)}</p>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-medium text-lg">
                    <p>Total</p>
                    <p>{formatPrice(grandTotal)}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 mt-6"
                >
                  Proceed to Checkout
                </button>
              </div>
              
              {!isAuthenticated && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="text-sm text-blue-700 mb-2">  
                    <strong>Checking out as a guest?</strong> You can continue without an account, but signing in offers benefits:
                  </p>
                  <ul className="text-xs text-blue-600 list-disc pl-5 mb-2">
                    <li>Easily track your order status</li>
                    <li>Faster checkout in the future</li>
                    <li>Access to your order history</li>
                  </ul>
                  
                  <div className="flex space-x-2 mt-3">
                    <Link 
                      to="/signIn"
                      state={{ from: '/cart' }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-md text-xs font-medium hover:bg-blue-700"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      className="bg-green-600 text-white py-2 px-4 rounded-md text-xs font-medium hover:bg-green-700"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
