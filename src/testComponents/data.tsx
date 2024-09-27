export const volume_vertical_bar_chart_labels = [undefined, '2024-Jan', '2024-Feb', '2024-Mar', '2024-Apr', '2024-May', '2024-Jun', '2024-Jul'];
export const volume_vertical_bar_chart_datasets = [
  {
    type: 'bar',
    label: 'Volume',
    data: [undefined, 100, 125, 200, 180, 220, 205, 250],
    backgroundColor: 'rgba(0, 119, 204, 0.8)', // Blue bars
    yAxisID: 'y', // Associate with left y-axis
    order: 2,
  },
  {
    type: 'line',
    label: 'USD Equivalent (in Millions)',
    data: [undefined, 10, 12, 18, 17, 20, 16, 21],
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
    data: [undefined, 100, 110, 150, 155, 160, 180, 200],
    borderColor: 'rgba(0, 0, 0, 0.5)', // Black dashed line
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderDash: [5, 5], // Dashed line
    fill: false,
    yAxisID: 'y', // Associate with left y-axis
    pointRadius: 0, // No points
    order: 1,
  },
];

const transformData = (datasets) => {
  const barDataset = datasets.find(dataset => dataset.type === 'bar');
  const lineDataset = datasets.find(dataset => dataset.type === 'line');
  
  if (!barDataset || !lineDataset) {
    throw new Error('Bar or line dataset not found');
  }

  const length = barDataset.data.length; // Get the length of the bar dataset's data array
  const newData: any = [];

  for (let i = 0; i < length; i++) {
    newData.push({
      bar: {
        data: barDataset.data[i], // Bar data
        color: barDataset.backgroundColor // Bar background color
      },
      line: {
        data: lineDataset.data[i], // Line data
        color: lineDataset.borderColor // Line border color
      }
    });
  }

  return newData;
}

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

// const path = require('path');

// module.exports = {
//   stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
//   addons: [
//     '@storybook/addon-links',
//     '@storybook/addon-essentials',
//   ],
//   framework: '@storybook/react',
//   staticDirs: ['../dev'],
//   typescript: {
//     check: true,
//   },
//   webpackFinal: async (config, { configType }) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       '@atoms': path.join(process.cwd(), 'src', 'atoms/'),
//       '@molecules': path.join(process.cwd(), 'src', 'molecules/'),
//       '@organisms': path.join(process.cwd(), 'src', 'organisms/'),
//       '@constants': path.join(process.cwd(), 'src', 'constants/'),
//       '@utils': path.join(process.cwd(), 'src', 'utils/'),
//       '@common': path.join(process.cwd(), 'src', 'common/'),
//     };

//     // Add a rule to handle `.mjs` files and support ES Modules
//     config.module.rules.push({
//       test: /\.mjs$/,
//       include: /node_modules/,
//       type: 'javascript/auto', // Required for handling ES Modules
//     });

//     // Add a rule to handle modern JavaScript files, including ES6/ES7 syntax
//     config.module.rules.push({
//       test: /\.(js|jsx|ts|tsx)$/,
//       exclude: /node_modules/,
//       use: {
//         loader: 'babel-loader',
//         options: {
//           presets: [
//             '@babel/preset-env', 
//             '@babel/preset-react', 
//             '@babel/preset-typescript'
//           ],
//           plugins: ['@babel/plugin-proposal-class-properties'], // Support for class properties
//         },
//       },
//     });

//     config.node = { fs: 'empty' };

//     if (configType === 'PRODUCTION') {
//       config.output.publicPath = '/react-storybook-static/';
//     }

//     return config;
//   },
//   managerWebpack: async (config, { configType }) => {
//     if (configType === 'PRODUCTION') {
//       config.output.publicPath = '/react-storybook-static/';
//     }
//     return config;
//   },
// };
