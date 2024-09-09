import React from 'react';
import { Bar, Line, Pie, Radar, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  ChartOptions,
  LineController,  // Import LineController
  BarController,   // Import BarController for bar charts
  PieController,   // Import PieController for pie charts
  RadarController, // Import RadarController for radar charts
  PolarAreaController, // Import PolarAreaController for polar area charts
  BubbleController, // Import BubbleController for bubble charts
  ScatterController, // Import ScatterController for scatter charts
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale, // Radar, PolarArea
  LineController,    // Register LineController
  BarController,     // Register BarController
  PieController,     // Register PieController
  RadarController,   // Register RadarController
  PolarAreaController, // Register PolarAreaController
  BubbleController,  // Register BubbleController
  ScatterController, // Register ScatterController
  ChartDataLabels
);

type VolumeVerticalBarChartOptions = {
  y1Title?: string;
  y2Title?: string;
};

type DistributionHorizontalBarChartOptions = {
  hideLabels?: boolean;
  valueFormatter?: (value: number) => string;
};

type TXChartProps = {
  type?:
    | 'volume-vertical-bar-chart'
    | 'distribution-horizontal-bar-chart'
    | 'line-chart'
    | 'pie-chart'
    | 'radar-chart'
    | 'polar-area-chart'
    | 'bubble-chart'
    | 'scatter-chart';
  labels: string[];
  datasets: any[]; // Define types as needed for your datasets
  customOptions?: ChartOptions<'bar' | 'line' | 'pie'>;
  height?: string | number;
  title?: string;
  volumeVerticalBarChartOptions?: VolumeVerticalBarChartOptions;
  distributionHorizontalBarChartOptions?: DistributionHorizontalBarChartOptions;
};

const defaultFormatter = (value: number) => `${value}K`;

const chartOptions: Record<string, ChartOptions<'bar' | 'line' | 'pie'>> = {
  "volume-vertical-bar-chart": {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, beginAtZero: true, grid: { display: true } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
    },
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: '', font: { size: 20 } },
      datalabels: { display: false }, // Disable the data labels for volume-vertical-bar-chart
    },
  },
  "distribution-horizontal-bar-chart": {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: true } },
    plugins: {
      legend: { display: false },
      datalabels: { display: true, anchor: 'end', align: 'end', clip: false, color: 'black' },
      title: { display: true, text: '', font: { size: 20 } },
    },
  },
  "line-chart": {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: true },
      y: { display: true, beginAtZero: true },
    },
    plugins: {
      legend: { display: true, position: 'bottom' },
      datalabels: { display: false },
      title: { display: true, text: '', font: { size: 20 } },
    },
  },
  "pie-chart": {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true },
      datalabels: { display: false },
      title: { display: true, text: '', font: { size: 20 } },
    },
  },
  default: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      datalabels: { display: false },
      title: { display: true, text: '', font: { size: 20 } },
    },
  },
};

const TXChart: React.FC<TXChartProps> = ({
  type = 'bar', // default to 'bar' chart
  labels,
  datasets,
  customOptions,
  height = '500px',
  title,
  volumeVerticalBarChartOptions,
  distributionHorizontalBarChartOptions,
}) => {
  // Determine which ChartJS component to use
  let ChartComponent;
  switch (type) {
    case 'line-chart':
      ChartComponent = Line;
      break;
    case 'pie-chart':
      ChartComponent = Pie;
      break;
    case 'radar-chart':
      ChartComponent = Radar;
      break;
    case 'polar-area-chart':
      ChartComponent = PolarArea;
      break;
    case 'bubble-chart':
      ChartComponent = Bubble;
      break;
    case 'scatter-chart':
      ChartComponent = Scatter;
      break;
    case 'volume-vertical-bar-chart':
    case 'distribution-horizontal-bar-chart':
    default:
      ChartComponent = Bar;
      break;
  }

  // Clone the options object to ensure each chart has its own unique options
  let options = JSON.parse(JSON.stringify(chartOptions[type] || chartOptions['default']));

  // Handling Volume Vertical Bar Chart Options
  if (type === 'volume-vertical-bar-chart' && volumeVerticalBarChartOptions) {
    const { y1Title, y2Title } = volumeVerticalBarChartOptions;
    options = {
      ...options,
      scales: {
        ...options.scales,
        y: {
          ...options.scales?.y,
          title: { display: !!y1Title, text: y1Title },
        },
        y1: {
          ...options.scales?.y1,
          title: { display: !!y2Title, text: y2Title },
        },
      },
    };
  }

  // Handling Distribution Horizontal Bar Chart Options
  if (type === 'distribution-horizontal-bar-chart' && distributionHorizontalBarChartOptions) {
    const { hideLabels = false, valueFormatter } = distributionHorizontalBarChartOptions;
    options = {
      ...options,
      scales: {
        ...options.scales,
        y: { ...options.scales?.y, display: !hideLabels },
      },
      plugins: {
        ...options.plugins,
        datalabels: {
          ...options.plugins?.datalabels,
          formatter: valueFormatter || defaultFormatter,
        },
      },
    };
  }

  // Use custom options if provided, otherwise use the default
  options = customOptions ? { ...options, ...customOptions } : options;

  // Set the chart title if provided
  if (title) {
    options.plugins!.title!.text = title;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ChartComponent
        data={{
          labels: labels,
          datasets: datasets,
        }}
        options={options}
      />
    </div>
  );
};

export default TXChart;
