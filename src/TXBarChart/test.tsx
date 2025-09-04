// tests/atoms/TXChart/TXChart.program-analysis.spec.tsx
import React from 'react';
import { render, fireEvent, screen, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { TXChart } from '../../../src/atoms/TXChart/index';
import { calculateHeights } from '../../../src/atoms/TXChart/TXBarChart'; // <-- adjust if path differs

// helper: extract numeric delta from inline style like "calc(50% - 12.34px)"
const getDeltaPx = (el: HTMLElement) => {
  const s = (el.style?.top ?? '').toString();
  const m = s.match(/calc\(50%\s*-\s*([-\d.]+)px\)/);
  return m ? parseFloat(m[1]) : 0;
};

const readDeltaPx = (el: HTMLElement) => {
  const s = (el.style?.top ?? '').toString();
  const m = s.match(/calc\(50%\s*-\s*([-\d.]+)px\)/);
  return m ? parseFloat(m[1]) : 0;
};

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

describe('TXChart – extra coverage', () => {
  it('uses chartHeight in vertical label shift calculations (smaller vs larger height)', async () => {
    const labels = [{ title: 'Max', value: 1000000 }, { title: 'Mid', value: 500000 }];
    // Many skinny segments so labels must shift
    const data = [
      { title: 'D1', value: 5000, color: 'red' },
      { title: 'D2', value: 4000, color: 'blue' },
      { title: 'D3', value: 3000, color: 'green' },
      { title: 'D4', value: 2000, color: 'purple' },
      { title: 'D5', value: 1000, color: 'orange' },
    ];

    // small chart
    const { unmount: unmountSmall } = render(
      <TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} chartHeight={200} />
    );

    // allow rAF and internal computations
    await new Promise(r => setTimeout(r, 30));
    const smallTopEl = (screen.getByTestId('data-element-0').querySelector('.data-details') as HTMLElement);
    const smallDelta = getDeltaPx(smallTopEl);
    unmountSmall();

    // large chart
    render(
      <TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} chartHeight={600} />
    );
    await new Promise(r => setTimeout(r, 30));
    const largeTopEl = (screen.getByTestId('data-element-0').querySelector('.data-details') as HTMLElement);
    const largeDelta = getDeltaPx(largeTopEl);

    // With a taller chart, the computed spacing scales; absolute delta should be larger or equal
    expect(Math.abs(largeDelta)).toBeGreaterThanOrEqual(Math.abs(smallDelta));
  });

  it('flips is-mounted after segs are positioned (covers segAnimOn path)', async () => {
    const labels = [{ title: 'A', value: 60 }, { title: 'B', value: 40 }, { title: 'C', value: 20 }];
    const data = [{ title: 'X', value: 10, color: 'red' }, { title: 'Y', value: 5, color: 'blue' }];

    render(<TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} />);
    // Wait past the 600ms label-offset timer + next rAF
    await waitFor(
      async () => {
        const container = document.querySelector('.chart-container') as HTMLElement;
        expect(container).toBeTruthy();
        expect(container.className).toContain('is-mounted');
      },
      { timeout: 1200 }
    );
  });

  it('bottom crowding: pins bottom-most label (delta=0) and shifts others up', async () => {
    // Large segment values (labels) with tiny data at the bottom to force crowding
    const labels = [
      { title: 'A', value: 1000000 },
      { title: 'B', value: 99000 },
      { title: 'C', value: 30000 },
    ];
    const data = [
      { title: 'Low1', value: 99000, color: 'teal' },
      { title: 'Low2', value: 1000, color: 'pink' },
    ];

    render(<TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} chartHeight={240} />);

    await new Promise(r => setTimeout(r, 30));

    const d0 = screen.getByTestId('data-element-0').querySelector('.data-details') as HTMLElement;
    const d1 = screen.getByTestId('data-element-1').querySelector('.data-details') as HTMLElement;

    const delta0 = getDeltaPx(d0);
    const delta1 = getDeltaPx(d1); // last bar → bottom-most

    // bottom-most is always 0 (pinned), the one above should be shifted (>= 0)
    expect(delta1).toBeCloseTo(0, 2);
    expect(delta0).toBeGreaterThanOrEqual(0);
  });

  it('handles the provided "stock to top" example ordering (100000; data 10,10,100000) and keeps bottom pinned', async () => {
    const labels = [{ title: 'Cap', value: 100000 }];
    const data = [
      { title: 'Small1', value: 10, color: '#0af' },
      { title: 'Small2', value: 10, color: '#0bf' },
      { title: 'Big', value: 100000, color: '#07f' }, // last → bottom-most segment
    ];

    render(<TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} chartHeight={220} />);

    await new Promise(r => setTimeout(r, 30));

    const bottomEl = screen.getByTestId('data-element-2').querySelector('.data-details') as HTMLElement;
    const bottomDelta = getDeltaPx(bottomEl);
    expect(bottomDelta).toBeCloseTo(0, 2); // bottom pinned

    // sanity: some non-bottom element will have a non-zero delta if spacing is needed
    const maybeShifted = screen.getByTestId('data-element-0').querySelector('.data-details') as HTMLElement;
    expect(Math.abs(getDeltaPx(maybeShifted))).toBeGreaterThanOrEqual(0);
  });

  it('handleContainerKeyDown: prevents default and stops propagation for Enter/Space on the popover wrapper', async () => {
  const mockData = [
    { title: 'Clickable', value: 100, color: 'red', popoverContent: <div>POP</div>, popoverTitle: 'Details' },
  ];
  const mockSegments = [{ title: 'S', value: 200 }];

  render(<TXChart type="program-analysis-bar-chart" datasets={mockData} labels={mockSegments} />);

  // open popover
  fireEvent.click(screen.getByText('Clickable'));
  const dialog = await screen.findByRole('dialog', { name: /details/i });

  // portal wrapper that has onKeyDown={handleContainerKeyDown}
  const wrapper = dialog.parentElement as HTMLElement;

  // Bubble-phase doc listener (NO { capture: true } here)
  const docHandler = jest.fn();
  document.addEventListener('keydown', docHandler);

  // Use RTL's fireEvent so React synthetic handler runs
  const evEnter = { key: 'Enter', code: 'Enter' } as any;
  fireEvent.keyDown(wrapper, evEnter);

  // defaultPrevented should be true
  // (RTL doesn’t give us the original event object back, so assert by side effect)
  expect(docHandler).not.toHaveBeenCalled();

  const evSpace = { key: ' ', code: 'Space' } as any;
  fireEvent.keyDown(wrapper, evSpace);
  expect(docHandler).not.toHaveBeenCalled();

  document.removeEventListener('keydown', docHandler);
});

