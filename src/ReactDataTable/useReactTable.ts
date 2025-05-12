import { useState, useMemo, useEffect } from 'react';
import TableWorker from './workers/tableWorker?worker';

export interface ColumnSetting {
  title: string;
  column: string;
  groupTitle?: string;
  sort?: 'asc' | 'desc' | false;
  pin?: boolean | string;
  order?: number;
  hidden?: boolean;
  width?: number;
  align?: 'left' | 'right' | 'center';
  // Optional per‑column overrides:
  canSort?: boolean;
  canFilter?: boolean;
  canResize?: boolean;
  canPin?: boolean;
}

interface TableInitialState {
  pageIndex?: number;
  pageSize?: number;
  sorting?: { id: string; desc: boolean }[];
  columnFilters?: { [key: string]: string };
  globalFilter?: string;
  columnOrder?: string[];
  columnPinning?: { left: string[]; right: string[] };
  columnVisibility?: { [key: string]: boolean };
  columnResizing?: { [key: string]: number };
}

interface UseReactTableProps<T> {
  columns: ColumnSetting[];
  data: T[];
  enableMultiRowSelection?: boolean;
  initialState?: TableInitialState;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  // New feature flags:
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableColumnFiltering?: boolean;
  enableColumnSorting?: boolean;
  enableGlobalFiltering?: boolean;
}

export interface ComputedColumnSetting extends ColumnSetting {
  getWidth: () => number;
  isPinned: () => boolean;
  leftPinOffset: () => number;
  getColumnStyle: () => React.CSSProperties;
}

export interface TableInstance<T> {
  headers: () => ComputedColumnSetting[];
  rows: T[];
  totalRows: number;
  loading: boolean;
  pageIndex: number;
  pageSize: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  sorting: { id: string; desc: boolean }[];
  setSorting: React.Dispatch<React.SetStateAction<{ id: string; desc: boolean }[]>>;
  columnFilters: { [key: string]: string };
  setColumnFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  columnOrder: string[];
  setColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
  columnPinning: { left: string[]; right: string[] };
  setColumnPinning: React.Dispatch<React.SetStateAction<{ left: string[]; right: string[] }>>;
  columnVisibility: { [key: string]: boolean };
  setColumnVisibility: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  columnResizing: { [key: string]: number };
  setColumnResizing: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  // Row selection API:
  selectedRowIds: Record<string, boolean>;
  toggleRowSelection: (rowId: string) => void;
  selectAllRows: (rows: T[]) => void;
  deselectAllRows: () => void;
  appendRowsToSelection: (rows: T[]) => void;
  removeRowsFromSelection: (rows: T[]) => void;
  enableMultiRowSelection: boolean;
  // New flags exposed to the UI:
  enableColumnPinning: boolean;
  enableColumnResizing: boolean;
  enableColumnFiltering: boolean;
  enableColumnSorting: boolean;
  enableGlobalFiltering: boolean;
}

