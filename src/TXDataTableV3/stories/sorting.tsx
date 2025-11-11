// stories/sorting.tsx
import React from 'react';
import { TXDataTable, getDeepValue } from '../index';
import { Container } from './utils';
import type { ColumnSettings } from '../interfaces';

// ---------- helpers ----------
const pad2 = (n: number) => String(n).padStart(2, '0');

// Fix "YYYY-MMDDT..." → "YYYY-MM-DDT..."
const normalizeTimestamp = (s: string | null | undefined) =>
  (s || '').replace(/^(\d{4})-(\d{2})(\d{2})T/, '$1-$2-$3T');

const toDate = (s: string | null | undefined) => new Date(normalizeTimestamp(s));

// Month short names
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// "DD-MMM-YYYY: hh:mm:ss" (UTC-based, matches trailing Z in input)
const formatUtcDmyMonHms = (d: Date) => {
  const day = pad2(d.getUTCDate());
  const mon = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hour = pad2(d.getUTCHours());      // 00..23
  const minutes = pad2(d.getUTCMinutes());
  const seconds = pad2(d.getUTCSeconds());
  return `${day}-${mon}-${year}: ${hour}:${minutes}:${seconds}`;
};

const makeUTC = (y: number, m: number, d: number, h: number, mi: number, s: number, ms = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, mi, s, ms));

/** Turn a Date into the weird ISO: "YYYY-MMDDT..." (missing dash before day) */
const toWeirdIso = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const time = d.toISOString().split('T')[1]; // "HH:mm:ss.sssZ"
  return `${y}-${m}${day}T${time}`;
};

