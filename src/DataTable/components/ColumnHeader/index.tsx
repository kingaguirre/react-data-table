import React from "react";
import { TableRow, TableCell, CellContent, ResizeHandle } from "../Rows/styled";
import { ColumnDragHighlighter } from "../Rows";
import { getPinnedDetails } from "../../utils";
import { SET_SELECTED_ROWS, SET_COLUMNS } from "../../context/actions";
import { DataTableContext } from "../../index";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from './styled'

export const ColumnHeader = () => {
  const {
    filteredData,
    dropTargetIndex,
    state: { selectedRows, columns, fetchedData },
    fetchConfig,
    setState,
    onMouseDown,
    onDragStart,
    onDragOver,
    onDrop,
    onColumnSettingsChange,
    onSelectedRowsChange,
    collapsibleRowRender,
    selectable,
    isSingleSelect
  } = React.useContext(DataTableContext);

  const rows = fetchConfig ? fetchedData.data : filteredData;
  let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);

  const selectAllRows = React.useCallback(() => {
    onSelectedRowsChange?.(rows);
    setState({ type: SET_SELECTED_ROWS, payload: rows });
  }, [rows, setState]);

  const deselectAllRows = React.useCallback(() => {
    onSelectedRowsChange?.([]);
    setState({ type: SET_SELECTED_ROWS, payload: [] });
  }, [setState]);

  return (
    <TableRow className="column-header-container">
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn
        {...(!isSingleSelect ? {
          checked: (!!rows && !!rows.length) && selectedRows.length === rows.length,
          onChange: (e) => e.target.checked ? selectAllRows() : deselectAllRows()
        } : {})}
      />
      {columns.map((col, index) => {
        if (col.hidden) return null;
        const showSortIcon = col.sorted !== 'none';
        const { showPinIcon, isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

        if (isPinned) {
          pinnedWidth += colWidth;
        }

        const isDraggable = col.draggable !== false;
        const hasControls = showPinIcon || showSortIcon;

        return (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            align={col.align}
            isPinned={isPinned}
            style={pinnedStyle}
            {...(isDraggable ? {
              onDragOver: (e) => onDragOver(e, index),
              onDrop: (e) => onDrop(e, index)
            } : {})}
          >
            <SC.TitleWrapper hasControls={hasControls} align={col.align}>
              {isDraggable ? (
                <SC.TitleContainer
                  hasControls={hasControls}
                  align={col.align}
                  {...(isDraggable ? {
                    isDraggedOver: index === dropTargetIndex,
                    draggable: true,
                    onDragStart: (e: any) => onDragStart(e, index)
                  } : {})}
                >
                  <CellContent>{col.title}</CellContent>
                </SC.TitleContainer>
              ) : <CellContent>{col.title}</CellContent>}

              {hasControls && (
                <SC.TitleControlsContainer>
                {showPinIcon && (
                  <SC.PinContainer
                    isPinned={isPinned}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newColumns = [...columns];
                      newColumns[index] = {
                        ...newColumns[index],
                        pinned: !newColumns[index].pinned,
                      };

                      setState({ type: SET_COLUMNS, payload: newColumns });
                      onColumnSettingsChange?.(newColumns);
                      localStorage.setItem('currentColumnSettings', JSON.stringify(newColumns));
                    }}
                  >
                    <i className="fa fa-thumb-tack"/>
                  </SC.PinContainer>
                )}

                {showSortIcon && (
                  <SC.SortContainer
                    onClick={(e) => {
                      e.stopPropagation();
                      const newColumns = columns.map((column, idx) => {
                        if (idx === index) {
                          return {
                            ...column,
                            sorted: !column.sorted ? 'asc' : column.sorted === 'asc' ? 'desc' : undefined,
                          };
                        }
                        return { ...column, sorted: undefined }; // Reset sorting for all other columns
                      });
                    
                      setState({ type: SET_COLUMNS, payload: newColumns });
                      onColumnSettingsChange?.(newColumns);
                      localStorage.setItem('currentColumnSettings', JSON.stringify(newColumns));
                    }}
                  >
                    <i className={`fa fa-${!col.sorted ? 'sort' : col.sorted === 'asc' ? 'sort-up' : 'sort-down'}`}/>
                  </SC.SortContainer>
                )}
              </SC.TitleControlsContainer>
              )}
            </SC.TitleWrapper>

            {isDraggable && (
              <>
                <ColumnDragHighlighter index={index}/>
                <ResizeHandle onMouseDown={onMouseDown(index)} />
              </>
            )}
          </TableCell>
        );
      })}
    </TableRow>
  )
}