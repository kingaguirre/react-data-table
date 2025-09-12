import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DataTableTanstackVirtual, ColumnSetting } from "./index";

type Row = Record<string, string | number>;
const ROWS = 100_000;
const COLS = 100;

function makeColumns(): ColumnSetting<Row>[] {
  return new Array(COLS).fill(null).map((_, c) => ({
    id: `c${c}`,
    title: `Column ${c}`,
    width: c % 5 === 0 ? 160 : c % 3 === 0 ? 140 : 120,
    minWidth: 80,
    maxWidth: 400,
  }));
}

// --- NEW: build columns with `column` + `groupTitle` + deep path examples
function makeColumnsV2(): ColumnSetting<Row>[] {
  const cols: ColumnSetting<Row>[] = [];

  for (let c = 0; c < COLS; c++) {
    // Same width logic as makeColumns
    const width = c % 5 === 0 ? 160 : c % 3 === 0 ? 140 : 120;

    // Grouping rules (contiguous where intended)
    let groupTitle: string | undefined;
    if (c === 0 || c === 1) {
      groupTitle = "Group 1";          // first two columns grouped
    } else if (c === 3 || c === 4) {
      groupTitle = "Metrics";          // two-column group
    } else if (c >= 5) {
      // Light, non-contiguous tags to show group headers here and there
      // (won't merge spans unless adjacent)
      if (c % 7 === 0) groupTitle = "Extras";
      else if (c % 11 === 0) groupTitle = "More";
    }

    cols.push({
      column: `c${c}`,
      id: `c${c}`,
      title: `Column ${c}`,
      groupTitle,
      width,
      minWidth: 80,
      maxWidth: 400,
    });
  }

  return cols;
}

