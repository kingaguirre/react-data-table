// src/DataTable2/hook/useCellSelection.ts
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

export type CellRange = { sr: number; sc: number; er: number; ec: number } | null;

type UseCellSelectionParams<T> = {
  enable: boolean;

  // grid & data
  rows: T[];
  leafCols: Array<{ id: string; columnDef: any; accessorFn: (row: T, i: number) => any }>;
  colWidthAt: (i: number) => number;

  // index transforms
  baseIndexForVisual: (vi: number) => number;
  getVisualIndexForBase: (bi: number) => number;

  // DOM/scroll context (main data grid, not the frozen select col)
  gridOuterRef: React.RefObject<HTMLDivElement | null>;
  gridWrapperRef: React.RefObject<HTMLDivElement | null>;
  bodyScrollTopRef: React.MutableRefObject<number>;
  bodyScrollLeftRef: React.MutableRefObject<number>;

  // geometry
  rowHeight: number;
  bodyHeight: number;
  headerMainWidth: number;
  frozenLeftPx: number;

  // paging/visibility
  pageStart: number;
  pageEnd: number;
  totalCount: number;
  visibleRowCount: number;
  enablePagination: boolean;

  // control & emit
  onChange?: (r: { startRow: number; startCol: number; endRow: number; endCol: number }) => void;
  normalizeToSingleIndex: (entry?: number | T) => number | null;

  // selected from props
  selectedCell?: [number | T, number];
  selectedCells?: { start: [number | T, number]; end: [number | T, number] };

  // repaint scheduler (provided by parent)
  scheduleOverlayRepaint: () => void;

  // paste/edit plumbing
  editOverlayRef: React.MutableRefObject<Map<number, Partial<T>>>;
  flushOverlayToState: () => void;

  // notify active row changes (parent decides how to use it)
  onActiveRowChange?: (baseIndex: number) => void;
};

