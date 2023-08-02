import React from "react";
import { TableRow, TableCell, CellContent, ResizeHandle, VerticalLine, DragHandle } from "../styled";
import { SET_SELECTED_ROWS, SET_COLUMNS } from "../context/actions";
import { DataTableContext } from "../index";

export default () => {
  const {
    rowKey,
    selectable,
    visibleRows,
    showLineAtIndex,
    state: { selectedRows, columns  },
    setState,
    onMouseDown,
    onDragStart,
    onDragOver,
    onDrop,
    collapsibleRowRender,
    onColumnSettingsChange
  } = React.useContext(DataTableContext);

  let frozenWidth = 0;

  const selectAllRows = React.useCallback(() => {
    setState({ type: SET_SELECTED_ROWS, payload: visibleRows.map(row => row[rowKey]) });
  }, [visibleRows, setState]);

  const deselectAllRows = React.useCallback(() => {
    setState({ type: SET_SELECTED_ROWS, payload: [] });
  }, [setState]);

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
                  setState({ type: SET_COLUMNS, payload: newColumns });
                  onColumnSettingsChange?.(newColumns);
                }}
              >
                📌
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  let newSortDirection: 'asc' | 'desc' | undefined;  // Change here
                  if (!col.sorted) {  // Change here
                    newSortDirection = 'asc';
                  } else if (col.sorted === 'asc') {
                    newSortDirection = 'desc';
                  } else {
                    newSortDirection = undefined;  // Change here
                  }

                  const newColumns = [...columns];
                  newColumns[index] = {
                    ...newColumns[index],
                  };

                  // Change here: conditionally add the sorted field
                  if (newSortDirection) {
                    newColumns[index].sorted = newSortDirection;
                  } else {
                    delete newColumns[index].sorted;
                  }

                  setState({ type: SET_COLUMNS, payload: newColumns });
                  onColumnSettingsChange?.(newColumns);
                }}
              >
                {(!col.sorted) && '⬆️⬇️'}
                {col.sorted === 'asc' && '⬆️'}
                {col.sorted === 'desc' && '⬇️'}
              </div>


            </div>
            <ResizeHandle onMouseDown={onMouseDown(index)} />
          </TableCell>
        );
      })}
    </TableRow>
  )
}