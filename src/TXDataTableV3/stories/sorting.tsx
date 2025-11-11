// stories/sorting.tsx
import React from 'react';
import { TXDataTable, getDeepValue } from '../index';
import { Container } from './utils';
import type { ColumnSettings } from '../interfaces';

// --- helpers ---
const pad2 = (n: number) => String(n).padStart(2, '0');

// "YYYY-MMDDT..." normalizer (fixes missing dash before day)
const normalizeTimestamp = (s: string | null | undefined) =>
  (s || '').replace(/^(\d{4})-(\d{2})(\d{2})T/, '$1-$2-$3T');

const toDate = (s: string | null | undefined) => new Date(normalizeTimestamp(s));

const formatUtcDmyHms = (d: Date) => {
  const day = pad2(d.getUTCDate());
  const month = pad2(d.getUTCMonth() + 1);
  const year = d.getUTCFullYear();
  const hour = pad2(d.getUTCHours());
  const minutes = pad2(d.getUTCMinutes());
  const seconds = pad2(d.getUTCSeconds());
  return `${day}-${month}-${year}, ${hour}:${minutes}:${seconds}`;
};

// produce weird ISO like "YYYY-0911T11:51:13.758Z"
const toWeirdIso = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const iso = d.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  const time = iso.split('T')[1]; // HH:mm:ss.sssZ
  return `${y}-${m}${day}T${time}`;
};

const rm = (n: number) =>
  `RM ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

// --- data (120 rows) ---
const BASE = new Date('2025-09-11T11:51:13.758Z').getTime();
const ROWS = Array.from({ length: 120 }, (_, i) => {
  const dA = new Date(BASE + i * 60 * 60 * 1000);       // hourly steps
  const dB = new Date(BASE + i * 17 * 60 * 1000);       // 17-minute steps
  const amount = 1000 + i * 13.37;                      // arbitrary ascending
  return {
    id: i + 1,
    name: `Row ${i + 1}`,
    amountText: rm(amount),
    makerTimestamp: toWeirdIso(dA),                     // e.g. "2025-0911T..."
    checkerTimestamp: toWeirdIso(dB),
  };
});

// --- columns ---
const COLUMNS: ColumnSettings[] = [
  { title: 'ID', column: 'id', width: 80, sorted: 'asc' },
  { title: 'Name', column: 'name', width: 180 },
  {
    title: 'Amount (RM)',
    column: 'amountText',
    width: 160,
    sortFn: amountSortFn, // custom numeric sort for currency text
  },
  {
    title: 'Maker TS (raw)',
    column: 'makerTimestamp',
    width: 220,
    sorted: 'desc',
    sortFunction: tsSortFn, // custom date sort for weird ISO
  },
  {
    title: 'Checker TS (formatted)',
    column: 'checkerTimestamp',
    width: 240,
    columnCustomRenderer: (_: any, data: any) => {
      const d = toDate(data?.checkerTimestamp);
      return Number.isNaN(d.getTime()) ? '' : formatUtcDmyHms(d); // "DD-MM-YYYY, HH:mm:ss"
    },
    sortFn: tsSortFn, // keep sort consistent with the underlying timestamp
  },
];

export default () => (
  <Container>
    <h2>TX Data Table V3 — Sorting Demo</h2>
    <p>Shows custom sorting for currency and timestamps (including weird ISO like <code>YYYY-MMDDT…Z</code>).</p>
    <TXDataTable
      dataSource={ROWS}
      columnSettings={COLUMNS}
      rowKey="id"
      headerSearchSettings
      // keep the rest minimal; sorting is via header clicks
    />
  </Container>
);
