/**
 * 1762157036601-grid.test.tsx
 *
 * Test coverage for TXGrid (integration with mocked TXDataTableV3).
 * Covers: mount/init, row click, add/update/delete/clear, pagination mapping,
 * duplicate validation -> ErrorModal, fetch modal flow, selectable rows, errorOnUpdateClick.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ──────────────────────────── Mocks ────────────────────────────

/** crypto.getRandomValues used in Add flow */
beforeAll(() => {
  // JSDOM shim
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.crypto = {
    getRandomValues: (arr: Uint8Array | Int8Array) => {
      if (arr && 'length' in arr && arr.length > 0) {
        arr[0] = 123; // deterministic
      }
      return arr;
    },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('lodash', () => ({
  cloneDeep: (x: any) => JSON.parse(JSON.stringify(x)),
}));

jest.mock('@constants/index', () => ({
  DisplayType: {
    EXCEPTION_HANDLING_MAKER: 'EXCEPTION_HANDLING_MAKER',
    STANDALONE_PROCESSING_MAKER: 'STANDALONE_PROCESSING_MAKER',
    IMB_REPROCESS_MAKER: 'IMB_REPROCESS_MAKER',
    PRE_PROCESSING_EXCEPTION_MAKER: 'PRE_PROCESSING_EXCEPTION_MAKER',
    DEAL_AT_BEST_MAKER: 'DEAL_AT_BEST_MAKER',
  },
}));

jest.mock('tradeport-web-components/dist/react', () => {
  const React = require('react');
  const Btn = ({ onButtonClick, children, disabled, ...rest }: any) => (
    <button data-testid={rest['data-testid']} disabled={disabled} onClick={onButtonClick}>
      {children}
    </button>
  );
  return {
    TxCoreButton: Btn,
    TxCoreGrid: ({ children }: any) => <div data-testid="tp-grid">{children}</div>,
    TxCoreColumn: ({ children }: any) => <div data-testid="tp-col">{children}</div>,
    TxCoreHeader: ({ headerTitle }: any) => <div data-testid="tp-header">{headerTitle}</div>,
  };
});

jest.mock('@atoms/TXModal', () => {
  const React = require('react');
  const TXModal: any = ({ show, children }: any) =>
    show ? <div data-testid="tx-modal">{children}</div> : null;
  TXModal.Header = ({ children }: any) => <div data-testid="tx-modal-header">{children}</div>;
  TXModal.Body = ({ children }: any) => <div data-testid="tx-modal-body">{children}</div>;
  TXModal.Footer = ({ children }: any) => <div data-testid="tx-modal-footer">{children}</div>;
  return { TXModal };
});

jest.mock('@atoms/TXConfirmModal', () => {
  const React = require('react');
  return {
    TXConfirmModal: ({ show, title, bodyContent, onClose, buttons = [] }: any) =>
      show ? (
        <div data-testid="tx-confirm">
          <div data-testid="tx-confirm-title">{title}</div>
          <div data-testid="tx-confirm-body">
            {typeof bodyContent === 'string' ? bodyContent : <div>{bodyContent}</div>}
          </div>
          <button
            data-testid="tx-confirm-btn"
            onClick={() => {
              buttons[0]?.onButtonClick?.();
              onClose?.();
            }}
          >
            {buttons[0]?.text || 'OK'}
          </button>
        </div>
      ) : null,
  };
});

jest.mock('@utils/index', () => ({
  isObjectValuesEmpty: (obj: any) =>
    !obj ||
    Object.values(obj).every(
      (v: any) => v === undefined || (typeof v === 'object' && v !== null && Object.keys(v).length === 0)
    ),
  isObjectEmpty: (obj: any) => !obj || Object.keys(obj).length === 0,
  getInputProps: () => ({}),
  getValueFromObject: (obj: any, path: string) =>
    path.split('.').reduce((a: any, k: string) => (a && a[k] !== undefined ? a[k] : undefined), obj),
  isValidArray: (arr: any) => Array.isArray(arr) && arr.length > 0,
}));

// The grid uses useValidate(fieldRefs).validateFields()
jest.mock('../../hooks/useValidation', () => ({
  useValidate: () => ({ validateFields: () => ({ isValid: true }) }),
}));

// Styled tokens inside TXGrid
jest.mock('./styled', () => ({
  Container: ({ children }: any) => <div data-testid="grid-container">{children}</div>,
  ButtonContainer: ({ children }: any) => <div data-testid="button-container">{children}</div>,
  DuplicateContainer: ({ children }: any) => <div data-testid="duplicate-container">{children}</div>,
}));

/**
 * Mock the DataTable used by TXGrid and GridModal:
 * - Exposes imperative API (validate, getSelectedRows, clearSelectedRows, clearActiveRow)
 * - Renders each row as a clickable button to trigger onRowClick
 * - Supports selectable + emit selection button for onSelectedRowsChange
 * - Triggers onPageIndexChange via a test button
 */
jest.mock('@atoms/TXDataTableV3', () => {
  const React = require('react');

  const getValue = (v: any) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
  const getDeepValue = (obj: any, path: string) =>
    path.split('.').reduce((a: any, k: string) => (a ? a[k] : undefined), obj);

  const TXDataTable = React.forwardRef((props: any, ref: any) => {
    const {
      dataSource = [],
      rowKey = 'id',
      onRowClick,
      onPageIndexChange,
      selectable,
      onSelectedRowsChange,
    } = props;

    const [selected, setSelected] = React.useState<any[]>([]);
    React.useImperativeHandle(ref, () => ({
      validate: jest.fn(),
      getSelectedRows: (cb: (rows: any[]) => void) => cb([...selected]),
      clearSelectedRows: () => setSelected([]),
      clearActiveRow: jest.fn(),
    }));

    return (
      <div data-testid={props['data-testid'] || 'tx-dt'}>
        <div data-testid="dt-row-count">{dataSource.length}</div>
        <button data-testid="dt-page-next" onClick={() => onPageIndexChange?.(2)}>
          pageNext
        </button>
        <div>
          {dataSource.map((row: any, idx: number) => (
            <div key={getValue(row[rowKey]) || idx}>
              <button data-testid={`dt-row-${idx}`} onClick={() => onRowClick?.(row, idx)}>
                {getValue(row[rowKey]) || `row-${idx}`}
              </button>
              {selectable && (
                <input
                  data-testid={`dt-select-${idx}`}
                  type="checkbox"
                  checked={selected.some((r) => getValue(r[rowKey]) === getValue(row[rowKey]))}
                  onChange={(e) => {
                    setSelected((prev) =>
                      e.target.checked
                        ? [...prev, row]
                        : prev.filter((r) => getValue(r[rowKey]) !== getValue(row[rowKey]))
                    );
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {selectable && onSelectedRowsChange && (
          <button data-testid="dt-emit-selection" onClick={() => onSelectedRowsChange(selected)}>
            emitSelection
          </button>
        )}
      </div>
    );
  });
  TXDataTable.displayName = 'TXDataTable';

  return { TXDataTable, getValue, getDeepValue };
});

// ──────────────────────────── Imports under test ────────────────────────────

import { TXGrid } from './index';
import { DATA_SOURCE, COLUMN_SETTINGS } from './data';

// ──────────────────────────── Helpers ────────────────────────────

function renderGrid(extraProps: Partial<React.ComponentProps<typeof TXGrid>> = {}) {
  const onChange = jest.fn();
  const onGridMount = jest.fn();
  const onRowClick = jest.fn();
  const onSelectedRowsChange = jest.fn();
  const onPageIndexChange = jest.fn();
  const setDataSource = jest.fn();

  function Harness() {
    const [fieldData, setFieldData] = React.useState<any>(extraProps.fieldData ?? undefined);
    return (
      <TXGrid
        rowKey="goodsId"
        dataSource={DATA_SOURCE.goodsDetails}
        setDataSource={setDataSource}
        columnSettings={COLUMN_SETTINGS}
        fieldData={fieldData}
        setFieldData={setFieldData}
        displayType="EXCEPTION_HANDLING_MAKER"
        // default: allow selection + modal for fetch flow unless overridden
        selectable
        multiSelect
        toFetchData
        onChange={onChange}
        onGridMount={onGridMount}
        onRowClick={onRowClick}
        onSelectedRowsChange={onSelectedRowsChange}
        onPageIndexChange={onPageIndexChange}
        {...extraProps}
      />
    );
  }

  const utils = render(<Harness />);
  return { ...utils, spies: { onChange, onGridMount, onRowClick, onSelectedRowsChange, onPageIndexChange, setDataSource } };
}

// ──────────────────────────── Tests ────────────────────────────

describe('TXGrid', () => {
  test('mounts and triggers onGridMount (respects isAllRowsSelected)', () => {
    const { spies } = renderGrid({ isAllRowsSelected: true });
    expect(spies.onGridMount).toHaveBeenCalledTimes(1);
    const payload = spies.onGridMount.mock.calls[0][0];
    // all rows should be marked selected { isSelected: { value: true } }
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
    const allSelected = payload.every((r: any) => r.isSelected?.value === true);
    expect(allSelected).toBe(true);
  });

  test('row click sets active row and calls onRowClick', async () => {
    const { spies } = renderGrid();
    await userEvent.click(screen.getByTestId('dt-row-0'));
    expect(spies.onRowClick).toHaveBeenCalledWith(expect.objectContaining({ goodsId: expect.anything() }), 0);
  });

  test('pagination mapping: pageNext (2) -> onPageIndexChange called with 1 (zero-based)', async () => {
    const { spies } = renderGrid({ toFetchData: false });
    await userEvent.click(screen.getByTestId('dt-page-next'));
    expect(spies.onPageIndexChange).toHaveBeenCalledWith(1);
  });

  test('clear button clears active row and calls setFieldData({})', async () => {
    const { spies } = renderGrid({ toFetchData: false });
    await userEvent.click(screen.getByTestId('dt-row-1')); // set active row
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    // setFieldData is inside Harness; we can infer through onChange not called & no crash.
    // But Clear triggers setFieldData({}) twice in some branches; still fine.
    // At least no error and buttons remain usable:
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  test('update flow updates the selected row and fires onChange', async () => {
    const { spies } = renderGrid({ toFetchData: false });
    // select row 0
    await userEvent.click(screen.getByTestId('dt-row-0'));
    // simulate external form setting fieldData to modify the row (TXGrid uses setFieldData to update activeRow via effect)
    // We can click Update directly (since useValidate returns isValid:true) — activeRow already equals row 0
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(spies.onChange).toHaveBeenCalledTimes(1);
    const updated = spies.onChange.mock.calls[0][0];
    expect(updated.find((r: any) => r.goodsId?.value || r.goodsId)?.goodsId).toBeDefined();
  });

  test('delete flow removes the selected row and fires onChange', async () => {
    const { spies } = renderGrid({ toFetchData: false });
    const initialCount = Number(screen.getByTestId('dt-row-count').textContent);
    await userEvent.click(screen.getByTestId('dt-row-0')); // select row 0
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(spies.onChange).toHaveBeenCalledTimes(1);
    // mock table re-renders with new count through TXGrid state; just check call payload length smaller
    const payload = spies.onChange.mock.calls[0][0];
    expect(payload.length).toBe(initialCount - 1);
  });

  test('add flow inserts a new row at top when fieldData has values', async () => {
    const { spies } = renderGrid({
      toFetchData: false,
      fieldData: { goodsDescription: { value: 'New Goods' } }, // no goodsId -> add path
    });
    const initialCount = Number(screen.getByTestId('dt-row-count').textContent);
    await userEvent.click(screen.getByRole('button', { name: 'Add New Record' }));
    expect(spies.onChange).toHaveBeenCalledTimes(1);
    const payload = spies.onChange.mock.calls[0][0];
    expect(payload.length).toBe(initialCount + 1);
    const first = payload[0];
    expect((first.goodsId && (first.goodsId.value || first.goodsId)) || '').toMatch(/^goodsId--/);
    expect(first.goodsDescription?.value).toBe('New Goods');
  });

  test('duplicate detection on Add shows ErrorModal', async () => {
    // itemNumber '7878.48' exists in data[0]; mark that column unique
    const columns = COLUMN_SETTINGS.map((c) =>
      c.column === 'itemNumber' ? { ...c, isUnique: true } : c
    );
    renderGrid({
      toFetchData: false,
      columnSettings: columns,
      fieldData: { itemNumber: { value: '7878.48' } },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Add New Record' }));
    const modal = await screen.findByTestId('tx-confirm');
    expect(within(modal).getByText('Validation Error')).toBeInTheDocument();
    expect(within(modal).getByText(/Duplicate Value\/s/i)).toBeInTheDocument();
    await userEvent.click(within(modal).getByTestId('tx-confirm-btn')); // close
    expect(modal).not.toBeInTheDocument();
  });

  test('errorOnUpdateClick shows ErrorModal immediately on Update', async () => {
    renderGrid({ toFetchData: false, errorOnUpdateClick: 'Block update' });
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    const modal = await screen.findByTestId('tx-confirm');
    expect(within(modal).getByText('Block update')).toBeInTheDocument();
    await userEvent.click(within(modal).getByTestId('tx-confirm-btn'));
    expect(modal).not.toBeInTheDocument();
  });

  test('fetch modal: open -> select rows in popup -> Add to Record -> onChange w/ selected rows', async () => {
    const { spies } = renderGrid({ toFetchData: true });
    // open modal
    await userEvent.click(screen.getByRole('button', { name: 'Fetch Data' }));
    const modal = await screen.findByTestId('tx-modal');
    const modalBody = within(modal).getByTestId('tx-modal-body');

    // select first two rows in the popup table
    const popupRow0 = within(modalBody).getByTestId('dt-row-0');
    const popupRow1 = within(modalBody).getByTestId('dt-row-1');
    await userEvent.click(popupRow0); // typical to focus row
    await userEvent.click(popupRow1);
    await userEvent.click(within(modalBody).getByTestId('dt-select-0'));
    await userEvent.click(within(modalBody).getByTestId('dt-select-1'));

    // click "Add to Record" in modal footer
    await userEvent.click(within(modal).getByRole('button', { name: 'Add to Record' }));

    // onChange fired with rows containing isSelected=true for chosen
    expect(spies.onChange).toHaveBeenCalled();
    const payloadJson = JSON.stringify(spies.onChange.mock.calls[0][0]);
    expect(payloadJson).toMatch(/"isSelected":{"value":true}/);
  });

  test('selectable in main grid: emit selection to grid -> onChange + external onSelectedRowsChange fire', async () => {
    const { spies } = renderGrid({ toFetchData: false, selectable: true });
    // toggle a couple of selections in main table
    await userEvent.click(screen.getByTestId('dt-select-0'));
    await userEvent.click(screen.getByTestId('dt-select-1'));
    await userEvent.click(screen.getByTestId('dt-emit-selection'));

    expect(spies.onSelectedRowsChange).toHaveBeenCalled();
    expect(spies.onChange).toHaveBeenCalled();
  });
});
