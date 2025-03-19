import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaDownload,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { formatPrice } from "../../../utils/formatUtils";
import { exportToCSV } from "../components/AnalyticsUtils";
import Pagination from "../../../Components/Pagination";

const SalesSummaryTab = ({ salesSummary, startDate, endDate }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState([]);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedItems(salesSummary.items.slice(startIndex, endIndex));
  }, [currentPage, salesSummary.items]);

  const handleExport = () => {
    exportToCSV(
      salesSummary.items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        date: item.date,
      })),
      "sales-summary",
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FaMoneyBillWave className="mr-2 text-yellow-600" /> Sales Summary
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

      <div className="mb-6">
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-yellow-700">
            {formatPrice(salesSummary.totalAmount)}
          </p>
          <p className="text-sm text-yellow-600 mt-1">
            {startDate === endDate
              ? `For ${new Date(startDate).toLocaleDateString()}`
              : `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`}
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
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-center">Quantity</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.itemName}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.itemType === "food"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.itemType === "food" ? "Food" : "Drink"}
                      </span>
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
                  <td
                    colSpan="5"
                    className="sticky left-0 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900"
                  >
                    Total:{" "}
                    <span className="md:hidden ml-1 font-bold">
                      {formatPrice(salesSummary.totalAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    {formatPrice(salesSummary.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalItems={salesSummary.items.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <FaChartBar className="text-gray-300 text-4xl mb-3" />
          <p className="text-gray-500 mb-1">
            No sales data available for the selected date range
          </p>
          <p className="text-sm text-gray-400">
            Try selecting a different date range
          </p>
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
  );
};

export default SalesSummaryTab;
