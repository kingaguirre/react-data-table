import type React from "react";

/** Column settings (use `column`, not `id`) */
export type ColumnSetting<T> = {
  column: string;                // unique key for the column
  title?: string;                // header text
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  accessor?: (row: T) => string | number | null | undefined;
  /** Optional: group header label for this column */
  groupTitle?: string | null;
};

export type DataTableProps<T> = {
  dataSource: T[];
  columnSettings: ColumnSetting<T>[];
  onChange?: (nextRows: T[]) => void;
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number;
  overscanRowCount?: number;
  overscanColumnCount?: number;
  className?: string;

  /** Pagination */
  enablePagination?: boolean;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (
    updater:
      | { pageIndex: number; pageSize: number }
      | ((
          old: { pageIndex: number; pageSize: number }
        ) => { pageIndex: number; pageSize: number })
  ) => void;
  onPageIndexChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  /** Row selection */
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  selectedRows?: Array<number | T>;
  disabledRows?: Array<number | T>;

  /** Active row */
  enableActiveRow?: boolean;
  activeRow?: number | T;

  /** Cell selection (Excel-like) */
  enableSelection?: boolean;
  selectedCell?: [number | T, number];
  selectedCells?: { start: [number | T, number]; end: [number | T, number] };
  onCellSelectionChange?: (r: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  }) => void;

  /** History (undo/redo) */
  undoLimit?: number; // default 5
  redoLimit?: number; // default 5
};

/** Minimal react-window grid child props (kept local to avoid type coupling issues) */
export type GridChildProps = {
  rowIndex: number;
  columnIndex: number;
  style: React.CSSProperties;
  data?: any;
};

/** Minimal onScroll signature we use from react-window */
export type GridOnScroll = {
  scrollLeft: number;
  scrollTop: number;
  scrollUpdateWasRequested: boolean;
};

/** Minimal ref shape we use (avoid importing types from react-window) */
export type GridRef = {
  scrollTo: (opts: { scrollLeft?: number; scrollTop?: number }) => void;
};
