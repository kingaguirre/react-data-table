import React from 'react';
import styled from 'styled-components';
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
  customOptions?: ChartOptions<'bar' | 'line' | 'pie'> & {
    stacked?: boolean;
    orientation?: 'horizontal' | 'vertical';
  };
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
      legend: { display: false },
      title: { display: true, text: '', font: { size: 20 }, position: 'top' }, // Set to 'top' initially
      datalabels: { display: true },
    },
  },
  "distribution-horizontal-bar-chart": {
    indexAxis: 'y', // Horizontal layout by default
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      x: { display: false, grid: { display: false } },  // Hide grid for x-axis
      y: { display: true, grid: { display: false }, padding: { right: 20 } } // Add padding-left and hide grid for y-axis
    },
    plugins: {
      legend: { display: false },
      datalabels: { display: true, anchor: 'end', align: 'end', clip: false, color: 'black' },
      title: { display: false },
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

  // Initialize scales if not defined
  if (!options.scales) {
    options.scales = {};
  }

  // Apply orientation (if provided)
  if (customOptions?.orientation) {
    const indexAxis = customOptions.orientation === 'horizontal' ? 'y' : 'x';
    options.indexAxis = indexAxis;
  }

  // Apply stacked option globally except for volume-vertical-bar-chart and distribution-horizontal-bar-chart
  if (customOptions?.stacked && type !== 'volume-vertical-bar-chart' && type !== 'distribution-horizontal-bar-chart') {
    options.scales.x = { ...options.scales.x, stacked: customOptions.stacked };
    options.scales.y = { ...options.scales.y, stacked: customOptions.stacked };
  }

  // Handle volume-vertical-bar-chart specific options
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

  // Handle distribution-horizontal-bar-chart specific options
  if (type === 'distribution-horizontal-bar-chart' && distributionHorizontalBarChartOptions) {
    const { hideLabels = false, valueFormatter } = distributionHorizontalBarChartOptions;
    options = {
      ...options,
      scales: {
        ...options.scales,
        y: { ...options.scales.y, display: !hideLabels, grid: { display: false }, padding: { left: 20 } },
        x: { ...options.scales.x, grid: { display: false } }
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

  // If a title is provided, set it in the options
  if (title) {
    options.plugins.title.text = title;
  }

  // Custom title plugin
  const customTitlePlugin = {
    id: 'customTitle',
    beforeDraw(chart) {
      const { ctx, chartArea: { bottom, left } } = chart;
      ctx.save();
      ctx.font = 'bold 20px Arial'; // Adjust font style
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = chart.options.plugins.title.color || '#000'; // Default title color

      const titleText = chart.options.plugins.title.text;
      if (titleText) { // Only draw if titleText exists
        const padding = 0; // Left padding
        const xPosition = left + padding; // X position with padding
        const yPosition = bottom + 24; // Y position below the chart

        ctx.fillText(titleText, xPosition, yPosition); // X and Y positions for title
      }
      ctx.restore();
    }
  };

  return (
    <div>
      <div style={{ width: '100%', height }}>
        <ChartComponent
          data={{
            labels: labels,
            datasets: datasets,
          }}
          options={options}
          plugins={type === 'distribution-horizontal-bar-chart' ? [customTitlePlugin] : undefined}
        />
      </div>

      {type === 'volume-vertical-bar-chart' && (
        <BottomDataContainer>
          {datasets?.[0]?.data?.map(i => (
            <BottomData>
              <div>{i}</div>
              <div>10</div>
            </BottomData>
          ))}
        </BottomDataContainer>
      )}
    </div>
  );
};

const BottomDataContainer = styled.div`
  display: flex;
  padding: 0 50px;
`
const BottomData = styled.div`
  flex: 1;
  > div {
    text-align: center;
    &:first-child {
      color: yellow;
    }
    &:nth-child(2) {
      color: blue
    }
  }
`

export default TXChart;
