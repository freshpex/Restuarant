import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaSearch, FaFilter, FaChevronDown, FaPhoneAlt, FaMapMarkerAlt, 
  FaCalendarAlt, FaTrash, FaExclamationTriangle, FaHamburger, FaGlassMartini,
  FaSortAmountDown, FaSortAmountUpAlt, FaClock, FaLayerGroup
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
  const [sortDirection, setSortDirection] = useState('desc');
  const [itemTypeFilter, setItemTypeFilter] = useState('');
  const [stats, setStats] = useState({ foodCount: 0, drinkCount: 0, mixedCount: 0 });
  const [groupedOrders, setGroupedOrders] = useState([]);
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchOrders();
  }, [sortDirection, itemTypeFilter]);

  const groupOrdersByReference = (ordersList) => {
    const groupedOrdersMap = {};
    
    // Grouping orders by their reference
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
    
    return Object.values(groupedOrdersMap).sort((a, b) => {
      if (sortDirection === 'desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
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
      
      const grouped = groupOrdersByReference(data.orders || []);
      setGroupedOrders(grouped);
      
      setStats(data.stats || { foodCount: 0, drinkCount: 0, mixedCount: 0 });
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
        
        const orderGroup = groupedOrders.find(group => group._id === orderId);
        
        if (orderGroup && orderGroup.items && orderGroup.items.length > 0) {
          const updatePromises = orderGroup.items.map(async (item) => {
            const response = await fetch(`${API_URL}/admin/orders/${item._id}/status`, {
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
            const response = await fetch(`${API_URL}/admin/orders/${item._id}/payment-status`, {
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

  // Item helper functions
  const getItemName = (order) => {
    if (order.foodName) return order.foodName;
    if (order.drinkName) return order.drinkName;
    return 'Unknown Item';
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

  const filteredOrders = groupedOrders.filter(order => {
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

  const deleteOrder = async (orderId, isBulkOrder = false, orderGroupId = null) => {
    try {
      let deleteEndpoint;
      let idToUse;
      
      if (isBulkOrder) {
        if (orderGroupId) {
          idToUse = orderGroupId;
        } else {
          idToUse = orderId;
        }
        
        console.log(`Deleting bulk order with ID: ${idToUse}`);
      } else {
        const orderItem = orders.find(o => o._id === orderId);
        idToUse = orderItem ? orderItem._id : orderId;
      }
      
      deleteEndpoint = `${API_URL}/admin/orders/${idToUse}`;
      console.log(`Making delete request to: ${deleteEndpoint}`);
      
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete order (Status: ${response.status})`);
      }

      const responseData = await response.json();
      console.log('Delete response:', responseData);
      
      if (isBulkOrder) {
        setOrders(prevOrders => 
          prevOrders.filter(order => 
            !(order.orderGroupId === orderGroupId || order.orderReference === orderId)
          )
        );
        
        setGroupedOrders(prevGroups =>
          prevGroups.filter(group => group._id !== orderId)
        );
        
        toast.success(responseData.message || 'Bulk order deleted successfully');
      } else {
        const actualId = orders.find(o => o._id === orderId)?._id || orderId;
        
        setOrders(prevOrders => 
          prevOrders.filter(order => order._id !== actualId)
        );
        
        setGroupedOrders(prevGroups => {
          const updatedGroups = prevGroups.map(group => {
            if (group.items.some(item => item._id === actualId)) {
              return {
                ...group,
                items: group.items.filter(item => item._id !== actualId),
                isBulkOrder: group.items.filter(item => item._id !== actualId).length > 1
              };
            }
            return group;
          });
          return updatedGroups.filter(group => group.items.length > 0);
        });
        
        toast.success(responseData.message || 'Order deleted successfully');
      }
      
      // Refresh orders after deletion
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order: ' + error.message);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const confirmDelete = (order) => {
    setDeleteConfirmation({
      ...order,
      isBulkOrder: order.isBulkOrder,
      orderGroupId: order.orderGroupId
    });
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
                        {order.isBulkOrder ? (
                          <div className="bg-purple-100 text-purple-800 p-1 rounded-full mr-2">
                            <FaLayerGroup className="text-purple-600" />
                          </div>
                        ) : getOrderTypeIcon(order)}
                        
                        <div className="ml-2">
                          <p className="font-medium">
                            #{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}
                            {order.isBulkOrder && (
                              <span className="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                Bulk ({order.items.length})
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{moment(order.createdAt).format('MMM DD, YYYY')}</p>
                          <p className="text-sm text-gray-500">{moment(order.createdAt).format('hh:mm A')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {capitalizeWords(order.status)}
                        </span>
                        <FaChevronDown className={`text-gray-400 transition-transform ${expandedOrder === order._id ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Mobile expanded view */}
                    {expandedOrder === order._id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700">Customer</h3>
                          <p className="text-sm">{order.buyerName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{order.userEmail}</p>
                        </div>
                        
                        {/* Order items */}
                        <div className="py-3">
                          <h3 className="font-medium text-gray-700 mb-2">
                            {order.isBulkOrder ? `Items (${order.items.length})` : 'Item'}
                          </h3>
                          <div className="mb-2 border-b border-gray-100 pb-2">
                                <span className="text-sm font-medium">Total: {formatPrice(order.totalAmount)}</span>
                              </div>
                              <div className="max-h-40 overflow-y-auto">
                                {order.items.map((item, idx) => (
                                  <div key={`${item._id}-${idx}`} className="flex justify-between items-center mb-2">
                                    <span className="text-sm flex items-center">
                                      {item.foodId ? <FaHamburger className="text-yellow-600 mr-1" /> : <FaGlassMartini className="text-blue-600 mr-1" />}
                                      <span className="ml-1">{getItemName(item)} x {item.quantity}</span>
                                    </span>
                                    <span className="text-sm">{formatPrice(item.totalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                          </div>
                        
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
                                onChange={(e) => updatePaymentStatus(order._id, e.target.value, order.isBulkOrder, order.orderGroupId)}
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
                                onChange={(e) => updateOrderStatus(order._id, e.target.value, order.isBulkOrder, order.orderGroupId)}
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
                              <FaTrash className="mr-2" /> 
                              {order.isBulkOrder ? 'Delete Bulk Order' : 'Delete Order'}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Total</th>
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
                      <tr key={order._id} className={order.isBulkOrder ? "bg-purple-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            {order.isBulkOrder && (
                              <span className="mr-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                                <FaLayerGroup className="mr-1 text-purple-600" />
                                Bulk
                              </span>
                            )}
                            <div>
                              <div className="text-sm text-gray-900">{order.orderReference || order._id.substring(order._id.length - 6).toUpperCase()}</div>
                              {order.isBulkOrder && (
                                <div className="text-xs text-gray-500">{order.items.length} items</div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.buyerName || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{order.userEmail || order.email}</div>
                        </td>
                        {/* Update Order items */}
                        <td className="px-6 py-4">
                          {order.isBulkOrder ? (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Multiple Items</span>
                              </div>
                              <div className="max-h-100 overflow-y-auto pr-2 text-xs">
                                {order.items.slice(0, 10).map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      {item.foodId ? <FaHamburger className="text-yellow-600 mr-1" /> : <FaGlassMartini className="text-blue-600 mr-1" />}
                                      <span>{getItemName(item)} x{item.quantity}</span>
                                    </div>
                                    <span>{formatPrice(item.totalPrice)}</span>
                                  </div>
                                ))}
                                {order.items.length > 10 && (
                                  <div className="text-gray-500 text-center mt-1">
                                    +{order.items.length - 3} more items
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              {order.items && order.items.length > 0 ? (
                                <div className="flex items-center">
                                  {getOrderTypeIcon(order.items[0])}
                                  <div className="ml-2">
                                    <div className="text-sm text-gray-900">{getItemName(order.items[0])}</div>
                                    <div className="text-xs text-gray-500">Qty: {order.items[0].quantity}</div>
                                    <div className="text-xs font-medium">{formatPrice(order.items[0].totalPrice)}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  {getOrderTypeIcon(order)}
                                  <div className="ml-2">
                                    <div className="text-sm text-gray-900">{getItemName(order)}</div>
                                    <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                                    <div className="text-xs font-medium">{formatPrice(order.totalPrice)}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(order.createdAt).format('MMM DD, YYYY hh:mm A')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {formatPrice(order.grandTotal)}
                          </div>
                          <div className="text-xs text-gray-500 flex flex-col">
                            <span>Subtotal: {formatPrice(order.totalAmount)}</span>
                            <span>Delivery: {formatPrice(order.deliveryFee || 0)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            value={order.paymentStatus || 'unpaid'}
                            onChange={(e) => updatePaymentStatus(order._id, e.target.value, order.isBulkOrder, order.orderGroupId)}
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {capitalizeWords(order.deliveryLocation || 'Not specified')}
                          </div>
                          <div className="text-xs text-gray-500 max-w-xs truncate" title={order.fullAddress}>
                            {order.fullAddress || 'No address provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value, order.isBulkOrder, order.orderGroupId)}
                            disabled={updatingOrderId === order._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updatingOrderId === order._id && (
                            <div className="mt-2 flex items-center">
                              <FaSpinner className="animate-spin text-yellow-600 mr-1 text-xs" />
                              <span className="text-xs text-gray-500">Updating</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => confirmDelete(order)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title={order.isBulkOrder ? "Delete Bulk Order" : "Delete Order"}
                          >
                            <FaTrash />
                          </button>
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
                <h3 className="text-lg font-semibold">
                  {deleteConfirmation.isBulkOrder ? 'Confirm Delete Bulk Order' : 'Confirm Delete'}
                </h3>
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
              <p>
                {deleteConfirmation.isBulkOrder 
                  ? `Are you sure you want to delete this bulk order with ${deleteConfirmation.items?.length || '0'} items?` 
                  : 'Are you sure you want to delete this order?'}
              </p>
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
                  onClick={() => deleteOrder(
                    deleteConfirmation._id, 
                    deleteConfirmation.isBulkOrder, 
                    deleteConfirmation.orderGroupId
                  )}
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