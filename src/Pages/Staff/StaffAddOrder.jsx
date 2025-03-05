import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaShoppingCart, FaMapMarkerAlt, FaUser, 
  FaPhone, FaEnvelope, FaUtensils, FaSearch, 
  FaPlus, FaTrash, FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import { formatPrice } from '../../utils/formatUtils';
import Fuse from 'fuse.js';

const StaffAddOrder = () => {
  const [availableFoods, setAvailableFoods] = useState([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [fuse, setFuse] = useState(null);
  const searchRef = useRef(null);
  const [newOrder, setNewOrder] = useState({
    buyerName: '',
    email: '',
    userEmail: '',
    phone: '',
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

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Initialize Fuse.js when foods are loaded
  useEffect(() => {
    if (availableFoods.length > 0) {
      const fuseOptions = {
        includeScore: true,
        threshold: 0.4,
        keys: [
          { name: 'foodName', weight: 0.7 },
          { name: 'foodCategory', weight: 0.3 },
          { name: 'foodDescription', weight: 0.2 }
        ]
      };
      setFuse(new Fuse(availableFoods, fuseOptions));
    }
  }, [availableFoods]);
  
  useEffect(() => {
    if (searchQuery && fuse) {
      const results = fuse.search(searchQuery)
        .map(result => result.item)
        .filter(food => parseInt(food.foodQuantity) > 0)
        .slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fuse]);
  
  const fetchAvailableFoods = async () => {
    try {
      setIsLoadingFoods(true);
      const response = await fetch(`${API_URL}/staff/foods`, {
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

  const handleFoodSelect = (food) => {
    if (!food) return;
    
    const availableQty = parseInt(food.foodQuantity) || 0;
    if (availableQty <= 0) {
      toast.error(`${food.foodName} is out of stock`);
      return;
    }
    
    // Create a new order item
    const newOrderItem = {
      id: Date.now(),
      foodId: food._id,
      foodName: food.foodName,
      foodPrice: food.foodPrice,
      foodImage: food.foodImage || '',
      quantity: 1,
      totalPrice: parseFloat(food.foodPrice),
      foodCategory: food.foodCategory,
      maxQuantity: availableQty
    };
    
    setSelectedFoods([...selectedFoods, newOrderItem]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedFoods = selectedFoods.map(item => {
      if (item.id === itemId) {
        const quantity = Math.min(Math.max(1, parseInt(newQuantity) || 1), item.maxQuantity);
        const error = quantity > item.maxQuantity ? 
          `Maximum available: ${item.maxQuantity}` : '';
        
        setQuantityErrors({
          ...quantityErrors,
          [itemId]: error
        });
        
        return {
          ...item,
          quantity,
          totalPrice: parseFloat(item.foodPrice) * quantity
        };
      }
      return item;
    });
    
    setSelectedFoods(updatedFoods);
  };
  
  const handleRemoveItem = (itemId) => {
    setSelectedFoods(selectedFoods.filter(item => item.id !== itemId));
    
    const newErrors = { ...quantityErrors };
    delete newErrors[itemId];
    setQuantityErrors(newErrors);
  };
  
  const handleDeliveryLocationChange = (e) => {
    setNewOrder({
      ...newOrder,
      deliveryLocation: e.target.value
    });
  };
  
  const calculateDeliveryFee = (location) => {
    switch(location) {
      case 'emaudo':
        return 500;
      case 'town':
        return 1000;
      case 'village':
        return 1500;
      case 'irrua':
        return 2500;
      case 'benin':
        return 10000;
      case 'auchi':
        return 10000;
      case 'nightEmaudo':
        return 700;
      case 'nightTown':
        return 1200;
      case 'nightVillage':
        return 1700;
      case 'nightIrrua':
        return 3000;
      case 'restaurant':
      default:
        return 0;
    }
  };
  
  const calculateOrderTotal = () => {
    const subtotal = selectedFoods.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = calculateDeliveryFee(newOrder.deliveryLocation);
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    };
  };
  
  const createOrder = async (e) => {
    e.preventDefault();
    
    if (!newOrder.buyerName || !newOrder.phone) {
      toast.error('Please fill in all required customer information');
      return;
    }
    
    if (selectedFoods.length === 0) {
      toast.error('Please add at least one food item to the order');
      return;
    }
    
    if (Object.keys(quantityErrors).some(key => quantityErrors[key])) {
      toast.error('Please fix quantity errors before submitting');
      return;
    }
    
    try {
      setIsCreatingOrder(true);
      const { subtotal, deliveryFee, total } = calculateOrderTotal();
      
      if (!newOrder.userEmail) {
        newOrder.userEmail = newOrder.email || 'walkin@guest.com';
      }
      
      if (selectedFoods.length === 1) {
        const singleItem = selectedFoods[0];
        
        const orderData = {
          ...newOrder,
          foodId: singleItem.foodId,
          foodName: singleItem.foodName,
          foodPrice: singleItem.foodPrice,
          foodImage: singleItem.foodImage,
          quantity: singleItem.quantity,
          totalPrice: singleItem.totalPrice,
          itemsSubtotal: subtotal.toFixed(2),
          deliveryFee,
          grandTotal: total.toFixed(2)
        };
        
        const response = await fetch(`${API_URL}/staff/create-order`, {
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
      } else {
        const bulkOrderData = {
          items: selectedFoods.map(item => ({
            foodId: item.foodId,
            foodName: item.foodName,
            quantity: item.quantity,
            price: item.foodPrice,
            totalPrice: item.totalPrice,
            foodImage: item.foodImage
          })),
          deliveryLocation: newOrder.deliveryLocation,
          deliveryFee,
          fullAddress: newOrder.fullAddress || (newOrder.deliveryLocation === 'restaurant' ? 'Dining at restaurant' : 'Address not provided'),
          subtotal: subtotal.toFixed(2),
          total: total.toFixed(2),
          paymentMethod: newOrder.paymentMethod,
          paymentStatus: newOrder.paymentStatus,
          buyerName: newOrder.buyerName,
          email: newOrder.email || 'walkin@guest.com',
          userEmail: newOrder.userEmail || newOrder.email || 'walkin@guest.com',
          phone: newOrder.phone,
          date: newOrder.date,
          status: newOrder.status,
          createdBy: 'staff',
        };
        
        const response = await fetch(`${API_URL}/bulk-order`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bulkOrderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create bulk order');
        }

        toast.success(`Order with ${selectedFoods.length} items created successfully!`);
      }
      
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
      deliveryLocation: 'restaurant',
      fullAddress: '',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      status: 'preparing',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFoods([]);
    setQuantityErrors({});
    setSearchQuery('');
  };
  
  // Calculate order totals
  const { subtotal, deliveryFee, total } = calculateOrderTotal();
  
  return (
    <>
      <Helmet>
        <title>Staff | Add New Order</title>
      </Helmet>
      <div className="container mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Create New Order</h2>
            <p className="text-gray-600 text-sm mt-1">Add a new walk-in or phone order</p>
          </div>
          
          <form onSubmit={createOrder} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="emaudo">Emaudo (₦500)</option>
                    <option value="town">Town (₦1000)</option>
                    <option value="irrua">Irrua (₦2500)</option>
                    <option value="village">Village (₦1500)</option>
                    <option value="nightEmaudo">Night Emaudo Delivery(₦700)</option>
                    <option value="nightTown">Night Town Delivery (₦1200)</option>
                    <option value="nightVillage">Night Village Delivery(₦1700)</option>
                    <option value="nightIrrua">Night Irrua Delivery(₦3000)</option>
                    <option value="auchi">Auchi(₦10000)</option>
                    <option value="benin">Benin(₦1000)</option>
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
                
                {/* Food search and selection */}
                <div className="mb-6 relative" ref={searchRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUtensils className="inline-block mr-1" /> Add Food Items <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <div className="flex">
                      <div className="relative flex-grow">
                        <input 
                          type="text" 
                          value={searchQuery} 
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchResults(e.target.value.length > 0);
                          }}
                          onClick={() => {
                            if (searchQuery) setShowSearchResults(true);
                          }}
                          placeholder="Search for food items..." 
                          className="w-full border border-gray-300 rounded-l-md shadow-sm px-4 py-2 pr-10 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        {searchQuery && (
                          <button 
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => {
                              setSearchQuery('');
                              setShowSearchResults(false);
                            }}
                          >
                            <FaTimes size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                      >
                        <FaSearch />
                      </button>
                    </div>
                    
                    {/* Search results dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg rounded-md max-h-60 overflow-y-auto">
                        {searchResults.map(food => (
                          <div 
                            key={food._id}
                            onClick={() => handleFoodSelect(food)}
                            className="flex items-center p-3 cursor-pointer hover:bg-yellow-50 border-b border-gray-100"
                          >
                            {food.foodImage ? (
                              <img src={food.foodImage} alt={food.foodName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaUtensils className="text-gray-500" />
                              </div>
                            )}
                            <div className="ml-3">
                              <h4 className="font-medium">{food.foodName}</h4>
                              <div className="flex text-xs text-gray-500">
                                <span className="mr-4">{formatPrice(food.foodPrice)}</span>
                                <span>Available: {food.foodQuantity}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showSearchResults && searchQuery && searchResults.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg rounded-md p-3">
                        <p className="text-gray-500">No matching food items found</p>
                      </div>
                    )}
                  </div>
                  
                  {isLoadingFoods ? (
                    <div className="text-center py-4">
                      <FaSpinner className="animate-spin mx-auto text-yellow-600" />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mt-2">
                      {availableFoods.length > 0 ? (
                        <span>Tip: Search by name or category from {availableFoods.length} available items</span>
                      ) : (
                        <span>No food items available</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected food items */}
                {selectedFoods.length > 0 && (
                  <div className="mb-6 border rounded-md divide-y">
                    {selectedFoods.map((item, index) => (
                      <div key={item.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {item.foodImage ? (
                              <img src={item.foodImage} alt={item.foodName} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <FaUtensils className="text-gray-500" />
                              </div>
                            )}
                            <div className="ml-3">
                              <h4 className="font-medium">{item.foodName}</h4>
                              <span className="text-xs text-gray-500">
                                {item.foodCategory} • {formatPrice(item.foodPrice)} each
                              </span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700 mr-2">Quantity:</span>
                            <div className="flex border border-gray-300 rounded">
                              <button 
                                type="button"
                                className="px-2 py-1 bg-gray-50"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >-</button>
                              <input
                                type="number"
                                min="1"
                                max={item.maxQuantity}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                className="w-12 text-center border-x border-gray-300"
                              />
                              <button 
                                type="button"
                                className="px-2 py-1 bg-gray-50"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >+</button>
                            </div>
                            <span className="text-xs ml-2 text-gray-500">(Max: {item.maxQuantity})</span>
                          </div>
                          <div className="font-medium">
                            {formatPrice(item.totalPrice)}
                          </div>
                        </div>
                        
                        {quantityErrors[item.id] && (
                          <p className="text-red-500 text-xs mt-1">{quantityErrors[item.id]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add a "Add Another Item" button by searching and clicking */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedFoods.length === 0 ? 'Search and add food items to the order' : 'You can add more items to this order'}
                  </p>
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
                {selectedFoods.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-md mb-6 border border-yellow-100">
                    <h4 className="font-medium text-yellow-800 mb-2">Order Summary ({selectedFoods.length} {selectedFoods.length === 1 ? 'item' : 'items'})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                      {selectedFoods.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.foodName} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between text-sm border-t border-yellow-200 pt-2">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm border-t border-yellow-200 pt-2">
                        <span className="text-gray-700">
                          Delivery Fee ({newOrder.deliveryLocation})
                        </span>
                        <span className="font-medium">{formatPrice(deliveryFee)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold border-t border-yellow-200 pt-2 mt-2">
                      <span className="text-gray-900">Total</span>
                      <span>{formatPrice(total)}</span>
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
                    disabled={isCreatingOrder || selectedFoods.length === 0 || Object.keys(quantityErrors).some(key => quantityErrors[key])}
                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                      (isCreatingOrder || selectedFoods.length === 0 || Object.keys(quantityErrors).some(key => quantityErrors[key])) ? 'opacity-70 cursor-not-allowed' : ''
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