export function useCellSelection<T>({
  enable,
  rows,
  leafCols,
  colWidthAt,
  baseIndexForVisual,
  getVisualIndexForBase,
  gridOuterRef,
  gridWrapperRef,
  bodyScrollTopRef,
  bodyScrollLeftRef,
  rowHeight,
  bodyHeight,
  headerMainWidth,
  frozenLeftPx,
  pageStart,
  pageEnd,
  totalCount,
  visibleRowCount,
  enablePagination,
  onChange,
  normalizeToSingleIndex,
  selectedCell,
  selectedCells,
  scheduleOverlayRepaint,
  editOverlayRef,
  flushOverlayToState,
  onActiveRowChange,
}: UseCellSelectionParams<T>) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // mount/unmount state for overlay
  const overlayVisibleRef = useRef(false);
  const [overlayMounted, setOverlayMounted] = React.useState(false);

  // prefix sums of column widths
  const colOffsetsRef = useRef<number[]>([0]);
  const recomputeColOffsets = useCallback(() => {
    const n = leafCols.length;
    const arr = new Array(n + 1);
    arr[0] = 0;
    for (let i = 0; i < n; i++) arr[i + 1] = arr[i] + colWidthAt(i);
    colOffsetsRef.current = arr;
  }, [leafCols.length, colWidthAt]);

  useLayoutEffect(() => {
    recomputeColOffsets();
    scheduleOverlayRepaint();
  }, [recomputeColOffsets, leafCols.length, scheduleOverlayRepaint]);

  // Internal selection state
  const boxRef = useRef<CellRange>(null);

  const emit = useCallback(
    (box: NonNullable<CellRange>) => {
      onChange?.({
        startRow: Math.min(box.sr, box.er),
        endRow: Math.max(box.sr, box.er),
        startCol: Math.min(box.sc, box.ec),
        endCol: Math.max(box.sc, box.ec),
      });
    },
    [onChange]
  );

  // Controlled → internal mirror
  const applyControlled = useCallback(() => {
    if (!enable) return;
    const src = selectedCells
      ? { a: selectedCells.start, b: selectedCells.end ?? selectedCells.start }
      : selectedCell
      ? { a: selectedCell, b: selectedCell }
      : null;
    if (!src) return;
    const norm = (p: [number | T, number]) => {
      const bi = normalizeToSingleIndex(p[0]);
      const col = Math.max(0, Math.min(leafCols.length - 1, p[1] | 0));
      return { bi: bi ?? -1, col };
    };
    const A = norm(src.a), B = norm(src.b);
    if (A.bi >= 0 && B.bi >= 0) {
      const sr = Math.min(A.bi, B.bi), er = Math.max(A.bi, B.bi);
      const sc = Math.min(A.col, B.col), ec = Math.max(A.col, B.col);
      boxRef.current = { sr, sc, er, ec };
      scheduleOverlayRepaint();
      emit({ sr, sc, er, ec });
      // NOTE: do NOT set active row here; keyboard-controlled active row is set only on Enter.
    }
  }, [
    enable,
    selectedCells,
    selectedCell,
    normalizeToSingleIndex,
    leafCols.length,
    scheduleOverlayRepaint,
    emit,
  ]);

  useEffect(() => {
    applyControlled();
  }, [applyControlled]);

  // hit-test
  const hitTest = useCallback(
    (clientX: number, clientY: number) => {
      const outer = gridOuterRef.current;
      if (!outer) return null;
      const rect = outer.getBoundingClientRect();
      let x = clientX - rect.left;
      let y = clientY - rect.top;
      x += bodyScrollLeftRef.current || 0;
      y += bodyScrollTopRef.current || 0;

      const viRaw = Math.floor(y / rowHeight);
      const vi = Math.max(0, Math.min(visibleRowCount - 1, viRaw));
      const bi = baseIndexForVisual(vi);
      if (bi < 0) return null;

      const offsets = colOffsetsRef.current;
      if (x < 0 || x >= offsets[offsets.length - 1]) return null;

      // binary search col
      let lo = 0, hi = offsets.length - 2;
      while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (offsets[mid] <= x && x < offsets[mid + 1]) { lo = mid; break; }
        if (x < offsets[mid]) hi = mid - 1; else lo = mid + 1;
      }
      const col = Math.max(0, Math.min(leafCols.length - 1, lo));
      const colLeft = offsets[col];
      const colRight = offsets[col + 1];

      return { vi, bi, col, x, y, colLeft, colRight };
    },
    [
      gridOuterRef,
      bodyScrollLeftRef,
      bodyScrollTopRef,
      rowHeight,
      visibleRowCount,
      baseIndexForVisual,
      leafCols.length,
    ]
  );

  const getColLeft = (c: number) =>
    colOffsetsRef.current[Math.max(0, Math.min(c, colOffsetsRef.current.length - 1))];
  const getColRight = (c: number) =>
    colOffsetsRef.current[Math.max(0, Math.min(c + 1, colOffsetsRef.current.length - 1))];

  // repaint with mount/unmount logic
  const repaint = useCallback(() => {
    const box = boxRef.current;
    if (!enable || !box) {
      if (overlayVisibleRef.current) { overlayVisibleRef.current = false; setOverlayMounted(false); }
      return;
    }

    const viA = getVisualIndexForBase(box.sr);
    const viB = getVisualIndexForBase(box.er);
    if (viA < 0 || viB < 0) {
      if (overlayVisibleRef.current) { overlayVisibleRef.current = false; setOverlayMounted(false); }
      return;
    }

    const v0 = Math.min(viA, viB);
    const v1 = Math.max(viA, viB);

    const visStart = enablePagination ? pageStart : 0;
    const visEnd   = enablePagination ? pageEnd   : totalCount;

    if (v1 < visStart || v0 >= visEnd) {
      if (overlayVisibleRef.current) { overlayVisibleRef.current = false; setOverlayMounted(false); }
      return;
    }

    const topVi = Math.max(v0, visStart);
    const botVi = Math.min(v1, visEnd - 1);

    const rowTop = (topVi - visStart) * rowHeight - (bodyScrollTopRef.current || 0);
    const rowBot = (botVi - visStart + 1) * rowHeight - (bodyScrollTopRef.current || 0);

    if (rowBot <= 0 || rowTop >= bodyHeight) {
      if (overlayVisibleRef.current) { overlayVisibleRef.current = false; setOverlayMounted(false); }
      return;
    }

    const leftPx =
      getColLeft(Math.min(box.sc, box.ec)) - (bodyScrollLeftRef.current || 0) + frozenLeftPx;
    const rightPx =
      getColRight(Math.max(box.sc, box.ec)) - (bodyScrollLeftRef.current || 0) + frozenLeftPx;

    const minLeft = frozenLeftPx;
    const maxRight = frozenLeftPx + (gridOuterRef.current?.clientWidth ?? headerMainWidth);

    const leftClamped = Math.max(leftPx, minLeft);
    const rightClamped = Math.min(rightPx, maxRight);

    if (rightClamped <= leftClamped) {
      if (overlayVisibleRef.current) { overlayVisibleRef.current = false; setOverlayMounted(false); }
      return;
    }

    // mount if needed, then style
    if (!overlayVisibleRef.current) {
      overlayVisibleRef.current = true;
      setOverlayMounted(true);
      requestAnimationFrame(() => repaint());
      return;
    }

    const el = overlayRef.current;
    if (!el) return;

    const yTop = rowTop;
    const height = rowBot - rowTop;

    el.style.transform = `translate(${Math.round(leftClamped)}px, ${Math.round(yTop)}px)`;
    el.style.width = `${Math.round(rightClamped - leftClamped)}px`;
    el.style.height = `${Math.round(height)}px`;
  }, [
    enable,
    getVisualIndexForBase,
    enablePagination,
    pageStart,
    pageEnd,
    totalCount,
    rowHeight,
    bodyHeight,
    headerMainWidth,
    frozenLeftPx,
    gridOuterRef,
    bodyScrollTopRef,
    bodyScrollLeftRef,
  ]);

  const recomputeOverlay = useCallback(() => repaint(), [repaint]);

  // Drag state
  const draggingRef = useRef(false);
  const dragAnchorRef = useRef<{ bi: number; col: number } | null>(null);
  const resizingRef = useRef<null | { edge: string; start: NonNullable<CellRange> }>(null);
  const lastEndRef = useRef<{ bi: number; col: number } | null>(null);

  // threshold helpers (40%) — used only on EXPAND during resize
  const thresholdColPass = (targetCol: number, pointerX: number) => {
    const last = lastEndRef.current;
    if (!last) return true;
    const curr = last.col;
    if (targetCol === curr) return true;
    if (Math.abs(targetCol - curr) > 1) return true;
    const left = getColLeft(targetCol);
    const right = getColRight(targetCol);
    const w = right - left;
    return targetCol > curr
      ? pointerX > left + 0.4 * w
      : pointerX < right - 0.4 * w;
  };

  const thresholdRowPass = (targetBi: number, pointerY: number) => {
    const last = lastEndRef.current;
    if (!last) return true;
    const currVi = getVisualIndexForBase(last.bi);
    const targetVi = getVisualIndexForBase(targetBi);
    if (currVi < 0 || targetVi < 0) return true;
    if (targetVi === currVi) return true;
    if (Math.abs(targetVi - currVi) > 1) return true;
    const yInRow = pointerY % rowHeight;
    return targetVi > currVi ? yInRow > 0.4 * rowHeight : yInRow < 0.6 * rowHeight;
  };

  const commit = (sr: number, sc: number, er: number, ec: number) => {
    const a = Math.min(sr, er), b = Math.max(sr, er);
    const c = Math.min(sc, ec), d = Math.max(sc, ec);
    boxRef.current = { sr: a, sc: c, er: b, ec: d };
    lastEndRef.current = { bi: b, col: d };
    emit({ sr: a, sc: c, er: b, ec: d });
    recomputeOverlay();
  };

  // style tweaks: selection drag vs resize
  const setDraggingVisual = (kind: "select" | "resize" | "none") => {
    const el = overlayRef.current;
    if (!el) return;
    if (kind === "none") {
      el.style.boxShadow = "none";
      el.style.background = "transparent";
      el.style.borderWidth = "2px";
      return;
    }
    if (kind === "select") {
      el.style.boxShadow = "0 0 0 1px #2b6fff, inset 0 0 0 1px #2b6fff";
      el.style.background = "rgba(43,111,255,0.06)";
      el.style.borderWidth = "2px";
      return;
    }
    // resize
    el.style.boxShadow = "0 0 0 1px #2b6fff, inset 0 0 0 1px #2b6fff";
    el.style.background = "rgba(43,111,255,0.06)";
    el.style.borderWidth = "3px"; // thicker only while resizing
  };

  // selection drag (click + drag anywhere in body)
  const onMouseMoveSelect = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current || !dragAnchorRef.current) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;

      const a = dragAnchorRef.current;
      let targetBi = hit.bi;
      let targetCol = hit.col;

      // keep thresholds during selection drag (for smoothness)
      if (!thresholdColPass(targetCol, hit.x)) targetCol = lastEndRef.current?.col ?? targetCol;
      if (!thresholdRowPass(targetBi, hit.y)) targetBi = lastEndRef.current?.bi ?? targetBi;

      commit(a.bi, a.col, targetBi, targetCol);
    },
    [hitTest]
  );

  // Threshold when expanding selection across edges
  const thresholdColPassResize = (
    currCol: number,
    targetCol: number,
    pointerX: number,
    dir: "left" | "right"
  ) => {
    if (targetCol === currCol) return true;
    if (Math.abs(targetCol - currCol) > 1) return true; // jumps allow immediately
    const left = getColLeft(targetCol);
    const right = getColRight(targetCol);
    const w = right - left;
    // Require 40% penetration into target in direction of travel
    return dir === "right" ? pointerX > left + 0.4 * w : pointerX < right - 0.4 * w;
  };

  const thresholdRowPassResize = (
    currVi: number,
    targetVi: number,
    pointerY: number,
    dir: "up" | "down"
  ) => {
    if (targetVi === currVi) return true;
    if (Math.abs(targetVi - currVi) > 1) return true; // jumps allow immediately
    const yInRow = pointerY % rowHeight;
    // Require 40% penetration into target in direction of travel
    return dir === "down" ? yInRow > 0.4 * rowHeight : yInRow < 0.6 * rowHeight;
  };

  // resizing (threshold ONLY when expanding; shrinking uses raw boundaries)
  const onMouseMoveResize = useCallback(
    (e: MouseEvent) => {
      const info = resizingRef.current;
      if (!info || !info.start) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;

      const s = { ...info.start };
      let { sr, sc, er, ec } = s;

      const expandUp    = (bi: number) => bi < s.sr;
      const expandDown  = (bi: number) => bi > s.er;
      const expandLeft  = (col: number) => col < s.sc;
      const expandRight = (col: number) => col > s.ec;

      let nextSr = sr, nextEr = er, nextSc = sc, nextEc = ec;

      // Current visual positions (for threshold math)
      const currTopVi = getVisualIndexForBase(sr);
      const currBotVi = getVisualIndexForBase(er);

      // ----- vertical edges -----
      if (info.edge.includes("n")) {
        if (expandUp(hit.bi)) {
          const targetVi = getVisualIndexForBase(hit.bi);
          if (thresholdRowPassResize(currTopVi, targetVi, hit.y, "up")) {
            nextSr = Math.min(hit.bi, er);
          }
        } else {
          // shrinking uses raw boundary (no threshold)
          nextSr = Math.min(hit.bi, er);
        }
      }
      if (info.edge.includes("s")) {
        if (expandDown(hit.bi)) {
          const targetVi = getVisualIndexForBase(hit.bi);
          if (thresholdRowPassResize(currBotVi, targetVi, hit.y, "down")) {
            nextEr = Math.max(hit.bi, sr);
          }
        } else {
          nextEr = Math.max(hit.bi, sr);
        }
      }

      // ----- horizontal edges -----
      if (info.edge.includes("w")) {
        if (expandLeft(hit.col)) {
          if (thresholdColPassResize(sc, hit.col, hit.x, "left")) {
            nextSc = Math.min(hit.col, ec);
          }
        } else {
          nextSc = Math.min(hit.col, ec);
        }
      }
      if (info.edge.includes("e")) {
        if (expandRight(hit.col)) {
          if (thresholdColPassResize(ec, hit.col, hit.x, "right")) {
            nextEc = Math.max(hit.col, sc);
          }
        } else {
          nextEc = Math.max(hit.col, sc);
        }
      }

      commit(nextSr, nextSc, nextEr, nextEc);
    },
    [hitTest, getVisualIndexForBase]
  );


  const onMouseUpWin = useCallback(
    (_e: MouseEvent) => {
      draggingRef.current = false;
      dragAnchorRef.current = null;
      resizingRef.current = null;
      window.removeEventListener("mousemove", onMouseMoveSelect);
      window.removeEventListener("mousemove", onMouseMoveResize);
      setDraggingVisual("none");
    },
    [onMouseMoveResize, onMouseMoveSelect]
  );

  const onMouseDownBody = useCallback(
    (e: React.MouseEvent) => {
      if (!enable) return;

      const target = e.target as HTMLElement | null;

      // --- NEW: let native interactive controls behave normally
      const isInteractive = (el: HTMLElement | null) => {
        if (!el) return false;
        const tag = el.tagName?.toLowerCase();
        if (tag === "input" || tag === "select" || tag === "textarea" || tag === "button") return true;
        if ((el as any).isContentEditable) return true;
        // checkbox/radio in selection column marks itself with data-select-cell="1"
        if (el.closest?.('[data-select-cell="1"]')) return true;
        // respect <label> clicks too
        if (el.closest?.("label")) return true;
        return false;
      };
      if (isInteractive(target)) return; // <-- IMPORTANT: don't focus or preventDefault

      gridWrapperRef.current?.focus();

      const edge = (target?.dataset as any)?.edge as string | undefined;
      if (edge && boxRef.current) {
        // start resize
        resizingRef.current = { edge, start: { ...boxRef.current } as NonNullable<CellRange> };
        lastEndRef.current = { bi: boxRef.current.er, col: boxRef.current.ec };
        setDraggingVisual("resize");
        window.addEventListener("mousemove", onMouseMoveResize);
        window.addEventListener("mouseup", onMouseUpWin, { once: true });
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;

      draggingRef.current = true;
      dragAnchorRef.current = { bi: hit.bi, col: hit.col };
      lastEndRef.current = { bi: hit.bi, col: hit.col };
      onActiveRowChange?.(hit.bi); // mouse click still updates active row
      commit(hit.bi, hit.col, hit.bi, hit.col);
      setDraggingVisual("select");
      window.addEventListener("mousemove", onMouseMoveSelect);
      window.addEventListener("mouseup", onMouseUpWin, { once: true });
      e.preventDefault();
    },
    [enable, gridWrapperRef, hitTest, onMouseMoveResize, onMouseMoveSelect, onMouseUpWin, onActiveRowChange]
  );

  // Copy selected (TSV)
  const copySel = useCallback(async () => {
    const box = boxRef.current;
    if (!box) return;
    const lines: string[] = [];
    for (let bi = box.sr; bi <= box.er; bi++) {
      const r = rows[bi];
      const vals: string[] = [];
      for (let c = box.sc; c <= box.ec; c++) {
        const col = leafCols[c];
        const v = r ? col.accessorFn(r, bi) : null;
        vals.push(v == null ? "" : String(v));
      }
      lines.push(vals.join("\t"));
    }
    const tsv = lines.join("\n");
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = tsv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, [rows, leafCols]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCopy = (e.key === "c" || e.key === "C") && (e.metaKey || e.ctrlKey);
      if (isCopy && boxRef.current) {
        e.preventDefault();
        copySel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copySel]);

  // Paste TSV into the CURRENT selection area ONLY (clamp to selection size)
  const onPasteBody = useCallback(
    (e: React.ClipboardEvent) => {
      if (!enable) return;
      const box = boxRef.current;
      if (!box) return;
      const text = e.clipboardData.getData("text/plain");
      if (!text) return;
      e.preventDefault();

      const rowsStr = text.replace(/\r/g, "").split("\n");
      const matrix: string[][] = rowsStr.map((line) => line.split("\t"));

      // compute target area (selection size)
      const targetRows = Math.max(1, Math.abs(box.er - box.sr) + 1);
      const targetCols = Math.max(1, Math.abs(box.ec - box.sc) + 1);

      const rMax = Math.min(matrix.length, targetRows);
      const cMax = Math.min(Math.max(...matrix.map(r => r.length)), targetCols);

      const overlay = editOverlayRef.current;

      for (let r = 0; r < rMax; r++) {
        const bi = box.sr + r;
        if (bi < 0 || bi >= rows.length) break;
        const patch: Record<string, any> = {};
        const rowArr = matrix[r] ?? [];
        for (let c = 0; c < cMax; c++) {
          const colIdx = box.sc + c;
          if (colIdx < 0 || colIdx >= leafCols.length) break;
          const colId = leafCols[colIdx].id;
          patch[colId] = rowArr[c] ?? "";
        }
        const prev = overlay.get(bi) || {};
        overlay.set(bi, { ...prev, ...patch });
      }
      flushOverlayToState();
    },
    [enable, rows.length, leafCols.length, editOverlayRef, flushOverlayToState]
  );

  // --- ensureCellVisible with this smoother version ---
  const ensureCellVisible = useCallback(
    (bi: number, col: number, pad = 12) => {
      const outer = gridOuterRef.current;
      if (!outer) return;

      // Compute vertical target
      let nextTop: number | null = null;
      {
        const vi = getVisualIndexForBase(bi);
        if (vi >= 0) {
          const visStart = enablePagination ? pageStart : 0;
          const cellTop = (vi - visStart) * rowHeight;
          const viewTop = outer.scrollTop;
          const viewBot = viewTop + bodyHeight;
          const wantTop = cellTop - pad;
          const wantBot = cellTop + rowHeight + pad;

          if (wantTop < viewTop) nextTop = Math.max(0, wantTop);
          else if (wantBot > viewBot) nextTop = wantBot - bodyHeight;
        }
      }

      // Compute horizontal target (using prefix sums)
      let nextLeft: number | null = null;
      {
        const viewW = (gridOuterRef.current?.clientWidth ?? headerMainWidth);
        const left = getColLeft(col);
        const right = getColRight(col);
        const viewLeft = outer.scrollLeft;
        const viewRight = viewLeft + viewW;
        const wantLeft = left - pad;
        const wantRight = right + pad;

        if (wantLeft < viewLeft) nextLeft = Math.max(0, wantLeft);
        else if (wantRight > viewRight) nextLeft = wantRight - viewW;
      }

      // Smooth scroll if needed (fallback to instant if unsupported)
      if (nextTop !== null || nextLeft !== null) {
        const top  = nextTop  ?? outer.scrollTop;
        const left = nextLeft ?? outer.scrollLeft;
        try {
          outer.scrollTo({ top, left, behavior: "smooth" });
        } catch {
          // Older browsers: one-shot set (still fine)
          outer.scrollTop = top;
          outer.scrollLeft = left;
        }
      }
    },
    [
      gridOuterRef,
      getVisualIndexForBase,
      getColLeft,
      getColRight,
      enablePagination,
      pageStart,
      rowHeight,
      bodyHeight,
      headerMainWidth,
    ]
  );

  // Keyboard arrows — move selection only; DO NOT change active row here
  const onKeyDownBody = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enable) return;
      const key = e.key as string;

      // Enter sets ACTIVE ROW...
      if (key === "Enter") {
        const box = boxRef.current;
        if (box) {
          const anchorRow = Math.min(box.sr, box.er);
          onActiveRowChange?.(anchorRow);
          e.preventDefault();
        }
        return;
      }

      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) return;

      let anchor: { r: number; c: number };
      const box = boxRef.current;
      if (box) anchor = { r: Math.min(box.sr, box.er), c: Math.min(box.sc, box.ec) };
      else anchor = { r: baseIndexForVisual(0), c: 0 };

      let dr = 0, dc = 0;
      if (key === "ArrowUp") dr = -1;
      if (key === "ArrowDown") dr = 1;
      if (key === "ArrowLeft") dc = -1;
      if (key === "ArrowRight") dc = 1;

      const nr = Math.max(0, Math.min(totalCount - 1, anchor.r + dr));
      const nc = Math.max(0, Math.min(leafCols.length - 1, anchor.c + dc));

      boxRef.current = { sr: nr, sc: nc, er: nr, ec: nc };
      lastEndRef.current = { bi: nr, col: nc };
      emit({ sr: nr, sc: nc, er: nr, ec: nc });
      recomputeOverlay();

      // --- NEW: auto-scroll to keep the moved-to cell visible
      ensureCellVisible(nr, nc);
      // --- END NEW

      e.preventDefault();
    },
    [
      enable,
      baseIndexForVisual,
      totalCount,
      leafCols.length,
      emit,
      recomputeOverlay,
      onActiveRowChange,
      ensureCellVisible,
    ]
  );

  // Overlay handles (8)
  const handles = ["n", "s", "w", "e", "nw", "ne", "sw", "se"].map((edge) => {
    const base: CSSProperties = {
      position: "absolute",
      pointerEvents: "auto",
      background: "transparent",
    };
    const style: CSSProperties =
      edge === "n"  ? { ...base, top: -3, left: 0,  width: "100%", height: 8,  cursor: "ns-resize" } :
      edge === "s"  ? { ...base, bottom: -3, left: 0, width: "100%", height: 8,  cursor: "ns-resize" } :
      edge === "w"  ? { ...base, left: -3, top: 0,   width: 8,      height: "100%", cursor: "ew-resize" } :
      edge === "e"  ? { ...base, right: -3, top: 0,  width: 8,      height: "100%", cursor: "ew-resize" } :
      edge === "nw" ? { ...base, top: -5, left: -5,  width: 10,     height: 10,     cursor: "nwse-resize" } :
      edge === "ne" ? { ...base, top: -5, right: -5, width: 10,     height: 10,     cursor: "nwse-resize" } :
      edge === "sw" ? { ...base, bottom: -5, left: -5,  width: 10,  height: 10,     cursor: "nesw-resize" } :
                      { ...base, bottom: -5, right: -5, width: 10,  height: 10,     cursor: "nwse-resize" };

    return (
      <div
        key={edge}
        data-edge={edge}
        style={style}
        onMouseDown={(e) => {
          if (!boxRef.current) return;
          e.preventDefault();
          e.stopPropagation();
          resizingRef.current = { edge, start: { ...boxRef.current } as NonNullable<CellRange> };
          lastEndRef.current = { bi: boxRef.current.er, col: boxRef.current.ec };
          setDraggingVisual("resize");
          window.addEventListener("mousemove", onMouseMoveResize);
          window.addEventListener("mouseup", onMouseUpWin, { once: true });
        }}
      />
    );
  });

  // ensure repaint when asked
  useEffect(() => {
    recomputeOverlay();
  }, [recomputeOverlay]);

  return {
    overlayRef,
    overlayMounted,
    onMouseDownBody,
    onPasteBody,
    onKeyDownBody,
    recomputeOverlay,
    overlayHandles: handles,
  };
}
