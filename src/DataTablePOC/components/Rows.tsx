import React from "react";
import { TableRowsContainer, TableRow, TableCell, CollapseIcon, CellContent, ResizeHandle, VerticalLine } from '../styled';
import { useDoubleClick, getDeepValue, highlightText } from "../utils"
import { ColumnSettings } from "../interfaces";

interface IProps {
  visibleRows: any[];
  rowKey: string;
  activeRow: string | null;
  selectable: boolean;
  columns: ColumnSettings[];
  search: string;
  showLineAtIndex: number | null;
  collapsibleRowHeight?: string;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  setActiveRow: React.Dispatch<React.SetStateAction<string | null>>;
  onMouseDown: (columnIndex: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
export default (props: IProps) => {
  const { visibleRows, rowKey, activeRow, selectable, columns, search, showLineAtIndex, collapsibleRowHeight, selectedRows, setSelectedRows, onRowClick, onRowDoubleClick, collapsibleRowRender, setActiveRow, onMouseDown } = props;
  const [collapsedRows, setCollapsedRows] = React.useState<Array<string>>([]);

  const handleRowSingleClick = React.useCallback((row: any) => {
    onRowClick?.(row);
    setActiveRow((prev) => (prev === row[rowKey] ? null : row[rowKey]));
  }, [onRowClick]);

  const handleRowDoubleClick = React.useCallback((row: any) => {
    onRowDoubleClick?.(row);
  }, [onRowDoubleClick]);

  const handleRowClick = React.useCallback((row: any) => {
    const singleClickAction = () => {
      handleRowSingleClick(row);
    };
    const doubleClickAction = () => {
      handleRowDoubleClick(row);
    };
    return useDoubleClick(singleClickAction, doubleClickAction);
  }, [handleRowSingleClick, handleRowDoubleClick]);

  const toggleRowCollapse = React.useCallback((id: string) => {
    setCollapsedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const toggleRowSelection = React.useCallback((id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

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
              style={{
                backgroundColor: isActiveRow ? 'lightblue' : isSelectedRow ? '#ddd' : 'white', // Set the background color based on whether the row is active.
                border: isSelectedRow ? '1px solid black' : undefined, // Set the border if the row is selected.
              }}
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