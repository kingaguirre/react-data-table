import React, { CSSProperties, useCallback } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import type { GridRef } from "../interface";

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

type HeaderProps = {
  selectionEnabled: boolean;
  multiSelect: boolean;
  hasEligibleFiltered: boolean;
  allFiltered: boolean;
  anyFiltered: boolean;
  toggleFilteredAll: () => void;

  headerHeight: number;
  hasGroups: boolean;
  groupRowHeight: number;

  viewportWidth: number;
  SELECT_COL_W: number;

  overscanColumnCount: number;

  leafCols: Array<{ id: string; columnDef: any }>;
  colWidthAt: (index: number) => number;
  columnSettings: Array<{ column: string; title?: string; groupTitle?: string | null }>;

  headerRef: React.RefObject<GridRef | null>;
  groupHeaderRef: React.RefObject<GridRef | null>;
  selHeaderRef: React.RefObject<GridRef | null>;

  sortState: { id: string | null; desc: boolean };
  requestSort: (columnId: string) => void;
};

export function Header({
  selectionEnabled,
  multiSelect,
  hasEligibleFiltered,
  allFiltered,
  anyFiltered,
  toggleFilteredAll,

  headerHeight,
  hasGroups,
  groupRowHeight,

  viewportWidth,
  SELECT_COL_W,

  overscanColumnCount,

  leafCols,
  colWidthAt,
  columnSettings,

  headerRef,
  groupHeaderRef,
  selHeaderRef,

  sortState,
  requestSort,
}: HeaderProps) {
  const headerMainWidth = Math.max(0, viewportWidth - (selectionEnabled ? SELECT_COL_W : 0));

  const getHeaderHeight = useCallback(() => headerHeight, [headerHeight]);
  const getGroupHeight  = useCallback(() => groupRowHeight, [groupRowHeight]);
  const getSelectColW   = useCallback(() => SELECT_COL_W, [SELECT_COL_W]);

  // ---- Build group runs (contiguous columns with same groupTitle) ----
  const groupRuns = React.useMemo(() => {
    if (!hasGroups || columnSettings.length === 0) return [] as Array<{ start: number; end: number; title: string | null | undefined }>;
    const runs: Array<{ start: number; end: number; title: string | null | undefined }> = [];
    let start = 0;
    let curr = columnSettings[0]?.groupTitle ?? null;
    for (let i = 1; i < columnSettings.length; i++) {
      const g = columnSettings[i]?.groupTitle ?? null;
      if (g !== curr) {
        runs.push({ start, end: i - 1, title: curr });
        start = i;
        curr = g;
      }
    }
    runs.push({ start, end: columnSettings.length - 1, title: curr });
    return runs;
  }, [columnSettings, hasGroups]);

  // Width per group run (sum of leaf widths in the run)
  const groupWidths = React.useMemo(() => {
    if (!hasGroups) return [] as number[];
    return groupRuns.map(run => {
      let w = 0;
      for (let i = run.start; i <= run.end; i++) w += colWidthAt(i);
      return w;
    });
  }, [hasGroups, groupRuns, colWidthAt]);

  const groupColWidth = useCallback(
    (i: number) => groupWidths[i] ?? 0,
    [groupWidths]
  );

  const GroupHeaderCell = useCallback(
    ({ columnIndex, style }: { columnIndex: number; style: CSSProperties }) => {
      const run = groupRuns[columnIndex];
      if (!run) return <div style={style} />;
      return (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            padding: "0 8px",
            borderBottom: "1px solid #ddd",
            borderRight: "1px solid #eee",
            background: "#f1f1f1",
            boxSizing: "border-box",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={run.title ?? ""}
        >
          {run.title ?? ""}
        </div>
      );
    },
    [groupRuns]
  );

  const HeaderCell = useCallback(
    ({ columnIndex, style }: { columnIndex: number; style: CSSProperties }) => {
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
        <div
          style={s}
          onClick={() => requestSort(col.id)}
          title="Sort: none → asc → desc"
        >
          {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
          {caret}
        </div>
      );
    },
    [leafCols, sortState, requestSort]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* ---- Group header row (virtualized; one column per group run) ---- */}
      {hasGroups && (
        <div style={{ display: "flex" }}>
          {selectionEnabled && (
            <Grid
              ref={selHeaderRef as any}
              columnCount={1}
              columnWidth={getSelectColW}
              height={groupRowHeight}
              rowCount={1}
              rowHeight={getGroupHeight}
              width={SELECT_COL_W}
              outerElementType={HiddenScrollOuter as any}
            >
              {({ style }: any) => <div style={style} />}
            </Grid>
          )}

          <Grid
            ref={groupHeaderRef as any}
            outerElementType={HiddenScrollOuter as any}
            columnCount={groupRuns.length}
            columnWidth={groupColWidth}
            height={groupRowHeight}
            rowCount={1}
            rowHeight={getGroupHeight}
            width={headerMainWidth}
            overscanColumnCount={overscanColumnCount}
            overscanRowCount={1}
            itemKey={({ columnIndex }: any) => {
              const run = groupRuns[columnIndex];
              return `gh-${run?.start}-${run?.end}`;
            }}
          >
            {({ columnIndex, style }: any) => (
              <GroupHeaderCell columnIndex={columnIndex} style={style} />
            )}
          </Grid>
        </div>
      )}

      {/* ---- Leaf headers ---- */}
      <div style={{ display: "flex" }}>
        {selectionEnabled && (
          <Grid
            ref={selHeaderRef as any}
            columnCount={1}
            columnWidth={getSelectColW}
            height={headerHeight}
            rowCount={1}
            rowHeight={getHeaderHeight}
            width={SELECT_COL_W}
            outerElementType={HiddenScrollOuter as any}
          >
            {({ style }: any) => {
              const disabledHdr = !hasEligibleFiltered;
              return (
                <div
                  style={{
                    ...style,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "1px solid #ddd",
                    background: "#f7f7f7",
                    boxSizing: "border-box",
                    fontWeight: 600,
                  }}
                >
                  {multiSelect ? (
                    <input
                      type="checkbox"
                      disabled={disabledHdr}
                      checked={!disabledHdr && allFiltered}
                      ref={(el) => {
                        if (el) el.indeterminate = !disabledHdr && !allFiltered && anyFiltered;
                      }}
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
                  ) : null}
                </div>
              );
            }}
          </Grid>
        )}

        <Grid
          ref={headerRef as any}
          outerElementType={HiddenScrollOuter as any}
          columnCount={leafCols.length}
          columnWidth={colWidthAt}
          height={headerHeight}
          rowCount={1}
          rowHeight={getHeaderHeight}
          width={headerMainWidth}
          overscanColumnCount={overscanColumnCount}
          overscanRowCount={1}
          itemKey={({ columnIndex }: any) => `h-${leafCols[columnIndex]?.id ?? columnIndex}`}
        >
          {({ columnIndex, style }: any) => (
            <HeaderCell columnIndex={columnIndex} style={style} />
          )}
        </Grid>
      </div>
    </div>
  );
}
