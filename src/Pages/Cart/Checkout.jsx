import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { clearCart } from '../../redux/slices/cartSlice';
import { formatPrice } from '../../utils/formatUtils';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { selectCurrentUser } from '../../redux/selectors';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  
  useEffect(() => {
    if (location.state?.isGuest) {
      const timer = setTimeout(() => {
        setShowSignupPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  
  const { 
    cartItems, 
    totalAmount, 
    deliveryLocation, 
    deliveryFee, 
    fullAddress,
    grandTotal,
    isGuest = false
  } = location.state || {};
  
  if (!cartItems || cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const handleBackToCart = () => {
    navigate('/cart');
  };
  
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    return phoneRegex.test(phone);
  };
  
  const processOrder = async (transactionDetails = null) => {
    setLoading(true);
    
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      setLoading(false);
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber.trim())) {
      setPhoneError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    if (isGuest && !guestName.trim()) {
      toast.error('Please enter your name');
      setLoading(false);
      return;
    }
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          foodId: item._id,
          foodName: item.foodName,
          quantity: item.quantity,
          price: item.foodPrice,
          totalPrice: item.totalPrice,
          foodImage: item.foodImage
        })),
        deliveryLocation,
        deliveryFee,
        fullAddress,
        subtotal: totalAmount,
        total: grandTotal,
        paymentMethod,
        paymentStatus: transactionDetails ? 'paid' : 'unpaid',
        transactionRef: transactionDetails?.transaction_id || null,
        buyerName: isGuest ? guestName : user?.displayName || '',
        email: isGuest ? guestEmail : user?.email || '',
        userEmail: isGuest ? guestEmail : user?.email || '',
        phone: phoneNumber.trim(),
        date: new Date().toISOString().split('T')[0],
        isGuestOrder: isGuest
      };
      
      if (transactionDetails && paymentMethod === 'online') {
        dispatch(clearCart());
        
        const tempId = `temp-${Date.now()}`;
        navigate('/order-success', { 
          state: { 
            orderId: tempId,
            isPaid: true,
            contactPhone: phoneNumber.trim(),
            isProcessing: true
          }
        });
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bulk-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to place order');
        }
        
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bulk-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
      
      const data = await response.json();
      
      dispatch(clearCart());
      
      navigate('/order-success', { 
        state: { 
          orderId: data.orderId,
          isPaid: !!transactionDetails,
          contactPhone: phoneNumber.trim()
        }
      });
      
    } catch (error) {
      console.error('Order processing error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };
  
  const handlePayWithWhatsApp = () => {
    
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber.trim())) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    
    const items = cartItems.map(item => `- ${item.foodName} x ${item.quantity}: ₦${item.totalPrice}`).join('\n');
    
    const message = encodeURIComponent(
      `Hello! I'd like to place an order:\n\n${items}\n\n` +
      `Subtotal: ₦${totalAmount}\n` +
      `Delivery to ${deliveryLocation} (${fullAddress}): ₦${deliveryFee}\n` +
      `Total: ₦${grandTotal}\n\n` +
      `My name is ${user.displayName}.\n` +
      `My contact number: ${phoneNumber}\n` + 
      `Please confirm if these items are available.`
    );
    
    window.open(`https://wa.me/+2349041801170?text=${message}`, '_blank');
    
    processOrder();
  };
  
  const handlePaymentSuccess = (response) => {
    toast.promise(
      updateOrderPaymentStatus(response),
      {
        loading: 'Confirming payment...',
        success: 'Payment confirmed! Redirecting...',
        error: 'Payment verification issue. Your payment may still be processing.',
      }
    );
  };

  const updateOrderPaymentStatus = async (paymentResponse) => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          foodId: item._id,
          foodName: item.foodName,
          quantity: item.quantity,
          price: item.foodPrice,
          totalPrice: item.totalPrice,
          foodImage: item.foodImage
        })),
        deliveryLocation,
        deliveryFee,
        fullAddress,
        subtotal: totalAmount,
        total: grandTotal,
        paymentMethod: 'online',
        paymentStatus: paymentResponse?.status === 'successful' || paymentResponse?.status === 'completed' ? 'paid' : 'processing',
        transactionRef: paymentResponse?.transaction_id || null,
        buyerName: user?.displayName || '',
        email: user?.email || '',
        userEmail: user?.email || '',
        phone: phoneNumber.trim(),
        date: new Date().toISOString().split('T')[0]
      };
      
      dispatch(clearCart());
      
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/bulk-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }
      
      const orderResult = await orderResponse.json();
      const { orderId, orderReference } = orderResult;
      
      const paymentUpdateResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          transactionRef: paymentResponse.transaction_id
        })
      });
      
      if (!paymentUpdateResponse.ok) {
        console.error('Payment status update failed but order was created');
      }
      
      navigate('/order-success', { 
        state: { 
          orderId: orderId,
          orderReference: orderReference,
          isPaid: true,
          contactPhone: phoneNumber.trim()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      
      navigate('/order-success', { 
        state: { 
          orderId: `temp-${Date.now()}`,
          isPaid: false,
          paymentPending: true,
          contactPhone: phoneNumber.trim()
        }
      });
      
      throw error;
    }
  };

  const handlePayOnline = () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber.trim())) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    
    setProcessingPayment(true);
    
    const createOrderFirst = async () => {
      try {
        const orderData = {
          items: cartItems.map(item => ({
            foodId: item._id,
            foodName: item.foodName,
            quantity: item.quantity,
            price: item.foodPrice,
            totalPrice: item.totalPrice,
            foodImage: item.foodImage
          })),
          deliveryLocation,
          deliveryFee,
          fullAddress,
          subtotal: totalAmount,
          total: grandTotal,
          paymentStatus: 'processing',
          paymentMethod: 'online',
          buyerName: user?.displayName || '',
          email: user?.email || '',
          userEmail: user?.email || '',
          phone: phoneNumber.trim(),
          date: new Date().toISOString().split('T')[0]
        };
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bulk-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create order');
        }
        
        const data = await response.json();
        
        initiatePayment(data.orderId, data.orderReference);
      } catch (error) {
        toast.error(error.message || 'Failed to initialize order');
        setProcessingPayment(false);
      }
    };
    
    const initiatePayment = (orderId, orderReference) => {
      const config = {
        public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: orderReference,
        amount: parseFloat(grandTotal),
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
          email: user?.email || '',
          phone_number: phoneNumber.trim(),
          name: user?.displayName || '',
        },
        customizations: {
          title: "Tim's Kitchen Cart Checkout",
          description: `Payment for ${cartItems.length} items`,
          logo: "/logo.png",
        },
        meta: {
          orderId: orderId,
          orderReference: orderReference
        }
      };
      
      const handleFlutterPayment = useFlutterwave(config);
      
      handleFlutterPayment({
        callback: (response) => {
          closePaymentModal();
          
          if (response.status === "successful" || response.status === "completed") {
            handlePaymentSuccess(response);
          } else {
            toast.error('Payment was not completed successfully.');
            setProcessingPayment(false);
          }
        },
        onClose: () => {
          setProcessingPayment(false);
          toast.info('Payment cancelled');
        },
      });
    };
    
    createOrderFirst();
  };
  
  const handlePlaceOrder = () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      document.getElementById('phone').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!validatePhoneNumber(phoneNumber.trim())) {
      setPhoneError('Please enter a valid phone number');
      document.getElementById('phone').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (paymentMethod === 'online') {
      handlePayOnline();
    } else if (paymentMethod === 'whatsapp') {
      handlePayWithWhatsApp();
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Tim's Kitchen | Checkout</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={handleBackToCart}
              className="flex items-center text-yellow-600 hover:text-yellow-800 mr-4"
              disabled={loading || processingPayment}
            >
              <FaArrowLeft className="mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Details</h2>
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item._id} className="py-4 flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.foodImage}
                        alt={item.foodName}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">{item.foodName}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-4">
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        setPhoneError('');
                      }}
                      className={`bg-white border ${phoneError ? 'border-red-500' : phoneNumber.trim() ? 'border-green-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5`}
                      placeholder="e.g., +234 904 123 4567"
                      required
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      <strong>Required</strong> for delivery coordination. The delivery personnel will call this number.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Delivery Location:</p>
                      <p className="text-sm text-gray-900">{deliveryLocation.charAt(0).toUpperCase() + deliveryLocation.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Delivery Fee:</p>
                      <p className="text-sm text-gray-900">{formatPrice(deliveryFee)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Full Address:</p>
                    <p className="text-sm text-gray-900">{fullAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'online' ? 'border-yellow-600 bg-yellow-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="online"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <label htmlFor="online" className="ml-3 block text-sm font-medium text-gray-700">
                        Pay Online (Card, Transfer, USSD)
                      </label>
                    </div>
                  </div>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'whatsapp' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('whatsapp')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="whatsapp"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label htmlFor="whatsapp" className="ml-3 block text-sm font-medium text-gray-700">
                        Pay via WhatsApp Chat
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add the signup prompt component here */}
              {isGuest && showSignupPrompt && (
                <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-100 animate-fadeIn">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Create an account for a better experience!</h3>
                  <p className="text-blue-700 mb-4">
                    Sign up now to easily track your orders, save your delivery information for future orders, and get exclusive deals.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/signup" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create Account
                    </Link>
                    <button 
                      onClick={() => setShowSignupPrompt(false)}
                      className="border border-blue-300 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="font-medium text-gray-900">{formatPrice(totalAmount)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="font-medium text-gray-900">{formatPrice(deliveryFee)}</p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-bold text-gray-900">{formatPrice(grandTotal)}</p>
                  </div>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || processingPayment}
                  className={`w-full mt-6 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 flex items-center justify-center
                    ${(loading || processingPayment) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {processingPayment ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    'Complete Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;