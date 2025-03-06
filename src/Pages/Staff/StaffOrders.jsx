import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaSearch, FaChevronDown, 
  FaMapMarkerAlt, FaCalendarAlt, FaHamburger, FaGlassMartini
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

const StaffOrders = () => {
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
  const [dateFilter, setDateFilter] = useState('');
  const [groupedOrders, setGroupedOrders] = useState([]);

  useEffect(() => {
    if (dateFilter) {
      setDateRange({ start: dateFilter, end: dateFilter });
      setCurrentPage(1);
    }
  }, [dateFilter]);
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupOrdersByReference = (ordersList) => {
    const groupedOrdersMap = {};
    
    ordersList.forEach(order => {
      const groupIdentifier = order.orderGroupId || order.orderReference || order._id;
      
      if (!groupedOrdersMap[groupIdentifier]) {
        groupedOrdersMap[groupIdentifier] = {
          items: [],
          orderReference: order.orderReference,
          orderGroupId: order.orderGroupId,
          buyerName: order.buyerName,
          userEmail: order.userEmail || order.email,
          phone: order.phone,
          createdAt: order.createdAt,
          status: order.status,
          paymentStatus: order.paymentStatus,
          deliveryLocation: order.deliveryLocation,
          fullAddress: order.fullAddress,
          deliveryFee: parseFloat(order.deliveryFee || 0),
          _id: groupIdentifier, 
          isBulkOrder: false,
          totalAmount: 0
        };
      }
      
      groupedOrdersMap[groupIdentifier].items.push(order);
      groupedOrdersMap[groupIdentifier].totalAmount += parseFloat(order.totalPrice || 0);
      
      if (groupedOrdersMap[groupIdentifier].items.length > 1) {
        groupedOrdersMap[groupIdentifier].isBulkOrder = true;
      }
    });
    
    // Calculate the grand total for each order group
    Object.values(groupedOrdersMap).forEach(group => {
      group.grandTotal = group.totalAmount + group.deliveryFee;
    });
    
    // Convert to array and sort
    return Object.values(groupedOrdersMap).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };
  
  // Helper function to get item type
  const getItemType = (order) => {
    if (order.foodId) return 'food';
    if (order.drinkId) return 'drink';
    return 'unknown';
  };
  
  // Helper function to get item name
  const getItemName = (order) => {
    if (order.foodName) return order.foodName;
    if (order.drinkName) return order.drinkName;
    return 'Unknown Item';
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/orders`, {
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
      
      const grouped = groupOrdersByReference(data.orders || []);

      setGroupedOrders(grouped);
    } catch (error) {
      setError(error.message || 'Error fetching orders');
      toast.error(error.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatuses = (currentStatus, paymentStatus) => {
    const orderStatusSequence = ['pending', 'preparing', 'ready', 'delivered'];
    
    if (currentStatus === 'cancelled') {
      return ['cancelled'];
    } 
    
    if (currentStatus === 'delivered') {
      return ['delivered'];
    }
    
    const currentIndex = orderStatusSequence.indexOf(currentStatus);
    const forwardStatuses = orderStatusSequence.slice(currentIndex);
    
    if (paymentStatus === 'paid') {
      return forwardStatuses;
    }
    
    return [...forwardStatuses, 'cancelled'];
  };
  
  const getAvailablePaymentStatuses = (currentPaymentStatus) => {
    const paymentStatusSequence = ['unpaid', 'processing', 'paid'];
    
    const currentIndex = paymentStatusSequence.indexOf(currentPaymentStatus);
    
    return paymentStatusSequence.slice(currentIndex);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      
      const orderGroup = groupedOrders.find(group => group._id === orderId);
      
      if (orderGroup && orderGroup.items && orderGroup.items.length > 0) {
        const updatePromises = orderGroup.items.map(async (item) => {
          const response = await fetch(`${API_URL}/staff/orders/${item._id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
          });
  
          if (!response.ok) {
            throw new Error(`Failed to update order item ${item._id}`);
          }
          return item._id;
        });
        
        await Promise.all(updatePromises);
        toast.success(`All items in order updated to ${status}`);
        
        setGroupedOrders(groupedOrders.map(group => 
          group._id === orderId ? { ...group, status } : group
        ));
        
      } else {
        const response = await fetch(`${API_URL}/staff/orders/${orderId}/status`, {
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
  
        toast.success(`Order status updated to ${status}`);
        
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
      }
      
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      setUpdatingPaymentId(orderId);
      
      const orderGroup = groupedOrders.find(group => group._id === orderId);
      
      if (orderGroup && orderGroup.items && orderGroup.items.length > 0) {
        const updatePromises = orderGroup.items.map(async (item) => {
          const response = await fetch(`${API_URL}/staff/orders/${item._id}/payment-status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentStatus })
          });
  
          if (!response.ok) {
            throw new Error(`Failed to update payment for item ${item._id}`);
          }
          return item._id;
        });
        
        await Promise.all(updatePromises);
        toast.success(`Payment status for all items updated to ${paymentStatus}`);
        
        setGroupedOrders(groupedOrders.map(group => {
          if (group._id === orderId) {
            const updatedGroup = { ...group, paymentStatus };
            
            if (paymentStatus === 'paid' && group.status === 'pending') {
              updatedGroup.status = 'preparing';
            }
            
            return updatedGroup;
          }
          return group;
        }));
        
      } else {
        const response = await fetch(`${API_URL}/staff/orders/${orderId}/payment-status`, {
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
        
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            const updatedOrder = { 
              ...order, 
              paymentStatus 
            };
            
            if (paymentStatus === 'paid' && order.status === 'pending') {
              updatedOrder.status = 'preparing';
            }
            
            return updatedOrder;
          }
          return order;
        }));
      }
      
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Error updating payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const filteredOrders = groupedOrders.filter(order => {
    const matchesSearch = 
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toString().includes(searchTerm) ||
      order.orderReference?.toLowerCase().includes(searchTerm.toLowerCase());
                        
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

  // Pagination logic remains the same
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
    setDateFilter('');
  };

  // Set today's date filter
  const filterTodayOrders = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDateFilter(today);
    toast.success("Filtered to show today's orders");
  };

  // Toggle order details on mobile
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  

  return (
    <>
      <Helmet>
        <title>Staff | Order Management</title>
      </Helmet>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or order ID..."
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
                className="w-full border rounded-lg px-4 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
          <button 
              onClick={filterTodayOrders}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center text-sm"
            >
              <FaCalendarAlt className="mr-2" /> Today's Orders
            </button>
            <button 
              onClick={resetFilters} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm"
            >
              Reset Filters
            </button>
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
            {/* Mobile Card View - Updated to show price breakdown */}
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
                      <div>
                        <p className="font-medium">
                          #{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}
                          {order.isBulkOrder && (
                            <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                              Bulk ({order.items.length})
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</p>
                        <span className="text-sm text-gray-500">{moment(order.createdAt).format('hh:mm A')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {capitalizeWords(order.status)}
                        </span>
                        <FaChevronDown className={`text-gray-400 transition-transform ${expandedOrder === order._id ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Order details (expandable) */}
                    {expandedOrder === order._id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700">Customer</h3>
                          <p className="text-sm">{order.buyerName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.userEmail || order.email}</p>
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        </div>
                        
                        {/* Order items */}
                        <div className="py-3">    
                            <div className="max-h-40 overflow-y-auto">
                              {order.items.map((item, idx) => (
                                <div key={`${item._id}-${idx}`} className="flex justify-between items-center mb-2">
                                  <span className="text-sm flex items-center">
                                    {getItemType(item) === 'food' ? 
                                      <FaHamburger className="text-yellow-600 mr-1" /> : 
                                      <FaGlassMartini className="text-blue-600 mr-1" />
                                    }
                                    <span className="ml-1">{getItemName(item)} x {item.quantity}</span>
                                  </span>
                                  <span className="text-sm">{formatPrice(item.totalPrice)}</span>
                                </div>
                              ))}
                            </div>
                        </div>
                        
                        {/* Delivery Info */}
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700 mb-1">Delivery Info</h3>
                          <div className="flex items-start space-x-2">
                            <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm">{capitalizeWords(order.deliveryLocation || 'Not specified')}</p>
                              <p className="text-xs text-gray-500">{order.fullAddress || 'No address provided'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price breakdown */}
                        <div className="py-3 border-t border-gray-100">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Items Subtotal:</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Delivery Fee:</span>
                            <span>{formatPrice(order.deliveryFee || 0)}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-2">
                            <span>Total:</span>
                            <span>{formatPrice(order.grandTotal)}</span>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="pt-3 border-t border-gray-100">
                          <h3 className="font-medium text-gray-700 mb-2">Update Order</h3>

                          <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Payment Status:</label>
                            <select
                              className={`w-full border border-gray-300 rounded px-3 py-2 text-sm ${
                                order.paymentStatus === 'paid' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                              }`}
                              value={order.paymentStatus || 'unpaid'}
                              onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                              disabled={updatingPaymentId === order._id || order.paymentStatus === 'paid'}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                            
                            {order.paymentStatus === 'paid' && (
                              <p className="text-xs text-gray-500 mt-1">
                                Payment already completed and cannot be changed, For any issue tell the Admin
                              </p>
                            )}
                            
                            {updatingPaymentId === order._id && (
                              <div className="flex items-center justify-center py-2">
                                <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                                <span className="text-sm">Updating...</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Order status dropdown */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Order Status:</label>
                            <select
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              disabled={updatingOrderId === order._id}
                            >
                              {getAvailableStatuses(order.status, order.paymentStatus).map(statusOption => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                </option>
                              ))}
                            </select>
                            
                            {updatingOrderId === order._id && (
                              <div className="flex items-center justify-center py-2">
                                <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                                <span className="text-sm">Updating...</span>
                              </div>
                            )}
                          </div>
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
                  maxPagesToShow={3}
                />
              )}
            </div>
            
            {/* Desktop Table View - Updated for proper pricing */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}
                            {order.isBulkOrder && (
                              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Bulk ({order.items.length})
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Customer info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.buyerName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.userEmail || order.email}</div>
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        </td>
                        
                        {/* Date column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</div>
                          <div className="text-xs text-gray-500">{moment(order.createdAt).format('hh:mm A')}</div>
                        </td>
                        
                        {/* Items column - updated for bulk orders */}
                        <td className="px-6 py-4">
                            <div>
                              <div className="max-h-100 overflow-y-auto text-xs space-y-1">
                                {order.items.slice(0, 10).map((item, idx) => (
                                  <div key={idx} className="flex items-center">
                                    {getItemType(item) === 'food' ? 
                                      <FaHamburger className="text-yellow-600 mr-1 text-xs" /> : 
                                      <FaGlassMartini className="text-blue-600 mr-1 text-xs" />
                                    }
                                    <span>{getItemName(item)} x{item.quantity}</span>
                                  </div>
                                ))}
                                {order.items.length > 10 && (
                                  <div className="text-gray-500">+{order.items.length - 3} more items</div>
                                )}
                              </div>
                            </div>
                        </td>
                        
                        {/* Order Total column*/}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 font-medium">
                              {formatPrice(order.grandTotal)}
                            </div>
                            <div className="text-xs text-gray-500 flex flex-col">
                              <span>Subtotal: {formatPrice(order.totalAmount || 0)}</span>
                              <span>Delivery: {formatPrice(order.deliveryFee || 0)}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Payment status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            value={order.paymentStatus || 'unpaid'}
                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                            disabled={updatingPaymentId === order._id}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                          </select>
                          {updatingPaymentId === order._id && (
                            <div className="mt-2 flex items-center">
                              <FaSpinner className="animate-spin text-yellow-600 mr-1 text-xs" />
                              <span className="text-xs text-gray-500">Updating</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Order status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updatingOrderId === order._id}
                          >
                            {getAvailableStatuses(order.status, order.paymentStatus).map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                            </option>
                          ))}
                          </select>
                          {updatingOrderId === order._id && (
                            <div className="mt-2 flex items-center">
                              <FaSpinner className="animate-spin text-yellow-600 mr-1 text-xs" />
                              <span className="text-xs text-gray-500">Updating</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Location info */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            {order.deliveryLocation && (
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {capitalizeWords(order.deliveryLocation)}
                              </div>
                            )}                            
                            <p className="text-xs text-gray-500">{order.fullAddress || 'No address provided'}</p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination*/}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200">
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
    </>
  );
};

export default StaffOrders;