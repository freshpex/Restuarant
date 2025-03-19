import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import {
  FaUserClock,
  FaUtensils,
  FaClipboardList,
  FaEdit,
  FaCalendarAlt,
  FaSpinner,
  FaUserTag,
  FaChartBar,
  FaCashRegister,
  FaUserTie,
  FaMoneyBillWave,
  FaTruck,
  FaCheck,
  FaExclamationCircle,
  FaShoppingBag,
  FaHistory,
} from "react-icons/fa";
import {
  selectToken,
  selectCurrentUser,
  selectUserRole,
} from "../../redux/selectors";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "react-hot-toast";

const showToast = (message, type) => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast(message, {
      icon: type === "warning" ? "⚠️" : "ℹ️",
      style: {
        borderRadius: "10px",
        background: type === "warning" ? "#FEF3C7" : "#E0F2FE",
        color: type === "warning" ? "#92400E" : "#1E40AF",
      },
    });
  }
};

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState({
    food: 5,
    orders: 5,
    updates: 6,
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [totalActivities, setTotalActivities] = useState(null);
  const [showAllStaff, setShowAllStaff] = useState(false);

  const token = useSelector(selectToken);
  const currentUser = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const API_URL = import.meta.env.VITE_API_URL;

  const isAdminOrManager = userRole === "admin" || userRole === "manager";

  useEffect(() => {
    fetchDashboardData();
    recordSignIn();

    if (isAdminOrManager) {
      fetchTeamData();
      fetchTotalActivities();
    }

    return () => {
      recordSignOut();
    };
  }, [isAdminOrManager]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of all staff members (admin/manager only)
  const fetchTeamData = async () => {
    try {
      const endpoint =
        userRole === "admin"
          ? `${API_URL}/admin/users?role=staff`
          : `${API_URL}/staff/members`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team data");
      }

      const data = await response.json();
      const staffUsers =
        userRole === "admin"
          ? data.users.filter((user) =>
              ["admin", "manager", "chef", "cashier"].includes(user.role),
            )
          : data.users;

      setTeamMembers(staffUsers);
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  // Fetch total activities across all staff (admin/manager only)
  const fetchTotalActivities = async () => {
    try {
      const endpoint =
        userRole === "admin"
          ? `${API_URL}/admin/activities/summary`
          : `${API_URL}/staff/activities/summary`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity summary");
      }

      const data = await response.json();
      setTotalActivities(data);
    } catch (error) {
      console.error("Error fetching activity summary:", error);
    }
  };

  const recordSignIn = async () => {
    try {
      await fetch(`${API_URL}/staff/signin-record`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to record sign-in:", error);
    }
  };

  const recordSignOut = async () => {
    try {
      await fetch(`${API_URL}/staff/signout-record`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to record sign-out:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatActivityType = (type) => {
    switch (type) {
      case "auth_signin":
        return "Signed In";
      case "auth_signout":
        return "Signed Out";
      case "food_added":
        return "Added Food Item";
      case "order_created":
        return "Created Order";
      case "order_status_updated":
        return "Updated Order Status";
      case "order_payment_updated":
        return "Updated Payment Status";
      case "page_access":
        return "Accessed Page";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "auth_signin":
      case "auth_signout":
        return <FaUserClock className="text-blue-500" />;
      case "food_added":
        return <FaUtensils className="text-green-500" />;
      case "order_created":
        return <FaClipboardList className="text-yellow-500" />;
      case "order_status_updated":
      case "order_payment_updated":
        return <FaEdit className="text-indigo-500" />;
      default:
        return <FaCalendarAlt className="text-gray-500" />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "manager":
        return "Manager";
      case "chef":
        return "Chef";
      case "cashier":
        return "Cashier";
      case "admin":
        return "Administrator";
      default:
        return role || "Staff";
    }
  };

  const loadMore = (section) => {
    setDisplayCount((prev) => ({
      ...prev,
      [section]: prev[section] + 5,
    }));
  };

  const viewStaffMember = (email) => {
    if (!isAdminOrManager) return;
    showToast(`Viewing details for ${email}`);
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
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="bg-yellow-100 rounded-full p-4">
              <FaUserTag className="text-yellow-600 text-3xl" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">
                {dashboardData?.user?.name || currentUser?.displayName}
              </h1>
              <p className="text-gray-600">
                {getRoleDisplayName(
                  dashboardData?.user?.role || currentUser?.role,
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardData?.user?.email || currentUser?.email}
              </p>
              {dashboardData?.user?.since && (
                <p className="text-xs text-gray-500 mt-1">
                  Staff member since{" "}
                  {new Date(dashboardData.user.since).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Admin/Manager Team Overview Section */}
        {isAdminOrManager && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center">
              <FaUserTie className="mr-2 text-yellow-600" /> Team Overview
            </h2>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-medium text-gray-700">
                Staff Members ({teamMembers.length})
              </h3>
              <button
                onClick={() => setShowAllStaff(!showAllStaff)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAllStaff ? "Show Summary" : "Show All Staff"}
              </button>
            </div>

            {showAllStaff ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name || member.displayName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              member.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : member.role === "manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : member.role === "chef"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {getRoleDisplayName(member.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {member.lastSignIn
                            ? formatDistanceToNow(new Date(member.lastSignIn), {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => viewStaffMember(member.email)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Activity
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="font-medium text-blue-800">Admins</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {teamMembers.filter((m) => m.role === "admin").length}
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <div className="font-medium text-indigo-800">Managers</div>
                  <div className="text-2xl font-bold text-indigo-900">
                    {teamMembers.filter((m) => m.role === "manager").length}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="font-medium text-green-800">Chefs</div>
                  <div className="text-2xl font-bold text-green-900">
                    {teamMembers.filter((m) => m.role === "chef").length}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <div className="font-medium text-yellow-800">Cashiers</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {teamMembers.filter((m) => m.role === "cashier").length}
                  </div>
                </div>
              </div>
            )}

            {/* Global activity metrics for admin/manager */}
            {totalActivities && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  Total Team Activity (Last 30 days)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-gray-500 text-xs uppercase">
                      Orders Created
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {totalActivities.ordersCreated || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-gray-500 text-xs uppercase">
                      Food Items Added
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {totalActivities.foodAdded || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-gray-500 text-xs uppercase">
                      Order Updates
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {totalActivities.statusUpdates || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-gray-500 text-xs uppercase">
                      Active Staff
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {totalActivities.activeUsers || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Stats - Personal or for all staff (admin/manager) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-yellow-600" /> Today's
              Activity
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Sign-ins</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.today?.signIns || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Food Items Added</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.today?.foodAdded || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Orders Created</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.today?.ordersCreated || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Updates</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.today?.ordersUpdated || 0}
                </span>
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
                <span className="font-semibold text-gray-900">
                  {dashboardData?.totals?.signIns || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Food Items Added</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.totals?.foodAdded || 0}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-sm text-gray-600">Orders Created</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.totals?.ordersCreated || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order Updates</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.totals?.ordersUpdated || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Sign-ins */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaUserClock className="mr-2 text-yellow-600" /> Recent Sign-ins
            </h2>
            <div className="space-y-3">
              {dashboardData?.activity?.signIns
                ?.slice(0, 4)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-2 last:border-0"
                  >
                    <p className="text-sm text-gray-900 mb-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              {(!dashboardData?.activity?.signIns ||
                dashboardData.activity.signIns.length === 0) && (
                <p className="text-sm text-gray-500">No recent sign-ins</p>
              )}
            </div>
          </div>

          {/* Order Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-yellow-600" /> Recent Order
              Activity
            </h2>
            <div className="space-y-3">
              {dashboardData?.activity?.orders
                ?.slice(0, 4)
                .map((activity, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-2 last:border-0"
                  >
                    <p className="text-sm text-gray-900 mb-1">
                      {formatActivityType(activity.activityType)}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {activity.details?.orderDetails?.customer || "Customer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              {(!dashboardData?.activity?.orders ||
                dashboardData.activity.orders.length === 0) && (
                <p className="text-sm text-gray-500">
                  No recent order activity
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
              <FaUtensils className="mr-2 text-yellow-600" /> Food Activities
            </h2>

            <div className="space-y-4">
              {dashboardData?.activity?.food &&
              dashboardData.activity.food.length > 0 ? (
                <>
                  {dashboardData.activity.food
                    .slice(0, displayCount.food)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-500 pl-4 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Added: {activity.details?.foodName || "Food item"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Price: ₦{activity.details?.foodPrice || "0"} •
                              Quantity: {activity.details?.foodQuantity || "0"}
                            </p>
                            {activity.details?.foodCategory && (
                              <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1 mt-1 inline-block">
                                {activity.details.foodCategory}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {activity.timestamp
                              ? format(
                                  new Date(activity.timestamp),
                                  "MMM d, h:mm a",
                                )
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    ))}

                  {dashboardData.activity.food.length > displayCount.food && (
                    <div className="text-center mt-3">
                      <button
                        onClick={() => loadMore("food")}
                        className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center mx-auto"
                      >
                        <FaHistory className="mr-1" /> View More (
                        {dashboardData.activity.food.length - displayCount.food}{" "}
                        remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaUtensils className="mx-auto mb-2 text-gray-300 text-2xl" />
                  <p>No recent food activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Creation Activities */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
              <FaClipboardList className="mr-2 text-yellow-600" /> New Orders
            </h2>

            <div className="space-y-4">
              {dashboardData?.activity?.orders &&
              dashboardData.activity.orders.filter(
                (a) => a.activityType === "order_created",
              ).length > 0 ? (
                <>
                  {dashboardData.activity.orders
                    .filter((a) => a.activityType === "order_created")
                    .slice(0, displayCount.orders)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Customer:{" "}
                              {activity.details?.customerName || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Order #
                              {activity.details?.orderReference?.slice(-6) ||
                                activity.details?.orderId?.slice(0, 6) ||
                                "New order"}
                            </p>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              Amount: ₦{activity.details?.totalAmount || "0.00"}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {activity.timestamp
                              ? format(
                                  new Date(activity.timestamp),
                                  "MMM d, h:mm a",
                                )
                              : "Unknown date"}
                          </span>
                        </div>
                      </div>
                    ))}

                  {dashboardData.activity.orders.filter(
                    (a) => a.activityType === "order_created",
                  ).length > displayCount.orders && (
                    <div className="text-center mt-3">
                      <button
                        onClick={() => loadMore("orders")}
                        className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center mx-auto"
                      >
                        <FaHistory className="mr-1" /> View More (
                        {dashboardData.activity.orders.filter(
                          (a) => a.activityType === "order_created",
                        ).length - displayCount.orders}{" "}
                        remaining)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FaClipboardList className="mx-auto mb-2 text-gray-300 text-2xl" />
                  <p>No recent order creations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Update Activities */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="font-semibold text-xl text-gray-800 mb-4 flex items-center">
            <FaEdit className="mr-2 text-yellow-600" /> Recent Order Updates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData?.activity?.orders &&
            dashboardData.activity.orders.filter(
              (a) =>
                a.activityType === "order_status_updated" ||
                a.activityType === "order_payment_updated",
            ).length > 0 ? (
              <>
                {dashboardData.activity.orders
                  .filter(
                    (a) =>
                      a.activityType === "order_status_updated" ||
                      a.activityType === "order_payment_updated",
                  )
                  .slice(0, displayCount.updates)
                  .map((activity, index) => {
                    let borderColor = "border-gray-300";
                    let icon = <FaEdit className="text-gray-500" />;

                    if (activity.activityType === "order_status_updated") {
                      if (activity.details?.newStatus === "delivered") {
                        borderColor = "border-green-500";
                        icon = <FaCheck className="text-green-500" />;
                      } else if (activity.details?.newStatus === "cancelled") {
                        borderColor = "border-red-500";
                        icon = <FaExclamationCircle className="text-red-500" />;
                      } else if (activity.details?.newStatus === "preparing") {
                        borderColor = "border-blue-500";
                        icon = <FaUtensils className="text-blue-500" />;
                      } else if (activity.details?.newStatus === "ready") {
                        borderColor = "border-purple-500";
                        icon = <FaTruck className="text-purple-500" />;
                      }
                    } else if (
                      activity.activityType === "order_payment_updated"
                    ) {
                      if (activity.details?.newPaymentStatus === "paid") {
                        borderColor = "border-green-500";
                        icon = <FaMoneyBillWave className="text-green-500" />;
                      }
                    }

                    return (
                      <div
                        key={index}
                        className={`border-l-4 ${borderColor} pl-4 py-3 bg-gray-50 rounded`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="mt-0.5">{icon}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                {activity.activityType ===
                                "order_status_updated" ? (
                                  <p className="font-medium text-gray-900">
                                    Status:{" "}
                                    <span className="capitalize">
                                      {activity.details?.oldStatus || "pending"}
                                    </span>{" "}
                                    →{" "}
                                    <span className="capitalize font-semibold">
                                      {activity.details?.newStatus}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="font-medium text-gray-900">
                                    Payment marked as{" "}
                                    <span className="font-semibold text-green-600">
                                      paid
                                    </span>
                                  </p>
                                )}

                                <p className="text-sm">
                                  <span className="text-gray-600">
                                    {activity.details?.orderDetails?.customer ||
                                      "Customer"}
                                  </span>
                                  {activity.details?.orderId && (
                                    <span className="text-xs bg-gray-100 rounded ml-2 px-2 py-0.5">
                                      #
                                      {activity.details.orderId.substring(0, 6)}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {activity.timestamp
                                  ? formatDistanceToNow(
                                      new Date(activity.timestamp),
                                      { addSuffix: true },
                                    )
                                  : "Recently"}
                              </span>
                            </div>

                            {activity.details?.orderDetails?.items && (
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.details.orderDetails.items}
                              </p>
                            )}

                            {activity.details?.orderDetails?.total && (
                              <p className="text-xs font-medium text-gray-800 mt-1">
                                Total: ₦{activity.details.orderDetails.total}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {dashboardData.activity.orders.filter(
                  (a) =>
                    a.activityType === "order_status_updated" ||
                    a.activityType === "order_payment_updated",
                ).length > displayCount.updates && (
                  <div className="col-span-2 text-center mt-3">
                    <button
                      onClick={() => loadMore("updates")}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center mx-auto"
                    >
                      <FaHistory className="mr-1" /> View More (
                      {dashboardData.activity.orders.filter(
                        (a) =>
                          a.activityType === "order_status_updated" ||
                          a.activityType === "order_payment_updated",
                      ).length - displayCount.updates}{" "}
                      remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <FaHistory className="mx-auto mb-2 text-gray-300 text-3xl" />
                <p>No recent order updates</p>
                <p className="text-sm mt-2">
                  Order status and payment updates will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;
