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
  LineController,
  BarController,
  PieController,
  RadarController,
  PolarAreaController,
  BubbleController,
  ScatterController,
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
  RadialLinearScale,
  LineController,
  BarController,
  PieController,
  RadarController,
  PolarAreaController,
  BubbleController,
  ScatterController,
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
  stacked?: boolean; // Stacked prop to apply across other chart types
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
      datalabels: { display: false },
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
  type = 'bar',
  labels,
  datasets,
  customOptions,
  height = '500px',
  title,
  stacked = false, // Stacked prop
  volumeVerticalBarChartOptions,
  distributionHorizontalBarChartOptions,
}) => {
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

  let options = JSON.parse(JSON.stringify(chartOptions[type] || chartOptions['default']));

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

  // Apply the stacked option to charts other than volume and distribution bar charts
  if (
    type !== 'volume-vertical-bar-chart' &&
    type !== 'distribution-horizontal-bar-chart' &&
    options.scales
  ) {
    options.scales.x = { ...options.scales?.x, stacked: stacked };
    options.scales.y = { ...options.scales?.y, stacked: stacked };
  }

  options = customOptions ? { ...options, ...customOptions } : options;

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
