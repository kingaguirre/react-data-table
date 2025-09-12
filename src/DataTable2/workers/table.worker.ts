// src/DataTable2/workers/table.worker.ts
import * as Comlink from "comlink";

type Row = Record<string, unknown>;

let TEXT_VEC: string[] | null = null;
let COL_IDS: string[] = [];
let ROWS_LEN = 0;

// Bound memory used by global filter text
const FILTER_COL_LIMIT = 12;
const FILTER_TEXT_LIMIT = 256;

function rowToText(row: Row | undefined, columnIds: string[]): string {
  if (!row) return "";
  const parts: string[] = [];
  const limit = Math.min(columnIds.length, FILTER_COL_LIMIT);
  for (let k = 0; k < limit; k++) {
    const key = columnIds[k];
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const v = (row as any)[key];
      if (v !== null && v !== undefined) parts.push(String(v));
    }
  }
  const s = parts.join(" ").toLowerCase();
  return s.length > FILTER_TEXT_LIMIT ? s.slice(0, FILTER_TEXT_LIMIT) : s;
}

async function ingestRows(rows: Row[], columnIds: string[]) {
  COL_IDS = columnIds.slice();
  ROWS_LEN = rows.length;
  TEXT_VEC = new Array(ROWS_LEN);
  for (let i = 0; i < ROWS_LEN; i++) {
    TEXT_VEC[i] = rowToText(rows[i], COL_IDS);
    // yield occasionally to keep the worker responsive on huge ingests
    if ((i & 2047) === 0) await new Promise((r) => setTimeout(r, 0));
  }
}

async function updateRowText(rowIndex: number, updatedRow: Row) {
  if (!TEXT_VEC) return;
  if (rowIndex < 0 || rowIndex >= ROWS_LEN) return;
  TEXT_VEC[rowIndex] = rowToText(updatedRow, COL_IDS);
}

function sortByVector(
  values: (string | number | null | undefined)[],
  desc: boolean
) {
  const n = values.length;
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;

  const dir = desc ? -1 : 1;
  const sample = values.find((v) => v !== null && v !== undefined);

  const cmp =
    typeof sample === "number"
      ? (a: number, b: number) => {
          const av = (values[a] as number) ?? Number.NEGATIVE_INFINITY;
          const bv = (values[b] as number) ?? Number.NEGATIVE_INFINITY;
          // stable tiebreaker on original index
          return ((av < bv ? -1 : av > bv ? 1 : 0) * dir) || (a - b);
        }
      : (a: number, b: number) => {
          const av = String(values[a] ?? "");
          const bv = String(values[b] ?? "");
          // stable tiebreaker on original index
          return ((av < bv ? -1 : av > bv ? 1 : 0) * dir) || (a - b);
        };

  idx.sort(cmp);
  return Comlink.transfer(idx, [idx.buffer]);
}

// return type now: Int32Array | null
function globalFilter(query: string, order?: Int32Array | null) {
  const q = (query ?? "").toLowerCase().trim();
  const vec = TEXT_VEC;

  if (!q) return order ?? null;

  if (!vec) return order ?? null;

  if (order && order.length) {
    const tmp = new Int32Array(order.length);
    let w = 0;
    for (let i = 0; i < order.length; i++) {
      const ri = order[i];
      if (ri >= 0 && ri < vec.length && vec[ri]?.includes(q)) tmp[w++] = ri;
    }
    const out = tmp.slice(0, w);
    return Comlink.transfer(out, [out.buffer]);
  } else {
    const acc = new Int32Array(ROWS_LEN);
    let w = 0;
    for (let i = 0; i < ROWS_LEN; i++) {
      if (vec[i]?.includes(q)) acc[w++] = i;
      if ((i & 4095) === 0) { /* yield */ }
    }
    const out = acc.slice(0, w);
    return Comlink.transfer(out, [out.buffer]);
  }
}

function reset() {
  TEXT_VEC = null;
  COL_IDS = [];
  ROWS_LEN = 0;
}

Comlink.expose({
  ingestRows,
  updateRowText,
  sortByVector,
  globalFilter,
  reset,
});