function sameRefArray(a: any[], b: any[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function DataTableDemo() {
  const [rows, setRows] = useState<Row[]>([]);
  const columns = useMemo(() => makeColumnsV2(), []);

  // Pagination (external)
  const [enablePagination, setEnablePagination] = useState<boolean>(true);
  const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [pageInput, setPageInput] = useState<string>("1");

  // Row selection toggles
  const [enableRowSelection, setEnableRowSelection] = useState<boolean>(true);
  const [enableMultiRowSelection, setEnableMultiRowSelection] = useState<boolean>(true);

  // Selected/Disabled **by index** (what you asked)
  const [selectedRowIdxs, setSelectedRowIdxs] = useState<number[]>([]);
  const [disabledRowIdxs, setDisabledRowIdxs] = useState<number[]>([]);

  // Mirror (optional): if you still want the selected row objects for your app logic
  const [selectedRowsObjects, setSelectedRowsObjects] = useState<Row[]>([]);
  const [rowSelectionMap, setRowSelectionMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3001/rows/all?rows=${ROWS}&cols=${COLS}`);
        const data: Row[] = await res.json();
        if (!cancelled) {
          setRows(data);
          // examples: disable 0,1,2; preselect 5 & 7
          setDisabledRowIdxs([0, 1, 2]);
          setSelectedRowIdxs([1, 5, 7]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Clamp pageIndex when data length or pageSize changes
  useEffect(() => {
    const total = rows.length;
    const size = Math.max(1, pagination.pageSize);
    const count = Math.max(1, Math.ceil(total / size));
    setPagination(p => {
      const next = { pageIndex: Math.min(p.pageIndex, count - 1), pageSize: size };
      setPageInput(String(next.pageIndex + 1));
      return next;
    });
  }, [rows.length, pagination.pageSize]);

  const total = rows.length;
  const size = Math.max(1, pagination.pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const canPrev = pagination.pageIndex > 0;
  const canNext = pagination.pageIndex < pageCount - 1;

  const onPageIndexChange = (idx: number) => setPagination(p => ({ ...p, pageIndex: idx }));
  const onPageSizeChange  = (sz: number)   => setPagination({ pageIndex: 0, pageSize: sz });

  const firstPage = () => onPageIndexChange(0);
  const prevPage  = () => onPageIndexChange(Math.max(0, pagination.pageIndex - 1));
  const nextPage  = () => onPageIndexChange(Math.min(pageCount - 1, pagination.pageIndex + 1));
  const lastPage  = () => onPageIndexChange(Math.max(0, pageCount - 1));

  const commitPageInput = (raw: string) => {
    const n = Math.max(1, Math.min(Number(raw) | 0, pageCount));
    setPageInput(String(n));
    onPageIndexChange(n - 1);
  };

  // Avoid loops when child emits the same selection objects repeatedly
  const handleSelectedRowsChange = useCallback((next: Row[]) => {
    setSelectedRowsObjects(prev => (sameRefArray(prev, next) ? prev : next));
  }, []);

  const applyExample = () => {
    if (!rows.length) return;
    setDisabledRowIdxs([0, 1, 2]);
    setSelectedRowIdxs([5, 7]);
  };
  const clearExample = () => {
    setDisabledRowIdxs([]);
    setSelectedRowIdxs([]);
  };

  return (
    <div style={{ padding: 12, boxSizing: "border-box" }}>
      {/* External controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <button onClick={() => setEnablePagination(v => !v)}>
          {enablePagination ? "Disable pagination" : "Enable pagination"}
        </button>

        {enablePagination && (
          <>
            <button onClick={firstPage} disabled={!canPrev}>« First</button>
            <button onClick={prevPage}  disabled={!canPrev}>‹ Prev</button>

            <span style={{ fontSize: 12, opacity: 0.8 }}>
              Page {pagination.pageIndex + 1} / {pageCount}
            </span>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              Go to:&nbsp;
              <input
                type="number"
                min={1}
                max={Math.max(1, pageCount)}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitPageInput(e.currentTarget.value); }}
                onBlur={(e) => commitPageInput(e.currentTarget.value)}
                style={{ width: 72, padding: "4px 6px" }}
              />
            </label>

            <button onClick={nextPage} disabled={!canNext}>Next ›</button>
            <button onClick={lastPage} disabled={!canNext}>Last »</button>

            <label style={{ marginLeft: 8 }}>
              Page size:&nbsp;
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              >
                {[25, 50, 100, 250, 500, 1000].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      {/* Row selection external toggles */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <button onClick={() => setEnableRowSelection(v => !v)}>
          {enableRowSelection ? "Disable row selection" : "Enable row selection"}
        </button>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Multi-select:&nbsp;
          <input
            type="checkbox"
            checked={enableMultiRowSelection}
            onChange={(e) => setEnableMultiRowSelection(e.target.checked)}
            disabled={!enableRowSelection}
          />
        </label>

        <button onClick={applyExample} disabled={!rows.length}>Apply example (by index)</button>
        <button onClick={clearExample}>Clear selected/disabled</button>

        <span style={{ opacity: 0.8 }}>
          Selected (idx): {selectedRowIdxs.join(", ") || "—"} &nbsp;|&nbsp; Disabled (idx): {disabledRowIdxs.join(", ") || "—"}
        </span>
      </div>

      <DataTableTanstackVirtual<Row>
        dataSource={rows}
        columnSettings={columns}
        maxHeight={450}

        enablePagination={enablePagination}
        pagination={pagination}
        onPaginationChange={setPagination}
        onPageIndexChange={onPageIndexChange}
        onPageSizeChange={onPageSizeChange}

        enableRowSelection={enableRowSelection}
        enableMultiRowSelection={enableMultiRowSelection}
        onRowSelectionChange={setRowSelectionMap}
        onSelectedRowsChange={handleSelectedRowsChange}

        // Pass indexes here (works across sort/filter/pagination)
        selectedRows={selectedRowIdxs}
        disabledRows={disabledRowIdxs}

        activeRow={24}
      />
    </div>
  );
}
