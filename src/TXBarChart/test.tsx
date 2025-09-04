// tests/atoms/TXChart/TXChart.program-analysis.spec.tsx
import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TXChart } from '../../../src/atoms/TXChart/index';
import { calculateHeights } from '../../../src/atoms/TXChart/TXBarChart'; // <-- adjust if path differs

// --- env/polyfills (ResizeObserver + rAF) ---
class RO {
  cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) { this.cb = cb; }
  observe = (el: Element) => {
    this.cb([{ contentRect: { width: 600, height: 400 } as any } as ResizeObserverEntry], this as any);
  };
  disconnect = () => {};
}
(global as any).ResizeObserver = RO;

const origRAF = global.requestAnimationFrame;
beforeAll(() => {
  (global as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
});
afterAll(() => {
  (global as any).requestAnimationFrame = origRAF;
});

describe('TXChart Component (program-analysis-bar-chart)', () => {
  const mockData: any = [
    { title: 'Test1', value: 100, color: 'red', popoverContent: 'Test Content 1' },
    { title: 'Test2', value: 200, color: 'blue', popoverContent: 'Test Content 2' },
  ];

  const mockSegments: any = [
    { title: 'Segment1', value: 150 },
    { title: 'Segment2', value: 250 },
  ];

  it('renders with defaults', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    expect(screen.getByText('Test1')).toBeInTheDocument();
    expect(screen.getByText('Test2')).toBeInTheDocument();
  });

  it('opens popover on data element click', async () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Test1'));

    // Wait for popover content to mount
    expect(await screen.findByText('Test Content 1')).toBeInTheDocument();

    // With the a11y fix above, this now passes
    expect(screen.getByRole('dialog', { name: /details/i })).toBeInTheDocument();
  });

  it('closes popover via Close button', async () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Test1'));
    const dlg = await screen.findByTestId('tx-popover');
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByTestId('tx-popover')).not.toBeInTheDocument();
  });


  it('closes popover on outside click', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Test1'));
    fireEvent.click(document);
    expect(screen.queryByText('Test Content 1')).not.toBeInTheDocument();
  });

  it('closes popover on Escape key', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Test1'));
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByText('Test Content 1')).not.toBeInTheDocument();
  });

  it('renders the correct number of data elements', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    const dataElements = screen.getAllByTestId(/data-element-/);
    expect(dataElements).toHaveLength(mockData.length);
  });

  it('renders the correct number of segments (FIX)', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    const segElements = screen.getAllByTestId(/segment-element-/);
    // ✅ Segments are from labels, not datasets
    expect(segElements).toHaveLength(mockSegments.length);
  });

  it('does not open popover when clicking a segment', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Segment1'));
    expect(screen.queryByText('Test Content 1')).not.toBeInTheDocument();
  });

  it('applies the correct background color per data element', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    const dataElements = screen.getAllByTestId(/data-element-/);
    dataElements.forEach((el, i) => {
      expect(el).toHaveStyle(`background-color: ${mockData[i].color}`);
    });
  });

  it('renders segment titles', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    mockSegments.forEach(s => {
      expect(screen.getByText(s.title)).toBeInTheDocument();
    });
  });

  it('does not open popover if popoverContent is missing', () => {
    const dataWithout = mockData.map(d => ({ ...d, popoverContent: null }));
    render(<TXChart type="program-analysis-bar-chart" datasets={dataWithout} labels={mockSegments} />);
    fireEvent.click(screen.getByText('Test1'));
    expect(screen.queryByText('Test Content 1')).not.toBeInTheDocument();
  });

  it('exposes proper ARIA when popoverContent exists (role=button, haspopup=dialog, tabIndex=0)', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    // "Test1" text sits inside the interactive ".data-details"
    const el = screen.getByText('Test1').closest('.data-details') as HTMLElement;
    expect(el).toHaveAttribute('role', 'button');
    expect(el).toHaveAttribute('aria-haspopup', 'dialog');
    expect(el).toHaveAttribute('tabindex', '0');
  });

  it('removes interactive ARIA when popoverContent is missing', () => {
    const dataWithout = mockData.map(d => ({ ...d, popoverContent: null }));
    render(<TXChart type="program-analysis-bar-chart" datasets={dataWithout} labels={mockSegments} />);
    const el = screen.getByText('Test1').closest('.data-details') as HTMLElement;
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('aria-haspopup');
    expect(el).toHaveAttribute('tabindex', '-1');
  });

  it('opens popover via keyboard Enter and Space', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    const target = screen.getByText('Test2').closest('.data-details') as HTMLElement;

    target.focus();
    fireEvent.keyDown(target, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Test Content 2')).toBeInTheDocument();

    // close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByText('Test Content 2')).not.toBeInTheDocument();

    // Space
    target.focus();
    fireEvent.keyDown(target, { key: ' ', code: 'Space' });
    expect(screen.getByText('Test Content 2')).toBeInTheDocument();
  });

  it('renders BottomContent when provided', () => {
    render(
      <TXChart
        type="program-analysis-bar-chart"
        datasets={mockData}
        labels={mockSegments}
        bottomContent={<div data-testid="bottom-content">BOTTOM</div>}
      />
    );
    expect(screen.getByTestId('bottom-content')).toHaveTextContent('BOTTOM');
  });

  it('renders orientation-dependent classes (vertical)', () => {
    render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);
    const data0 = screen.getByTestId('data-element-0');
    expect(data0.className).toMatch(/vertical-bar-text-(top|bottom)/);
  });

  it('renders orientation-dependent classes (horizontal)', () => {
    render(
      <TXChart
        type="program-analysis-bar-chart"
        datasets={mockData}
        labels={mockSegments}
        orientation="horizontal"
      />
    );
    const data0 = screen.getByTestId('data-element-0');
    expect(data0.className).toMatch(/horizontal-bar-text-(top|bottom)/);
  });

  it('segment className reflects top/bottom positioning thresholds', () => {
    // craft labels so one is <10% and one is >= 90% of max
    const labels = [{ title: 'Small', value: 5 }, { title: 'Huge', value: 95 }];
    const data = [{ title: 'D1', value: 10, color: 'purple', popoverContent: 'x' }];

    render(<TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} />);

    const seg0 = screen.getByTestId('segment-element-0'); // 'Huge' will be sorted first
    const seg1 = screen.getByTestId('segment-element-1'); // 'Small' next

    // We don’t know which DOM index maps to which after sorting, so assert using their class names:
    const classes0 = seg0.className;
    const classes1 = seg1.className;

    // Expect one top and one bottom among the two
    expect(classes0.includes('vertical-bar-chart-top') || classes1.includes('vertical-bar-chart-top')).toBe(true);
    expect(classes0.includes('vertical-bar-chart-bottom') || classes1.includes('vertical-bar-chart-bottom')).toBe(true);
  });
});

