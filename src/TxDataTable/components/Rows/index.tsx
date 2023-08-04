import React from "react";
import { useDoubleClick, getDeepValue, highlightText } from "../../utils"
import { SET_ACTIVE_ROW, SET_SELECTED_ROWS } from "../../context/actions";
import { DataTableContext } from "../../index";
import SelectCheckboxColumn from "../SelectCheckboxColumn";
import CollapsibleRowColumn from "../CollapsibleRowColumn";
import * as SC from "./styled";

export default () => {
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
    collapsibleRowRender
  } = React.useContext(DataTableContext);

  const [collapsedRows, setCollapsedRows] = React.useState<string[]>([]);

  const handleRowSingleClick = React.useCallback((row: any) => {
    onRowClick?.(row);
    setState({ type: SET_ACTIVE_ROW, payload: activeRow === row[rowKey] ? null : row[rowKey] })
  }, [onRowClick, activeRow]);

  const handleRowDoubleClick = React.useCallback((row: any) => {
    onRowDoubleClick?.(row);
  }, [onRowDoubleClick]);

  const handleRowClick = useDoubleClick(
    (row) => handleRowSingleClick(row),
    (row) => handleRowDoubleClick(row),
  );

  const toggleRowCollapse = React.useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, []);

  const toggleRowSelection = React.useCallback((id: string) => {
    const payload = selectedRows.includes(id) ? selectedRows.filter((rowId) => rowId !== id) : [...selectedRows, id];
    setState({ type: SET_SELECTED_ROWS, payload })
  }, [selectedRows]);

  /** Use fetchedData.data when fetchConfig is defined, otherwise use visibleRows */
  const rows = fetchConfig ? fetchedData.data : visibleRows;

  if (!Array.isArray(rows)) {
    console.error("The 'rows' prop is not an array.");
    return null; // TODO: You can return a fallback UI or simply return null
  }

  return (
    <SC.TableRowsContainer>
      {rows.map((row, rowIndex) => {
        const isRowCollapsed = collapsedRows.includes(row[rowKey]);
        let frozenWidth = 0;
        const isActiveRow = row[rowKey] === activeRow;
        const isSelectedRow = selectedRows.includes(row[rowKey]);
        return (
          <React.Fragment key={rowIndex}>
            <SC.TableRow
              onClick={() => handleRowClick(row)}
              className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''}`}
            >
              <CollapsibleRowColumn
                onClick={() => toggleRowCollapse(row[rowKey])}
                isRowCollapsed={isRowCollapsed}
              />
              <SelectCheckboxColumn
                checked={selectedRows.includes(row[rowKey])}
                onChange={() => toggleRowSelection(row[rowKey])}
              />
              {columns.map((col, index) => {
                if (col.hide) return null;
                const isFrozen = col.freeze;
                if (isFrozen) {
                  frozenWidth += parseInt(col.width || "", 10);
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
                    isFrozen={isFrozen}
                    style={isFrozen ? { left: `${frozenWidth - parseInt(col.width || "", 10)}px` } : {}}
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
              <SC.TableRow style={{ height: collapsibleRowHeight }}>
                <SC.TableCell>
                  {collapsibleRowRender(row)}
                </SC.TableCell>
              </SC.TableRow>
            )}
          </React.Fragment>
        )
      })}
    </SC.TableRowsContainer>
  )
}