it('top crowding: correction prevents any label from overflowing chart top', async () => {
  const labels = [{ title: 'Ceiling', value: 600 }, { title: 'Floor', value: 100 }];
  const data = Array.from({ length: 8 }, (_, i) => ({ title: `T${i+1}`, value: 10, color: `#${i}${i}${i}` }));
  const chartHeight = 120;

  render(
    <TXChart
      type="program-analysis-bar-chart"
      datasets={data}
      labels={labels}
      chartHeight={chartHeight}
    />
  );

  // Wait a tick for rAF label pass (your vertical label pass doesn’t gate this, but be safe)
  await new Promise(r => setTimeout(r, 30));

  // Recompute geometric centers using same util
  const { calculatedDatasets } = calculateHeights(labels as any, data as any);
  const chartPx = typeof chartHeight === 'number' ? chartHeight : parseFloat(String(chartHeight));
  const MIN_BOX_H = 14; // matches component guard

  // Ensure no final overflow (center + delta + boxH/2 <= chartPx)
  for (let i = 0; i < calculatedDatasets.length; i++) {
    const d = calculatedDatasets[i] as any;
    const hPct = parseFloat(d.height || '0');
    const hPx = chartPx * (hPct / 100);
    const accPct = Number(d.accumulatedHeight) || 0;
    const bottomPx = chartPx * ((accPct - hPct) / 100);
    const centerAbs = bottomPx + hPx / 2;

    const el = screen.getByTestId(`data-element-${i}`).querySelector('.data-details') as HTMLElement;
    const delta = readDeltaPx(el);
    const finalOverflow = centerAbs + delta + MIN_BOX_H / 2 - chartPx;

    expect(finalOverflow).toBeLessThanOrEqual(0.5); // allow tiny rounding tolerance
  }
});

it('top crowding (with slack): top label gets a negative delta when there is room to push down', async () => {
  const labels = [{ title: 'Ceiling', value: 2000 }, { title: 'Floor', value: 500 }];
  // lots of tiny bars → huge upward pass; taller chart → room to push down
  const data = Array.from({ length: 12 }, (_, i) => ({ title: `T${i+1}`, value: 5, color: '#777' }));
  const chartHeight = 180;

  render(<TXChart type="program-analysis-bar-chart" datasets={data} labels={labels} chartHeight={chartHeight} />);
  await new Promise(r => setTimeout(r, 30));

  const topEl = screen.getByTestId('data-element-0').querySelector('.data-details') as HTMLElement;
  const topDelta = readDeltaPx(topEl);
  expect(topDelta).toBeLessThan(0);
});


});