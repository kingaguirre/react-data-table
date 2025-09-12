import React, {
  CSSProperties,
  useCallback,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  ColumnDef,
  ColumnSizingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  VariableSizeGrid as Grid,
  GridOnScrollProps,
  GridChildComponentProps,
  areEqual,
} from "react-window";
import { createDataWorker } from "./workers/client";
import { useCellSelection } from "./hooks/useCellSelection";
import { useStableEvent } from "./hooks/useStableEvent";

export type ColumnSetting<T> = {
  id: string;
  title?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  accessor?: (row: T) => string | number | null | undefined;
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

const DEFAULT_COL_WIDTH = 120;
const SELECT_COL_W = 44;

function useParentWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const next = el.clientWidth;
      if (next !== w) setW(next);
    });
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []); // eslint-disable-line
  return { ref, width: w };
}

const HiddenScrollOuter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => (
  <div
    ref={ref}
    {...props}
    style={{ ...(props.style as CSSProperties), overflow: "hidden" }}
  />
));

function equalCellStyle(a: CSSProperties, b: CSSProperties) {
  if (a === b) return true;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height &&
    a.transform === b.transform
  );
}

type BodyCellProps = {
  value: any;
  style: CSSProperties;
  zebra: boolean;
  bg?: string;
  v: number;
};

const BodyCell = React.memo(function BodyCell({
  value,
  style,
  zebra,
  bg,
}: BodyCellProps) {
  return (
    <div
      style={{
        ...style,
        padding: "0 8px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #eee",
        borderRight: "1px solid #f3f3f3",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxSizing: "border-box",
        background: bg ?? (zebra ? "#fafafa" : "#fff"),
      }}
      title={value != null ? String(value) : ""}
    >
      {value as any}
    </div>
  );
},
(prev, next) =>
  prev.value === next.value &&
  prev.zebra === next.zebra &&
  prev.bg === next.bg &&
  prev.v === next.v &&
  equalCellStyle(prev.style, next.style));

const HeaderCellView = React.memo(
  function HeaderCellView({
    style,
    label,
    colId,
    isSorted,
    desc,
    requestSort,
  }: {
    style: CSSProperties;
    label: string;
    colId: string;
    isSorted: boolean;
    desc: boolean;
    requestSort: (colId: string) => void;
  }) {
    const onClickSort = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        requestSort(colId);
      },
      [requestSort, colId]
    );

    const icon = isSorted ? (desc ? "▼" : "▲") : "▲▼";

    const root: CSSProperties = {
      ...style,
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #ddd",
      borderRight: "1px solid #eee",
      fontWeight: 600,
      background: "#f7f7f7",
      boxSizing: "border-box",
      cursor: "default",
      gap: 8,
    };

    const sortBox: CSSProperties = {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      minWidth: 28,
      height: 24,
      border: "1px solid #ddd",
      borderRadius: 6,
      userSelect: "none",
      cursor: "pointer",
      background: isSorted ? "#fff" : "#fafafa",
    };

    return (
      <div style={root} title="Click the box to sort">
        <div
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <div
          role="button"
          aria-label={`Sort ${label}`}
          title={!isSorted ? "Sort ascending" : desc ? "Sort none" : "Sort descending"}
          onClick={onClickSort}
          onMouseDown={(e) => e.stopPropagation()}
          style={sortBox}
        >
          {icon}
        </div>
      </div>
    );
  },
  (a, b) =>
    a.colId === b.colId &&
    a.label === b.label &&
    a.isSorted === b.isSorted &&
    a.desc === b.desc &&
    equalCellStyle(a.style, b.style)
);

type HeaderItemData = {
  cols: Array<{ id: string; label: string }>;
  sortId: string | null;
  sortDesc: boolean;
  onSort: (id: string) => void;
};

const HeaderGridCell = React.memo(
  function HeaderGridCell({
    columnIndex,
    style,
    data,
  }: GridChildComponentProps<HeaderItemData>) {
    const meta = data.cols[columnIndex];
    const isSorted = data.sortId === meta.id;

    return (
      <HeaderCellView
        style={style}
        label={meta.label}
        colId={meta.id}
        isSorted={isSorted}
        desc={isSorted ? data.sortDesc : false}
        requestSort={data.onSort}
      />
    );
  },
  // Only re-render this header cell when:
  // - its layout style actually changes (numbers differ), or
  // - this column's sorted state or sort direction changes, or
  // - its id/label changes.
  (prev, next) => {
    if (prev.columnIndex !== next.columnIndex) return false;
    if (!equalCellStyle(prev.style, next.style)) return false;

    const pMeta = prev.data.cols[prev.columnIndex];
    const nMeta = next.data.cols[next.columnIndex];
    if (pMeta.id !== nMeta.id || pMeta.label !== nMeta.label) return false;

    const pIs = prev.data.sortId === pMeta.id;
    const nIs = next.data.sortId === nMeta.id;
    if (pIs !== nIs) return false;
    if (pIs && prev.data.sortDesc !== next.data.sortDesc) return false;

    // Ignore data.onSort reference changes on purpose.
    return true;
  }
);


const SelectionHeaderCellView = React.memo(
  function SelectionHeaderCellView({
    style,
    disabled,
    checked,
    indeterminate,
    onToggle,
  }: {
    style: CSSProperties;
    disabled: boolean;
    checked: boolean;
    indeterminate: boolean;
    onToggle: () => void;
  }) {
    const s: CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid #ddd",
      background: "#f7f7f7",
      boxSizing: "border-box",
      fontWeight: 600,
    };

    return (
      <div style={s}>
        <input
          type="checkbox"
          disabled={disabled}
          checked={!disabled && checked}
          ref={(el) => {
            if (el) el.indeterminate = !disabled && indeterminate;
          }}
          aria-label="Select all (filtered)"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!disabled) onToggle();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {}}
        />
      </div>
    );
  },
  (a, b) =>
    a.disabled === b.disabled &&
    a.checked === b.checked &&
    a.indeterminate === b.indeterminate &&
    equalCellStyle(a.style, b.style)
);

type SelHeaderItemData = {
  disabled: boolean;
  checked: boolean;
  indeterminate: boolean;
  onToggle: () => void;
};

const SelectionHeaderGridCell = React.memo(
  function SelectionHeaderGridCell({
    style,
    data,
  }: GridChildComponentProps<SelHeaderItemData>) {
    return (
      <SelectionHeaderCellView
        style={style}
        disabled={data.disabled}
        checked={data.checked}
        indeterminate={data.indeterminate}
        onToggle={data.onToggle}
      />
    );
  },
  (prev, next) => {
    // ignore onToggle identity; compare style numbers + tri-state only
    if (!equalCellStyle(prev.style, next.style)) return false;
    const p = prev.data,
      n = next.data;
    return (
      p.disabled === n.disabled &&
      p.checked === n.checked &&
      p.indeterminate === n.indeterminate
    );
  }
);

type SelBodyItemData = {
  baseIndexForVisual: (vi: number) => number;
  isDisabledBase: (bi: number) => boolean;
  getVisual: (bi: number) => { bg?: string; v: number };
  selHas: (bi: number) => boolean;
  multiSelect: boolean;
  toggleOne: (bi: number) => void;
};

