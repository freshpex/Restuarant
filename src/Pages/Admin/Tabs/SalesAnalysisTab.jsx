import React from 'react';
import { FaChartBar, FaDownload } from 'react-icons/fa';
import DailySalesChart from '../Charts/DailySalesChart';
import { exportToCSV } from '../components/AnalyticsUtils';

const SalesAnalysisTab = ({ dailySales }) => {
  const handleExport = () => {
    exportToCSV(dailySales, 'daily-sales');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FaChartBar className="mr-2 text-yellow-600" /> Sales Analysis
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
      
      {dailySales.length > 0 ? (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Daily Sales & Revenue</h3>
            <DailySalesChart dailySales={dailySales} />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">
          No sales data available for the selected date range
        </div>
      )}
    </div>
  );
};

export default SalesAnalysisTab;
