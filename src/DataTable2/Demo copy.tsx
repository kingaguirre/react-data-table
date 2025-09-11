// src/DataTable2/Demo.tsx
import React, { useEffect, useMemo, useState } from "react";
// import { createRoot } from "react-dom/client";
import { DataTableTanstackVirtual, ColumnSetting } from "./index";
// import { generateLargeDataStream } from "./dataWorkerClient";

type Row = Record<string, string | number>;
const ROWS = 100_000; // or 1_000_000
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

export function DataTableDemo() {
  const [rows, setRows] = useState<Row[]>([]);
  const columns = useMemo(() => makeColumns(), []);

  // useEffect(() => {
  //   setRows([]); // reset for new run
  //   const cancel = generateLargeDataStream({ rows: ROWS, cols: COLS, chunk: 5000 }, (batch) => {
  //     // append in chunks (requestAnimationFrame throttled inside client)
  //     setRows(prev => (prev.length ? [...prev, ...batch] : batch));
  //   });
  //   return () => cancel();
  // }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // ⚠️ WARNING: this will pull a massive JSON blob and likely freeze/OOM.
      const res = await fetch(`http://localhost:3001/rows/all?rows=${ROWS}&cols=${COLS}`);
      const data: Row[] = await res.json(); // parses the entire payload in memory
      if (!cancelled) setRows(data);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: 12, boxSizing: "border-box" }}>
      <DataTableTanstackVirtual<Row>
        dataSource={rows}
        columnSettings={columns}
      />
    </div>
  );
}
