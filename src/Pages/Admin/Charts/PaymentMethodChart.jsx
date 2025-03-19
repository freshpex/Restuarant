import React from "react";
import { Doughnut } from "react-chartjs-2";
import { formatPrice } from "../../../utils/formatUtils";

const PaymentMethodChart = ({ salesBreakdown }) => {
  const onlineAmount = salesBreakdown
    .filter((item) => item.paymentMethod === "online")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const whatsappAmount = salesBreakdown
    .filter((item) => item.paymentMethod === "whatsapp")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const cashAmount = salesBreakdown
    .filter((item) => item.paymentMethod === "cash")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const chartData = {
    labels: ["Online Payment", "WhatsApp Payment", "Cash on Delivery"],
    datasets: [
      {
        data: [onlineAmount, whatsappAmount, cashAmount],
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B"],
        hoverBackgroundColor: ["#3730A3", "#059669", "#D97706"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce(
              (sum, val) => sum + val,
              0,
            );
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${formatPrice(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80 flex justify-center">
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PaymentMethodChart;
