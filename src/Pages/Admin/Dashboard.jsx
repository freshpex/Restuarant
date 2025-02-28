import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaSpinner, FaChartBar, FaUsers, FaUtensils, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken, selectCurrentUser } from '../../redux/selectors';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      setError(error.message || 'Error fetching statistics');
      toast.error(error.message || 'Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting;

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Tim's Kitchen</title>
      </Helmet>
      <div className="container mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{greeting}, {user?.displayName}</h1>
          <p className="text-gray-600 mt-1">Welcome to Tim's Kitchen Admin Dashboard</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <FaUsers className="text-blue-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold">{stats?.userCount || 0}</h3>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <FaUtensils className="text-green-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Foods</p>
                  <h3 className="text-2xl font-bold">{stats?.foodCount || 0}</h3>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <FaShoppingCart className="text-yellow-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <h3 className="text-2xl font-bold">{stats?.orderCount || 0}</h3>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                  <FaMoneyBillWave className="text-indigo-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <h3 className="text-2xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</h3>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/admin/foods" 
                  className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 flex items-center"
                >
                  <FaUtensils className="text-yellow-600 mr-3 text-xl" />
                  <span>Manage Foods</span>
                </Link>
                <Link 
                  to="/admin/orders" 
                  className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 flex items-center"
                >
                  <FaShoppingCart className="text-green-600 mr-3 text-xl" />
                  <span>Manage Orders</span>
                </Link>
                <Link 
                  to="/admin/users" 
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 flex items-center"
                >
                  <FaUsers className="text-blue-600 mr-3 text-xl" />
                  <span>Manage Users</span>
                </Link>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.recentOrders?.length ? (
                      stats.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.userName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">{order.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${Number(order.totalPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                    'bg-blue-100 text-blue-800'}`
                            }>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent orders
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <Link 
                  to="/admin/orders" 
                  className="text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
