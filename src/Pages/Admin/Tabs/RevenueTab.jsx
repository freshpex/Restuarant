import React from 'react';
import { FaMoneyBillWave, FaDownload } from 'react-icons/fa';
import { formatPrice } from '../../../utils/formatUtils';
import { exportToCSV } from '../components/AnalyticsUtils';
import MonthlyRevenueChart from '../Charts/MonthlyRevenueChart';
import PaymentMethodChart from '../Charts/PaymentMethodChart';

const RevenueTab = ({ stats, monthlyRevenue, salesBreakdown }) => {
  const handleExport = () => {
    exportToCSV(
      Object.entries(monthlyRevenue).map(([month, amount]) => ({month, amount})),
      'revenue-data'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FaMoneyBillWave className="mr-2 text-yellow-600" /> Revenue Analysis
        </h2>
        <div className="mt-2 md:mt-0">
          <button
            onClick={handleExport}
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
              : '₦0.00'}
          </h3>
          <p className="text-xs text-green-700 mt-1">Per order</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <p className="text-sm font-medium text-purple-800">Current Month Revenue</p>
          <h3 className="text-2xl font-bold text-purple-900 mt-2">
            {(() => {
              const now = new Date();
              const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              return formatPrice(monthlyRevenue[monthKey] || 0);
            })()}
          </h3>
          <p className="text-xs text-purple-700 mt-1">This month</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Monthly Revenue Trend</h3>
        <MonthlyRevenueChart monthlyRevenue={monthlyRevenue} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Sales by Payment Method</h3>
        <PaymentMethodChart salesBreakdown={salesBreakdown} />
      </div>
    </div>
  );
};

export default RevenueTab;
