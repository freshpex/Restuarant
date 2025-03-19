import React from "react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "summary"
              ? "border-b-2 border-yellow-600 text-yellow-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Daily Sales (Summary)
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "sales"
              ? "border-b-2 border-yellow-600 text-yellow-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sales Analysis
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "inventory"
              ? "border-b-2 border-yellow-600 text-yellow-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("revenue")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "revenue"
              ? "border-b-2 border-yellow-600 text-yellow-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Revenue
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
