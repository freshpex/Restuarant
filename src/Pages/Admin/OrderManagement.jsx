import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaSpinner, FaSearch, FaFilter } from 'react-icons/fa';
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
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const updateOrderStatus = async (orderId, status) => {
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

      toast.success(`Order status updated to ${status}`);
      
      // Update local state
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
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, paymentStatus } : order
      ));
    } catch (error) {
      toast.error(error.message || 'Error updating payment status');
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  // Filter orders based on search term, status, payment status, and date range
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

  return (
    <>
      <Helmet>
        <title>Admin | Order Management</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Order Management</h1>
          <button 
            onClick={resetFilters} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2"
          >
            Reset Filters
          </button>
        </div>

        {/* Search and Filters */}
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

            <div>
              <input
                type="date"
                placeholder="Start Date"
                className="w-full border rounded-lg px-4 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>

            <div>
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
          <div className="overflow-x-auto bg-white rounded-lg shadow">
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
        )}
      </div>
    </>
  );
};

export default OrderManagement;