export const useReactTable = <T extends Record<string, any>>({
  columns,
  data,
  enableMultiRowSelection = true,
  initialState = {},
  onSelectedRowsChange,
  enableColumnPinning = true,
  enableColumnResizing = true,
  enableColumnFiltering = true,
  enableColumnSorting = true,
  enableGlobalFiltering = true,
}: UseReactTableProps<T>): TableInstance<T> => {
  // Pagination state.
  const [pageIndex, setPageIndex] = useState(initialState.pageIndex ?? 0);
  const [pageSize, setPageSize] = useState(initialState.pageSize ?? 10);

  // Sorting state.
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>(initialState.sorting ?? []);

  // Column filters state.
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>(
    initialState.columnFilters ?? {}
  );

  // Global filter state.
  const [globalFilter, setGlobalFilter] = useState(initialState.globalFilter ?? '');

  // Column order state.
  const [columnOrder, setColumnOrder] = useState<string[]>(
    initialState.columnOrder ?? columns.map((col) => col.column)
  );

  // Column pinning state.
  const [columnPinning, setColumnPinning] = useState<{ left: string[]; right: string[] }>(
    enableColumnPinning ? initialState.columnPinning ?? { left: [], right: [] } : { left: [], right: [] }
  );

  // Column visibility state.
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(
    initialState.columnVisibility ?? {}
  );

  // Column resizing state.
  const [columnResizing, setColumnResizing] = useState<{ [key: string]: number }>(
    enableColumnResizing ? initialState.columnResizing ?? {} : {}
  );

  // States for the computed rows, totalRows, and loading indicator.
  const [rows, setRows] = useState<T[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // --- Row selection state ---
  const rowSelectionMode: 'multiple' | 'single' = enableMultiRowSelection ? 'multiple' : 'single';
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const toggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) => {
      if (rowSelectionMode === 'single') {
        return prev[rowId] ? {} : { [rowId]: true };
      }
      return { ...prev, [rowId]: !prev[rowId] };
    });
  };

  const selectAllRows = (rows: T[]) => {
    const newSelected: Record<string, boolean> = {};
    rows.forEach((row) => {
      const id = row.id ? row.id.toString() : '';
      if (id) newSelected[id] = true;
    });
    setSelectedRowIds(newSelected);
  };

  const deselectAllRows = () => setSelectedRowIds({});

  const appendRowsToSelection = (rows: T[]) => {
    setSelectedRowIds((prev) => {
      const newSelected = { ...prev };
      rows.forEach((row) => {
        const id = row.id ? row.id.toString() : '';
        if (id) newSelected[id] = true;
      });
      return newSelected;
    });
  };

  const removeRowsFromSelection = (rows: T[]) => {
    setSelectedRowIds((prev) => {
      const newSelected = { ...prev };
      rows.forEach((row) => {
        const id = row.id ? row.id.toString() : '';
        if (id) delete newSelected[id];
      });
      return newSelected;
    });
  };

  // Compute headers based on column order and visibility.
  const headers = useMemo(() => {
    let hdrs = columns.filter(
      (col) =>
        (columnVisibility[col.column] === undefined ? true : columnVisibility[col.column]) &&
        !col.hidden
    );
    if (columnOrder && columnOrder.length > 0) {
      hdrs.sort((a, b) => columnOrder.indexOf(a.column) - columnOrder.indexOf(b.column));
    } else {
      hdrs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return hdrs;
  }, [columns, columnVisibility, columnOrder]);

  // --- Enhance headers with dynamic width and pinning helpers ---
  const computedHeaders: ComputedColumnSetting[] = useMemo(() => {
    return headers.map(col => {
      // Returns current width (resized value or default)
      const getWidth = () => columnResizing[col.column] || col.width || 150;
      // Returns true if the column is pinned on the left.
      const isPinned = () => columnPinning.left.includes(col.column);
      // Computes the sticky left offset based on the order of pinned columns.
      const leftPinOffset = () => {
        if (!isPinned()) return 0;
        let offset = enableMultiRowSelection ? 50 : 0;
        const sortedPinned = [...columnPinning.left].sort((a, b) => columnOrder.indexOf(a) - columnOrder.indexOf(b));
        for (const colId of sortedPinned) {
          if (colId === col.column) break;
          const pinnedCol = columns.find(c => c.column === colId);
          offset += columnResizing[colId] || (pinnedCol?.width || 150);
        }
        return offset;
      };
      // Returns a style object for the column, including sticky positioning if pinned.
      const getColumnStyle = (): React.CSSProperties => {
        const style: React.CSSProperties = { width: getWidth() };
        if (isPinned()) {
          style.position = 'sticky';
          style.left = leftPinOffset();
          style.zIndex = 2;
          style.background = '#eee';
        }
        return style;
      };

      return {
        ...col,
        getWidth,
        isPinned,
        leftPinOffset,
        getColumnStyle,
      };
    });
  }, [headers, columnResizing, columnPinning, columnOrder, enableMultiRowSelection, columns]);

  // --- Offload heavy data processing to the Web Worker ---
  useEffect(() => {
    setLoading(true);
    const worker = new TableWorker();
    worker.onmessage = (e: MessageEvent<{ rows: T[]; totalRows: number }>) => {
      setRows(e.data.rows);
      setTotalRows(e.data.totalRows);
      setLoading(false);
      worker.terminate();
    };
    worker.postMessage({
      data,
      sorting: enableColumnSorting ? sorting : [],
      globalFilter: enableGlobalFiltering ? globalFilter : '',
      columnFilters: enableColumnFiltering ? columnFilters : {},
      pageIndex,
      pageSize,
    });
    return () => {
      worker.terminate();
    };
  }, [
    data,
    sorting,
    globalFilter,
    columnFilters,
    pageIndex,
    pageSize,
    enableColumnFiltering,
    enableColumnSorting,
    enableGlobalFiltering,
  ]);

  // --- Notify parent of selected rows changes ---
  useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedRows = data.filter(row => row.id && selectedRowIds[row.id.toString()]);
      onSelectedRowsChange(selectedRows);
    }
  }, [selectedRowIds, data]);

  return {
    headers: () => computedHeaders,
    rows,
    totalRows,
    loading,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnOrder,
    setColumnOrder,
    columnPinning,
    setColumnPinning,
    columnVisibility,
    setColumnVisibility,
    columnResizing,
    setColumnResizing,
    selectedRowIds,
    toggleRowSelection,
    selectAllRows,
    deselectAllRows,
    appendRowsToSelection,
    removeRowsFromSelection,
    enableMultiRowSelection,
    enableColumnPinning,
    enableColumnResizing,
    enableColumnFiltering,
    enableColumnSorting,
    enableGlobalFiltering,
  };
};
