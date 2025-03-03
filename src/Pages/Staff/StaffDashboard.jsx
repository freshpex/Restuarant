import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaUserClock, FaUtensils, FaClipboardList, FaEdit, 
  FaCalendarAlt, FaSpinner, FaUserTag, FaChartBar,
  FaCashRegister, FaUserTie
} from 'react-icons/fa';
import { selectToken, selectCurrentUser } from '../../redux/selectors';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const API_URL = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    fetchDashboardData();
    recordSignIn();
    
    return () => {
      recordSignOut();
    };
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const recordSignIn = async () => {
    try {
      await fetch(`${API_URL}/staff/signin-record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to record sign-in:', error);
    }
  };
  
  const recordSignOut = async () => {
    try {
      await fetch(`${API_URL}/staff/signout-record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to record sign-out:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
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
  
  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'manager':
        return 'Manager';
      case 'chef':
        return 'Chef';
      case 'cashier':
        return 'Cashier';
      case 'admin':
        return 'Administrator';
      default:
        return role || 'Staff';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md mx-auto max-w-4xl mt-10">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Staff Dashboard | Tim's Kitchen</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        {/* Staff Info Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="bg-yellow-100 rounded-full p-4">
              <FaUserTag className="text-yellow-600 text-3xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{dashboardData?.user?.name || currentUser?.displayName}</h1>
              <p className="text-gray-600">{getRoleDisplayName(dashboardData?.user?.role || currentUser?.role)}</p>
              <p className="text-sm text-gray-500 mt-1">{dashboardData?.user?.email || currentUser?.email}</p>
              {dashboardData?.user?.since && (
                <p className="text-xs text-gray-500 mt-1">
                  Staff member since {new Date(dashboardData.user.since).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today's Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-yellow-600" /> Today's Activity
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Sign-ins</span>
                <span className="font-semibold text-gray-900">{dashboardData?.today?.signIns || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Food Items Added</span>
                <span className="font-semibold text-gray-900">{dashboardData?.today?.foodAdded || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Orders Created</span>
                <span className="font-semibold text-gray-900">{dashboardData?.today?.ordersCreated || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Updates</span>
                <span className="font-semibold text-gray-900">{dashboardData?.today?.ordersUpdated || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Overall Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-yellow-600" /> 30-Day Totals
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Sign-ins</span>
                <span className="font-semibold text-gray-900">{dashboardData?.totals?.signIns || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Food Items Added</span>
                <span className="font-semibold text-gray-900">{dashboardData?.totals?.foodAdded || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Orders Created</span>
                <span className="font-semibold text-gray-900">{dashboardData?.totals?.ordersCreated || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Updates</span>
                <span className="font-semibold text-gray-900">{dashboardData?.totals?.ordersUpdated || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Recent Sign-ins */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaUserClock className="mr-2 text-yellow-600" /> Recent Sign-ins
            </h2>
            <div className="space-y-3">
              {dashboardData?.activity?.signIns?.slice(0, 4).map((activity, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-sm text-gray-900 mb-1">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                </div>
              ))}
              {(!dashboardData?.activity?.signIns || dashboardData.activity.signIns.length === 0) && (
                <p className="text-sm text-gray-500">No recent sign-ins</p>
              )}
            </div>
          </div>
          
          {/* Order Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-yellow-600" /> Recent Order Activity
            </h2>
            <div className="space-y-3">
              {dashboardData?.activity?.orders?.slice(0, 4).map((activity, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-sm text-gray-900 mb-1">
                    {formatActivityType(activity.activityType)}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {activity.details?.orderDetails?.customer || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.activity?.orders || dashboardData.activity.orders.length === 0) && (
                <p className="text-sm text-gray-500">No recent order activity</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Activity Timeline */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="font-semibold text-xl text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {dashboardData?.activity?.recent?.map((activity, index) => (
              <div key={index} className="flex gap-3 border-b border-gray-100 pb-4 last:border-0">
                <div className="mt-1">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <h3 className="font-medium text-gray-900">{formatActivityType(activity.activityType)}</h3>
                    <span className="text-sm text-gray-500">{formatTime(activity.timestamp)}</span>
                  </div>
                  
                  {activity.details?.endpoint && (
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.details?.method} {activity.details?.endpoint}
                    </p>
                  )}
                  
                  {activity.activityType === 'food_added' && (
                    <div className="mt-1 bg-gray-50 p-2 rounded text-sm">
                      <p className="font-medium">{activity.details?.foodName}</p>
                      <div className="flex justify-between mt-1">
                        <span>Price: ₦{activity.details?.foodPrice}</span>
                        <span>Quantity: {activity.details?.foodQuantity}</span>
                      </div>
                    </div>
                  )}
                  
                  {(activity.activityType === 'order_status_updated' || 
                    activity.activityType === 'order_payment_updated') && (
                    <div className="mt-1 bg-gray-50 p-2 rounded text-sm">
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
            
            {(!dashboardData?.activity?.recent || dashboardData.activity.recent.length === 0) && (
              <p className="text-center text-gray-500 py-6">No recent activity found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;
