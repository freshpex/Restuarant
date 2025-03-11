import React from 'react';
import { Line } from 'react-chartjs-2';
import { formatPrice } from '../../../utils/formatUtils';

const MonthlyRevenueChart = ({ monthlyRevenue }) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  // Prepare chart data
  const chartData = {
    labels: monthNames,
    datasets: [
      {
        label: `Revenue ${currentYear}`,
        data: monthNames.map((_, index) => {
          const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
          return monthlyRevenue[monthKey] || 0;
        }),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatPrice(value)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₦)'
        }
      }
    }
  };

  return (
    <div className="h-96">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MonthlyRevenueChart;
