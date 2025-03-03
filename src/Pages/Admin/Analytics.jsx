import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { 
  FaSpinner, FaChartBar, FaUsers, FaUtensils, FaMoneyBillWave, 
  FaCalendarAlt, FaFilter, FaSearch, FaExclamationTriangle,
  FaBoxOpen, FaClipboardList, FaDownload, FaTable
} from 'react-icons/fa';
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
  TimeScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { formatPrice } from '../../utils/formatUtils';

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
  ArcElement,
  TimeScale
);

const Analytics = () => {
  // State for general data
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topFoods, setTopFoods] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;
  
  // State for filtering
  const [dateFilter, setDateFilter] = useState('week');
  const [startDate, setStartDate] = useState(getDefaultStartDate('week'));
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('summary');
  
  // State for detailed data
  const [dailySales, setDailySales] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [salesBreakdown, setSalesBreakdown] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    items: [],
    totalAmount: 0
  });

  const [overviewStats, setOverviewStats] = useState({
    userCount: 0,
    foodCount: 0, 
    orderCount: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [filteredLabel, setFilteredLabel] = useState('All Time');

  // Helper function to get default start date
  function getDefaultStartDate(period) {
    const today = new Date();
    let result = new Date();
    
    switch(period) {
      case 'day':
        result = today;
        break;
      case 'week':
        result.setDate(today.getDate() - 7);
        break;
      case 'month':
        result.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        result.setFullYear(today.getFullYear() - 1);
        break;
      default:
        result.setDate(today.getDate() - 7);
    }
    
    return result.toISOString().split('T')[0];
  }

  // Initial data loading
  useEffect(() => {
    fetchFilteredStats();
    fetchTopFoods();
    fetchMonthlyRevenue();
  }, []);
  
  // Effect to fetch filtered data when filter changes
  useEffect(() => {
    fetchFilteredStats();
    fetchDailySales();
    fetchInventoryItems();
    fetchSalesBreakdown();
    fetchSalesSummary();
  }, [startDate, endDate]);
  
  // Handle date filter change
  const handleDateFilterChange = (period) => {
    setDateFilter(period);
    const newStartDate = getDefaultStartDate(period);
    setStartDate(newStartDate);
    setEndDate(new Date().toISOString().split('T')[0]);
    
    // Set appropriate label for the overview tab
    switch(period) {
      case 'day':
        setFilteredLabel("Today's");
        break;
      case 'week':
        setFilteredLabel("This Week's");
        break;
      case 'month':
        setFilteredLabel("This Month's");
        break;
      case 'year':
        setFilteredLabel("This Year's");
        break;
      default:
        setFilteredLabel("All Time");
    }
  };

  // Fetch basic stats
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

  // Fetch top selling foods
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

  // Fetch monthly revenue
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

  // NEW: Fetch daily sales data
  const fetchDailySales = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/daily-sales?startDate=${startDate}&endDate=${endDate}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch daily sales');
      }

      const data = await response.json();
      setDailySales(data.dailySales || []);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      toast.error('Could not load daily sales data');
    }
  };

  // NEW: Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/inventory?startDate=${startDate}&endDate=${endDate}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventoryItems(data.foods || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // NEW: Fetch sales breakdown
  const fetchSalesBreakdown = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/sales-breakdown?startDate=${startDate}&endDate=${endDate}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sales breakdown');
      }

      const data = await response.json();
      setSalesBreakdown(data.sales.byPaymentMethod || []);
    } catch (error) {
      console.error('Error fetching sales breakdown:', error);
    }
  };

  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/sales-summary?startDate=${startDate}&endDate=${endDate}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sales summary');
      }

      const data = await response.json();
      
      if (data.success) {
        setSalesSummary({
          items: data.items || [],
          totalAmount: data.totalAmount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      toast.error('Could not load sales summary');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats with date filter
  const fetchFilteredStats = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/admin/stats`);
      
      if (startDate) {
        url.searchParams.append('startDate', startDate);
      }
      if (endDate) {
        url.searchParams.append('endDate', endDate);
      }

      const response = await fetch(url, {
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
      
      const isFiltered = startDate !== getDefaultStartDate('all') || endDate !== new Date().toISOString().split('T')[0];
      
      if (isFiltered && data.stats) {
        setOverviewStats({
          userCount: data.stats.filteredUserCount || 0,
          foodCount: data.stats.filteredFoodCount || 0,
          orderCount: data.stats.filteredOrderCount || 0,
          totalRevenue: data.stats.filteredRevenue || 0,
          recentOrders: data.stats.filteredRecentOrders || []
        });
      } else {
        setOverviewStats({
          userCount: data.stats.userCount || 0,
          foodCount: data.stats.foodCount || 0,
          orderCount: data.stats.orderCount || 0,
          totalRevenue: data.stats.totalRevenue || 0,
          recentOrders: data.stats.recentOrders || []
        });
      }
    } catch (error) {
      setError(error.message || 'Error fetching statistics');
      toast.error(error.message || 'Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  // Export data as CSV
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const csvRows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Monthly revenue data
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

  // Daily sales chart data
  const dailySalesChartData = {
    labels: dailySales.map(day => day.date),
    datasets: [
      {
        label: 'Items Sold',
        data: dailySales.map(day => day.itemCount),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Revenue (₦)',
        data: dailySales.map(day => day.revenue),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  // Sales by category chart
  const categoryData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#8AC24A', '#00BCD4',
          '#673AB7', '#795548', '#607D8B', '#E91E63'
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#8AC24A', '#00BCD4',
          '#673AB7', '#795548', '#607D8B', '#E91E63'
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
  
  // Filter inventory items by search term
  const filteredInventory = inventoryItems.filter(item => 
    item.foodName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.foodCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Admin | Analytics Dashboard</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Date filter controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-medium flex items-center">
                <FaFilter className="mr-2 text-yellow-600" /> Data Filters
              </h2>
              <p className="text-sm text-gray-500">Filter the analytics data by date range</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleDateFilterChange('day')}
                className={`px-3 py-1 text-sm rounded-full ${dateFilter === 'day' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Today
              </button>
              <button 
                onClick={() => handleDateFilterChange('week')}
                className={`px-3 py-1 text-sm rounded-full ${dateFilter === 'week' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Last 7 days
              </button>
              <button 
                onClick={() => handleDateFilterChange('month')}
                className={`px-3 py-1 text-sm rounded-full ${dateFilter === 'month' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Last 30 days
              </button>
              <button 
                onClick={() => handleDateFilterChange('year')}
                className={`px-3 py-1 text-sm rounded-full ${dateFilter === 'year' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Last year
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="flex items-center">
                <label htmlFor="startDate" className="text-sm mr-2 whitespace-nowrap">From:</label>
                <input 
                  type="date" 
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
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
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'summary'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Daily Sales (Summary)
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'sales'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sales Analysis
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'inventory'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'revenue'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              Revenue
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
           {/* SALES SUMMARY TAB */}
           {activeTab === 'summary' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaMoneyBillWave className="mr-2 text-yellow-600" /> Sales Summary
                    </h2>
                    <div className="mt-2 md:mt-0">
                      <button
                        onClick={() => exportToCSV(
                          salesSummary.items.map(item => ({
                            foodName: item.foodName,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            date: item.date
                          })), 
                          'sales-summary'
                        )}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                      >
                        <FaDownload className="mr-2" /> Export Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <h3 className="text-lg font-medium mb-1">Total Sales</h3>
                      <p className="text-3xl font-bold text-yellow-700">
                        {formatPrice(salesSummary.totalAmount)}
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        {startDate === endDate ? 
                          `For ${new Date(startDate).toLocaleDateString()}` : 
                          `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>

                  {salesSummary.items.length > 0 ? (
                    <div className="overflow-hidden">
                      <div className="max-w-full overflow-x-auto pb-2">
                        <table className="min-w-full bg-white">
                          <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 text-xs font-semibold uppercase tracking-wider">
                              <th className="sticky left-0 bg-gray-100 px-4 py-3">Item</th>
                              <th className="px-4 py-3 text-center">Date</th>
                              <th className="px-4 py-3 text-center">Quantity</th>
                              <th className="px-4 py-3 text-right">Unit Price</th>
                              <th className="px-4 py-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {salesSummary.items.map((item, index) => (
                              <tr key={index}>
                                <td className="sticky left-0 bg-white px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.foodName}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                                  {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-gray-500">
                                  {formatPrice(parseFloat(item.unitPrice))}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatPrice(parseFloat(item.totalPrice))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-50">
                              <td colSpan="4" className="sticky left-0 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900">
                                Total: <span className="md:hidden ml-1 font-bold">{formatPrice(salesSummary.totalAmount)}</span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                {formatPrice(salesSummary.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                      <FaChartBar className="text-gray-300 text-4xl mb-3" />
                      <p className="text-gray-500 mb-1">No sales data available for the selected date range</p>
                      <p className="text-sm text-gray-400">Try selecting a different date range</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="mb-2 flex items-center">
                      <FaExclamationTriangle className="text-yellow-500 mr-2" /> 
                      <span>Tips for mobile users:</span>
                    </p>
                    <ul className="list-disc pl-10">
                      <li>Scroll left/right to view all columns</li>
                      <li>The "Item" column remains visible while scrolling</li>
                      <li>Tap on a row to highlight it for easier reading</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* SALES TAB */}
            {activeTab === 'sales' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaChartBar className="mr-2 text-yellow-600" /> Sales Analysis
                    </h2>
                    <div className="mt-2 md:mt-0">
                      <button
                        onClick={() => exportToCSV(dailySales, 'daily-sales')}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                      >
                        <FaDownload className="mr-2" /> Export Data
                      </button>
                    </div>
                  </div>
                  
                  {dailySales.length > 0 ? (
                    <>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">Daily Sales & Revenue</h3>
                        <div className="h-80">
                          <Line 
                            data={dailySalesChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              interaction: {
                                mode: 'index',
                                intersect: false,
                              },
                              plugins: {
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.dataset.label || '';
                                      const value = context.parsed.y;
                                      return label + ': ' + (label.includes('Revenue') ? '₦' + value.toFixed(2) : value);
                                    }
                                  }
                                },
                              },
                              scales: {
                                y: {
                                  type: 'linear',
                                  display: true,
                                  position: 'left',
                                  title: {
                                    display: true,
                                    text: 'Items Sold'
                                  }
                                },
                                y1: {
                                  type: 'linear',
                                  display: true,
                                  position: 'right',
                                  grid: {
                                    drawOnChartArea: false,
                                  },
                                  title: {
                                    display: true,
                                    text: 'Revenue (₦)'
                                  }
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500">
                      No sales data available for the selected date range
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaBoxOpen className="mr-2 text-yellow-600" /> Inventory Management
                    </h2>
                    <div className="mt-2 md:mt-0">
                      <button
                        onClick={() => exportToCSV(inventoryItems, 'inventory')}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                      >
                        <FaDownload className="mr-2" /> Export Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center">
                      <FaSearch className="text-gray-400 mr-2" />
                      <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                      />
                    </div>
                  </div>

                  {filteredInventory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Food Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInventory.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {item.foodName}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {item.foodCategory}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {item.foodQuantity}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatPrice(item.price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      No inventory items found
                    </div>
                  )}
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FaExclamationTriangle className="text-yellow-600 mr-2" /> Low Stock Items
                  </h3>
                  
                  {filteredInventory.filter(item => parseInt(item.foodQuantity) <= 10).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Food Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity Left
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredInventory
                            .filter(item => parseInt(item.foodQuantity) <= 10)
                            .map((item) => (
                              <tr key={`low-${item._id}`}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.foodName}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {item.foodQuantity}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${parseInt(item.foodQuantity) === 0 
                                      ? 'bg-red-100 text-red-800' 
                                      : parseInt(item.foodQuantity) <= 5 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-orange-100 text-orange-800'}`}
                                  >
                                    {parseInt(item.foodQuantity) === 0 
                                      ? 'Out of Stock' 
                                      : parseInt(item.foodQuantity) <= 5 
                                        ? 'Critical' 
                                        : 'Low'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      No low stock items
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REVENUE TAB */}
            {activeTab === 'revenue' && (
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FaMoneyBillWave className="mr-2 text-yellow-600" /> Revenue Analysis
                    </h2>
                    <div className="mt-2 md:mt-0">
                      <button
                        onClick={() => exportToCSV(
                          Object.entries(monthlyRevenue).map(([month, amount]) => ({month, amount})),
                          'revenue-data'
                        )}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                      >
                        <FaDownload className="mr-2" /> Export Data
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-blue-900 mt-2">
                        {formatPrice(stats?.totalRevenue || 0)}
                      </h3>
                      <p className="text-xs text-blue-700 mt-1">All time revenue</p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                      <p className="text-sm font-medium text-green-800">Average Order Value</p>
                      <h3 className="text-2xl font-bold text-green-900 mt-2">
                        {stats?.orderCount > 0 
                          ? formatPrice(stats?.totalRevenue / stats?.orderCount) 
                          : '0.00'}
                      </h3>
                      <p className="text-xs text-green-700 mt-1">Per order</p>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                      <p className="text-sm font-medium text-purple-800">Current Month Revenue</p>
                      <h3 className="text-2xl font-bold text-purple-900 mt-2">
                        ₦{(() => {
                          const now = new Date();
                          const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                          return (monthlyRevenue[monthKey] || 0).toFixed(2);
                        })()}
                      </h3>
                      <p className="text-xs text-purple-700 mt-1">This month</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Monthly Revenue Trend</h3>
                    <div className="h-96">
                      <Line 
                        data={revenueChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.dataset.label || '';
                                  const value = context.raw || 0;
                                  return `${label}: ${formatPrice(value)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Revenue (₦)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Sales by Payment Method</h3>
                    <div className="h-80 flex justify-center">
                      <div style={{ width: '100%', maxWidth: '400px' }}>
                        <Doughnut
                          data={{
                            labels: ['Online Payment', 'WhatsApp Payment', 'Cash on Delivery'],
                            datasets: [
                              {
                                data: [
                                  salesBreakdown.filter(item => item.paymentMethod === 'online')
                                    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
                                  salesBreakdown.filter(item => item.paymentMethod === 'whatsapp')
                                    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
                                  salesBreakdown.filter(item => item.paymentMethod === 'cash')
                                    .reduce((sum, item) => sum + Number(item.amount || 0), 0),
                                ],
                                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B'],
                                hoverBackgroundColor: ['#3730A3', '#059669', '#D97706'],
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom',
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${formatPrice(value)} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;