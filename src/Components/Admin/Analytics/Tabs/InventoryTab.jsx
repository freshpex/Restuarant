import React, { useState } from "react";
import {
  FaBoxOpen,
  FaDownload,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";
import { formatPrice } from "../../../utils/formatUtils";
import { exportToCSV } from "../components/AnalyticsUtils";

const InventoryTab = ({ inventoryItems }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInventory = inventoryItems.filter(
    (item) =>
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCategory?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExport = () => {
    exportToCSV(filteredInventory, "inventory");
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <FaBoxOpen className="mr-2 text-yellow-600" /> Inventory Management
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
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
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
                      {item.itemName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.type === "food"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.type === "food" ? "Food" : "Drink"}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.itemCategory}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
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
          <FaExclamationTriangle className="text-yellow-600 mr-2" /> Low Stock
          Items
        </h3>

        {filteredInventory.filter((item) => parseInt(item.quantity) <= 10)
          .length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
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
                  .filter((item) => parseInt(item.quantity) <= 10)
                  .map((item) => (
                    <tr key={`low-${item._id}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            parseInt(item.quantity) === 0
                              ? "bg-red-100 text-red-800"
                              : parseInt(item.quantity) <= 5
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {parseInt(item.quantity) === 0
                            ? "Out of Stock"
                            : parseInt(item.quantity) <= 5
                              ? "Critical"
                              : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">No low stock items</div>
        )}
      </div>
    </>
  );
};

export default InventoryTab;
