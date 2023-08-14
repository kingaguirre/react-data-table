import React from "react";
import { useDoubleClick, getDeepValue, highlightText, getPinnedDetails } from "../../utils"
import { SET_ACTIVE_ROW, SET_SELECTED_ROWS } from "../../context/actions";
import { DataTableContext } from "../../index";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";

export const Rows = () => {
  const {
    rowKey,
    visibleRows,
    showLineAtIndex,
    collapsibleRowHeight,
    fetchConfig,
    state: { selectedRows, activeRow, columns, search, fetchedData },
    setState,
    onMouseDown,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onSelectedRowsChange
  } = React.useContext(DataTableContext);

  const collapsibleRowRefs = React.useRef<{ [key: string]: HTMLElement | null }>({});

  const [collapsedRows, setCollapsedRows] = React.useState<string[]>([]);

  const handleRowSingleClick = React.useCallback((row: any) => {
    onRowClick?.(row);
    setState({ type: SET_ACTIVE_ROW, payload: activeRow === row[rowKey] ? null : row[rowKey] });
  }, [onRowClick, activeRow]);

  const handleRowDoubleClick = React.useCallback((row: any) => {
    onRowDoubleClick?.(row);
    setState({ type: SET_ACTIVE_ROW, payload: activeRow === row[rowKey] ? null : row[rowKey] });
  }, [onRowDoubleClick, activeRow]);

  const handleRowClick = useDoubleClick(
    (row) => handleRowSingleClick(row),
    (row) => handleRowDoubleClick(row),
  );

  const toggleRowCollapse = React.useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, []);

  const toggleRowSelection = React.useCallback((row: any) => {
    const isSelectedRow = selectedRows.find(r => r[rowKey] === row[rowKey]);
    const payload = isSelectedRow ? selectedRows.filter((r) => r[rowKey] !== row[rowKey]) : [...selectedRows, row];
    onSelectedRowsChange?.(payload);
    setState({ type: SET_SELECTED_ROWS, payload });
  }, [selectedRows]);

  const getCollapsibleRowHeight = (rowKey: string) => {
    return collapsibleRowRefs.current[rowKey]?.offsetHeight || collapsibleRowHeight;
  };

  /** Use fetchedData.data when fetchConfig is defined, otherwise use visibleRows */
  const isFetching = fetchConfig && fetchedData.fetching;
  const rows = fetchConfig ? fetchedData.data : visibleRows;

  if (!Array.isArray(rows) && !isFetching && rows !== undefined) {
    console.error("The 'rows' prop is not an array.");
    return null; /** TODO: You can return a fallback UI or simply return null */
  }

  /** Placeholder for loading */
  if (isFetching && rows === undefined) {
    return <SC.LoadingPanel>Loading the data...</SC.LoadingPanel>;
  }

  /** Placeholder for no data */
  if (!rows || rows.length === 0) {
    return <SC.LoadingPanel>No data available.</SC.LoadingPanel>;
  }

  return (
    <SC.TableRowsContainer isFetching={isFetching}>
      {rows.map((row, rowIndex) => {
        const rowKeyValue = row[rowKey];
        let pinnedWidth = 0;
        const isRowCollapsed = collapsedRows.includes(rowKeyValue);
        const isActiveRow = rowKeyValue === activeRow;
        const isSelectedRow = !!selectedRows.find(row => row[rowKey] === rowKeyValue) || !!selectedRows.includes(rowKeyValue);
        return (
          <React.Fragment key={rowIndex}>
            <SC.TableRow
              onClick={() => handleRowClick(row)}
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

                let cellContent = col.customColumnRenderer
                  ? col.customColumnRenderer(row[col.column], row)
                  : getDeepValue(row, col.column);

                // If search text exists, highlight the text
                if (search) {
                  cellContent = highlightText(cellContent, search);
                }
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
                    {showLineAtIndex === index && <SC.VerticalLine />}
                    <SC.ResizeHandle onMouseDown={onMouseDown(index)} />
                  </SC.TableCell>
                );
              })}
            </SC.TableRow>
            {isRowCollapsed && collapsibleRowRender && (
              <SC.TableRow style={{ height: collapsibleRowHeight || getCollapsibleRowHeight(rowKeyValue) }}>
                <SC.CollapsibleRowRenderContainer ref={(el) => collapsibleRowRefs.current[rowKeyValue] = el}>
                  {collapsibleRowRender(row)}
                </SC.CollapsibleRowRenderContainer>
              </SC.TableRow>
            )}
          </React.Fragment>
        )
      })}
    </SC.TableRowsContainer>
  )
}