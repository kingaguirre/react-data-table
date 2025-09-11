import React, { useCallback, useEffect, useState } from "react";

type FooterProps = {
  selectionEnabled: boolean;
  multiSelect: boolean;
  pageEligibleCount: number;
  pageAllSelected: boolean;
  pageSomeSelected: boolean;
  onTogglePageAll: () => void;
  selectedCount: number;

  summaryFrom: number;
  summaryTo: number;
  totalCount: number;

  pageIndexClamped: number;
  pageCount: number;
  pag: { pageIndex: number; pageSize: number };
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
};

export function Footer({
  selectionEnabled,
  multiSelect,
  pageEligibleCount,
  pageAllSelected,
  pageSomeSelected,
  onTogglePageAll,
  selectedCount,

  summaryFrom,
  summaryTo,
  totalCount,

  pageIndexClamped,
  pageCount,
  pag,
  setPageIndex,
  setPageSize,
  canPrev,
  canNext,
}: FooterProps) {
  return (
    <div style={{ border: "1px solid #ddd", borderTop: "none", background: "#fafafa", fontSize: 13 }}>
      {selectionEnabled && multiSelect && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "8px 10px",
            borderBottom: "1px solid #e9e9e9",
          }}
        >
          <div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                disabled={pageEligibleCount === 0}
                checked={pageEligibleCount > 0 && pageAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = pageEligibleCount > 0 && pageSomeSelected;
                }}
                onChange={onTogglePageAll}
                aria-label="Select current page"
                title={
                  pageEligibleCount === 0
                    ? "No selectable rows on this page"
                    : "Select all rows on this page"
                }
              />
              Select all rows on this page
            </label>
          </div>
          <div>
            <strong>{selectedCount.toLocaleString()}</strong> Total Selected Rows
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 10px",
        }}
      >
        <div style={{ whiteSpace: "nowrap" }}>
          Displaying <strong>{summaryFrom.toLocaleString()}</strong> to{" "}
          <strong>{summaryTo.toLocaleString()}</strong> of{" "}
          <strong>{totalCount.toLocaleString()}</strong> Records
        </div>
        <PaginationControls
          pageIndexClamped={pageIndexClamped}
          pageCount={pageCount}
          setPageIndex={setPageIndex}
          pag={pag}
          setPageSize={setPageSize}
          canPrev={canPrev}
          canNext={canNext}
        />
      </div>
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
  useEffect(() => {
    setInput(String(pageIndexClamped + 1));
  }, [pageIndexClamped]);

  const commit = useCallback(
    (raw: string) => {
      const n = Math.max(1, Math.min((Number(raw) | 0) || 1, Math.max(1, pageCount)));
      setInput(String(n));
      setPageIndex(n - 1);
    },
    [pageCount, setPageIndex]
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => setPageIndex(0)} disabled={!canPrev}>
        « First
      </button>
      <button onClick={() => setPageIndex(pageIndexClamped - 1)} disabled={!canPrev}>
        ‹ Prev
      </button>

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
          onKeyDown={(e) => {
            if (e.key === "Enter") commit(e.currentTarget.value);
          }}
          onBlur={(e) => commit(e.currentTarget.value)}
          style={{ width: 72, padding: "4px 6px" }}
        />
      </label>

      <button onClick={() => setPageIndex(pageIndexClamped + 1)} disabled={!canNext}>
        Next ›
      </button>
      <button onClick={() => setPageIndex(pageCount - 1)} disabled={!canNext}>
        Last »
      </button>

      <label style={{ marginLeft: 6 }}>
        Page size:&nbsp;
        <select value={pag.pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
          {[25, 50, 100, 250, 500, 1000].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
