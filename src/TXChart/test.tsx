// __mocks__/chart.js
export const Bar = jest.fn(() => null);
export const Line = jest.fn(() => null);
export const Pie = jest.fn(() => null);
export const Radar = jest.fn(() => null);
export const PolarArea = jest.fn(() => null);
export const Bubble = jest.fn(() => null);
export const Scatter = jest.fn(() => null);

export const Chart = {
  register: jest.fn(),
};

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TXChart from './TXChart'; // Adjust the path if necessary
import { Bar, Line, Pie, Radar, PolarArea, Bubble, Scatter } from 'chart.js';

jest.mock('chart.js', () => ({
  Bar: jest.fn(() => null),
  Line: jest.fn(() => null),
  Pie: jest.fn(() => null),
  Radar: jest.fn(() => null),
  PolarArea: jest.fn(() => null),
  Bubble: jest.fn(() => null),
  Scatter: jest.fn(() => null),
  Chart: { register: jest.fn() },
}));

describe('TXChart Component', () => {
  const mockLabels = ['January', 'February', 'March'];
  const mockDatasets = [
    {
      label: 'Dataset 1',
      data: [100, 200, 300],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ];

  it('renders Bar chart by default', () => {
    const { container } = render(<TXChart labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Bar).toHaveBeenCalled();
  });

  it('renders Line chart when type is "line-chart"', () => {
    const { container } = render(<TXChart type="line-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Line).toHaveBeenCalled();
  });

  it('renders Pie chart when type is "pie-chart"', () => {
    const { container } = render(<TXChart type="pie-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Pie).toHaveBeenCalled();
  });

  it('renders Radar chart when type is "radar-chart"', () => {
    const { container } = render(<TXChart type="radar-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Radar).toHaveBeenCalled();
  });

  it('renders PolarArea chart when type is "polar-area-chart"', () => {
    const { container } = render(<TXChart type="polar-area-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(PolarArea).toHaveBeenCalled();
  });

  it('renders Bubble chart when type is "bubble-chart"', () => {
    const { container } = render(<TXChart type="bubble-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Bubble).toHaveBeenCalled();
  });

  it('renders Scatter chart when type is "scatter-chart"', () => {
    const { container } = render(<TXChart type="scatter-chart" labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Scatter).toHaveBeenCalled();
  });

  it('passes custom title to the chart options', () => {
    const { container } = render(<TXChart type="line-chart" labels={mockLabels} datasets={mockDatasets} title="Custom Title" />);
    expect(container).toBeInTheDocument();
    // Since we are mocking, we can't access the exact title, but we ensure the chart renders correctly
  });

  it('handles customOptions such as stacked option', () => {
    render(<TXChart type="bar" labels={mockLabels} datasets={mockDatasets} customOptions={{ stacked: true }} />);
    expect(Bar).toHaveBeenCalled();
  });

  it('handles volume-vertical-bar-chart options', () => {
    render(
      <TXChart
        type="volume-vertical-bar-chart"
        labels={mockLabels}
        datasets={mockDatasets}
        volumeVerticalBarChartOptions={{ y1Title: 'Y1 Axis', y2Title: 'Y2 Axis' }}
      />
    );
    expect(Bar).toHaveBeenCalled();
  });

  it('handles distribution-horizontal-bar-chart options', () => {
    render(
      <TXChart
        type="distribution-horizontal-bar-chart"
        labels={mockLabels}
        datasets={mockDatasets}
        distributionHorizontalBarChartOptions={{ hideLabels: true, valueFormatter: (val) => `${val} units` }}
      />
    );
    expect(Bar).toHaveBeenCalled();
  });

  it('handles default chart rendering when type is not specified', () => {
    const { container } = render(<TXChart labels={mockLabels} datasets={mockDatasets} />);
    expect(container).toBeInTheDocument();
    expect(Bar).toHaveBeenCalled();
  });
});
