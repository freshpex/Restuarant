import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { 
  FaSpinner, FaUserClock, FaUtensils, FaClipboardList, 
  FaEdit, FaCalendarAlt, FaUserTag, FaSearch,
  FaDownload, FaFilter, FaUser, FaTrash
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import Pagination from '../../Components/Pagination';

const StaffActivities = () => {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedActivities, setPaginatedActivities] = useState([]);
  
  const ITEMS_PER_PAGE = 10;
  
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;
  
  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }
  
  useEffect(() => {
    fetchStaffActivities();
  }, [startDate, endDate, filterType]);
  
  const fetchStaffActivities = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/admin/staff-activities?startDate=${startDate}&endDate=${endDate}`;
      
      if (filterType) {
        url += `&type=${filterType}`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching staff activities:', error);
      toast.error('Failed to load staff activities');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedActivities(activities.slice(startIndex, endIndex));
  }, [activities, currentPage]);
  
  // Apply search filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStaffActivities();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.querySelector('.bg-white.p-6.rounded-lg.shadow-md').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  const formatActivityType = (type) => {
    switch(type) {
      case 'auth_signin':
        return 'Signed In';
      case 'auth_signout':
        return 'Signed Out';
      case 'food_added':
        return 'Added Food Item';
      case 'order_created':
        return 'Created Order';
      case 'order_status_updated':
        return 'Updated Order Status';
      case 'order_payment_updated':
        return 'Updated Payment Status';
      case 'page_access':
        return 'Accessed Page';
      case 'dashboard_access':
        return 'Viewed Dashboard';
      case 'orders_viewed':
        return 'Viewed Orders';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  const getActivityIcon = (type) => {
    switch(type) {
      case 'auth_signin':
      case 'auth_signout':
        return <FaUserClock className="text-blue-500" />;
      case 'food_added':
        return <FaUtensils className="text-green-500" />;
      case 'order_created':
        return <FaClipboardList className="text-yellow-500" />;
      case 'order_status_updated':
      case 'order_payment_updated':
        return <FaEdit className="text-indigo-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };
  
  const handleDateFilterChange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };
  
  const exportToCSV = () => {
    if (!activities || activities.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Staff Name', 'Staff Email', 'Staff Role', 'Activity Type', 'Timestamp', 'Endpoint', 'Details'];
    const csvRows = activities.map(activity => {
      return [
        activity.staffName || 'Unknown',
        activity.email,
        activity.role,
        formatActivityType(activity.activityType),
        new Date(activity.timestamp).toLocaleString(),
        activity.details?.endpoint || '',
        JSON.stringify(activity.details || {}).replace(/,/g, ';')
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `staff-activities-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const deleteActivity = async (id) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${API_URL}/admin/staff-activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Activity deleted successfully');
        fetchStaffActivities();
      } else {
        toast.error(response.data.message || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
      toast.error(error.response?.data?.message || 'Failed to delete activity');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const deleteAllActivities = async () => {
    if (!confirm('Are you sure you want to delete ALL staff activities? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('FINAL WARNING: This will permanently delete ALL activity records. Continue?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${API_URL}/admin/staff-activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(`${response.data.deletedCount || 'All'} activities deleted successfully`);
        fetchStaffActivities();
      } else {
        toast.error(response.data.message || 'Failed to delete activities');
      }
    } catch (error) {
      console.error('Failed to delete all activities:', error);
      toast.error(error.response?.data?.message || 'Failed to delete activities');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const canDeleteActivity = (activity) => !activity.isDeletionRecord;

  return (
    <>
      <Helmet>
        <title>Staff Activities | Admin Dashboard</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Staff Activities</h1>
          
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <button 
              onClick={() => handleDateFilterChange(1)}
              className={`px-3 py-1 text-sm rounded-full ${
                endDate === new Date().toISOString().split('T')[0] && 
                startDate === new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }
            >
              Today
            </button>
            <button 
              onClick={() => handleDateFilterChange(7)}
              className={`px-3 py-1 text-sm rounded-full ${
                endDate === new Date().toISOString().split('T')[0] && 
                startDate === new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0] 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }
            >
              Last 7 days
            </button>
            <button 
              onClick={() => handleDateFilterChange(30)}
              className={`px-3 py-1 text-sm rounded-full ${
                endDate === new Date().toISOString().split('T')[0] && 
                startDate === new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0] 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }
            >
              Last 30 days
            </button>
          </div>
        </div>
        
        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <FaSearch className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search by staff name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              />
            </div>
            
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
              >
                <option value="">All Activity Types</option>
                <option value="auth_signin">Sign-ins</option>
                <option value="auth_signout">Sign-outs</option>
                <option value="food_added">Food Added</option>
                <option value="order_created">Orders Created</option>
                <option value="order_status_updated">Order Status Updates</option>
                <option value="orders_viewed">Orders Viewed</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center">
                <label htmlFor="startDate" className="text-sm mr-2 whitespace-nowrap">From:</label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="endDate" className="text-sm mr-2 whitespace-nowrap">To:</label>
                <input 
                  type="date" 
                  id="endDate"
                  value={endDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-3">
                {activities.length} activities found
              </span>
            </div>
            
            <div className="flex space-x-2">
              {activities.length > 0 && (
                <button
                  onClick={deleteAllActivities}
                  disabled={isDeleting}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <FaSpinner className="animate-spin mr-1" />
                  ) : (
                    <FaTrash />
                  )}
                  Delete All
                </button>
              )}
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <FaDownload className="mr-1" /> Download
              </button>
            </div>
          </div>
        </div>
        
        {/* Activity Timeline */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">Activity Log</h2>
            
            {activities.length > 0 ? (
              <>
                <div className="space-y-6">
                  {paginatedActivities.map((activity, index) => (
                    <div key={index} className={`flex gap-3 border-b border-gray-100 pb-6 last:border-0 ${activity.isDeletionRecord ? 'bg-red-50 p-3 rounded' : ''}`}>
                      <div className="mt-1">
                        {getActivityIcon(activity.activityType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {formatActivityType(activity.activityType)}
                              {activity.isDeletionRecord && (
                                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  Deletion Record
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-blue-600 mt-1 flex items-center">
                              <FaUser className="mr-1 text-xs" />
                              <span className="font-medium">{activity.staffName || 'Unknown'}</span>
                              <span className="mx-2 text-gray-400">|</span>
                              <span className="text-gray-600">{activity.email}</span>
                              <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">{activity.role}</span>
                            </p>
                          </div>
                          <div className="flex items-center mt-1 sm:mt-0">
                            <span className="text-sm text-gray-500 mr-3">{formatTime(activity.timestamp)}</span>
                            
                            {canDeleteActivity(activity) && (
                              <button 
                                onClick={() => deleteActivity(activity._id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Delete this activity"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {activity.details?.endpoint && (
                          <p className="text-sm text-gray-600 mt-2">
                            {activity.activityType}
                          </p>
                        )}
                        
                        {activity.activityType === 'food_added' && activity.details?.foodName && (
                          <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
                            <p className="font-medium">{activity.details?.foodName}</p>
                            <div className="flex justify-between mt-1">
                              <span>Price: ₦{activity.details?.foodPrice}</span>
                              <span>Quantity: {activity.details?.foodQuantity}</span>
                            </div>
                          </div>
                        )}
                        
                        {(activity.activityType === 'order_status_updated' || 
                          activity.activityType === 'order_payment_updated') && 
                          activity.details?.orderDetails?.customer && (
                          <div className="mt-2 bg-gray-50 p-2 rounded text-sm">
                            <div className="flex justify-between">
                              <span>Order: {activity.details?.orderId?.substring(0, 8)}</span>
                              <span>Customer: {activity.details?.orderDetails?.customer}</span>
                            </div>
                            {activity.activityType === 'order_status_updated' && (
                              <p className="mt-1">
                                Status changed from <span className="font-medium">{activity.details?.oldStatus}</span> to <span className="font-medium">{activity.details?.newStatus}</span>
                              </p>
                            )}
                            {activity.activityType === 'order_payment_updated' && (
                              <p className="mt-1">
                                Payment status: <span className="font-medium">{activity.details?.newPaymentStatus}</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination component */}
                <Pagination 
                  currentPage={currentPage}
                  totalItems={activities.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <FaUserTag className="mx-auto text-gray-300 text-4xl mb-3" />
                <p>No staff activities found for the selected filters</p>
                <p className="text-sm mt-2">Try adjusting your filters or date range</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StaffActivities;