describe('calculateHeights util', () => {
  it('sorts labels descending by value and computes percentage heights', () => {
    const labels = [
      { title: 'A', value: 10 },
      { title: 'B', value: 30 },
      { title: 'C', value: 20 },
    ];
    const data = [
      { title: 'X', value: 5, color: 'red' },
      { title: 'Y', value: 7, color: 'blue' },
    ];

    const { sortedLabels, calculatedDatasets } = calculateHeights(labels, data);

    // sorted descending: B(30), C(20), A(10)
    expect(sortedLabels.map(l => l.title)).toEqual(['B', 'C', 'A']);

    // maxValue = max(30, 12) = 30
    const maxValue = 30;
    const labelHeights = sortedLabels.map(l => parseFloat(String(l.height)));
    expect(labelHeights).toEqual([
      (30 / maxValue) * 100,
      (20 / maxValue) * 100,
      (10 / maxValue) * 100,
    ].map(v => expect.closeTo ? v : v)); // keep TS happy if needed

    // datasets
    const dsHeights = calculatedDatasets.map(d => parseFloat(String(d.height)));
    expect(dsHeights[0]).toBeCloseTo((5 / maxValue) * 100, 5);
    expect(dsHeights[1]).toBeCloseTo((7 / maxValue) * 100, 5);

    // accumulatedHeight is sum from current index to end
    const expectedAccum = dsHeights.map((_, i) =>
      dsHeights.slice(i).reduce((a, b) => a + b, 0)
    );
    calculatedDatasets.forEach((d, i) => {
      expect(d.accumulatedHeight).toBeCloseTo(expectedAccum[i], 5);
    });

    // The FIRST element carries the total; the LAST is just itself
    expect(calculatedDatasets[0].accumulatedHeight).toBeCloseTo(((5 + 7) / maxValue) * 100, 5);
    expect(calculatedDatasets[1].accumulatedHeight).toBeCloseTo((7 / maxValue) * 100, 5);
  });

  it('handles empty inputs without crashing and uses sane defaults', () => {
    const { sortedLabels, calculatedDatasets } = calculateHeights([], []);
    expect(sortedLabels).toEqual([]);
    expect(calculatedDatasets).toEqual([]);
  });

  it('when labels empty, max is sum(datasets); when datasets empty, max is max(label)', () => {
    const withOnlyData = calculateHeights([], [
      { title: 'D1', value: 40, color: 'red' },
      { title: 'D2', value: 60, color: 'blue' },
    ]);

    // maxValue = 100 → heights 40% and 60%
    const dsHeights = withOnlyData.calculatedDatasets.map(d => parseFloat(String(d.height)));
    expect(dsHeights[0]).toBeCloseTo(40, 5);
    expect(dsHeights[1]).toBeCloseTo(60, 5);

    // accumulated from current → end → [100, 60]
    expect(withOnlyData.calculatedDatasets[0].accumulatedHeight).toBeCloseTo(100, 5);
    expect(withOnlyData.calculatedDatasets[1].accumulatedHeight).toBeCloseTo(60, 5);

    const withOnlyLabels = calculateHeights(
      [{ title: 'L1', value: 25 }, { title: 'L2', value: 75 }],
      []
    );
    // maxValue = 75 → label heights [100%, 33.333%] after sort (L2, L1)
    const lh = withOnlyLabels.sortedLabels.map(l => parseFloat(String(l.height)));
    expect(lh[0]).toBeCloseTo(100, 5);           // 75/75
    expect(lh[1]).toBeCloseTo((25 / 75) * 100, 5);
  });

});
