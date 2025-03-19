import React from "react";
import { Line } from "react-chartjs-2";

const DailySalesChart = ({ dailySales }) => {
  const chartData = {
    labels: dailySales.map((day) => day.date),
    datasets: [
      {
        label: "Items Sold",
        data: dailySales.map((day) => day.itemCount),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Revenue (₦)",
        data: dailySales.map((day) => day.revenue),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return (
              label +
              ": " +
              (label.includes("Revenue") ? "₦" + value.toFixed(2) : value)
            );
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Items Sold",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Revenue (₦)",
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default DailySalesChart;
