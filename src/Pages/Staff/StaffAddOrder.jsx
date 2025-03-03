import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaSpinner, FaShoppingCart, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import { formatPrice } from '../../utils/formatUtils';

const StaffAddOrder = () => {
  const [availableFoods, setAvailableFoods] = useState([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState({
    buyerName: '',
    email: '',
    userEmail: '',
    phone: '',
    foodId: '',
    foodName: '',
    foodPrice: '',
    foodImage: '',
    quantity: 1,
    deliveryLocation: 'restaurant',
    fullAddress: '',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    status: 'preparing',
    date: new Date().toISOString().split('T')[0]
  });
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    fetchAvailableFoods();
  }, []);
  
  const fetchAvailableFoods = async () => {
    try {
      setIsLoadingFoods(true);
      const response = await fetch(`${API_URL}/admin/foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch foods');
      }

      const data = await response.json();
      setAvailableFoods(data.foods || []);
    } catch (error) {
      toast.error('Error loading food items');
      console.error(error);
    } finally {
      setIsLoadingFoods(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value
    });
  };

  const handleFoodSelect = (e) => {
    const foodId = e.target.value;
    const selected = availableFoods.find(food => food._id === foodId);
    
    if (selected) {
      // Reset quantity to 1 or available quantity, whichever is smaller
      const availableQty = parseInt(selected.foodQuantity) || 0;
      const safeQuantity = Math.min(1, availableQty);
      
      setSelectedFood(selected);
      setQuantityError(''); // Clear any previous quantity errors
      
      // Calculate with delivery fee based on current location
      const subtotal = parseFloat(selected.foodPrice) * safeQuantity;
      const deliveryFee = calculateDeliveryFee(newOrder.deliveryLocation);
      const total = subtotal + deliveryFee;
      
      setNewOrder({
        ...newOrder,
        foodId: selected._id,
        foodName: selected.foodName,
        foodPrice: selected.foodPrice,
        foodImage: selected.foodImage || '',
        quantity: safeQuantity,
        totalPrice: total.toFixed(2)
      });
    } else {
      setSelectedFood(null);
      setQuantityError('');
      setNewOrder({
        ...newOrder,
        foodId: '',
        foodName: '',
        foodPrice: '',
        foodImage: '',
        totalPrice: '0.00'
      });
    }
  };

  const handleQuantityChange = (e) => {
    const requestedQuantity = parseInt(e.target.value) || 0;
    
    if (selectedFood) {
      const availableQty = parseInt(selectedFood.foodQuantity) || 0;
      
      // Check if requested quantity exceeds available quantity
      if (requestedQuantity > availableQty) {
        setQuantityError(`Only ${availableQty} available in inventory`);
      } else if (requestedQuantity <= 0) {
        setQuantityError('Quantity must be at least 1');
      } else {
        setQuantityError('');
      }
      
      // Calculate totals with delivery fee
      const subtotal = parseFloat(selectedFood.foodPrice) * requestedQuantity;
      const deliveryFee = calculateDeliveryFee(newOrder.deliveryLocation);
      const total = subtotal + deliveryFee;
      
      setNewOrder({
        ...newOrder,
        quantity: requestedQuantity,
        totalPrice: total.toFixed(2)
      });
    } else {
      setNewOrder({
        ...newOrder,
        quantity: Math.max(1, requestedQuantity)
      });
    }
  };
  
  const handleDeliveryLocationChange = (e) => {
    const location = e.target.value;
    const deliveryFee = calculateDeliveryFee(location);
    
    // Recalculate total price if food is selected
    if (selectedFood) {
      const subtotal = parseFloat(selectedFood.foodPrice) * newOrder.quantity;
      const total = subtotal + deliveryFee;
      
      setNewOrder({
        ...newOrder,
        deliveryLocation: location,
        totalPrice: total.toFixed(2)
      });
    } else {
      setNewOrder({
        ...newOrder,
        deliveryLocation: location
      });
    }
  };
  
  const calculateDeliveryFee = (location) => {
    switch(location) {
      case 'emaudo':
        return 500;
      case 'town':
        return 1000;
      case 'village':
        return 1500;
      case 'restaurant':
      default:
        return 0;
    }
  };
  
  const createOrder = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newOrder.buyerName || !newOrder.foodId || !newOrder.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check quantity validation
    if (quantityError) {
      toast.error('Please fix the quantity issues before submitting');
      return;
    }
    
    if (selectedFood && parseInt(newOrder.quantity) > parseInt(selectedFood.foodQuantity)) {
      toast.error(`Cannot order more than available quantity (${selectedFood.foodQuantity})`);
      return;
    }
    
    try {
      setIsCreatingOrder(true);
      
      // Ensure emails match if not set
      if (!newOrder.userEmail) {
        newOrder.userEmail = newOrder.email || 'walkin@guest.com';
      }
      
      // Calculate totals
      const subtotal = parseFloat(newOrder.foodPrice) * newOrder.quantity;
      const deliveryFee = calculateDeliveryFee(newOrder.deliveryLocation);
      
      // Create the order to send to the API
      const orderData = {
        ...newOrder,
        deliveryFee,
        itemsSubtotal: subtotal.toFixed(2),
        totalPrice: (subtotal + deliveryFee).toFixed(2)
      };
      
      const response = await fetch(`${API_URL}/admin/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      toast.success('Order created successfully!');
      resetForm();
      
    } catch (error) {
      toast.error(error.message || 'Error creating order');
    } finally {
      setIsCreatingOrder(false);
    }
  };
  
  const resetForm = () => {
    setNewOrder({
      buyerName: '',
      email: '',
      userEmail: '',
      phone: '',
      foodId: '',
      foodName: '',
      foodPrice: '',
      foodImage: '',
      quantity: 1,
      deliveryLocation: 'restaurant',
      fullAddress: '',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'preparing',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFood(null);
    setQuantityError('');
  };
  
  return (
    <>
      <Helmet>
        <title>Staff | Add New Order</title>
      </Helmet>
      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
            <p className="text-gray-600 text-sm mt-1">Add a new walk-in or phone order</p>
          </div>
          
          <form onSubmit={createOrder} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Information</h3>
                
                <div className="mb-4">
                  <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUser className="inline-block mr-1" /> Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="buyerName"
                    name="buyerName"
                    value={newOrder.buyerName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaPhone className="inline-block mr-1" /> Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newOrder.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaEnvelope className="inline-block mr-1" /> Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newOrder.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaMapMarkerAlt className="inline-block mr-1" /> Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="deliveryLocation"
                    name="deliveryLocation"
                    value={newOrder.deliveryLocation}
                    onChange={handleDeliveryLocationChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="restaurant">Restaurant (Dine-in)</option>
                    <option value="emaudo">Emaudo Campus (₦500)</option>
                    <option value="town">Town (₦1000)</option>
                    <option value="village">Village (₦1500)</option>
                  </select>
                </div>
                
                {newOrder.deliveryLocation !== 'restaurant' && (
                  <div className="mb-4">
                    <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      <FaMapMarkerAlt className="inline-block mr-1" /> Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="fullAddress"
                      name="fullAddress"
                      value={newOrder.fullAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    ></textarea>
                  </div>
                )}
              </div>
              
              {/* Order Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Order Details</h3>
                
                <div className="mb-4">
                  <label htmlFor="foodId" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUtensils className="inline-block mr-1" /> Food Item <span className="text-red-500">*</span>
                  </label>
                  {isLoadingFoods ? (
                    <div className="flex items-center justify-center h-10">
                      <FaSpinner className="animate-spin text-yellow-600" />
                    </div>
                  ) : (
                    <select
                      id="foodId"
                      name="foodId"
                      value={newOrder.foodId}
                      onChange={handleFoodSelect}
                      className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                      <option value="">Select a food item</option>
                      {availableFoods.map(food => (
                        <option 
                          key={food._id} 
                          value={food._id}
                          disabled={parseInt(food.foodQuantity) <= 0}
                        >
                          {food.foodName} - {formatPrice(food.foodPrice)} 
                          {parseInt(food.foodQuantity) <= 0 ? ' (Out of stock)' : 
                           parseInt(food.foodQuantity) <= 5 ? ' (Low stock)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                {selectedFood && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex gap-3">
                      {selectedFood.foodImage ? (
                        <img 
                          src={selectedFood.foodImage} 
                          alt={selectedFood.foodName} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                          <FaUtensils className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{selectedFood.foodName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{formatPrice(selectedFood.foodPrice)} per item</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {selectedFood.foodQuantity}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaShoppingCart className="inline-block mr-1" /> Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newOrder.quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    className={`w-full border rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                      quantityError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {quantityError && (
                    <p className="mt-1 text-sm text-red-600">{quantityError}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={newOrder.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="pos">POS</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      value={newOrder.paymentStatus}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newOrder.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="preparing">Preparing</option>
                    <option value="pending">Pending</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                
                {/* Order Summary */}
                {selectedFood && !quantityError && (
                  <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-2">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">
                          {selectedFood.foodName} x {newOrder.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice((parseFloat(selectedFood.foodPrice) * newOrder.quantity).toFixed(2))}
                        </span>
                      </div>
                      
                      {newOrder.deliveryLocation !== 'restaurant' && (
                        <div className="flex justify-between text-sm border-t border-yellow-200 pt-2">
                          <span className="text-gray-700">
                            Delivery Fee ({newOrder.deliveryLocation})
                          </span>
                          <span className="font-medium">
                            {formatPrice(calculateDeliveryFee(newOrder.deliveryLocation))}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-bold border-t border-yellow-200 pt-2 mt-2">
                        <span className="text-gray-900">Total</span>
                        <span>{formatPrice(newOrder.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingOrder || quantityError}
                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                      (isCreatingOrder || quantityError) ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isCreatingOrder ? (
                      <>
                        <FaSpinner className="inline-block animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default StaffAddOrder;