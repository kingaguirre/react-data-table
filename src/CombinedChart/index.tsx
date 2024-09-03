import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const CombinedChart = () => {
  const data = {
    labels: ['2024-Jan', '2024-Feb', '2024-Mar', '2024-Apr', '2024-May', '2024-Jun', '2024-Jul'],
    datasets: [
      {
        type: 'bar',
        label: 'Volume',
        data: [100, 125, 200, 180, 220, 205, 250],
        backgroundColor: 'rgba(0, 119, 204, 0.8)', // Blue bars
        yAxisID: 'y', // Associate with left y-axis
      },
      {
        type: 'line',
        label: 'USD Equivalent (in Millions)',
        data: [10, 12, 18, 17, 20, 16, 21],
        borderColor: 'rgba(255, 165, 0, 0.8)', // Orange line
        backgroundColor: 'rgba(255, 165, 0, 0.8)', // Orange points
        fill: false,
        yAxisID: 'y1', // Associate with right y-axis
        pointStyle: 'circle',
        pointRadius: 5,
      },
      {
        type: 'line',
        label: 'Trend of Transaction Volume',
        data: [100, 110, 150, 155, 160, 180, 200],
        borderColor: 'rgba(0, 0, 0, 0.5)', // Black dashed line
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderDash: [5, 5], // Dashed line
        fill: false,
        yAxisID: 'y', // Associate with left y-axis
        pointRadius: 0, // No points
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volume',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'USD Equivalent (in Millions)',
        },
        grid: {
          drawOnChartArea: false, // Prevent gridlines on right y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CombinedChart;
