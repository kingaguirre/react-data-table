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

// Format to "DD-MMM-YYYY: hh:mm:ss" (UTC-based, matching the trailing Z)
const formatUtcDmyMonHms = (d: Date) => {
  const day = pad2(d.getUTCDate());
  const mon = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hour = pad2(d.getUTCHours());      // 00..23; change if you want 12h
  const minutes = pad2(d.getUTCMinutes());
  const seconds = pad2(d.getUTCSeconds());
  return `${day}-${mon}-${year}: ${hour}:${minutes}:${seconds}`;
};

const makeUTC = (y: number, m: number, d: number, h: number, mi: number, s: number, ms = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, mi, s, ms));

/** Turn a Date into your weird ISO: "YYYY-MMDDT..." (missing dash before day) */
const toWeirdIso = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const time = d.toISOString().split('T')[1]; // "HH:mm:ss.sssZ"
  return `${y}-${m}${day}T${time}`;
};

const rm = (n: number) =>
  `RM ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Custom sorters
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

// ---------- data (120 rows with varied years/months/days/times) ----------
const ROWS = Array.from({ length: 120 }, (_, i) => {
  // Maker timestamp varies forward across 2019..2025, all months, days, and times
  const yA = 2019 + (i % 7);         // 2019..2025
  const mA = 1 + (i % 12);           // 1..12
  const dA = 1 + ((i * 7) % 28);     // 1..28 (safe)
  const hA = (i * 3) % 24;
  const miA = (i * 11) % 60;
  const sA = (i * 19) % 60;

  // Checker timestamp varies differently (and sometimes earlier years) to avoid correlation
  const yB = 2025 - (i % 6);         // 2025..2020
  const mB = 12 - (i % 12) || 12;    // 12..1
  const dB = 1 + ((i * 5) % 28);     // 1..28
  const hB = (i * 7) % 24;
  const miB = (i * 13) % 60;
  const sB = (i * 23) % 60;

  const makerDate = makeUTC(yA, mA, dA, hA, miA, sA, 758);
  const checkerDate = makeUTC(yB, mB, dB, hB, miB, sB, 758);

  // Non-monotonic amounts so sorting is obvious
  const amount =
    1000 +
    ((i * 137) % 1234) + // wrap-around pattern
    ((i % 3) === 0 ? 0.5 : 0); // sprinkle some cents

  return {
    id: i + 1,
    name: `Row ${i + 1}`,
    amountText: rm(amount),
    makerTimestamp: toWeirdIso(makerDate),     // e.g., "2025-0911T..."
    checkerTimestamp: toWeirdIso(checkerDate), // same weird format
  };
});

// ---------- columns ----------
const COLUMNS: ColumnSettings[] = [
  { title: 'ID', column: 'id', width: 80 },
  { title: 'Name', column: 'name' }, // ← no width per request
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
    sortFn: tsSortFn, // use sortFn (no sortFunction)
  },
  {
    title: 'Checker TS (formatted)',
    column: 'checkerTimestamp',
    width: 260,
    columnCustomRenderer: (_: any, data: any) => {
      const d = toDate(data?.checkerTimestamp);
      return Number.isNaN(d.getTime()) ? '' : formatUtcDmyMonHms(d); // "DD-MMM-YYYY: hh:mm:ss"
    },
    sortFn: tsSortFn, // consistent with the underlying timestamp
  },
];

export default () => (
  <Container>
    <h2>TX Data Table V3 — Sorting (Wide Date Coverage)</h2>
    <p>
      Dates span different <b>years</b>, <b>months</b>, <b>days</b>, and <b>times</b> using the weird format
      <code> YYYY-MMDDT…Z</code>. Columns use <code>sortFn</code> and the formatted date shows as
      <code> DD-MMM-YYYY: hh:mm:ss</code>.
    </p>
    <TXDataTable
      dataSource={ROWS}
      columnSettings={COLUMNS}
      rowKey="id"
      headerSearchSettings
    />
  </Container>
);
