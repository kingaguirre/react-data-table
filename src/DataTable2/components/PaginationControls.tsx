import React, { useEffect, useState } from "react";

type Props = {
  pageIndexClamped: number;
  pageCount: number;
  setPageIndex: (idx: number) => void;
  pag: { pageIndex: number; pageSize: number };
  setPageSize: (n: number) => void;
  canPrev: boolean;
  canNext: boolean;
};

function PaginationControlsBase({
  pageIndexClamped,
  pageCount,
  setPageIndex,
  pag,
  setPageSize,
  canPrev,
  canNext,
}: Props) {
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

export const PaginationControls = React.memo(PaginationControlsBase);
