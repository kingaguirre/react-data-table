import React from "react";
import { TableRow, TableCell, CellContent, ResizeHandle, VerticalLine } from "../../styled";
import { SET_SELECTED_ROWS, SET_COLUMNS } from "../../context/actions";
import { DataTableContext } from "../../index";
import SelectCheckboxColumn from "../SelectCheckboxColumn";
import CollapsibleRowColumn from "../CollapsibleRowColumn";
import * as SC from './styled'

export default () => {
  const {
    rowKey,
    visibleRows,
    showLineAtIndex,
    state: { selectedRows, columns  },
    setState,
    onMouseDown,
    onDragStart,
    onDragOver,
    onDrop,
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
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn
        checked={!!visibleRows.length && selectedRows.length === visibleRows.length}
        onChange={(e) => e.target.checked ? selectAllRows() : deselectAllRows()}
      />
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
            <SC.TitleWrapper>
              <SC.TitleContainer
                draggable={true}
                onDragStart={(e: any) => onDragStart(e, index)}
              >
                <CellContent>{col.title}</CellContent>
              </SC.TitleContainer>
              
              <SC.TitleControlsContainer>
                <div
                  onClick={(e) => {
                     // Prevent triggering other click events
                    e.stopPropagation();
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
                  <i className="fa fa-thumb-tack"/>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    let newSortDirection: 'asc' | 'desc' | undefined;
                    if (!col.sorted) {
                      newSortDirection = 'asc';
                    } else if (col.sorted === 'asc') {
                      newSortDirection = 'desc';
                    } else {
                      newSortDirection = undefined;
                    }

                    const newColumns = [...columns];
                    newColumns[index] = {
                      ...newColumns[index],
                    };

                    if (newSortDirection) {
                      newColumns[index].sorted = newSortDirection;
                    } else {
                      delete newColumns[index].sorted;
                    }

                    setState({ type: SET_COLUMNS, payload: newColumns });
                    onColumnSettingsChange?.(newColumns);
                  }}
                >
                  <i className={`fa fa-${!col.sorted ? 'sort' : col.sorted === 'asc' ? 'sort-up' : 'sort-down'}`}/>
                </div>
              </SC.TitleControlsContainer>

              {showLineAtIndex === index && <VerticalLine />}
            </SC.TitleWrapper>
            <ResizeHandle onMouseDown={onMouseDown(index)} />
          </TableCell>
        );
      })}
    </TableRow>
  )
}