const SelectionBodyGridCell = React.memo(
  function SelectionBodyGridCell({
    rowIndex,
    style,
    data,
  }: GridChildComponentProps<SelBodyItemData>) {
    const bi = data.baseIndexForVisual(rowIndex);
    const disabled = bi < 0 || data.isDisabledBase(bi);
    const checked = data.selHas(bi);
    const vis = data.getVisual(bi);

    const s: CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid #eee",
      background: vis.bg ?? (rowIndex % 2 === 0 ? "#fafafa" : "#fff"),
      boxSizing: "border-box",
    };
    const type = data.multiSelect ? "checkbox" : "radio";

    return (
      <div
        style={s}
        title={disabled ? "Row is disabled for selection" : undefined}
        data-select-cell="1"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type={type}
          disabled={disabled}
          checked={checked}
          aria-label={type === "checkbox" ? "Select row" : "Choose row"}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!disabled) data.toggleOne(bi);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {}}
        />
      </div>
    );
  },
  (prev, next) => {
    // Keep if layout changed
    if (!equalCellStyle(prev.style, next.style)) return false;

    // Compare derived row-specific states only
    const pbi = prev.data.baseIndexForVisual(prev.rowIndex);
    const nbi = next.data.baseIndexForVisual(next.rowIndex);
    if (pbi !== nbi) return false;

    const pDis = pbi < 0 || prev.data.isDisabledBase(pbi);
    const nDis = nbi < 0 || next.data.isDisabledBase(nbi);
    if (pDis !== nDis) return false;

    const pChk = prev.data.selHas(pbi);
    const nChk = next.data.selHas(nbi);
    if (pChk !== nChk) return false;

    const pVis = prev.data.getVisual(pbi);
    const nVis = next.data.getVisual(nbi);
    if ((pVis.bg ?? "") !== (nVis.bg ?? "")) return false;

    // Everything relevant for THIS row is unchanged → skip re-render
    return true;
  }
);

