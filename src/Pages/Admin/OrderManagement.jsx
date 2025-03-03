import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaSpinner, FaSearch, FaFilter, FaChevronDown, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import moment from 'moment';
import { formatPrice, capitalizeWords } from '../../utils/formatUtils';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
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
    paymentMethod: 'whatsapp',
    paymentStatus: 'paid',
    status: 'preparing',
    date: new Date().toISOString().split('T')[0]
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState(false);
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (showAddOrderModal) {
      fetchAvailableFoods();
    }
  }, [showAddOrderModal]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message || 'Error fetching orders');
      toast.error(error.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

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

  const updateOrderStatus = async (orderId, status, showToast = true) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      if (showToast) {
        toast.success(`Order status updated to ${status}`);
      }
      
      if (showToast) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      toast.error(error.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setUpdatingPaymentId(orderId);
      const response = await fetch(`${API_URL}/admin/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      toast.success(`Payment status updated to ${paymentStatus}`);
      
      // Update local state
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          const updatedOrder = { 
            ...order, 
            paymentStatus 
          };
          
          if (paymentStatus === 'paid' && order.status === 'pending') {
            updatedOrder.status = 'preparing';
            updateOrderStatus(orderId, 'preparing', false);
          }
          
          return updatedOrder;
        }
        return order;
      }));
    } catch (error) {
      toast.error(error.message || 'Error updating payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleOrderInputChange = (e) => {
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
      const availableQty = parseInt(selected.foodQuantity) || 0;
      const safeQuantity = Math.min(1, availableQty);
      
      setSelectedFood(selected);
      setQuantityError('');
      
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
      
      if (requestedQuantity > availableQty) {
        setQuantityError(`Only ${availableQty} available in inventory`);
      } else if (requestedQuantity <= 0) {
        setQuantityError('Quantity must be at least 1');
      } else {
        setQuantityError('');
      }
      
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

  const handleDeliveryLocationChange = (e) => {
    const location = e.target.value;
    const deliveryFee = calculateDeliveryFee(location);
    
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

  const createOrder = async (e) => {
    e.preventDefault();
    
    if (!newOrder.buyerName || !newOrder.foodId || !newOrder.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
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
      
      if (!newOrder.userEmail) {
        newOrder.userEmail = newOrder.email;
      }
      
      const subtotal = parseFloat(newOrder.foodPrice) * newOrder.quantity;
      let deliveryFee = 0;
      
      if (newOrder.deliveryLocation === 'emaudo') {
        deliveryFee = 500;
      } else if (newOrder.deliveryLocation === 'town') {
        deliveryFee = 1000;
      } else if (newOrder.deliveryLocation === 'restaurant') {
        deliveryFee = 0;
      } else if (newOrder.deliveryLocation === 'village') {
        deliveryFee = 1500;
      }
      
      const orderData = {
        ...newOrder,
        deliveryFee,
        itemsSubtotal: subtotal.toFixed(2),
        totalPrice: (subtotal + deliveryFee).toFixed(2),
        createdAt: new Date()
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
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      setOrders([result.order, ...orders]);
      
      toast.success('Order created successfully!');
      setShowAddOrderModal(false);
      resetNewOrderForm();
      
    } catch (error) {
      toast.error(error.message || 'Error creating order');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const resetNewOrderForm = () => {
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
      paymentMethod: 'whatsapp',
      paymentStatus: 'paid',
      status: 'preparing',
      date: new Date().toISOString().split('T')[0]
    });
    setSelectedFood(null);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order._id?.toString().includes(searchTerm);
                        
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    const matchesPaymentStatus = paymentStatusFilter ? order.paymentStatus === paymentStatusFilter : true;
    
    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const orderDate = moment(order.createdAt);
      
      if (dateRange.start && dateRange.end) {
        matchesDate = orderDate.isBetween(dateRange.start, dateRange.end, 'day', '[]');
      } else if (dateRange.start) {
        matchesDate = orderDate.isSameOrAfter(dateRange.start, 'day');
      } else if (dateRange.end) {
        matchesDate = orderDate.isSameOrBefore(dateRange.end, 'day');
      }
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDate;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  };

  // Toggle order details on mobile
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(prevOrders => 
        prevOrders.filter(order => order._id !== orderId)
      );

      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order: ' + error.message);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const confirmDelete = (order) => {
    setDeleteConfirmation(order);
  };

  // Delete all orders
  const deleteAllOrders = async () => {
    try {
      setIsDeletingAll(true);
      const response = await fetch(`${API_URL}/admin/orders`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete all orders');
      }

      const data = await response.json();
      setOrders([]);
      toast.success(`${data.deletedCount || 'All'} orders deleted successfully`);
    } catch (error) {
      console.error('Error deleting all orders:', error);
      toast.error('Failed to delete all orders: ' + error.message);
    } finally {
      setIsDeletingAll(false);
      setDeleteAllConfirmation(false);
    }
  };

  const confirmDeleteAll = () => {
    setDeleteAllConfirmation(true);
  };

  return (
    <>
      <Helmet>
        <title>Admin | Order Management</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Order Management</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddOrderModal(true)} 
              className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-2 py-2 flex items-center"
            >
              Add Order
            </button>
            {orders.length > 0 && (
              <button 
                onClick={confirmDeleteAll} 
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center"
                disabled={isDeletingAll}
              >
                {isDeletingAll ? (
                  <FaSpinner className="animate-spin mr-1" />
                ) : (
                  <FaTrash className="mr-1"/>
                )}
                Delete All
              </button>
            )}
            <button 
              onClick={resetFilters} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Search and Filters - make them stacked on mobile */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by email, name, or order ID..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div>
              <select
                className="w-full border rounded-lg px-4 py-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <select
                className="w-full border rounded-lg px-4 py-2 bg-white"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                placeholder="Start Date"
                className="w-full border rounded-lg px-4 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
              <input
                type="date"
                placeholder="End Date"
                className="w-full border rounded-lg px-4 py-2"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {currentItems.length === 0 ? (
                <div className="bg-white p-4 text-center text-gray-500 rounded-lg shadow">
                  No orders found
                </div>
              ) : (
                currentItems.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Order header */}
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <div>
                        <p className="font-medium">#{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {capitalizeWords(order.status)}
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                          ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {capitalizeWords(order.paymentStatus)}
                        </span>
                        <FaChevronDown className={`text-gray-400 transition-transform ${expandedOrder === order._id ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Order details (expandable) */}
                    {expandedOrder === order._id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        {/* Customer info */}
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700">Customer</h3>
                          <p className="text-sm">{order.buyerName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.userEmail}</p>
                        </div>
                        
                        {/* Order items */}
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          <div className="py-3">
                            <h3 className="font-medium text-gray-700 mb-2">Items</h3>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    {item.foodImage && (
                                      <img 
                                        src={item.foodImage} 
                                        alt={item.foodName} 
                                        className="w-8 h-8 rounded object-cover mr-2"
                                      />
                                    )}
                                    <span className="text-sm">{item.foodName} x {item.quantity}</span>
                                  </div>
                                  <span className="text-sm font-medium">{formatPrice(item.totalPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-3">
                            <h3 className="font-medium text-gray-700 mb-2">Item</h3>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{order.foodName} x {order.quantity}</span>
                              <span className="text-sm font-medium">{formatPrice(order.totalPrice)}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Delivery information */}
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700 mb-1">Delivery Info</h3>
                          <div className="flex items-start space-x-2">
                            <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm">{capitalizeWords(order.deliveryLocation || 'Not specified')}</p>
                              <p className="text-xs text-gray-500">{order.fullAddress || 'No address provided'}</p>
                            </div>
                          </div>
                          {order.phone && (
                            <div className="flex items-center space-x-2 mt-1">
                              <FaPhoneAlt className="text-gray-400 flex-shrink-0" />
                              <p className="text-sm">{order.phone}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Price details */}
                        <div className="py-3 border-t border-gray-100">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Items Subtotal:</span>
                            <span>{formatPrice(order.itemsSubtotal || (order.foodPrice * order.quantity) || order.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Delivery Fee:</span>
                            <span>{formatPrice(order.deliveryFee || 0)}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-2">
                            <span>Total:</span>
                            <span>{formatPrice(order.total || order.totalPrice)}</span>
                          </div>
                        </div>
                        
                        {/* Action buttons with better touch targets */}
                        <div className="pt-3 border-t border-gray-100">
                          <h3 className="font-medium text-gray-700 mb-2">Update Order</h3>
                          
                          {updatingPaymentId === order._id ? (
                            <div className="flex items-center justify-center py-2">
                              <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                              <span className="text-sm">Updating payment...</span>
                            </div>
                          ) : (
                            <div className="mb-3">
                              <label className="block text-sm text-gray-600 mb-1">Payment Status:</label>
                              <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                                value={order.paymentStatus || 'unpaid'}
                                onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                              >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                              </select>
                            </div>
                          )}
                          
                          {updatingOrderId === order._id ? (
                            <div className="flex items-center justify-center py-2">
                              <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                              <span className="text-sm">Updating status...</span>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Order Status:</label>
                              <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(order);
                              }}
                              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              <FaTrash className="mr-2" /> Delete Order
                            </button>
                          </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Mobile pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded ${
                      currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Prev
                  </button>
                  <span className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded ${
                      currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            
            {/* Desktop Table View - keep the existing table */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.buyerName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(order.createdAt).format('MMM DD, YYYY hh:mm A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(order.totalPrice)}</div>
                          <div className="text-xs text-gray-500">
                            Items: {formatPrice(order.itemsSubtotal || (order.foodPrice * order.quantity))}
                          </div>
                          <div className="text-xs text-gray-500">
                            Delivery: {formatPrice(order.deliveryFee || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {capitalizeWords(order.deliveryLocation || 'Not specified')}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate" title={order.fullAddress}>
                            {order.fullAddress || 'No address provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {updatingOrderId === order._id ? (
                            <div className="flex items-center">
                              <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                              <span className="text-sm text-gray-500">Updating...</span>
                            </div>
                          ) : (
                            <>
                              <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white mr-2"
                                value={order.paymentStatus || 'unpaid'}
                                onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                disabled={updatingPaymentId === order._id}
                              >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                              </select>
                              <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <button
                                onClick={() => confirmDelete(order)}
                                className="text-red-500 hover:text-red-700 ml-2"
                                title="Delete Order"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-white flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredOrders.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredOrders.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === i + 1
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            } text-sm font-medium`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Manual Order</h3>
                <button 
                  onClick={() => setShowAddOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={createOrder} className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-3">Customer Information</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="buyerName" className="block text-sm text-gray-600 mb-1">
                      Customer Name* <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="buyerName"
                      name="buyerName"
                      value={newOrder.buyerName}
                      onChange={handleOrderInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Customer's full name"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newOrder.email}
                      onChange={handleOrderInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Optional: Customer's email address"
                    />
                    <span className="text-xs text-gray-500">Optional - for receipt and notifications</span>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="block text-sm text-gray-600 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={newOrder.phone}
                      onChange={handleOrderInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Customer's phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Order Details</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="foodId" className="block text-sm text-gray-600 mb-1">
                      Food Item <span className="text-red-500">*</span>
                    </label>
                    {isLoadingFoods ? (
                      <div className="flex items-center text-gray-500">
                        <FaSpinner className="animate-spin mr-2" /> Loading food items...
                      </div>
                    ) : (
                      <select
                        id="foodId"
                        name="foodId"
                        value={newOrder.foodId}
                        onChange={handleFoodSelect}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      >
                        <option value="">-- Select a food item --</option>
                        {availableFoods.map(food => (
                          <option key={food._id} value={food._id} disabled={parseInt(food.foodQuantity) <= 0}>
                            {food.foodName} - {formatPrice(parseFloat(food.foodPrice))}
                            {parseInt(food.foodQuantity) <= 0 ? ' (Out of stock)' : ` (${food.foodQuantity} available)`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="quantity" className="block text-sm text-gray-600 mb-1">
                      Quantity <span className="text-red-500">*</span>
                      {selectedFood && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Available: {selectedFood.foodQuantity})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={newOrder.quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={selectedFood ? selectedFood.foodQuantity : undefined}
                      className={`w-full border ${
                        quantityError ? 'border-red-500' : 'border-gray-300'
                      } rounded px-3 py-2 text-sm`}
                      required
                    />
                    {quantityError && (
                      <p className="text-red-500 text-xs mt-1">{quantityError}</p>
                    )}
                  </div>
                  
                  {selectedFood && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Item Subtotal:</span>
                        <span>{formatPrice(parseFloat(selectedFood.foodPrice) * newOrder.quantity)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span>{formatPrice(calculateDeliveryFee(newOrder.deliveryLocation))}</span>
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center font-medium">
                        <span>Total:</span>
                        <span>{formatPrice(parseFloat(newOrder.totalPrice))}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-3">Delivery Information</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="deliveryLocation" className="block text-sm text-gray-600 mb-1">
                      Delivery Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="deliveryLocation"
                      name="deliveryLocation"
                      value={newOrder.deliveryLocation}
                      onChange={handleDeliveryLocationChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    >
                      <option value="restaurant">Restaurant (Dine-in)</option>
                      <option value="emaudo">Emaudo Campus (₦500)</option>
                      <option value="town">Town (₦1000)</option>
                      <option value="village">Village (₦1500)</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="fullAddress" className="block text-sm text-gray-600 mb-1">
                      Full Address
                      {newOrder.deliveryLocation !== 'restaurant' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <textarea
                      id="fullAddress"
                      name="fullAddress"
                      value={newOrder.fullAddress}
                      onChange={handleOrderInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder={newOrder.deliveryLocation === 'restaurant' ? 
                        "Optional for dine-in orders" : 
                        "Detailed delivery address"
                      }
                      required={newOrder.deliveryLocation !== 'restaurant'}
                    />
                    {newOrder.deliveryLocation === 'restaurant' && (
                      <span className="text-xs text-gray-500">Optional for restaurant dine-in</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Payment Information</h4>
                  
                  <div className="mb-3">
                    <label htmlFor="paymentMethod" className="block text-sm text-gray-600 mb-1">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={newOrder.paymentMethod}
                      onChange={handleOrderInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="cash">Cash (In Person/POS)</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="paymentStatus" className="block text-sm text-gray-600 mb-1">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentStatus"
                      name="paymentStatus"
                      value={newOrder.paymentStatus}
                      onChange={handleOrderInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  
                    <div className="mb-3">
                      <label htmlFor="status" className="block text-sm text-gray-600 mb-1">
                        Order Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={newOrder.status}
                        onChange={handleOrderInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
  
                <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddOrderModal(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingOrder || !!quantityError || (selectedFood && parseInt(newOrder.quantity) > parseInt(selectedFood.foodQuantity))}
                    className={`px-4 py-2 text-sm ${
                      isCreatingOrder || quantityError || (selectedFood && parseInt(newOrder.quantity) > parseInt(selectedFood.foodQuantity))
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white rounded-lg flex items-center`}
                  >
                    {isCreatingOrder ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Creating Order...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Delete All Orders</h3>
                <button 
                  onClick={() => setDeleteAllConfirmation(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center text-red-600 mb-4">
                <FaExclamationTriangle className="text-2xl mr-3" />
                <div>
                  <h4 className="font-bold text-lg">Warning: Permanent Action</h4>
                  <p className="text-gray-700">This will delete ALL orders permanently.</p>
                </div>
              </div>
              
              <p className="mb-4 text-gray-700">Are you absolutely sure you want to delete all {orders.length} orders? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteAllConfirmation(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteAllOrders}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
                  disabled={isDeletingAll}
                >
                  {isDeletingAll ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" /> Yes, Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5">
              <p>Are you sure you want to delete this order?</p>
              <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteOrder(deleteConfirmation._id)}
                  className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderManagement;