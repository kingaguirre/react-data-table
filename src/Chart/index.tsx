import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const HorizontalBarChart = () => {
  const data = {
    labels: [
      'DT Export LC Negotiation',
      'DT Export Collections',
      'DT Export LC Adv and Conf',
      'DT Import Collections',
      'OA Vendor Prepay',
      'OA IIF',
      'DT Imports',
      'FI Reimbursements',
      'DT Guarantees',
      'OA Receivables Services',
      'Others',
      'OA EIF',
      'DT Bankers Acceptance',
      'FI Trade Loans',
      'DT BDBR',
      'DT Prehipment',
      'OA BBTL',
      'OA OIF',
    ],
    datasets: [
      {
        label: 'Values',
        data: [
          45000, 29000, 22000, 15000, 15000, 7000, 7000, 6000, 5000, 2000, 2000, 1000, 1000, 1000, 1000, 1000, 1000, 459,
        ],
        backgroundColor: 'green',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        display: false, // Hide the x-axis
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      datalabels: {
        anchor: 'end', // Position the labels at the end of the bars
        align: 'end',
        formatter: (value) => `${value}K`, // Format the value with 'K'
        color: 'black', // Set the color of the labels
        font: {
          weight: 'bold',
        },
      },
      tooltip: {
        enabled: false, // Disable the tooltip since values are shown on the bars
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default HorizontalBarChart;
