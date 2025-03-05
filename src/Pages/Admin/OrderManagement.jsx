import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaSearch, FaFilter, FaChevronDown, FaPhoneAlt, FaMapMarkerAlt, 
  FaCalendarAlt, FaTrash, FaExclamationTriangle, FaHamburger, FaGlassMartini,
  FaSortAmountDown, FaSortAmountUpAlt, FaClock
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import moment from 'moment';
import { formatPrice, capitalizeWords } from '../../utils/formatUtils';
import Pagination from '../../Components/Pagination';

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
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc'); // default to newest first
  const [itemTypeFilter, setItemTypeFilter] = useState(''); // '', 'food', or 'drink'
  const [stats, setStats] = useState({ foodCount: 0, drinkCount: 0, mixedCount: 0 });
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, [sortDirection, itemTypeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      queryParams.append('sort', sortDirection);
      
      if (itemTypeFilter) {
        queryParams.append('itemType', itemTypeFilter);
      }
      
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      if (paymentStatusFilter) {
        queryParams.append('payment', paymentStatusFilter);
      }
      
      if (dateRange.start) queryParams.append('dateStart', dateRange.start);
      if (dateRange.end) queryParams.append('dateEnd', dateRange.end);
      
      const response = await fetch(`${API_URL}/admin/orders?${queryParams.toString()}`, {
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
      setStats(data.stats || { foodCount: 0, drinkCount: 0, mixedCount: 0 });
    } catch (error) {
      setError(error.message || 'Error fetching orders');
      toast.error(error.message || 'Error fetching orders');
    } finally {
      setLoading(false);
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

  // Item helper functions
  const getItemName = (order) => {
    if (order.foodName) return order.foodName;
    if (order.drinkName) return order.drinkName;
    return 'Unknown Item';
  };
  
  const getItemImage = (order) => {
    if (order.foodImage) return order.foodImage;
    if (order.drinkImage) return order.drinkImage;
    return null;
  };
  
  const getItemPrice = (order) => {
    if (order.foodPrice) return order.foodPrice;
    if (order.drinkPrice) return order.drinkPrice;
    return 0;
  };
  
  const getOrderType = (order) => {
    const hasFood = !!order.foodId || !!order.foodName;
    const hasDrink = !!order.drinkId || !!order.drinkName;
    
    if (hasFood && hasDrink) return 'mixed';
    if (hasFood) return 'food';
    if (hasDrink) return 'drink';
    return 'unknown';
  };
  
  const getOrderTypeIcon = (order) => {
    const type = getOrderType(order);
    
    switch(type) {
      case 'food':
        return <FaHamburger className="text-yellow-600" />;
      case 'drink':
        return <FaGlassMartini className="text-blue-600" />;
      case 'mixed':
        return (
          <div className="flex">
            <FaHamburger className="text-yellow-600 mr-1" />
            <FaGlassMartini className="text-blue-600" />
          </div>
        );
      default:
        return null;
    }
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
    setItemTypeFilter('');
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
      
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle item type filter change
  const handleItemTypeFilterChange = (e) => {
    setItemTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  // Filter recent orders (24 hours)
  const filterRecentOrders = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const formattedDate = yesterday.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    setDateRange({
      start: formattedDate,
      end: today
    });
    
    setCurrentPage(1);
    toast.success("Filtered to show orders from the past 24 hours");
  };

  // Filter today's orders
  const filterTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setDateRange({
      start: today,
      end: today
    });
    
    setCurrentPage(1);
    toast.success("Filtered to show today's orders");
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
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            {/* Item type filter */}
            <div>
              <select
                className="w-full border rounded-lg px-4 py-2 bg-white"
                value={itemTypeFilter}
                onChange={handleItemTypeFilterChange}
              >
                <option value="">All Items</option>
                <option value="food">Food Only</option>
                <option value="drink">Drinks Only</option>
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
          
          <div className="flex justify-between mt-4">
            <div>
              <button 
                onClick={toggleSortDirection} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm flex items-center mr-2"
                title={sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
              >
                {sortDirection === 'desc' ? (
                  <>
                    <FaSortAmountDown className="mr-2" /> Newest First
                  </>
                ) : (
                  <>
                    <FaSortAmountUpAlt className="mr-2" /> Oldest First
                  </>
                )}
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={filterRecentOrders}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded flex items-center text-sm"
              >
                <FaClock className="mr-2" /> Last 24 Hours
              </button>
              <button 
                onClick={filterTodayOrders}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center text-sm"
              >
                <FaCalendarAlt className="mr-2" /> Today's Orders
              </button>
              <button 
                onClick={resetFilters} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm flex items-center"
              >
                <FaFilter className="mr-2" /> Reset Filters
              </button>
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
                    <div 
                      className="p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <div className="flex items-center">
                        {getOrderTypeIcon(order)}
                        <div className="ml-2">
                          <p className="font-medium">#{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}</p>
                          <p className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</p>
                        </div>
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
                    
                    {/* Mobile expanded view - keep existing with modifications for food/drink */}
                    {expandedOrder === order._id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
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
                                    {item.type === 'food' ? (
                                      <FaHamburger className="text-yellow-600 mr-2 flex-shrink-0" />
                                    ) : (
                                      <FaGlassMartini className="text-blue-600 mr-2 flex-shrink-0" />
                                    )}
                                    {item.image && (
                                      <img 
                                        src={item.image} 
                                        alt={item.itemName} 
                                        className="w-8 h-8 rounded object-cover mr-2"
                                      />
                                    )}
                                    <span className="text-sm">{item.itemName} x {item.quantity}</span>
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
                              {getOrderTypeIcon(order)}
                              <span className="text-sm ml-2">{getItemName(order)} x {order.quantity}</span>
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
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredOrders.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={paginate}
                  maxPagesToShow={3} // Use fewer pages on mobile for better fit
                />
              )}
            </div>
            
            {/* Desktop Table View - update for food/drink */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
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
                      <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          #{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.buyerName || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{order.userEmail || order.email}</div>
                        </td>
                        {/* Update Order items */}
                        <td className="px-6 py-4">
                          {Array.isArray(order.items) && order.items.length > 1 ? (
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center">
                                  {item.type === 'food' ? (
                                    <FaHamburger className="text-yellow-600 mr-2 flex-shrink-0" />
                                  ) : (
                                    <FaGlassMartini className="text-blue-600 mr-2 flex-shrink-0" />
                                  )}
                                  {item.image && (
                                    <img 
                                      src={item.image} 
                                      alt={item.itemName} 
                                      className="w-8 h-8 rounded object-cover mr-2"
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-medium">{item.itemName}</div>
                                    <div className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              {getOrderTypeIcon(order)}
                              <div className="ml-2">
                                <div className="text-sm font-medium">{getItemName(order)}</div>
                                <div className="text-xs text-gray-500">Qty: {order.quantity} × {formatPrice(getItemPrice(order))}</div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(order.createdAt).format('MMM DD, YYYY hh:mm A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(order.totalPrice)}</div>
                          <div className="text-xs text-gray-500">
                            {Array.isArray(order.items) ? 'Multiple items' : 'Single item'}
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
                <div className="px-6 py-3 bg-white border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of{" "}
                        <span className="font-medium">{filteredOrders.length}</span> results
                      </p>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredOrders.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={paginate}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
              
              <div className="flex justify-end space-x-3 mt-6 border-t border-gray-200 pt-4"></div>
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