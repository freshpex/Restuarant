import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaSearch, FaChevronDown, FaFilter, 
  FaMapMarkerAlt, FaCalendarAlt, FaSortAmountDown, 
  FaSortAmountUpAlt, FaGlassMartini, FaHamburger 
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
  const [itemTypeFilter, setItemTypeFilter] = useState(''); // 'food', 'drink', or '' (all)
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [stats, setStats] = useState({ foodCount: 0, drinkCount: 0, mixedCount: 0 });

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
      
      if (dateFilter) {
        queryParams.append('date', dateFilter);
      } else if (dateRange.start || dateRange.end) {
        if (dateRange.start) queryParams.append('dateStart', dateRange.start);
        if (dateRange.end) queryParams.append('dateEnd', dateRange.end);
      }
      
      const response = await fetch(`${API_URL}/staff/orders?${queryParams.toString()}`, {
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

  const getAvailableStatuses = (currentStatus) => {
    const orderStatusSequence = ['pending', 'preparing', 'ready', 'delivered'];
    
    if (currentStatus === 'cancelled') {
      return ['cancelled'];
    }
    
    const currentIndex = orderStatusSequence.indexOf(currentStatus);
    
    const forwardStatuses = orderStatusSequence.slice(currentIndex);
    return [...forwardStatuses, 'cancelled'];
  };
  
  const getAvailablePaymentStatuses = (currentPaymentStatus) => {
    const paymentStatusSequence = ['unpaid', 'processing', 'paid'];
    
    const currentIndex = paymentStatusSequence.indexOf(currentPaymentStatus || 'unpaid');
    
    return paymentStatusSequence.slice(currentIndex);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`${API_URL}/staff/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      toast.success(`Order status updated to ${status}`);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
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

  // Filter orders based on filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Get item name from order (food or drink)
  const getItemName = (order) => {
    if (order.foodName) return order.foodName;
    if (order.drinkName) return order.drinkName;
    return 'Unknown Item';
  };
  
  // Get item image from order
  const getItemImage = (order) => {
    if (order.foodImage) return order.foodImage;
    if (order.drinkImage) return order.drinkImage;
    return null;
  };
  
  // Get item price from order
  const getItemPrice = (order) => {
    if (order.foodPrice) return order.foodPrice;
    if (order.drinkPrice) return order.drinkPrice;
    return 0;
  };
  
  // Determine order type (food, drink or both)
  const getOrderType = (order) => {
    const hasFood = !!order.foodId || !!order.foodName;
    const hasDrink = !!order.drinkId || !!order.drinkName;
    
    if (hasFood && hasDrink) return 'mixed';
    if (hasFood) return 'food';
    if (hasDrink) return 'drink';
    return 'unknown';
  };
  
  // Get icon for order type
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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle item type filter change
  const handleItemTypeFilterChange = (e) => {
    setItemTypeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <option value="processing">Processing</option>
              </select>
            </div>
            
            {/* New item type filter */}
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

            <div>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <div>
              <button 
                onClick={toggleSortDirection} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2 text-sm flex items-center"
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
                    {/* Order header */}
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
                        
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700 mb-2">Item</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-sm flex items-center">
                              {getOrderTypeIcon(order)}
                              <span className="ml-1">{getItemName(order)} x {order.quantity}</span>
                            </span>
                            <span className="text-sm font-medium">{formatPrice(order.totalPrice)}</span>
                          </div>
                        </div>
                        
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
                        
                        {/* Action buttons */}
                        <div className="pt-3 border-t border-gray-100">
                          <h3 className="font-medium text-gray-700 mb-2">Update Order</h3>
                          
                          <div className="mb-3">
                            <label className="block text-sm text-gray-600 mb-1">Payment Status:</label>
                            <select
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                              value={order.paymentStatus || 'unpaid'}
                              onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                              disabled={updatingPaymentId === order._id}
                            >
                              {getAvailablePaymentStatuses(order.paymentStatus).map(statusOption => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                </option>
                              ))}
                            </select>
                            
                            {updatingPaymentId === order._id && (
                              <div className="flex items-center justify-center py-2">
                                <FaSpinner className="animate-spin text-yellow-600 mr-2" />
                                <span className="text-sm">Updating...</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Order Status:</label>
                            <select
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              disabled={updatingOrderId === order._id}
                            >
                              {getAvailableStatuses(order.status).map(statusOption => (
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
            
            {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                        </td>
                      </tr>
                      ) : (
                      currentItems.map((order) => (
                        <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.buyerName || 'Guest'}</div>
                          <div className="text-xs text-gray-500">{order.userEmail || order.email}</div>
                          <div className="text-xs text-gray-500">{order.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</div>
                          <div className="text-xs text-gray-500">{moment(order.createdAt).format('hh:mm A')}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                          {getOrderTypeIcon(order)}
                          <div className="ml-2">
                            <div className="text-sm text-gray-900">{getItemName(order)}</div>
                            <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                            <div className="text-xs font-medium">{formatPrice(parseFloat(getItemPrice(order)) * order.quantity)}</div>
                          </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                          value={order.paymentStatus || 'unpaid'}
                          onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                          disabled={updatingPaymentId === order._id}
                          >
                          {getAvailablePaymentStatuses(order.paymentStatus).map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                            {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                            </option>
                          ))}
                          </select>
                          {updatingPaymentId === order._id && (
                          <div className="mt-2 flex items-center">
                            <FaSpinner className="animate-spin text-yellow-600 mr-1 text-xs" />
                            <span className="text-xs text-gray-500">Updating</span>
                          </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                          className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingOrderId === order._id}
                          >
                          {getAvailableStatuses(order.status).map(statusOption => (
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
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1">
                          {order.fullAddress && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {capitalizeWords(order.deliveryLocation)}
                            </div>
                          )}                            
                          <p className="text-xs text-gray-500">
                            {order.fullAddress || 'No address provided'}
                          </p>
                          </div>
                        </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                    </table>
                    
                    {/* Pagination */}
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