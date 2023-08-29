import React, { useContext, useState, useCallback, Fragment } from "react";
import { getDeepValue, getPinnedDetails } from "../../utils"
import { SET_SELECTED_ROWS, SET_ACTIVE_ROW } from "../../context/actions";
import { DataTableContext } from "../../index";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";

export const Rows = () => {
  const {
    rowKey,
    visibleRows,
    clickableRow,
    collapsibleRowHeight,
    selectable,
    state: { selectedRows, activeRow, columns },
    setState,
    onRowClick,
    collapsibleRowRender,
    onSelectedRowsChange
  } = useContext(DataTableContext);

  const [collapsedRows, setCollapsedRows] = useState<string[]>([]);

  const handleRowClick = useCallback((row: any) => {
    onRowClick?.(row);
    setState({ type: SET_ACTIVE_ROW, payload: activeRow === row[rowKey] ? null : row[rowKey] });
  }, [onRowClick, activeRow]);

  const toggleRowCollapse = useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, [collapsibleRowHeight]);

  const toggleRowSelection = useCallback((row: any) => {
    const normalizeSelectedRows = (rows: any[]) =>
      rows.map((r) => (typeof r === 'string' ? { [rowKey]: r } : r));
  
    const normalizedSelectedRows = normalizeSelectedRows(selectedRows);
  
    const isSelectedRow = normalizedSelectedRows.find(
      (r) => r[rowKey] === row[rowKey]
    );
  
    const payload = isSelectedRow
      ? normalizedSelectedRows.filter((r) => r[rowKey] !== row[rowKey])
      : [...normalizedSelectedRows, row];
  
    onSelectedRowsChange?.(payload);
    setState({ type: SET_SELECTED_ROWS, payload });
  }, [selectedRows]);

  /** Placeholder for loading */
  if (visibleRows === undefined) {
    return <SC.LoadingPanel>Loading the data...</SC.LoadingPanel>;
  }

  /** Placeholder for no data */
  if (!visibleRows || visibleRows.length === 0 || !Array.isArray(visibleRows) && visibleRows !== undefined) {
    return <SC.LoadingPanel>No data available.</SC.LoadingPanel>;
  }

  return (
    <SC.TableRowsContainer>
      {visibleRows.map((row, rowIndex) => {
        const rowKeyValue = row[rowKey];
        let pinnedWidth = 0 + (!!collapsibleRowRender ? 90 : 0) + (!!selectable ? 90 : 0);
        const isRowCollapsed = collapsedRows.includes(rowKeyValue);
        const isActiveRow = rowKeyValue === activeRow;
        const isSelectedRow = !!selectedRows.find(row => row[rowKey] === rowKeyValue) || !!selectedRows.includes(rowKeyValue);
        return (
          <Fragment key={rowIndex}>
            <SC.TableRow
              {...(!!clickableRow ? {
                onClick: () => handleRowClick?.(row)
              } : {})}
              className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''}`}
            >
              <CollapsibleRowColumn
                onClick={() => toggleRowCollapse(rowKeyValue)}
                isRowCollapsed={isRowCollapsed}
              />
              <SelectCheckboxColumn
                checked={isSelectedRow}
                onChange={() => toggleRowSelection(row)}
              />
              {columns.map((col, index) => {
                if (col.hidden) return null;

                const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

                if (isPinned) {
                  pinnedWidth += colWidth;
                }

                const rowValue = getDeepValue(row, col.column);
                let cellContent = col.columnCustomRenderer
                  ? col.columnCustomRenderer(row[col.column], row)
                  : typeof rowValue === "object" ? JSON.stringify(rowValue) : rowValue;

                return (
                  <SC.TableCell
                    key={index}
                    width={col.width}
                    minWidth={col.minWidth}
                    align={col.align}
                    isPinned={isPinned}
                    style={pinnedStyle}
                  >
                    <SC.CellContent
                      className="cell-content"
                      style={{ maxWidth: col.width }}
                    >
                      {cellContent}
                    </SC.CellContent>
                  </SC.TableCell>
                );
              })}
            </SC.TableRow>
            {isRowCollapsed && collapsibleRowRender && (
              <SC.TableRow style={{ height: collapsibleRowHeight }}>
                <SC.CollapsibleRowRenderContainer>
                  {collapsibleRowRender(row)}
                </SC.CollapsibleRowRenderContainer>
              </SC.TableRow>
            )}
          </Fragment>
        )
      })}
    </SC.TableRowsContainer>
  )
}
