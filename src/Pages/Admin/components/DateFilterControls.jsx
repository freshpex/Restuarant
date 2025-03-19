import React from "react";
import { FaFilter } from "react-icons/fa";

const DateFilterControls = ({
  dateFilter,
  startDate,
  endDate,
  handleDateFilterChange,
  setStartDate,
  setEndDate,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium flex items-center">
            <FaFilter className="mr-2 text-yellow-600" /> Data Filters
          </h2>
          <p className="text-sm text-gray-500">
            Filter the analytics data by date range
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDateFilterChange("day")}
            className={`px-3 py-1 text-sm rounded-full ${
              dateFilter === "day"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleDateFilterChange("week")}
            className={`px-3 py-1 text-sm rounded-full ${
              dateFilter === "week"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleDateFilterChange("month")}
            className={`px-3 py-1 text-sm rounded-full ${
              dateFilter === "month"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => handleDateFilterChange("year")}
            className={`px-3 py-1 text-sm rounded-full ${
              dateFilter === "year"
                ? "bg-yellow-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Last year
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center">
            <label
              htmlFor="startDate"
              className="text-sm mr-2 whitespace-nowrap"
            >
              From:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="text-sm mr-2 whitespace-nowrap">
              To:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateFilterControls;
