import React from "react";
import { TableRowsContainer, TableRow, TableCell, CollapseIcon, CellContent, ResizeHandle, VerticalLine } from '../styled';
import { useDoubleClick, getDeepValue, highlightText } from "../utils"
import { SET_ACTIVE_ROW, SET_SELECTED_ROWS } from "../context/actions";
import { DataTableContext } from "../index";

export default () => {
  const {
    rowKey,
    selectable,
    visibleRows,
    showLineAtIndex,
    collapsibleRowHeight,
    state: { selectedRows, activeRow, columns, search },
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

  return (
    <TableRowsContainer>
      {visibleRows.map((row, rowIndex) => {
        const isRowCollapsed = collapsedRows.includes(row[rowKey]);
        let frozenWidth = 0;
        const isActiveRow = row[rowKey] === activeRow;
        const isSelectedRow = selectedRows.includes(row[rowKey]);
        return (
          <React.Fragment key={rowIndex}>
            <TableRow
              onClick={() => handleRowClick(row)}
              className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''}`}
            >
              {collapsibleRowRender && (
                <TableCell onClick={() => toggleRowCollapse(row[rowKey])}>
                  <CollapseIcon>{isRowCollapsed ? '-' : '+'}</CollapseIcon>
                </TableCell>
              )}
              {selectable && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row[rowKey])}
                    onChange={() => toggleRowSelection(row[rowKey])}
                  />
                </TableCell>
              )}
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
                  <TableCell
                    key={index}
                    width={col.width}
                    minWidth={col.minWidth}
                    align={col.align}
                    style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: '#fff' } : {}}
                  >
                    <CellContent className="cell-content" style={{ maxWidth: col.width }}>{cellContent}</CellContent>
                    {showLineAtIndex === index && <VerticalLine />}
                    <ResizeHandle onMouseDown={onMouseDown(index)} />
                  </TableCell>
                );
              })}
            </TableRow>
            {isRowCollapsed && collapsibleRowRender && (
              <TableRow style={{ height: collapsibleRowHeight }}>
                <TableCell>
                  {collapsibleRowRender(row)}
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        )
      })}
    </TableRowsContainer>
  )
}