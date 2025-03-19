import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { selectToken } from "../../redux/selectors";
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
} from "chart.js";
import "chartjs-adapter-date-fns";
import DateFilterControls from "./components/DateFilterControls";
import TabNavigation from "./components/TabNavigation";
import SalesSummaryTab from "./Tabs/SalesSummaryTab";
import SalesAnalysisTab from "./Tabs/SalesAnalysisTab";
import InventoryTab from "./Tabs/InventoryTab";
import RevenueTab from "./Tabs/RevenueTab";
import {
  getDefaultStartDate,
  getFilteredLabel,
} from "./components/AnalyticsUtils";

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
  TimeScale,
);

const Analytics = () => {
  // State for general data
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topFoods, setTopFoods] = useState([]);
  const [topDrinks, setTopDrinks] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const token = useSelector(selectToken);
  const API_URL = import.meta.env.VITE_API_URL;

  // State for filtering
  const [dateFilter, setDateFilter] = useState("week");
  const [startDate, setStartDate] = useState(getDefaultStartDate("week"));
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeTab, setActiveTab] = useState("summary");

  // State for detailed data
  const [dailySales, setDailySales] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [salesBreakdown, setSalesBreakdown] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    items: [],
    totalAmount: 0,
  });

  const [overviewStats, setOverviewStats] = useState({
    userCount: 0,
    foodCount: 0,
    drinkCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [filteredLabel, setFilteredLabel] = useState("This Week's");

  // Initial data loading
  useEffect(() => {
    fetchFilteredStats();
    fetchTopFoods();
    fetchTopDrinks();
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
    setEndDate(new Date().toISOString().split("T")[0]);
    setFilteredLabel(getFilteredLabel(period));
  };

  // Fetch top selling foods
  const fetchTopFoods = async () => {
    try {
      const response = await fetch(`${API_URL}/topSellingFoods`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch top foods");
      }

      const data = await response.json();
      setTopFoods(data || []);
    } catch (error) {
      console.error("Error fetching top foods:", error);
    }
  };

  // Fetch top selling drinks
  const fetchTopDrinks = async () => {
    try {
      const response = await fetch(`${API_URL}/topSellingDrinks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch top drinks");
      }

      const data = await response.json();
      setTopDrinks(data || []);
    } catch (error) {
      console.error("Error fetching top drinks:", error);
    }
  };

  // Fetch monthly revenue
  const fetchMonthlyRevenue = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/monthly-revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch monthly revenue");
      }

      const data = await response.json();
      setMonthlyRevenue(data.monthlyRevenue || {});
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
    }
  };

  // Fetch daily sales data
  const fetchDailySales = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/daily-sales?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch daily sales");
      }

      const data = await response.json();
      setDailySales(data.dailySales || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
      toast.error("Could not load daily sales data");
    }
  };

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/inventory?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const data = await response.json();
      setInventoryItems(data.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // Fetch sales breakdown
  const fetchSalesBreakdown = async () => {
    try {
      const response = await fetch(
        `${API_URL}/admin/sales-breakdown?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales breakdown");
      }

      const data = await response.json();
      setSalesBreakdown(data.sales.byPaymentMethod || []);
    } catch (error) {
      console.error("Error fetching sales breakdown:", error);
    }
  };

  // Fetch sales summary
  const fetchSalesSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/admin/sales-summary?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sales summary");
      }

      const data = await response.json();

      if (data.success) {
        setSalesSummary({
          items: data.items || [],
          totalAmount: data.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      toast.error("Could not load sales summary");
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
        url.searchParams.append("startDate", startDate);
      }
      if (endDate) {
        url.searchParams.append("endDate", endDate);
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);

      const isFiltered =
        startDate !== getDefaultStartDate("all") ||
        endDate !== new Date().toISOString().split("T")[0];

      if (isFiltered && data.stats) {
        setOverviewStats({
          userCount: data.stats.filteredUserCount || 0,
          foodCount: data.stats.filteredFoodCount || 0,
          drinkCount: data.stats.filteredDrinkCount || 0,
          orderCount: data.stats.filteredOrderCount || 0,
          totalRevenue: data.stats.filteredRevenue || 0,
          recentOrders: data.stats.filteredRecentOrders || [],
        });
      } else {
        setOverviewStats({
          userCount: data.stats.userCount || 0,
          foodCount: data.stats.foodCount || 0,
          drinkCount: data.stats.drinkCount || 0,
          orderCount: data.stats.orderCount || 0,
          totalRevenue: data.stats.totalRevenue || 0,
          recentOrders: data.stats.recentOrders || [],
        });
      }
    } catch (error) {
      setError(error.message || "Error fetching statistics");
      toast.error(error.message || "Error fetching statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin | Analytics Dashboard</title>
      </Helmet>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Date filter controls */}
        <DateFilterControls
          dateFilter={dateFilter}
          startDate={startDate}
          endDate={endDate}
          handleDateFilterChange={handleDateFilterChange}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        {/* Tab navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-yellow-600 text-4xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* SALES SUMMARY TAB */}
            {activeTab === "summary" && (
              <SalesSummaryTab
                salesSummary={salesSummary}
                startDate={startDate}
                endDate={endDate}
              />
            )}

            {/* SALES TAB */}
            {activeTab === "sales" && (
              <SalesAnalysisTab
                dailySales={dailySales}
                topFoods={topFoods}
                topDrinks={topDrinks}
              />
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <InventoryTab
                inventoryItems={inventoryItems}
                summary={{
                  foodCount: overviewStats.foodCount,
                  drinkCount: overviewStats.drinkCount,
                  totalItems: inventoryItems.length,
                }}
              />
            )}

            {/* REVENUE TAB */}
            {activeTab === "revenue" && (
              <RevenueTab
                stats={stats}
                monthlyRevenue={monthlyRevenue}
                salesBreakdown={salesBreakdown}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;
