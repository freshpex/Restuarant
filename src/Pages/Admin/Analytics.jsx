import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FaSpinner, FaChartBar, FaUsers, FaUtensils, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { selectToken } from '../../redux/selectors';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  ArcElement
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topFoods, setTopFoods] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
    fetchTopFoods();
    fetchMonthlyRevenue();
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

  const fetchTopFoods = async () => {
    try {
      const response = await fetch(`${API_URL}/topSellingFoods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top foods');
      }

      const data = await response.json();
      setTopFoods(data || []);
    } catch (error) {
      console.error('Error fetching top foods:', error);
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/monthly-revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch monthly revenue');
      }

      const data = await response.json();
      setMonthlyRevenue(data.monthlyRevenue || {});
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
    }
  };

  // Prepare chart data for top selling foods
  const topFoodsChartData = {
    labels: topFoods.map(food => food.foodName),
    datasets: [
      {
        label: 'Orders',
        data: topFoods.map(food => food.orderCount || 0),
        backgroundColor: 'rgba(253, 224, 71, 0.6)',
        borderColor: 'rgb(253, 224, 71)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare monthly revenue data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const revenueChartData = {
    labels: monthNames,
    datasets: [
      {
        label: `Revenue ${currentYear}`,
        data: monthNames.map((_, index) => {
          const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
          return monthlyRevenue[monthKey] || 0;
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Prepare category distribution data
  const categoryData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      },
    ],
  };

  if (topFoods.length > 0) {
    const categoryCount = {};
    topFoods.forEach(food => {
      const category = food.foodCategory || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    categoryData.labels = Object.keys(categoryCount);
    categoryData.datasets[0].data = Object.values(categoryCount);
  }

  return (
    <>
      <Helmet>
        <title>Admin | Analytics</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <div>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Users</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.userCount || 0}</h3>
                  </div>
                  <FaUsers className="text-3xl text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Foods</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.foodCount || 0}</h3>
                  </div>
                  <FaUtensils className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                    <h3 className="text-3xl font-bold mt-1">{stats?.orderCount || 0}</h3>
                  </div>
                  <FaChartBar className="text-3xl text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-1">${(stats?.totalRevenue || 0).toFixed(2)}</h3>
                  </div>
                  <FaMoneyBillWave className="text-3xl text-green-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Top Selling Foods</h3>
                <Bar 
                  data={topFoodsChartData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Order Count by Food Item'
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                <Line 
                  data={revenueChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: `Monthly Revenue - ${currentYear}`
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                <div className="h-64">
                  <Pie 
                    data={categoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: true,
                          text: 'Food Items by Category'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats?.recentOrders?.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.userName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{order.userEmail}</div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${Number(order.totalPrice).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;
