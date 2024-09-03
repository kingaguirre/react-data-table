import React from 'react';
import { Bar } from 'react-chartjs-2';
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
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ChartDataLabels);

type VolumeVerticalBarChartOptions = {
  y1Title?: string;
  y2Title?: string;
};

type DistributionHorizontalBarChartOptions = {
  hideLabels?: boolean;
  valueFormatter?: (value: number) => string;
};

type TXChartProps = {
  type?: 'volume-vertical-bar-chart' | 'distribution-horizontal-bar-chart';
  labels: string[];
  datasets: any[]; // Use specific types if your datasets have a defined structure
  customOptions?: ChartOptions<'bar'>;
  height?: string | number;
  title?: string;
  volumeVerticalBarChartOptions?: VolumeVerticalBarChartOptions;
  distributionHorizontalBarChartOptions?: DistributionHorizontalBarChartOptions;
};

const defaultFormatter = (value: number) => `${value}K`;

const chartOptions: Record<string, ChartOptions<'bar'>> = {
  "volume-vertical-bar-chart": {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        grid: {
          display: false, // Remove vertical grid lines
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          display: true, // Keep horizontal grid lines
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Move legend to the right side
        align: 'center', // Align legend items at the start (top)
        labels: {
          boxWidth: 20, // Set the width of the color box in the legend
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
      title: {
        display: true,
        text: '', // Will be dynamically updated based on props
        position: 'top',
        align: 'center',
        font: {
          size: 20, // Set font size to 20px
        },
      },
      datalabels: {
        display: false, // Disable the data labels for volume-vertical-bar-chart
      },
    },
  },
  "distribution-horizontal-bar-chart": {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 50, // Add padding to the right to ensure text visibility
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: true, // Keep vertical grid lines
        },
      },
      y: {
        display: true, // Option to hide/show y-axis labels (will be overridden)
        beginAtZero: true,
        grid: {
          display: false, // Remove horizontal grid lines
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true, // Always show data labels on bars
        anchor: 'end', // Position labels at the end of the bars
        align: 'end', // Align labels to the end of the bars
        clip: false, // Prevent clipping of labels
        color: 'black', // Set the color of the labels
      },
      title: {
        display: true,
        text: '', // Will be dynamically updated based on props
        position: 'top',
        align: 'center',
        font: {
          size: 20, // Set font size to 20px
        },
      },
    },
  },
  default: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // Set legend position to bottom
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: '', // Will be dynamically updated based on props
        position: 'top',
        align: 'center',
        font: {
          size: 20, // Set font size to 20px
        },
      },
    },
  },
};

const TXChart: React.FC<TXChartProps> = ({
  type,
  labels,
  datasets,
  customOptions,
  height = '500px',
  title,
  volumeVerticalBarChartOptions,
  distributionHorizontalBarChartOptions,
}) => {
  // Clone the options object to ensure each chart has its own unique options
  let options = JSON.parse(JSON.stringify(chartOptions[type || 'default']));

  if (type === 'volume-vertical-bar-chart' && volumeVerticalBarChartOptions) {
    const { y1Title, y2Title } = volumeVerticalBarChartOptions;

    // Modify options dynamically based on provided titles
    options = {
      ...options,
      scales: {
        ...options.scales,
        y: {
          ...options.scales?.y,
          title: {
            display: !!y1Title,
            text: y1Title,
          },
        },
        y1: {
          ...options.scales?.y1,
          title: {
            display: !!y2Title,
            text: y2Title,
          },
        },
      },
    };
  }

  if (type === 'distribution-horizontal-bar-chart') {
    if (distributionHorizontalBarChartOptions) {
      const { hideLabels = false, valueFormatter } = distributionHorizontalBarChartOptions;

      // Modify options for the distribution-horizontal-bar-chart type
      options = {
        ...options,
        scales: {
          ...options.scales,
          y: {
            ...options.scales?.y,
            display: !hideLabels, // Control display of y-axis labels, true will hide labels, false will show them
          },
        },
        plugins: {
          ...options.plugins,
          datalabels: {
            ...options.plugins?.datalabels,
            formatter: valueFormatter, // Set custom formatter for values
          },
        },
      };
    } else {
      options = {
        ...options,
        plugins: {
          ...options.plugins,
          datalabels: {
            ...options.plugins?.datalabels,
            formatter: defaultFormatter, // Set default formatter for values
          },
        },
      }
    }
  }

  options = type ? options || chartOptions['default'] : customOptions || chartOptions['default'];

  // Set the chart title if provided
  if (title) {
    options.plugins!.title!.text = title;
  }

  return (
    <div style={{ width: '100%', height }}>
      <Bar
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
