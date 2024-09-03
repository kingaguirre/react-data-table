export const volume_vertical_bar_chart_labels = ['2024-Jan', '2024-Feb', '2024-Mar', '2024-Apr', '2024-May', '2024-Jun', '2024-Jul'];
export const volume_vertical_bar_chart_datasets = [
  {
    type: 'bar',
    label: 'Volume',
    data: [100, 125, 200, 180, 220, 205, 250],
    backgroundColor: 'rgba(0, 119, 204, 0.8)', // Blue bars
    yAxisID: 'y', // Associate with left y-axis
    order: 2,
  },
  {
    type: 'line',
    label: 'USD Equivalent (in Millions)',
    data: [10, 12, 18, 17, 20, 16, 21],
    borderColor: 'rgba(255, 165, 0)', // Orange line
    borderWidth: 3,
    backgroundColor: 'white', // Orange points
    fill: false,
    yAxisID: 'y1', // Associate with right y-axis
    pointStyle: 'circle',
    pointRadius: 6,
    order: 0,
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
    order: 1,
  },
];

export const distribution_horizontal_bar_chart_labels = [
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
];

export const distribution_horizontal_bar_chart_datasets = [
  {
    label: 'Values',
    data: [
      45000, 29000, 22000, 15000, 15000, 7000, 7000, 6000, 5000, 2000, 2000, 1000, 1000, 1000, 1000, 1000, 1000, 459,
    ],
    backgroundColor: 'green',
  },
]