export function DataTableTanstackVirtual<T extends Record<string, any>>({
  dataSource,
  columnSettings,
  onChange,
  rowHeight = 36,
  headerHeight = 40,
  maxHeight = 520,
  overscanRowCount = 10,
  overscanColumnCount = 6,
  className,

  enablePagination = true,
  pagination,
  onPaginationChange,
  onPageIndexChange,
  onPageSizeChange,

  enableRowSelection = false,
  enableMultiRowSelection,
  onRowSelectionChange,
  onSelectedRowsChange,
  selectedRows,
  disabledRows,

  enableActiveRow = true,
  activeRow,

  enableSelection = true,
  selectedCell,
  selectedCells,
  onCellSelectionChange,

  undoLimit = 5,
  redoLimit = 5,
}: DataTableProps<T>) {
  const blurTimerRef = useRef<number | null>(null);
  // rows
  const [isActive, setIsActive] = useState(false);
  const isControlled = typeof onChange === "function";
  const [internalRows, setInternalRows] = useState<T[]>(() => dataSource);

  useEffect(() => {
    if (!isControlled) setInternalRows(dataSource);
  }, [dataSource, isControlled]);

  const rows: T[] = isControlled ? dataSource : internalRows;
  const rowCount = rows.length;

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const { ref, width } = useParentWidth<HTMLDivElement>();

  // selection defaults
  const selectionEnabled = !!enableRowSelection;
  const multiSelect = selectionEnabled ? enableMultiRowSelection ?? true : false;

  // columns
  const columns = useMemo<ColumnDef<T>[]>(() => {
    return columnSettings.map((c) => {
      const accessor = c.accessor ?? ((row: T) => row[c.id]);
      return {
        id: c.id,
        header: c.title ?? c.id,
        accessorFn: accessor,
        size: c.width ?? DEFAULT_COL_WIDTH,
        minSize: c.minWidth ?? 40,
        maxSize: c.maxWidth ?? 10000,
      } as ColumnDef<T>;
    });
  }, [columnSettings]);

  const accessorById = useMemo(() => {
    const m = new Map<string, (row: T, i: number) => any>();
    for (const c of columnSettings)
      m.set(c.id, (c.accessor ?? ((r: T) => (r as any)[c.id])) as any);
    return m;
  }, [columnSettings]);

  // --- live refs for values used by requestSort ---
  const rowsRef = useRef(rows);
  useEffect(() => { rowsRef.current = rows; }, [rows]);

  const accessorByIdRef = useRef(accessorById);
  useEffect(() => { accessorByIdRef.current = accessorById; }, [accessorById]);

  // Keep last base order so filter/ingest can fall back safely
  const lastBaseOrderRef = useRef<Int32Array | null>(null);

  function makeIdentityOrder(n: number): Int32Array {
    const a = new Int32Array(n);
    for (let i = 0; i < n; i++) a[i] = i;
    return a;
  }

  /** Guard against empty orders on no-query paths */
  function ensureOrder(
    order: Int32Array | null | undefined,
    fallback: Int32Array | null | undefined,
    rowCount: number,
    hasQuery: boolean
  ): Int32Array | null {
    if (hasQuery) return order ?? fallback ?? null;
    if (!order) return fallback ?? null;
    if (order.length === 0) return fallback ?? makeIdentityOrder(rowCount);
    return order;
  }

  // sizing
  const initialSizing = useMemo(() => {
    const s: ColumnSizingState = {};
    for (const c of columnSettings) {
      const w = Math.max(
        c.minWidth ?? 40,
        Math.min(c.width ?? DEFAULT_COL_WIDTH, c.maxWidth ?? 10000)
      );
      s[c.id] = w;
    }
    return s;
  }, [columnSettings]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(initialSizing);

  // --- Per-cell versioning: bump only the (row,col) that changed ---
  const cellVersionRef = useRef<Map<string, number>>(new Map());

  const getCellVersion = useCallback((bi: number, colId: string): number => {
    const k = `${bi}:${colId}`;
    return cellVersionRef.current.get(k) ?? 0;
  }, []);

  const bumpCellVersion = useCallback((bi: number, colId: string) => {
    const k = `${bi}:${colId}`;
    cellVersionRef.current.set(k, (cellVersionRef.current.get(k) ?? 0) + 1);
  }, []);

  const bumpCellVersionsDiff = useCallback((oldArr: T[], newArr: T[]) => {
    // Only look at configured columns
    const ids = columnSettings.map(c => c.id);
    const n = Math.min(oldArr.length, newArr.length);
    for (let i = 0; i < n; i++) {
      const a = oldArr[i], b = newArr[i];
      if (a === b) continue;           // identical object → skip
      for (let k = 0; k < ids.length; k++) {
        const id = ids[k];
        if ((a as any)?.[id] !== (b as any)?.[id]) {
          bumpCellVersion(i, id);      // (row i, col id) changed
        }
      }
    }
  }, [columnSettings, bumpCellVersion]);

  // worker
  const workerRef = useRef<ReturnType<typeof createDataWorker> | null>(null);
  if (!workerRef.current) workerRef.current = createDataWorker();

  // tokens
  const ingestTokenRef = useRef(0);
  const sortTokenRef = useRef(0);
  const filterTokenRef = useRef(0);

  // filter queue
  const filterInFlightRef = useRef(false);
  const filterPendingRef = useRef<string | null>(null);

  // edit overlay batching
  const editOverlayRef = useRef<Map<number, Partial<T>>>(new Map());
  const editRafRef = useRef<number | null>(null);
  const lastFlushTsRef = useRef(0);
  const MAX_EDIT_FPS = 20;
  const pendingEditTokenRef = useRef(0);

  // history (undo/redo)
  const [undoStack, setUndoStack] = useState<T[][]>([]);
  const [redoStack, setRedoStack] = useState<T[][]>([]);
  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const pushUndo = useCallback((snapshot: T[]) => {
    setUndoStack((prev) => {
      const next = [...prev, snapshot];
      if (next.length > undoLimit) next.shift();
      return next;
    });
    // any new edit clears redo
    setRedoStack([]);
  }, [undoLimit]);

  const doUndo = useCallback(async () => {
    if (!canUndo) return;
    setUndoStack((prev) => {
      const next = prev.slice();
      const prevState = next.pop()!;

      // bump versions for cells that change due to undo
      const oldRowsArr = (isControlled ? dataSource : internalRows);
      bumpCellVersionsDiff(oldRowsArr, prevState);

      // push current to redo
      setRedoStack((rprev) => {
        const snap = (isControlled ? dataSource : internalRows).map((r) => ({ ...r }));
        const rnext = [snap, ...rprev];
        if (rnext.length > redoLimit) rnext.pop();
        return rnext;
      });

      if (isControlled && onChange) onChange(prevState);
      else setInternalRows(prevState);
      // reingest worker for correctness
      (async () => {
        try {
          const api = workerRef.current!.api;
          await api.reset();
          await api.ingestRows(prevState as any[], columnSettings.map((c) => c.id));
        } catch {}
      })();
      return next;
    });
  }, [canUndo, isControlled, onChange, dataSource, internalRows, redoLimit, columnSettings]);

  const doRedo = useCallback(async () => {
    if (!canRedo) return;
    setRedoStack((prev) => {
      const next = prev.slice();
      const redoState = next.shift()!;

      // bump versions for cells that change due to redo
      const oldRowsArr = (isControlled ? dataSource : internalRows);
      bumpCellVersionsDiff(oldRowsArr, redoState);

      // push current to undo
      setUndoStack((uprev) => {
        const snap = (isControlled ? dataSource : internalRows).map((r) => ({ ...r }));
        const unext = [...uprev, snap];
        if (unext.length > undoLimit) unext.shift();
        return unext;
      });
      if (isControlled && onChange) onChange(redoState);
      else setInternalRows(redoState);
      // reingest worker
      (async () => {
        try {
          const api = workerRef.current!.api;
          await api.reset();
          await api.ingestRows(redoState as any[], columnSettings.map((c) => c.id));
        } catch {}
      })();
      return next;
    });
  }, [canRedo, isControlled, onChange, dataSource, internalRows, undoLimit, columnSettings]);

  // view state
  const [globalQuery, setGlobalQuery] = useState("");
  const [sortState, setSortState] = useState<{ id: string | null; desc: boolean }>({ id: null, desc: false });
  const [sortOrder, setSortOrder] = useState<Int32Array | null>(null);
  const [viewOrder, setViewOrder] = useState<Int32Array | null>(null);

  const sortStateRef = useRef(sortState);
  const queryRef = useRef(globalQuery);
  useEffect(() => { sortStateRef.current = sortState; }, [sortState]);
  useEffect(() => { queryRef.current = globalQuery; }, [globalQuery]);

  // tanstack table
  const table = useReactTable({
    data: rows,
    columns,
    state: { columnSizing },
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });

  const leafCols = useMemo(() => table.getVisibleLeafColumns(), [table, columnSizing]);

  const colWidthAt = useCallback(
    (index: number) => {
      const col = leafCols[index];
      if (!col) return 80;
      const size = col.getSize?.() ?? (col.columnDef as any)?.size ?? 120;
      const min = col.columnDef.minSize ?? 40;
      const max = col.columnDef.maxSize ?? 10000;
      return Math.max(min, Math.min(size, max));
    },
    [leafCols]
  );

  // ingest
  const colIdSig = useMemo(() => columnSettings.map((c) => c.id).join("|"), [columnSettings]);
  const lastIngestSigRef = useRef<string>("");

  const ingestTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (ingestTimerRef.current) {
      clearTimeout(ingestTimerRef.current);
      ingestTimerRef.current = null;
    }

    ingestTimerRef.current = window.setTimeout(async () => {
      const rowsLen = rows.length;
      const sig = `${rowsLen}#${colIdSig}`;
      if (!rowsLen) {
        setSortOrder(null);
        setViewOrder(null);
        lastBaseOrderRef.current = null;
        lastIngestSigRef.current = sig;
        return;
      }
      if (sig === lastIngestSigRef.current) return;
      lastIngestSigRef.current = sig;

      const safeIds = columnSettings.map((c) => c.id);
      const token = ++ingestTokenRef.current;

      try {
        const api = workerRef.current!.api;
        await api.ingestRows(rows as any[], safeIds);
        if (token !== ingestTokenRef.current || !mountedRef.current) return;

        // base sort
        let base: Int32Array | null = null;
        const currSort = sortStateRef.current;
        if (currSort.id) {
          const accessor =
            accessorById.get(currSort.id) ?? ((r: T) => (r as any)[currSort.id!]);
          const vec = new Array<any>(rowsLen);
          for (let i = 0; i < rowsLen; i++)
            vec[i] = rows[i] ? accessor(rows[i], i) : undefined;
          try {
            base = await api.sortByVector(vec, currSort.desc);
          } catch {
            base = null;
          }
        }

        lastBaseOrderRef.current = base;

        const qTrim = (queryRef.current || "").trim();
        const hasQuery = qTrim.length > 0;

        // show base immediately; never blank when no query
        if (token === ingestTokenRef.current && mountedRef.current) {
          setSortOrder(base);
          setViewOrder(ensureOrder(base, null, rowsLen, hasQuery));
        }

        if (!hasQuery) return;

        // overlay filtered when query exists
        try {
          const filtered = await api.globalFilter(qTrim, base);
          if (token === ingestTokenRef.current && mountedRef.current) {
            setViewOrder(ensureOrder(filtered ?? base, base, rowsLen, true));
          }
        } catch {
          // keep base
        }
      } catch {
        /* swallow */
      }
    }, 0);

    return () => {
      if (ingestTimerRef.current) {
        clearTimeout(ingestTimerRef.current);
        ingestTimerRef.current = null;
      }
    };
  }, [rows.length, colIdSig, columnSettings, accessorById, rows]);

  // sorting
  const requestSort = useCallback(async (columnId: string) => {
    const api = workerRef.current!.api;

    // Cancel any pending filter tick to avoid clobbering fresh sort
    filterPendingRef.current = null;

    // Compute next state based on the *current* sort (via ref, not closure)
    const prev = sortStateRef.current;
    let next: { id: string | null; desc: boolean };
    if (prev.id !== columnId) next = { id: columnId, desc: false };
    else if (!prev.desc) next = { id: columnId, desc: true };
    else next = { id: null, desc: false };
    setSortState(next);

    const token = ++sortTokenRef.current;

    // Always read latest rows/accessors from refs (avoid stale rowCount=0)
    const currRows = rowsRef.current;
    const currRowCount = currRows.length;

    // Compute base order
    let baseOrder: Int32Array | null = null;
    if (next.id) {
      const accessor =
        accessorByIdRef.current.get(next.id) ??
        ((r: any) => r[next.id!]);
      const vec = new Array<any>(currRowCount);
      for (let i = 0; i < currRowCount; i++) {
        const r = currRows[i];
        vec[i] = r ? accessor(r, i) : undefined;
      }
      try { baseOrder = await api.sortByVector(vec, next.desc); }
      catch { baseOrder = null; }
    }

    lastBaseOrderRef.current = baseOrder;

    const qTrim = (queryRef.current || "").trim();
    const hasQuery = qTrim.length > 0;

    // Show base immediately; never blank on first click
    if (token === sortTokenRef.current && mountedRef.current) {
      setSortOrder(baseOrder);
      setViewOrder(ensureOrder(baseOrder, null, currRowCount, hasQuery));
    }

    if (!hasQuery) return;

    // Overlay filtered when query exists
    try {
      const filtered = await api.globalFilter(qTrim, baseOrder);
      if (token === sortTokenRef.current && mountedRef.current) {
        setViewOrder(ensureOrder(filtered ?? baseOrder, baseOrder, currRowCount, true));
      }
    } catch {
      /* keep what we showed */
    }
  }, []);

  // filter
  const startFilter = useCallback((q: string) => {
    filterPendingRef.current = q;

    const kick = async () => {
      if (filterInFlightRef.current) return;
      const queued = filterPendingRef.current;
      if (queued == null) return;

      filterInFlightRef.current = true;
      filterPendingRef.current = null;

      const api = workerRef.current!.api;
      const token = ++filterTokenRef.current;

      const qTrim = (queued || "").trim();
      const hasQuery = qTrim.length > 0;

      let result: Int32Array | null;
      if (!hasQuery) {
        // no query → fall back to last base or current sortOrder (or identity)
        const base = lastBaseOrderRef.current ?? sortOrder;
        result = ensureOrder(base, base, rowCount, false);
      } else {
        try {
          const filtered = await api.globalFilter(qTrim, sortOrder);
          result = ensureOrder(
            filtered ?? sortOrder,
            lastBaseOrderRef.current ?? sortOrder,
            rowCount,
            true
          );
        } catch {
          result = ensureOrder(
            sortOrder,
            lastBaseOrderRef.current ?? sortOrder,
            rowCount,
            true
          );
        }
      }

      if (token === filterTokenRef.current && mountedRef.current) {
        setViewOrder(result);
      }

      filterInFlightRef.current = false;
      if (filterPendingRef.current !== null) kick();
    };

    setTimeout(kick, 45);
  }, [sortOrder, rowCount]);

  const onGlobalFilterChange = useCallback((q: string) => {
    setGlobalQuery(q);
    startFilter(q);
  }, [startFilter]);

  // refs & scroll sync
  const headerRef = useRef<Grid>(null);
  const bodyRef = useRef<Grid>(null);
  const selHeaderRef = useRef<Grid>(null);
  const selBodyRef = useRef<Grid>(null);
  const bodyOuterRef = useRef<HTMLDivElement | null>(null);
  const bodyWrapRef = useRef<HTMLDivElement | null>(null);
  const bodyScrollTopRef = useRef(0);
  const bodyScrollLeftRef = useRef(0);

  const rafScrollRef = useRef<number | null>(null);
  const recomputeActiveOverlayRef = useRef<() => void>(() => {});
  const cellSelRecomputeRef = useRef<() => void>(() => {});

  const scheduleOverlayRepaint = useCallback(() => {
    if (rafScrollRef.current != null) return;
    rafScrollRef.current = requestAnimationFrame(() => {
      rafScrollRef.current = null;
      recomputeActiveOverlayRef.current?.();
      cellSelRecomputeRef.current?.();
    });
  }, []);

  const onBodyScroll = useCallback(({ scrollLeft, scrollTop }: GridOnScrollProps) => {
    headerRef.current?.scrollTo({ scrollLeft, scrollTop: 0 });
    selBodyRef.current?.scrollTo({ scrollLeft: 0, scrollTop: scrollTop ?? 0 });
    if (typeof scrollTop === "number") bodyScrollTopRef.current = scrollTop;
    if (typeof scrollLeft === "number") bodyScrollLeftRef.current = scrollLeft;
    scheduleOverlayRepaint();
  }, [scheduleOverlayRepaint]);

  // Build the column metas once per visible columns change
  const headerCols = useMemo(
    () =>
      leafCols.map((c) => ({
        id: String(c.id),
        label:
          typeof c.columnDef.header === "string"
            ? (c.columnDef.header as string)
            : String(c.id),
      })),
    [leafCols]
  );

  // If requestSort identity changes, we don't care (comparator ignores).
  const headerData: HeaderItemData = useMemo(
    () => ({
      cols: headerCols,
      sortId: sortState.id,
      sortDesc: !!sortState.desc,
      onSort: (id: string) => requestSort(id),
    }),
    [headerCols, sortState.id, sortState.desc, requestSort]
  );

  // pagination
  const [internalPagination, setInternalPagination] = useState<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 50 });
  const pag = pagination ?? internalPagination;

  const applyPagination = useCallback((
    updater:
      | { pageIndex: number; pageSize: number }
      | ((old: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })
  ) => {
    if (onPaginationChange) onPaginationChange(updater);
    else setInternalPagination(prev => (typeof updater === "function" ? (updater as any)(prev) : updater));
  }, [onPaginationChange]);

  const setPageIndex = useCallback((nextIndex: number) => {
    nextIndex = Math.max(0, nextIndex);
    onPageIndexChange?.(nextIndex);
    applyPagination(p => ({ ...p, pageIndex: nextIndex }));
    scheduleOverlayRepaint();
  }, [applyPagination, onPageIndexChange, scheduleOverlayRepaint]);

  const setPageSize = useCallback((nextSize: number) => {
    nextSize = Math.max(1, nextSize);
    onPageSizeChange?.(nextSize);
    applyPagination(p => ({ pageIndex: 0, pageSize: nextSize }));
    scheduleOverlayRepaint();
  }, [applyPagination, onPageSizeChange, scheduleOverlayRepaint]);

  useEffect(() => {
    if (!enablePagination) return;

    // compute totalCount without creating new state:
    const total = viewOrder ? viewOrder.length : rowCount;
    const size  = Math.max(1, pag.pageSize);
    const count = Math.max(1, Math.ceil(total / size));

    // Only clamp if current page index is out of range.
    if (pag.pageIndex >= count) {
      applyPagination(p => ({ ...p, pageIndex: Math.max(0, count - 1) }));
    }
    // If pageIndex is already valid, do nothing (no re-render).
  }, [
    enablePagination,
    viewOrder,
    rowCount,
    pag.pageIndex,
    pag.pageSize,
    applyPagination
  ]);

  const totalCount = viewOrder ? viewOrder.length : rowCount;
  const pageCount = enablePagination ? Math.max(1, Math.ceil(totalCount / Math.max(1, pag.pageSize))) : 1;
  const pageIndexClamped = enablePagination ? Math.min(pag.pageIndex, pageCount - 1) : 0;
  const pageStart = enablePagination ? Math.min(pageIndexClamped * Math.max(1, pag.pageSize), Math.max(0, totalCount)) : 0;
  const pageEnd = enablePagination ? Math.min(pageStart + Math.max(1, pag.pageSize), totalCount) : totalCount;
  const visibleRowCount = Math.max(0, pageEnd - pageStart);

  // selection state
  const [sel, setSel] = useState<Set<number>>(new Set());

  const rowIndexByRef = useMemo(() => {
    const m = new Map<T, number>();
    for (let i = 0; i < rows.length; i++) m.set(rows[i], i);
    return m;
  }, [rows]);

  const normalizeToIndexSet = useCallback((arr?: Array<number | T>) => {
    const s = new Set<number>();
    if (!arr || !arr.length) return s;
    for (const entry of arr) {
      if (typeof entry === "number") {
        if (entry >= 0 && entry < rows.length) s.add(entry);
      } else {
        const idx = rowIndexByRef.get(entry);
        if (typeof idx === "number") s.add(idx);
      }
    }
    return s;
  }, [rows.length, rowIndexByRef]);

  const normalizeToSingleIndex = useCallback((entry?: number | T): number | null => {
    if (entry == null) return null;
    if (typeof entry === "number") return entry >= 0 && entry < rows.length ? entry : null;
    const idx = rowIndexByRef.get(entry);
    return typeof idx === "number" ? idx : null;
  }, [rows.length, rowIndexByRef]);

  useEffect(() => {
    if (!selectedRows) return;
    const next = normalizeToIndexSet(selectedRows);
    let changed = next.size !== sel.size;
    if (!changed) for (const i of next) { if (!sel.has(i)) { changed = true; break; } }
    if (changed) setSel(next);
  }, [selectedRows, normalizeToIndexSet]); // eslint-disable-line

  const disabledSet = useMemo(() => normalizeToIndexSet(disabledRows), [disabledRows, normalizeToIndexSet]);
  const isDisabledBase = useCallback((bi: number) => disabledSet.has(bi), [disabledSet]);

  useEffect(() => {
    if (!selectionEnabled) return;
    if (!multiSelect && sel.size > 1) {
      let min = Infinity;
      sel.forEach((i) => { if (i < min) min = i; });
      const next = new Set<number>();
      if (Number.isFinite(min)) next.add(min as number);
      setSel(next);
    }
  }, [selectionEnabled, multiSelect, sel]);

  const baseIndexForVisual = useCallback((visualIndex: number) => {
    const baseVisualIndex = (enablePagination ? pageStart : 0) + visualIndex;
    const ord = viewOrder;
    if (!ord) return baseVisualIndex;
    if (baseVisualIndex < 0 || baseVisualIndex >= ord.length) return -1;
    return ord[baseVisualIndex] ?? -1;
  }, [viewOrder, enablePagination, pageStart]);

  // inverse view
  const invViewRef = useRef<Map<number, number> | null>(null);
  useEffect(() => {
    if (viewOrder) {
      const m = new Map<number, number>();
      for (let i = 0; i < viewOrder.length; i++) m.set(viewOrder[i], i);
      invViewRef.current = m;
    } else {
      invViewRef.current = null;
    }
    scheduleOverlayRepaint();
  }, [viewOrder, scheduleOverlayRepaint]);

  const getVisualIndexForBase = useCallback((bi: number) => {
    if (bi == null || bi < 0) return -1;
    if (!viewOrder) return bi;
    return invViewRef.current?.get(bi) ?? -1;
  }, [viewOrder]);

  // emit selection
  const lastEmitSigRef = useRef<string>("");
  useEffect(() => {
    const indices = Array.from(sel).sort((a, b) => a - b);
    const sig = indices.join(",");
    if (sig === lastEmitSigRef.current) return;
    lastEmitSigRef.current = sig;

    const map: Record<string, boolean> = {};
    indices.forEach((i) => { map[String(i)] = true; });
    onRowSelectionChange?.(map);

    if (onSelectedRowsChange) {
      const out: T[] = [];
      indices.forEach((i) => { if (i >= 0 && i < rows.length) out.push(rows[i]); });
      onSelectedRowsChange(out);
    }
  }, [sel, rows, onRowSelectionChange, onSelectedRowsChange]);

  const clearSelection = useCallback(() => {
    setSel(prev => (prev.size ? new Set<number>() : prev));
  }, []);

  const toggleOne = useCallback((baseIndex: number) => {
    if (isDisabledBase(baseIndex)) return;
    setSel(prev => {
      const next = new Set(prev);
      if (multiSelect) {
        if (next.has(baseIndex)) next.delete(baseIndex); else next.add(baseIndex);
      } else { next.clear(); next.add(baseIndex); }
      return next;
    });
  }, [multiSelect, isDisabledBase]);

  // header tri-state
  const { anyFiltered, allFiltered, hasEligibleFiltered } = useMemo(() => {
    if (!selectionEnabled || !multiSelect) return { anyFiltered: false, allFiltered: false, hasEligibleFiltered: false };
    if (totalCount === 0) return { anyFiltered: false, allFiltered: false, hasEligibleFiltered: false };
    let any = false, all = true, eligible = 0;
    if (viewOrder) {
      for (let i = 0; i < totalCount; i++) {
        const bi = viewOrder[i];
        if (isDisabledBase(bi)) continue;
        eligible++;
        const has = sel.has(bi); any = any || has; if (!has) all = false;
      }
    } else {
      for (let bi = 0; bi < totalCount; bi++) {
        if (isDisabledBase(bi)) continue;
        eligible++;
        const has = sel.has(bi); any = any || has; if (!has) all = false;
      }
    }
    if (eligible === 0) return { anyFiltered: false, allFiltered: false, hasEligibleFiltered: false };
    return { anyFiltered: any, allFiltered: all, hasEligibleFiltered: true };
  }, [selectionEnabled, multiSelect, totalCount, sel, viewOrder, isDisabledBase]);

  const toggleFilteredAll = useCallback(() => {
    if (!selectionEnabled || !multiSelect) return;
    setSel(prev => {
      const next = new Set(prev);
      if (allFiltered) {
        if (viewOrder) { for (let i = 0; i < totalCount; i++) { const bi = viewOrder[i]; if (!isDisabledBase(bi)) next.delete(bi); } }
        else { for (let bi = 0; bi < totalCount; bi++) { if (!isDisabledBase(bi)) next.delete(bi); } }
      } else {
        if (viewOrder) { for (let i = 0; i < totalCount; i++) { const bi = viewOrder[i]; if (!isDisabledBase(bi)) next.add(bi); } }
        else { for (let bi = 0; bi < totalCount; bi++) { if (!isDisabledBase(bi)) next.add(bi); } }
      }
      return next;
    });
  }, [selectionEnabled, multiSelect, allFiltered, viewOrder, totalCount, isDisabledBase]);

  // Selection header tri-state → stable itemData for Grid
  const selHeaderData: SelHeaderItemData | null = useMemo(() => {
    if (!selectionEnabled || !multiSelect) return null;

    const disabledHdr = !hasEligibleFiltered;
    const checkedHdr = !disabledHdr && allFiltered;
    const indeterminateHdr = !disabledHdr && !allFiltered && anyFiltered;

    return {
      disabled: disabledHdr,
      checked: checkedHdr,
      indeterminate: indeterminateHdr,
      onToggle: () => toggleFilteredAll(),
    };
  }, [
    selectionEnabled,
    multiSelect,
    hasEligibleFiltered,
    allFiltered,
    anyFiltered,
    toggleFilteredAll,
  ]);

  // footer page tri-state
  const { pageAllSelected, pageSomeSelected, pageEligibleCount } = useMemo(() => {
    if (!selectionEnabled || visibleRowCount === 0) return { pageAllSelected: false, pageSomeSelected: false, pageEligibleCount: 0 };
    let eligible = 0, any = false, all = true;
    for (let vi = 0; vi < visibleRowCount; vi++) {
      const bi = baseIndexForVisual(vi);
      if (bi < 0 || isDisabledBase(bi)) continue;
      eligible++;
      const has = sel.has(bi);
      any = any || has; if (!has) all = false;
    }
    if (eligible === 0) return { pageAllSelected: false, pageSomeSelected: false, pageEligibleCount: 0 };
    return { pageAllSelected: all, pageSomeSelected: any && !all, pageEligibleCount: eligible };
  }, [selectionEnabled, visibleRowCount, sel, baseIndexForVisual, isDisabledBase]);

  const togglePageAll = useCallback(() => {
    if (!selectionEnabled) return;
    setSel(prev => {
      const next = new Set(prev);
      if (multiSelect) {
        if (pageAllSelected) {
          for (let vi = 0; vi < visibleRowCount; vi++) { const bi = baseIndexForVisual(vi); if (bi >= 0 && !isDisabledBase(bi)) next.delete(bi); }
        } else {
          for (let vi = 0; vi < visibleRowCount; vi++) { const bi = baseIndexForVisual(vi); if (bi >= 0 && !isDisabledBase(bi)) next.add(bi); }
        }
      } else {
        next.clear();
        if (!pageAllSelected && visibleRowCount > 0) {
          for (let vi = 0; vi < visibleRowCount; vi++) {
            const bi = baseIndexForVisual(vi); if (bi >= 0 && !isDisabledBase(bi)) { next.add(bi); break; }
          }
        }
      }
      return next;
    });
  }, [selectionEnabled, multiSelect, pageAllSelected, visibleRowCount, baseIndexForVisual, isDisabledBase]);

  // row accessor for display
  const rowAt = useCallback((visualIndex: number) => {
    const baseVisualIndex = (enablePagination ? pageStart : 0) + visualIndex;
    const ord = viewOrder;
    if (!ord) return rows[baseVisualIndex] ?? null;
    if (baseVisualIndex < 0 || baseVisualIndex >= ord.length) return null;
    const ri = ord[baseVisualIndex];
    return ri >= 0 && ri < rows.length ? rows[ri] : null;
  }, [rows, viewOrder, enablePagination, pageStart]);

  // row visuals (bg) to minimize rerenders
  type Visual = { bg?: string; v: number };
  const rowVisualRef = useRef<Map<number, Visual>>(new Map());
  // keep function identity stable
  const getVisual = useCallback(
    (bi: number): { bg?: string; v: number } =>
      rowVisualRef.current.get(bi) ?? { bg: undefined, v: 0 },
    []
  );

  // read selection from a ref so selBodyData doesn't change every render
  const selRef = useRef(sel);
  useEffect(() => { selRef.current = sel; }, [sel]);

  const prevSelRef = useRef<Set<number>>(new Set());
  const prevDisabledRef = useRef<Set<number>>(new Set());

  const recomputeVisualFor = (bi: number) => {
    if (bi < 0) return;
    const selected = sel.has(bi);
    const disabled = isDisabledBase(bi);
    const bg = selected ? "#e8f2ff" : disabled ? "#f3f3f3" : undefined;
    const prev = rowVisualRef.current.get(bi);
    if (!prev || prev.bg !== bg) rowVisualRef.current.set(bi, { bg, v: (prev?.v ?? 0) + 1 });
  };

  useEffect(() => {
    const prev = prevSelRef.current;
    const changed = new Set<number>();
    sel.forEach((i) => { if (!prev.has(i)) changed.add(i); });
    prev.forEach((i) => { if (!sel.has(i)) changed.add(i); });
    if (changed.size) changed.forEach(recomputeVisualFor);
    prevSelRef.current = new Set(sel);
    scheduleOverlayRepaint();
  }, [sel, scheduleOverlayRepaint]);

  useEffect(() => {
    const prev = prevDisabledRef.current;
    const changed = new Set<number>();
    disabledSet.forEach((i) => { if (!prev.has(i)) changed.add(i); });
    prev.forEach((i) => { if (!disabledSet.has(i)) changed.add(i); });
    if (changed.size) changed.forEach(recomputeVisualFor);
    prevDisabledRef.current = new Set(disabledSet);
    scheduleOverlayRepaint();
  }, [disabledSet, scheduleOverlayRepaint]);

  const BodyCellRenderer = useCallback(({ rowIndex, columnIndex, style }: GridChildComponentProps) => {
    const col: any = leafCols[columnIndex];
    if (!col) return <BodyCell value={null} style={style} zebra={rowIndex % 2 === 0} bg={undefined} v={0} />;
    const rowObj = rowAt(rowIndex);
    const value = rowObj ? (col.columnDef.accessorFn as any)(rowObj, rowIndex) : null;
    const baseIndex = baseIndexForVisual(rowIndex);
    const vis = getVisual(baseIndex);
    return <BodyCell value={value} style={style} zebra={rowIndex % 2 === 0} bg={vis.bg} v={vis.v} />;
  }, [leafCols, rowAt, baseIndexForVisual]);

  const selBodyData: SelBodyItemData = useMemo(
    () => ({
      baseIndexForVisual,
      isDisabledBase,
      getVisual,
      selHas: (bi: number) => selRef.current.has(bi),
      multiSelect: !!multiSelect,
      toggleOne,
    }),
    [baseIndexForVisual, isDisabledBase, getVisual, multiSelect, toggleOne]
  );

  // edit batching + history
  const flushOverlayToState = useCallback(() => {
    const m = editOverlayRef.current;
    if (m.size === 0 || !mountedRef.current) return;

    const now = performance.now();
    if (now - lastFlushTsRef.current < 1000 / MAX_EDIT_FPS) {
      requestAnimationFrame(flushOverlayToState);
      return;
    }
    lastFlushTsRef.current = now;

    // snapshot BEFORE applying (for undo)
    const snapshot = rows.map((r) => ({ ...r }));
    pushUndo(snapshot); // also clears redo

    const editedIdxs = Array.from(m.keys());

    const next = rows.slice();
    m.forEach((patch, idx) => {
      const old = next[idx] ?? ({} as T);
      next[idx] = { ...old, ...patch };

      // NEW: bump per-cell versions for edited keys on this row
      for (const key of Object.keys(patch as any)) {
        bumpCellVersion(idx, key);
      }
    });
    m.clear();

    if (isControlled && onChange) onChange(next);
    else setInternalRows(next);

    // keep worker text vector in sync for changed rows only
    (async () => {
      try {
        const api = workerRef.current!.api;
        for (const idx of editedIdxs) {
          const row = next[idx];
          if (row) await api.updateRowText(idx, row as any);
        }
      } catch {}
    })();
  }, [rows, isControlled, onChange, pushUndo, bumpCellVersion]);

  const handleRandomizeFirstCell = useCallback(() => {
    if (rows.length === 0 || leafCols.length === 0) return;
    const firstColId = leafCols[0].id;

    const newVal = `Random ${Math.random().toString(36).slice(2, 7)}`;
    const overlay = editOverlayRef.current;
    overlay.set(0, { ...(overlay.get(0) || {}), [firstColId]: newVal } as any);

    const myTok = ++pendingEditTokenRef.current;
    (async () => {
      try {
        const api = workerRef.current!.api;
        const baseRow = rows[0] || ({} as T);
        await api.updateRowText(0, { ...baseRow, [firstColId]: newVal } as any);

        const qTrim = (queryRef.current || "").trim();
        if (qTrim) {
          const token = ++filterTokenRef.current;
          let refreshed: Int32Array | null = null;
          try {
            const filtered = await api.globalFilter(qTrim, sortOrder);
            refreshed = filtered ?? sortOrder;
          } catch {
            refreshed = sortOrder;
          }
          if (token === filterTokenRef.current && myTok === pendingEditTokenRef.current && mountedRef.current) {
            setViewOrder(refreshed ?? sortOrder);
          }
        }
      } catch { /* ignore */ }
    })();

    if (editRafRef.current == null) {
      editRafRef.current = requestAnimationFrame(() => {
        editRafRef.current = null;
        flushOverlayToState();
      });
    }
  }, [rows, leafCols, sortOrder, flushOverlayToState]);

  // sizes
  const viewportWidth = Math.max(0, width);
  const frozenWidth = selectionEnabled ? SELECT_COL_W : 0;
  const headerMainWidth = Math.max(0, viewportWidth - frozenWidth);
  const bodyHeight = Math.max(0, maxHeight - headerHeight);

  // Active row overlay
  const activeOverlayRef = useRef<HTMLDivElement | null>(null);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);
  const [activeMounted, setActiveMounted] = useState(false);

  // internal wins over prop (mouse clicks set this; arrows/keyboard do NOT alter it now)
  const activeBaseIndex = useMemo(() => {
    if (typeof internalActiveIndex === "number") return internalActiveIndex;
    const controlled = activeRow != null ? normalizeToSingleIndex(activeRow) : null;
    return controlled ?? null;
  }, [internalActiveIndex, activeRow, normalizeToSingleIndex]);

  const recomputeActiveOverlay = useCallback(() => {
    if (!enableActiveRow) {
      if (activeMounted) setActiveMounted(false);
      return;
    }
    const bi = typeof activeBaseIndex === "number" ? activeBaseIndex : -1;
    const vi = bi >= 0 ? getVisualIndexForBase(bi) : -1;

    const visStart = enablePagination ? pageStart : 0;
    const visEnd   = enablePagination ? pageEnd   : totalCount;

    if (vi < visStart || vi >= visEnd || vi < 0) {
      if (activeMounted) setActiveMounted(false);
      return;
    }

    const top = (vi - visStart) * rowHeight - (bodyScrollTopRef.current || 0);

    if (top + rowHeight <= 0 || top >= bodyHeight) {
      if (activeMounted) setActiveMounted(false);
      return;
    }

    if (!activeMounted) setActiveMounted(true);

    const el = activeOverlayRef.current;
    if (!el) return;

    // left=0 to overlap frozen column as well
    const leftPx  = 0;
    const widthPx = frozenWidth + headerMainWidth;

    el.style.transform = `translateY(${Math.round(top)}px)`;
    el.style.left      = `${leftPx}px`;
    el.style.width     = `${widthPx}px`;
    el.style.height    = `${rowHeight}px`;
  }, [
    enableActiveRow,
    activeBaseIndex,
    getVisualIndexForBase,
    enablePagination,
    pageStart,
    pageEnd,
    totalCount,
    rowHeight,
    bodyHeight,
    frozenWidth,
    headerMainWidth,
    activeMounted,
  ]);

  // global 'click anywhere in table' activation (safe for inputs)
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const isFocusable = (el: EventTarget | null): el is HTMLElement => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName?.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea" || tag === "button") return true;
      if (tag === "a" && (node as HTMLAnchorElement).href) return true;
      const ti = node.getAttribute?.("tabindex");
      if (ti != null && !Number.isNaN(parseInt(ti, 10)) && parseInt(ti!, 10) >= 0) return true;
      if ((node as any).isContentEditable) return true;

      // NEW: anything inside the select column cell
      if (node.closest?.('[data-select-cell="1"]')) return true;

      return false;
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) return;

      // IMPORTANT: don’t set state or shift focus for focusable targets;
      // let the browser deliver the first click untouched.
      if (isFocusable(e.target)) return;

      // Non-focusable: we can activate immediately and focus the body for arrows.
      if (document.activeElement !== bodyWrapRef.current) {
        requestAnimationFrame(() => bodyWrapRef.current?.focus());
      }
      // No need to call setIsActive here because onFocusCapture will set it (deferred).
    };

    document.addEventListener("pointerdown", onPointerDownCapture, true);
    return () => document.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [ref, bodyWrapRef]);

  useEffect(() => { (recomputeActiveOverlayRef.current = recomputeActiveOverlay); }, [recomputeActiveOverlay]);
  useLayoutEffect(() => { recomputeActiveOverlay(); }, [recomputeActiveOverlay, viewOrder, pageStart, pageEnd, rowHeight, bodyHeight]);

  // Cell selection hook
  const cellSel = useCellSelection<T>({
    enable: enableSelection,
    rows,
    leafCols: leafCols as any,
    colWidthAt,
    baseIndexForVisual,
    getVisualIndexForBase,
    gridOuterRef: bodyOuterRef,
    gridWrapperRef: bodyWrapRef,
    bodyScrollTopRef,
    bodyScrollLeftRef,
    rowHeight,
    bodyHeight,
    headerMainWidth,
    frozenLeftPx: frozenWidth,
    pageStart,
    pageEnd,
    totalCount,
    visibleRowCount,
    enablePagination,
    onChange: onCellSelectionChange,
    normalizeToSingleIndex,
    selectedCell,
    selectedCells,
    scheduleOverlayRepaint,
    editOverlayRef,
    flushOverlayToState,
    onActiveRowChange: (bi) => {
      if (!enableActiveRow) return;
      // NOTE: Mouse click still updates active row; keyboard arrows do NOT (handled in hook)
      setInternalActiveIndex(bi);
      scheduleOverlayRepaint();
    },
  });

  useEffect(() => { cellSelRecomputeRef.current = cellSel.recomputeOverlay; }, [cellSel.recomputeOverlay]);

  useEffect(() => { scheduleOverlayRepaint(); }, [visibleRowCount, leafCols.length, scheduleOverlayRepaint]);

  const onKeyDownTable = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Don’t hijack shortcuts while typing in inputs / textareas / contenteditable
    const tgt = e.target as HTMLElement | null;
    const tag = tgt?.tagName?.toLowerCase();
    const editing =
      tag === "input" ||
      tag === "textarea" ||
      (tgt as any)?.isContentEditable === true;

    if (!isActive || editing) {
      // Let the selection hook handle it (or native input behavior)
      cellSel.onKeyDownBody(e);
      return;
    }

    // Excel-like Undo/Redo
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "z") {
        e.preventDefault();
        // Shift+Z = redo (Mac), plain Z = undo
        if (e.shiftKey) doRedo();
        else doUndo();
        return;
      }
      if (k === "y") {
        e.preventDefault();
        doRedo();
        return;
      }
    }

    // pass-through to the selection handler for everything else
    cellSel.onKeyDownBody(e);
  }, [isActive, doUndo, doRedo, cellSel]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", maxHeight, position: "relative" }}
      // Keep table "active" when focusing anywhere inside (including child inputs).
      onFocusCapture={() => {
        if (blurTimerRef.current != null) {
          clearTimeout(blurTimerRef.current);
          blurTimerRef.current = null;
        }
        // immediate is fine; focus landed inside our root
        setIsActive(true);
      }}
      // Only deactivate if focus truly left the table after the event settles.
      onBlurCapture={() => {
        if (blurTimerRef.current != null) {
          clearTimeout(blurTimerRef.current);
        }
        blurTimerRef.current = window.setTimeout(() => {
          blurTimerRef.current = null;
          const rootEl = ref.current;
          const next = document.activeElement as Node | null;
          if (!rootEl || !next || !rootEl.contains(next)) {
            setIsActive(false);
          }
        }, 0);
      }}
    >
      {/* Toolbar */}
      <div style={{ margin: "0 0 8px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Global filter…"
          value={globalQuery}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          style={{ padding: "6px 10px", width: 320 }}
        />
        <button onClick={handleRandomizeFirstCell}>Edit row 0 • col 0</button>

        {/* Undo/Redo */}
        <button onClick={doUndo} disabled={!canUndo} title={`Undo (${undoStack.length}/${undoLimit})`}>
          ⟲ Undo
        </button>
        <button onClick={doRedo} disabled={!canRedo} title={`Redo (${redoStack.length}/${redoLimit})`}>
          ⟳ Redo
        </button>

        {selectionEnabled && (
          <button onClick={clearSelection}>Clear selection ({sel.size})</button>
        )}
        <div style={{ opacity: 0.6, fontSize: 12 }}>
          Rows: {rowCount.toLocaleString()} | Showing: {Math.max(0, visibleRowCount).toLocaleString()}
          {enablePagination ? ` | Page ${pageIndexClamped + 1} / ${pageCount}` : ""}
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex" }}>
        {selectionEnabled && (
          <Grid
            ref={selHeaderRef}
            columnCount={1}
            columnWidth={() => SELECT_COL_W}
            height={headerHeight}
            rowCount={1}
            rowHeight={() => headerHeight}
            width={SELECT_COL_W}
            outerElementType={HiddenScrollOuter as any}
            itemData={
              // When multi-select is off, we still render the empty header cell once
              selHeaderData ?? {
                disabled: true,
                checked: false,
                indeterminate: false,
                onToggle: () => {},
              }
            }
            itemKey={() => "sel-hdr"} // stable key → no remount on sort
          >
            {SelectionHeaderGridCell}
          </Grid>
        )}

        <Grid
          ref={headerRef}
          outerElementType={HiddenScrollOuter as any}
          columnCount={leafCols.length}
          columnWidth={colWidthAt}
          height={headerHeight}
          rowCount={1}
          rowHeight={() => headerHeight}
          width={Math.max(0, viewportWidth - (selectionEnabled ? SELECT_COL_W : 0))}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={1}
          // Keep itemKey free of sort state so cells aren’t remounted on sort
          itemKey={({ columnIndex }) => `h-${leafCols[columnIndex]?.id ?? columnIndex}`}
          itemData={headerData}
        >
          {HeaderGridCell}
        </Grid>
      </div>

      {/* Body + overlays */}
      <div
        ref={bodyWrapRef}
        style={{
          display: "flex",
          height: bodyHeight,
          border: "1px solid #ddd",
          borderTop: "none",
          position: "relative",
          overflow: "hidden",
          outline: "none",
        }}
        onMouseDown={cellSel.onMouseDownBody}
        onPaste={cellSel.onPasteBody}
        onKeyDown={onKeyDownTable}
        tabIndex={0}
      >
        {selectionEnabled && (
          <Grid
            ref={selBodyRef}
            columnCount={1}
            columnWidth={() => SELECT_COL_W}
            height={bodyHeight}
            rowCount={visibleRowCount}
            rowHeight={() => rowHeight}
            width={SELECT_COL_W}
            outerElementType={HiddenScrollOuter as any}
            itemData={selBodyData}
            itemKey={({ rowIndex }) => {
              const bi = baseIndexForVisual(rowIndex);
              const v = getVisual(bi).v;
              return `sel-${bi}-v${v}`;
            }}
          >
            {SelectionBodyGridCell}
          </Grid>
        )}

        <Grid
          ref={bodyRef}
          outerRef={bodyOuterRef}
          columnCount={leafCols.length}
          columnWidth={colWidthAt}
          height={bodyHeight}
          rowCount={visibleRowCount}
          rowHeight={() => rowHeight}
          width={Math.max(0, viewportWidth - (selectionEnabled ? SELECT_COL_W : 0))}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={overscanRowCount}
          onScroll={onBodyScroll}
          itemKey={({ rowIndex, columnIndex }) => {
            const baseVisualIndex = (enablePagination ? pageStart : 0) + rowIndex;
            const ord = viewOrder;
            const bi = ord && baseVisualIndex >= 0 && baseVisualIndex < ord.length
              ? ord[baseVisualIndex]
              : baseVisualIndex;

            const v = getVisual(bi).v; // row visual version (selection/disabled)
            const colId = leafCols[columnIndex]?.id ?? columnIndex;

            // per-cell version — only the changed cell gets a new key
            const cv = typeof colId === "string" ? getCellVersion(bi, String(colId)) : 0;

            return `${bi ?? -1}-${colId}-v${v}-c${cv}`;
          }}
        >
          {BodyCellRenderer}
        </Grid>

        {/* Active row overlay (1px) — mounted only when visible; spans from left:0 */}
        {enableActiveRow && activeMounted && (
          <div
            ref={activeOverlayRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: rowHeight,
              border: "1px solid #2b6fff",
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}

        {/* Cell selection overlay — mounted only when visible */}
        {enableSelection && cellSel.overlayMounted && (
          <div
            ref={cellSel.overlayRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              border: isActive ? "2px solid #2b6fff" : "2px dashed #2b6fff",
              boxSizing: "border-box",
              pointerEvents: "none",     // parent never intercepts
              zIndex: 3,
            }}
          >
            {/* NEW: only let resize handles take pointer events when active */}
            <div style={{ pointerEvents: isActive ? "auto" : "none" }}>
              {cellSel.overlayHandles}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <FooterBar
        enablePagination={!!enablePagination}
        pageIndex={pageIndexClamped}
        pageSize={pag.pageSize}
        totalCount={totalCount}
        onPageIndex={setPageIndex}
        onPageSize={setPageSize}

        showSelectionPanel={selectionEnabled && !!multiSelect}
        pageEligibleCount={pageEligibleCount}
        pageAllSelected={pageAllSelected}
        pageSomeSelected={pageSomeSelected}
        totalSelectedCount={sel.size}
        onTogglePageAll={togglePageAll}
      />
    </div>
  );
}

const FooterBar = React.memo(function FooterBar({
  enablePagination,
  pageIndex,
  pageSize,
  totalCount,
  onPageIndex,
  onPageSize,

  showSelectionPanel,
  pageEligibleCount,
  pageAllSelected,
  pageSomeSelected,
  totalSelectedCount,
  onTogglePageAll,
}: {
  enablePagination: boolean;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPageIndex: (idx: number) => void;
  onPageSize: (n: number) => void;

  showSelectionPanel: boolean;
  pageEligibleCount: number;
  pageAllSelected: boolean;
  pageSomeSelected: boolean;
  totalSelectedCount: number;
  onTogglePageAll: () => void;
}) {
  // Make the pagination callbacks identity-stable for children.
  // This ensures PagerArea/PaginationControls do NOT re-render when the parent re-renders for selection.
  const onPageIndexStable = useStableEvent(onPageIndex);
  const onPageSizeStable  = useStableEvent(onPageSize);

  if (!enablePagination && !showSelectionPanel) return null;

  return (
    <div style={{ border: "1px solid #ddd", borderTop: "none", background: "#fafafa", fontSize: 13 }}>
      {showSelectionPanel && (
        <PageSelectionBar
          pageEligibleCount={pageEligibleCount}
          pageAllSelected={pageAllSelected}
          pageSomeSelected={pageSomeSelected}
          totalSelectedCount={totalSelectedCount}
          onTogglePageAll={onTogglePageAll}
        />
      )}

      {enablePagination && (
        <PagerArea
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageIndex={onPageIndexStable}
          onPageSize={onPageSizeStable}
        />
      )}
    </div>
  );
}, (a, b) =>
  // NOTE: do NOT compare function props; they change identity easily.
  a.enablePagination     === b.enablePagination &&
  a.pageIndex           === b.pageIndex &&
  a.pageSize            === b.pageSize &&
  a.totalCount          === b.totalCount &&
  a.showSelectionPanel  === b.showSelectionPanel &&
  a.pageEligibleCount   === b.pageEligibleCount &&
  a.pageAllSelected     === b.pageAllSelected &&
  a.pageSomeSelected    === b.pageSomeSelected &&
  a.totalSelectedCount  === b.totalSelectedCount
);

const PageSelectionBar = React.memo(function PageSelectionBar({
  pageEligibleCount,
  pageAllSelected,
  pageSomeSelected,
  totalSelectedCount,
  onTogglePageAll,
}: {
  pageEligibleCount: number;
  pageAllSelected: boolean;
  pageSomeSelected: boolean;
  totalSelectedCount: number;
  onTogglePageAll: () => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 10px", borderBottom: "1px solid #e9e9e9" }}>
      <div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            disabled={pageEligibleCount === 0}
            checked={pageEligibleCount > 0 && pageAllSelected}
            ref={(el) => { if (el) el.indeterminate = pageEligibleCount > 0 && pageSomeSelected; }}
            onChange={onTogglePageAll}
            aria-label="Select current page"
            title={pageEligibleCount === 0 ? "No selectable rows on this page" : "Select all rows on this page"}
          />
          Select all rows on this page
        </label>
      </div>
      <div><strong>{totalSelectedCount.toLocaleString()}</strong> Total Selected Rows</div>
    </div>
  );
}, (a, b) =>
  a.pageEligibleCount   === b.pageEligibleCount &&
  a.pageAllSelected     === b.pageAllSelected &&
  a.pageSomeSelected    === b.pageSomeSelected &&
  a.totalSelectedCount  === b.totalSelectedCount &&
  a.onTogglePageAll     === b.onTogglePageAll
);

const PagerArea = React.memo(function PagerArea({
  pageIndex,
  pageSize,
  totalCount,
  onPageIndex,
  onPageSize,
}: {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  onPageIndex: (idx: number) => void;
  onPageSize: (n: number) => void;
}) {
  const safeSize  = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(totalCount / safeSize));
  const canPrev   = pageIndex > 0;
  const canNext   = pageIndex < pageCount - 1;

  const summaryFrom = totalCount > 0 ? pageIndex * safeSize + 1 : 0;
  const summaryTo   = totalCount > 0 ? Math.min(pageIndex * safeSize + safeSize, totalCount) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 10px" }}>
      <div style={{ whiteSpace: "nowrap" }}>
        {/* Only rendered when pagination is enabled (FooterBar gates it) */}
        Displaying <strong>{summaryFrom.toLocaleString()}</strong> to <strong>{summaryTo.toLocaleString()}</strong> of <strong>{totalCount.toLocaleString()}</strong> Records
      </div>

      <PaginationControls
        pageIndex={pageIndex}
        pageSize={safeSize}
        pageCount={pageCount}
        canPrev={canPrev}
        canNext={canNext}
        onPageIndex={onPageIndex}
        onPageSize={onPageSize}
      />
    </div>
  );
}, (a, b) =>
  // NOTE: ignore function props here too; only primitive pagination state matters for re-rendering.
  a.pageIndex   === b.pageIndex &&
  a.pageSize    === b.pageSize &&
  a.totalCount  === b.totalCount
);

const PaginationControls = React.memo(function PaginationControls({
  pageIndex,
  pageSize,
  pageCount,
  canPrev,
  canNext,
  onPageIndex,
  onPageSize,
}: {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  onPageIndex: (idx: number) => void;
  onPageSize: (n: number) => void;
}) {
  const [input, setInput] = React.useState<string>(String(pageIndex + 1));
  React.useEffect(() => { setInput(String(pageIndex + 1)); }, [pageIndex]);

  const commit = React.useCallback((raw: string) => {
    const n = Math.max(1, Math.min((Number(raw) | 0) || 1, Math.max(1, pageCount)));
    setInput(String(n));
    onPageIndex(n - 1);
  }, [pageCount, onPageIndex]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => onPageIndex(0)}             disabled={!canPrev}>« First</button>
      <button onClick={() => onPageIndex(pageIndex - 1)} disabled={!canPrev}>‹ Prev</button>

      <span style={{ opacity: 0.8 }}>
        Page {pageIndex + 1} / {pageCount}
      </span>

      <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        Go to:&nbsp;
        <input
          type="number"
          min={1}
          max={Math.max(1, pageCount)}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commit(e.currentTarget.value); }}
          onBlur={(e) => commit(e.currentTarget.value)}
          style={{ width: 72, padding: "4px 6px" }}
        />
      </label>

      <button onClick={() => onPageIndex(pageIndex + 1)} disabled={!canNext}>Next ›</button>
      <button onClick={() => onPageIndex(pageCount - 1)} disabled={!canNext}>Last »</button>

      <label style={{ marginLeft: 6 }}>
        Page size:&nbsp;
        <select value={pageSize} onChange={(e) => onPageSize(parseInt(e.target.value, 10))}>
          {[25, 50, 100, 250, 500, 1000].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
    </div>
  );
}, (a, b) =>
  a.pageIndex   === b.pageIndex &&
  a.pageSize    === b.pageSize &&
  a.pageCount   === b.pageCount &&
  a.canPrev     === b.canPrev &&
  a.canNext     === b.canNext &&
  a.onPageIndex === b.onPageIndex &&
  a.onPageSize  === b.onPageSize
);