const rm = (n: number) =>
  `RM ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));

// ---------- custom sorters ----------
const amountSortFn = (a: any, b: any, col: ColumnSettings) => {
  const toNum = (s: string) => Number((s || '').replace(/[^\d.-]/g, '')) || 0;
  const av = toNum(getDeepValue(a, col.column));
  const bv = toNum(getDeepValue(b, col.column));
  return av - bv;
};

const tsSortFn = (a: any, b: any, col: ColumnSettings) => {
  const ta = toDate(getDeepValue(a, col.column)).getTime();
  const tb = toDate(getDeepValue(b, col.column)).getTime();
  const A = Number.isNaN(ta) ? 0 : ta;
  const B = Number.isNaN(tb) ? 0 : tb;
  return A - B;
};

// Sort against renderer text (string or {downloadText, render})
const rendererTextSortFn = (a: any, b: any, col: ColumnSettings) => {
  const outA: any = (col as any).columnCustomRenderer?.(null, a);
  const outB: any = (col as any).columnCustomRenderer?.(null, b);
  const getText = (out: any) =>
    typeof out === 'string' ? out : (out?.downloadText ?? out?.render ?? '');
  return getText(outA).localeCompare(getText(outB));
};

// Numeric based on row.score (renderer-only column)
const scoreSortFn = (a: any, b: any) => {
  const av = Number(a?.score ?? 0);
  const bv = Number(b?.score ?? 0);
  return av - bv;
};

// Rating (renderer-only) 1..5
const ratingSortFn = (a: any, b: any) => (Number(a?.rating ?? 0) - Number(b?.rating ?? 0));

// Natural alphanumeric like "A10", "B2", "AA3" → compare letters, then number
const alphaNumSortFn = (a: any, b: any) => {
  const parse = (s: string) => {
    const m = (s || '').match(/^([A-Za-z]+)(\d+)?$/);
    return m ? [m[1].toUpperCase(), Number(m[2] ?? 0)] as const : [s.toUpperCase(), 0] as const;
  };
  const [la, na] = parse(a?.code);
  const [lb, nb] = parse(b?.code);
  if (la !== lb) return la < lb ? -1 : 1;
  return na - nb;
};

// Grade with a custom order (A+ > A > A- > B+ > ... > F); ascending respects this ladder
const GRADE_ORDER = ['F','D','C-','C','C+','B-','B','B+','A-','A','A+']; // lowest→highest
const gradeSortFn = (a: any, b: any) => GRADE_ORDER.indexOf(a?.grade) - GRADE_ORDER.indexOf(b?.grade);

// ---------- data (120 rows with varied years/months/days/times + custom-sort fields) ----------
const GRADES = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F'];
const LETTERS = ['A','B','C','D','E','AA','AB','BA','BB'];

const ROWS = Array.from({ length: 120 }, (_, i) => {
  // Maker timestamp varies across 2019..2025
  const yA = 2019 + (i % 7);
  const mA = 1 + (i % 12);
  const dA = 1 + ((i * 7) % 28);
  const hA = (i * 3) % 24;
  const miA = (i * 11) % 60;
  const sA = (i * 19) % 60;

  // Checker timestamp varies differently 2025..2020
  const yB = 2025 - (i % 6);
  const mB = 12 - (i % 12) || 12;
  const dB = 1 + ((i * 5) % 28);
  const hB = (i * 7) % 24;
  const miB = (i * 13) % 60;
  const sB = (i * 23) % 60;

  const makerDate = makeUTC(yA, mA, dA, hA, miA, sA, 758);
  const checkerDate = makeUTC(yB, mB, dB, hB, miB, sB, 758);

  const amount =
    1000 +
    ((i * 137) % 1234) +
    ((i % 3) === 0 ? 0.5 : 0);

  const rating = 1 + (i % 5);
  const score = (i * 17) % 1001; // 0..1000
  const code = `${LETTERS[i % LETTERS.length]}${1 + ((i * 7) % 25)}`;
  const grade = GRADES[(i * 3) % GRADES.length];

  return {
    id: i + 1,
    name: `Row ${i + 1}`,
    amountText: rm(amount),
    makerTimestamp: toWeirdIso(makerDate),     // e.g., "2025-0911T..."
    checkerTimestamp: toWeirdIso(checkerDate), // same weird format
    // custom-sort fields
    rating,
    score,
    code,
    grade,
  };
});

// ---------- single table columns (showcasing many custom sort scenarios) ----------
const COLUMNS: ColumnSettings[] = [
  { title: 'ID', column: 'id', width: 70 },
  { title: 'Name', column: 'name' }, // no width
  {
    title: 'Amount (RM)',
    column: 'amountText',
    width: 160,
    sortFn: amountSortFn, // numeric sort for currency strings
  },
  {
    title: 'Maker TS (raw)',
    column: 'makerTimestamp',
    width: 220,
    sorted: 'desc',
    sortFn: tsSortFn, // uses underlying ISO timestamp
  },
  {
    title: 'Checker TS (formatted)',
    column: 'checkerTimestamp',
    width: 260,
    columnCustomRenderer: (_: any, data: any) => {
      const d = toDate(data?.checkerTimestamp);
      return Number.isNaN(d.getTime()) ? '' : formatUtcDmyMonHms(d); // "DD-MMM-YYYY: hh:mm:ss"
    },
    sortFn: tsSortFn, // still sorts by underlying timestamp
  },

  // ----- CUSTOM SORT EXAMPLES (renderer + downloadText) -----

  // 1) Rating stars (virtual UI, numeric sort by row.rating)
  {
    title: 'Rating ★',
    column: 'ratingStars', // not in data
    width: 140,
    columnCustomRenderer: (_: any, row: any) => {
      const r = Number(row?.rating ?? 0);
      const text = String(r);
      return {
        render: `${stars(r)} (${r}/5)`,
        downloadText: text, // used for CSV/Excel exports
      };
    },
    sortFn: ratingSortFn,
  },

  // 2) Score with suffix (renderer holds “123 pts”, downloadText is plain number)
  {
    title: 'Score (pts)',
    column: 'scoreCell', // not in data
    width: 140,
    columnCustomRenderer: (_: any, row: any) => {
      const sc = Number(row?.score ?? 0);
      return {
        render: `${sc} pts`,
        downloadText: String(sc),
      };
    },
    sortFn: scoreSortFn,
  },

  // 3) Alphanumeric code like A10/B2/AA3 with natural sort
  {
    title: 'Code (A1/B12)',
    column: 'codeCell', // not in data
    width: 160,
    columnCustomRenderer: (_: any, row: any) => {
      const code = row?.code ?? '';
      return {
        render: `Code: ${code}`,
        downloadText: String(code),
      };
    },
    sortFn: alphaNumSortFn,
  },

  // 4) Grade with custom order (ladder) and colored badge-like text
  {
    title: 'Grade',
    column: 'gradeCell', // not in data
    width: 120,
    columnCustomRenderer: (_: any, row: any) => {
      const g = row?.grade ?? '';
      // keep it simple for Storybook; render as plain text; downloadText same
      return {
        render: `${g}`,
        downloadText: String(g),
      };
    },
    sortFn: gradeSortFn,
  },

  // 5) Virtual label sorted by renderer text (string/obj sorting)
  {
    title: 'Virtual Label',
    column: 'virtualLabel', // not in data
    width: 240,
    columnCustomRenderer: (_: any, row: any) => {
      const num = Number(String(row?.amountText || '').replace(/[^\d.-]/g, '')) || 0;
      const text = `#${pad2(row.id)} • ${rm(num)}`;
      return { render: text, downloadText: text };
    },
    sortFn: rendererTextSortFn, // sorts by renderer text (downloadText)
  },
];

export default () => (
  <Container>
    <h2>TX Data Table V3 — Custom Sorting (Single Table)</h2>
    <p>
      Demonstrates custom sort for currency, timestamps (raw + pretty), ratings (stars),
      numeric scores, natural alphanumeric codes, a custom grade ladder, and a virtual label
      that sorts by renderer text. Date format: <code>DD-MMM-YYYY: hh:mm:ss</code>.
    </p>
    <TXDataTable
      dataSource={ROWS}
      columnSettings={COLUMNS}
      // intentionally no rowKey / headerSearchSettings as requested
    />
  </Container>
);
