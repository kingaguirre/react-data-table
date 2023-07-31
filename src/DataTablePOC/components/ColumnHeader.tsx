import React from "react";
import { TableRow, TableCell, CellContent, ResizeHandle, VerticalLine, DragHandle } from "../styled";
import { ColumnSettings } from "../interfaces";

interface IProps {
  visibleRows: any[];
  selectable: boolean;
  rowKey: string;
  columns: ColumnSettings[];
  showLineAtIndex: number | null;
  selectedRows: string[];
  setSelectedRows: React.Dispatch<React.SetStateAction<string[]>>
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  onMouseDown: (columnIndex: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  setColumns: React.Dispatch<React.SetStateAction<ColumnSettings[]>>;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
}

export default (props: IProps) => {
  const { visibleRows, selectable, rowKey, columns, showLineAtIndex, selectedRows, setSelectedRows, collapsibleRowRender, onMouseDown, onDragStart, onDragOver, onDrop, setColumns, onColumnSettingsChange } = props;
  let frozenWidth = 0;

  const selectAllRows = React.useCallback(() => {
    setSelectedRows(visibleRows.map(row => row[rowKey]));
  }, [visibleRows]);

  const deselectAllRows = React.useCallback(() => {
    setSelectedRows([]);
  }, []);

  return (
    <TableRow>
      {collapsibleRowRender && <TableCell width="42px" />}
      {selectable && (
        <TableCell width="38px">
          <input
            type="checkbox"
            checked={!!visibleRows.length && selectedRows.length === visibleRows.length}
            onChange={(e) => e.target.checked ? selectAllRows() : deselectAllRows()}
          />
        </TableCell>
      )}
      {columns.map((col, index) => {
        if (col.hide) return null;
        const isFrozen = col.freeze;
        if (isFrozen) {
          frozenWidth += parseInt(col.width || "", 10);
        }
        return (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            align={col.align}
            style={isFrozen ? { position: "sticky", left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: "#fff" } : {}}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <DragHandle
                draggable={true}
                onDragStart={(e: any) => onDragStart(e, index)}
              >
                ☰
              </DragHandle>
              <CellContent>{col.title}</CellContent>
              {showLineAtIndex === index && <VerticalLine />}
              <div
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering other click events
                  // Create a copy of columns and modify the freeze value of the current column
                  const newColumns = [...columns];
                  newColumns[index] = {
                    ...newColumns[index],
                    freeze: !newColumns[index].freeze,
                  };
                  // Update the state and call onColumnSettingsChange if provided
                  setColumns(newColumns);
                  onColumnSettingsChange?.(newColumns);
                }}
              >
                📌
              </div>
            </div>
            <ResizeHandle onMouseDown={onMouseDown(index)} />
          </TableCell>
        );
      })}
    </TableRow>
  )
}