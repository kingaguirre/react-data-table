// src/DataTable2/DataTableTanstackVirtual.tsx
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
import { VariableSizeGrid } from "react-window";
import { createDataWorker } from "./dataWorkerClient";
import { useCellSelection } from "./hook/useCellSelection";

/** ---------- Local types to avoid version/type export issues ---------- */
type GridChildProps = {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data?: any;
  isScrolling?: boolean;
  isVisible?: boolean;
};
type GridOnScroll = {
  scrollLeft: number;
  scrollTop: number;
  scrollUpdateWasRequested: boolean;
};
type GridRef = InstanceType<typeof VariableSizeGrid>;

/** ---------- Column settings (NO id; use `column` + optional groupTitle) ---------- */
export type ColumnSetting<T> = {
  /** Dot-path to the field. Ex: "user.name" or "meta.stats.count" */
  column: string;
  title?: string;
  groupTitle?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Optional custom accessor; if omitted, we resolve via dotted path */
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
const GROUP_H = 28; // px height for optional group header row

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

/** Safe dotted-path getter ("a.b.c" ➜ obj.a?.b?.c) */
function getByPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  // supports simple dot paths; extend here if you want bracket notation
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
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

  /** ---------- Build TanStack columns from ColumnSetting (id = column) ---------- */
  const columns = useMemo<ColumnDef<T>[]>(() => {
    return columnSettings.map((c) => {
      const accessorFn = (c.accessor ??
        ((row: T) => getByPath(row, c.column))) as (row: T) => any;

      return {
        /** Give TanStack a stable id based on your path */
        id: c.column,
        header: c.title ?? c.column,
        accessorFn,
        size: c.width ?? DEFAULT_COL_WIDTH,
        minSize: c.minWidth ?? 40,
        maxSize: c.maxWidth ?? 10000,
      } as ColumnDef<T>;
    });
  }, [columnSettings]);

  /** Accessors for sorting/worker vectors keyed by column id (same as path) */
  const accessorById = useMemo(() => {
    const m = new Map<string, (row: T, i: number) => any>();
    for (const c of columnSettings) {
      const fn =
        (c.accessor as any) ??
        ((r: T) => getByPath(r, c.column));
      m.set(c.column, fn as any);
    }
    return m;
  }, [columnSettings]);

  // sizing
  const initialSizing = useMemo(() => {
    const s: ColumnSizingState = {};
    for (const c of columnSettings) {
      const w = Math.max(
        c.minWidth ?? 40,
        Math.min(c.width ?? DEFAULT_COL_WIDTH, c.maxWidth ?? 10000)
      );
      s[c.column] = w;
    }
    return s;
  }, [columnSettings]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(initialSizing);

  // worker
  const workerRef = useRef<ReturnType<typeof createDataWorker> | null>(null);
  if (!workerRef.current) workerRef.current = createDataWorker();

  // tokens
  const ingestTokenRef = useRef(0);
  const sortTokenRef = useRef(0);
  const filterTokenRef = useRef(0);

  // filter queue
  theFilter: {
    // keep names as in prior file for minimal diff
  }
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
    setRedoStack([]);
  }, [undoLimit]);

  const doUndo = useCallback(async () => {
    if (!canUndo) return;
    setUndoStack((prev) => {
      const next = prev.slice();
      const prevState = next.pop()!;
      setRedoStack((rprev) => {
        const snap = (isControlled ? dataSource : internalRows).map((r) => ({ ...r }));
        const rnext = [snap, ...rprev];
        if (rnext.length > redoLimit) rnext.pop();
        return rnext;
      });
      if (isControlled && onChange) onChange(prevState);
      else setInternalRows(prevState);
      (async () => {
        try {
          const api = workerRef.current!.api;
          await api.reset();
          await api.ingestRows(prevState as any[], columnSettings.map((c) => c.column));
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
      setUndoStack((uprev) => {
        const snap = (isControlled ? dataSource : internalRows).map((r) => ({ ...r }));
        const unext = [...uprev, snap];
        if (unext.length > undoLimit) unext.shift();
        return unext;
      });
      if (isControlled && onChange) onChange(redoState);
      else setInternalRows(redoState);
      (async () => {
        try {
          const api = workerRef.current!.api;
          await api.reset();
          await api.ingestRows(redoState as any[], columnSettings.map((c) => c.column));
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
  const colIdSig = useMemo(() => columnSettings.map((c) => c.column).join("|"), [columnSettings]);
  const lastIngestSigRef = useRef<string>("");

  const ingestTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (ingestTimerRef.current) { clearTimeout(ingestTimerRef.current); ingestTimerRef.current = null; }
    ingestTimerRef.current = window.setTimeout(async () => {
      const rowsLen = rows.length;
      const sig = `${rowsLen}#${colIdSig}`;
      if (!rowsLen) { setSortOrder(null); setViewOrder(null); lastIngestSigRef.current = sig; return; }
      if (sig === lastIngestSigRef.current) return;
      lastIngestSigRef.current = sig;

      const safeIds = columnSettings.map((c) => c.column);
      const token = ++ingestTokenRef.current;

      try {
        const api = workerRef.current!.api;
        await api.ingestRows(rows as any[], safeIds);
        if (token !== ingestTokenRef.current || !mountedRef.current) return;

        let base: Int32Array | null = null;
        const currSort = sortStateRef.current;
        if (currSort.id) {
          const accessor = accessorById.get(currSort.id) ?? ((r: T) => getByPath(r, currSort.id!));
          const vec = new Array<any>(rowsLen);
          for (let i = 0; i < rowsLen; i++) vec[i] = rows[i] ? accessor(rows[i], i) : undefined;
          try { base = await api.sortByVector(vec, currSort.desc); } catch { base = null; }
        }

        let finalOrder = base;
        const q = queryRef.current;
        if (q) {
          try { finalOrder = await api.globalFilter(q, base); } catch {}
        }

        if (token === ingestTokenRef.current && mountedRef.current) {
          setSortOrder(base);
          setViewOrder(finalOrder ?? base);
        }
      } catch {}
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
    let next: { id: string | null; desc: boolean };
    if (sortState.id !== columnId) next = { id: columnId, desc: false };
    else if (!sortState.desc) next = { id: columnId, desc: true };
    else next = { id: null, desc: false };
    setSortState(next);

    const token = ++sortTokenRef.current;

    let baseOrder: Int32Array | null = null;
    if (next.id) {
      const accessor =
        accessorById.get(next.id) ??
        ((r: T) => getByPath(r, next.id!));
      const vec = new Array<any>(rowCount);
      for (let i = 0; i < rowCount; i++) vec[i] = rows[i] ? accessor(rows[i], i) : undefined;
      try { baseOrder = await api.sortByVector(vec, next.desc); } catch { baseOrder = null; }
    }

    let finalOrder = baseOrder;
    const q = queryRef.current;
    if (q) {
      try { finalOrder = await api.globalFilter(q, baseOrder); } catch {}
    }

    if (token === sortTokenRef.current && mountedRef.current) {
      setSortOrder(baseOrder);
      setViewOrder(finalOrder);
    }
  }, [rows, rowCount, accessorById, sortState]);

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

      let finalOrder: Int32Array | null;
      if (!queued) {
        finalOrder = sortStateRef.current.id ? sortOrder : null;
      } else {
        try { finalOrder = await api.globalFilter(queued, sortOrder); }
        catch { finalOrder = sortOrder; }
      }

      if (token === filterTokenRef.current && mountedRef.current) {
        setViewOrder(finalOrder ?? sortOrder);
      }

      filterInFlightRef.current = false;
      if (filterPendingRef.current !== null) kick();
    };

    setTimeout(kick, 45);
  }, [sortOrder]);

  const onGlobalFilterChange = useCallback((q: string) => {
    setGlobalQuery(q);
    startFilter(q);
  }, [startFilter]);

  // refs & scroll sync
  const headerRef = useRef<GridRef | null>(null);
  const groupHeaderRef = useRef<GridRef | null>(null);
  const bodyRef = useRef<GridRef | null>(null);
  const selHeaderRef = useRef<GridRef | null>(null);
  const selBodyRef = useRef<GridRef | null>(null);
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

  const onBodyScroll = useCallback(({ scrollLeft, scrollTop }: GridOnScroll) => {
    headerRef.current?.scrollTo({ scrollLeft, scrollTop: 0 });
    groupHeaderRef.current?.scrollTo({ scrollLeft, scrollTop: 0 });
    selBodyRef.current?.scrollTo({ scrollLeft: 0, scrollTop: scrollTop ?? 0 });
    if (typeof scrollTop === "number") bodyScrollTopRef.current = scrollTop;
    if (typeof scrollLeft === "number") bodyScrollLeftRef.current = scrollLeft;
    scheduleOverlayRepaint();
  }, [scheduleOverlayRepaint]);

  /** Named cell renderers so react-window always gets a valid component type */
  function HeaderCellFC({ columnIndex, style }: GridChildProps) {
    const col = leafCols[columnIndex];
    if (!col) return <div style={{ ...style }} />;
    const caret = sortState.id !== col.id ? "" : sortState.desc ? " 🔽" : " 🔼";
    const s: CSSProperties = {
      ...style,
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #ddd",
      borderRight: "1px solid #eee",
      fontWeight: 600,
      background: "#f7f7f7",
      boxSizing: "border-box",
      cursor: "pointer",
    };
    return (
      <div style={s} onClick={() => requestSort(col.id)} title="Sort: none → asc → desc">
        {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}{caret}
      </div>
    );
  }

  // ------- Group header logic (optional) -------
  const hasGroups = useMemo(
    () => columnSettings.some(c => c.groupTitle != null),
    [columnSettings]
  );

  const colOffsets = useMemo(() => {
    const arr: number[] = [0];
    for (let i = 0; i < leafCols.length; i++) arr.push(arr[i] + colWidthAt(i));
    return arr; // length = leafCols.length + 1
  }, [leafCols, colWidthAt]);

  function GroupHeaderCellFC({ columnIndex, style }: GridChildProps) {
    const thisTitle = columnSettings[columnIndex]?.groupTitle;
    const prevTitle =
      columnIndex > 0 ? columnSettings[columnIndex - 1]?.groupTitle : undefined;

    const isStart = thisTitle === undefined ? true : thisTitle !== prevTitle;
    if (!isStart) return <div style={style} />;

    let end = columnIndex;
    if (thisTitle !== undefined) {
      for (let j = columnIndex + 1; j < columnSettings.length; j++) {
        if (columnSettings[j]?.groupTitle !== thisTitle) break;
        end = j;
      }
    }

    const width = colOffsets[end + 1] - colOffsets[columnIndex];

    const s: CSSProperties = {
      ...style,
      width,
      height: GROUP_H,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      borderRight: "1px solid #e9e9e9",
      background: "#f2f2f2",
      boxSizing: "border-box",
      pointerEvents: "none",
    };

    return <div style={s} title={thisTitle || ""}>{thisTitle || ""}</div>;
  }
  // --------------------------------------------

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
    if (enablePagination) applyPagination(p => ({ ...p, pageIndex: 0 }));
  }, [viewOrder?.length, sortState.id, sortState.desc, enablePagination]); // eslint-disable-line

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

  type Visual = { bg?: string; v: number };
  const rowVisualRef = useRef<Map<number, Visual>>(new Map());
  const getVisual = (bi: number): Visual => rowVisualRef.current.get(bi) ?? { bg: undefined, v: 0 };

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

  function BodyCellRendererFC({ rowIndex, columnIndex, style }: GridChildProps) {
    const col = leafCols[columnIndex];
    if (!col) return <BodyCell value={null} style={style} zebra={rowIndex % 2 === 0} bg={undefined} v={0} />;
    const rowObj = rowAt(rowIndex);
    const value = rowObj ? (col.columnDef.accessorFn as any)(rowObj, rowIndex) : null;
    const baseIndex = baseIndexForVisual(rowIndex);
    const vis = getVisual(baseIndex);
    return <BodyCell value={value} style={style} zebra={rowIndex % 2 === 0} bg={vis.bg} v={vis.v} />;
  }

  function SelectionHeaderCellFC({ style }: { style: CSSProperties }) {
    if (!selectionEnabled) return null;
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
    if (!multiSelect) return <div style={s} />;

    const disabledHdr = !hasEligibleFiltered;
    return (
      <div style={s}>
        <input
          type="checkbox"
          disabled={disabledHdr}
          checked={!disabledHdr && allFiltered}
          ref={(el) => { if (el) el.indeterminate = !disabledHdr && !allFiltered && anyFiltered; }}
          aria-label="Select all (filtered)"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!disabledHdr) toggleFilteredAll();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {}}
        />
      </div>
    );
  }

  function SelectionBodyCellFC({ rowIndex, style }: { rowIndex: number; style: CSSProperties }) {
    if (!selectionEnabled) return null;
    const bi = baseIndexForVisual(rowIndex);
    const disabled = bi < 0 || isDisabledBase(bi);
    const checked = sel.has(bi);
    const vis = getVisual(bi);
    const s: CSSProperties = {
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderBottom: "1px solid #eee",
      background: vis.bg ?? (rowIndex % 2 === 0 ? "#fafafa" : "#fff"),
      boxSizing: "border-box",
    };
    const type = multiSelect ? "checkbox" : "radio";
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
            if (!disabled) toggleOne(bi);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {}}
        />
      </div>
    );
  }

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

    const snapshot = rows.map((r) => ({ ...r }));
    pushUndo(snapshot);

    const editedIdxs = Array.from(m.keys());

    const next = rows.slice();
    m.forEach((patch, idx) => {
      const old = next[idx] ?? ({} as T);
      next[idx] = { ...old, ...patch };
    });
    m.clear();

    if (isControlled && onChange) onChange(next);
    else setInternalRows(next);

    (async () => {
      try {
        const api = workerRef.current!.api;
        for (const idx of editedIdxs) {
          const row = next[idx];
          if (row) await api.updateRowText(idx, row as any);
        }
      } catch {}
    })();
  }, [rows, isControlled, onChange, pushUndo]);

  const handleRandomizeFirstCell = useCallback(() => {
    if (rows.length === 0 || leafCols.length === 0) return;
    const firstColId = leafCols[0].id;

    const newVal = `Random ${Math.random().toString(36).slice(2, 7)}`;
    const overlay = editOverlayRef.current;
    overlay.set(0, { ...(overlay.get(0) || {}), [firstColId]: newVal });

    const myTok = ++pendingEditTokenRef.current;
    (async () => {
      try {
        const api = workerRef.current!.api;
        const baseRow = rows[0] || ({} as T);
        await api.updateRowText(0, { ...baseRow, [firstColId]: newVal } as any);

        const q = queryRef.current;
        if (q) {
          const token = ++filterTokenRef.current;
          let refreshed: Int32Array | null = null;
          try { refreshed = await api.globalFilter(q, sortOrder); } catch { refreshed = sortOrder; }
          if (token === filterTokenRef.current && myTok === pendingEditTokenRef.current && mountedRef.current) {
            setViewOrder(refreshed ?? sortOrder);
          }
        }
      } catch {}
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
  const bodyHeight = Math.max(0, maxHeight - headerHeight - (hasGroups ? GROUP_H : 0));

  // Active row overlay
  const activeOverlayRef = useRef<HTMLDivElement | null>(null);
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);
  const [activeMounted, setActiveMounted] = useState(false);

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
      if (node.closest?.('[data-select-cell="1"]')) return true;
      return false;
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) return;
      if (isFocusable(e.target)) return;
      if (document.activeElement !== bodyWrapRef.current) {
        requestAnimationFrame(() => bodyWrapRef.current?.focus());
      }
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
      setInternalActiveIndex(bi);
      scheduleOverlayRepaint();
    },
  });

  useEffect(() => { cellSelRecomputeRef.current = cellSel.recomputeOverlay; }, [cellSel.recomputeOverlay]);

  const canPrev = enablePagination && pageIndexClamped > 0;
  const canNext = enablePagination && pageIndexClamped < pageCount - 1;
  const summaryFrom = totalCount === 0 ? 0 : pageStart + 1;
  const summaryTo = totalCount === 0 ? 0 : pageEnd;

  useEffect(() => { scheduleOverlayRepaint(); }, [visibleRowCount, leafCols.length, scheduleOverlayRepaint]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", maxHeight, position: "relative" }}
      onFocusCapture={() => {
        setTimeout(() => { setIsActive(true); }, 0);
      }}
      onBlurCapture={(e) => {
        const next = e.relatedTarget as Node | null;
        const root = ref.current;
        if (!root || !next || !root.contains(next)) setIsActive(false);
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

      {/* Header (group row + leaf header row) */}
      <div>
        {hasGroups && leafCols.length > 0 && (
          <div style={{ display: "flex" }}>
            {selectionEnabled && (
              <VariableSizeGrid
                columnCount={1}
                columnWidth={() => SELECT_COL_W}
                height={GROUP_H}
                rowCount={1}
                rowHeight={() => GROUP_H}
                width={SELECT_COL_W}
                outerElementType={HiddenScrollOuter as any}
              >
                {function BlankFC() { return <div />; } as any}
              </VariableSizeGrid>
            )}

            <VariableSizeGrid
              ref={groupHeaderRef}
              outerElementType={HiddenScrollOuter as any}
              columnCount={leafCols.length}
              columnWidth={colWidthAt}
              height={GROUP_H}
              rowCount={1}
              rowHeight={() => GROUP_H}
              width={Math.max(0, viewportWidth - (selectionEnabled ? SELECT_COL_W : 0))}
              overscanColumnCount={overscanColumnCount}
              overscanRowCount={1}
              itemKey={({ columnIndex }: any) => `gh-${leafCols[columnIndex]?.id ?? columnIndex}`}
            >
              {GroupHeaderCellFC as any}
            </VariableSizeGrid>
          </div>
        )}

        <div style={{ display: "flex" }}>
          {selectionEnabled && (
            <VariableSizeGrid
              ref={selHeaderRef}
              columnCount={1}
              columnWidth={() => SELECT_COL_W}
              height={headerHeight}
              rowCount={1}
              rowHeight={() => headerHeight}
              width={SELECT_COL_W}
              outerElementType={HiddenScrollOuter as any}
            >
              {function SelHdrRenderer({ style }: GridChildProps) {
                return <SelectionHeaderCellFC style={style} />;
              } as any}
            </VariableSizeGrid>
          )}

          <VariableSizeGrid
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
            itemKey={({ columnIndex }: any) => `h-${leafCols[columnIndex]?.id ?? columnIndex}`}
          >
            {HeaderCellFC as any}
          </VariableSizeGrid>
        </div>
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
        onKeyDown={cellSel.onKeyDownBody}
        tabIndex={0}
      >
        {selectionEnabled && (
          <VariableSizeGrid
            ref={selBodyRef}
            columnCount={1}
            columnWidth={() => SELECT_COL_W}
            height={bodyHeight}
            rowCount={visibleRowCount}
            rowHeight={() => rowHeight}
            width={SELECT_COL_W}
            outerElementType={HiddenScrollOuter as any}
            itemKey={({ rowIndex }: any) => `sel-${(enablePagination ? pageStart : 0) + rowIndex}`}
          >
            {function SelBodyRenderer({ rowIndex, style }: GridChildProps) {
              return <SelectionBodyCellFC rowIndex={rowIndex} style={style} />;
            } as any}
          </VariableSizeGrid>
        )}

        <VariableSizeGrid
          ref={bodyRef}
          outerRef={bodyOuterRef as any}
          columnCount={leafCols.length}
          columnWidth={colWidthAt}
          height={bodyHeight}
          rowCount={visibleRowCount}
          rowHeight={() => rowHeight}
          width={Math.max(0, viewportWidth - (selectionEnabled ? SELECT_COL_W : 0))}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={overscanRowCount}
          onScroll={onBodyScroll as any}
          itemKey={({ rowIndex, columnIndex }: any) => {
            const baseVisualIndex = (enablePagination ? pageStart : 0) + rowIndex;
            const ord = viewOrder;
            const bi = ord && baseVisualIndex >= 0 && baseVisualIndex < ord.length ? ord[baseVisualIndex] : baseVisualIndex;
            const v = getVisual(bi).v;
            const colId = leafCols[columnIndex]?.id ?? columnIndex;
            return `${bi ?? -1}-${colId}-v${v}`;
          }}
        >
          {BodyCellRendererFC as any}
        </VariableSizeGrid>

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
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            <div style={{ pointerEvents: isActive ? "auto" : "none" }}>
              {cellSel.overlayHandles}
            </div>
          </div>
        )}
      </div>

      {enablePagination && (
        <div style={{ border: "1px solid #ddd", borderTop: "none", background: "#fafafa", fontSize: 13 }}>
          {selectionEnabled && multiSelect && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 10px", borderBottom: "1px solid #e9e9e9" }}>
              <div>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    disabled={pageEligibleCount === 0}
                    checked={pageEligibleCount > 0 && pageAllSelected}
                    ref={(el) => { if (el) el.indeterminate = pageEligibleCount > 0 && pageSomeSelected; }}
                    onChange={togglePageAll}
                    aria-label="Select current page"
                    title={pageEligibleCount === 0 ? "No selectable rows on this page" : "Select all rows on this page"}
                  />
                  Select all rows on this page
                </label>
              </div>
              <div><strong>{sel.size.toLocaleString()}</strong> Total Selected Rows</div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 10px" }}>
            <div style={{ whiteSpace: "nowrap" }}>
              Displaying <strong>{(totalCount === 0 ? 0 : pageStart + 1).toLocaleString()}</strong> to <strong>{(totalCount === 0 ? 0 : pageEnd).toLocaleString()}</strong> of <strong>{totalCount.toLocaleString()}</strong> Records
            </div>
            <PaginationControls
              pageIndexClamped={pageIndexClamped}
              pageCount={pageCount}
              setPageIndex={setPageIndex}
              pag={pag}
              setPageSize={setPageSize}
              canPrev={enablePagination && pageIndexClamped > 0}
              canNext={enablePagination && pageIndexClamped < pageCount - 1}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationControls({
  pageIndexClamped,
  pageCount,
  setPageIndex,
  pag,
  setPageSize,
  canPrev,
  canNext,
}: {
  pageIndexClamped: number;
  pageCount: number;
  setPageIndex: (idx: number) => void;
  pag: { pageIndex: number; pageSize: number };
  setPageSize: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const [input, setInput] = useState<string>(String(pageIndexClamped + 1));
  useEffect(() => { setInput(String(pageIndexClamped + 1)); }, [pageIndexClamped]);

  const commit = (raw: string) => {
    const n = Math.max(1, Math.min((Number(raw) | 0) || 1, Math.max(1, pageCount)));
    setInput(String(n));
    setPageIndex(n - 1);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => setPageIndex(0)} disabled={!canPrev}>« First</button>
      <button onClick={() => setPageIndex(pageIndexClamped - 1)} disabled={!canPrev}>‹ Prev</button>

      <span style={{ opacity: 0.8 }}>
        Page {pageIndexClamped + 1} / {pageCount}
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

      <button onClick={() => setPageIndex(pageIndexClamped + 1)} disabled={!canNext}>Next ›</button>
      <button onClick={() => setPageIndex(pageCount - 1)} disabled={!canNext}>Last »</button>

      <label style={{ marginLeft: 6 }}>
        Page size:&nbsp;
        <select value={pag.pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
          {[25, 50, 100, 250, 500, 1000].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
