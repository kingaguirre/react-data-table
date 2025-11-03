import React, { useEffect } from "react";
import { TxCoreIcon } from "tradeport-web-components/dist/react";
import { TableCell, CellContent, ResizeHandle } from "../Rows/Cell/styled";
import { TableRow } from "../Rows/styled";
import { ColumnDragHighlighter } from "../Rows/Cell";
import { getPinnedDetails, filterRows } from "../../utils";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import { withState, IComponent } from '../../GlobalStateProvider';
import * as SC from "./styled"

export const ColumnHeader = withState({
  states: [
    'filteredData',
    'dropTargetIndex',
    'selectedRows',
    'columns',
    'fetchedData',
    'fetchConfig',
    'onDragStart',
    'onDragOver',
    'onDrop',
    'onColumnSettingsChange',
    'onSelectedRowsChange',
    'collapsibleRowRender',
    'selectable',
    'multiSelect',
    'ssrConfig',
    'rowKey',
    'disabledSelectedRows'
  ],
})(React.memo((props: IComponent) => {
  const {
    filteredData,
    dropTargetIndex,
    selectedRows,
    columns,
    fetchedData,
    fetchConfig,
    onDragStart,
    onDragOver,
    onDrop,
    onColumnSettingsChange,
    onSelectedRowsChange,
    collapsibleRowRender,
    selectable,
    multiSelect,
    ssrConfig,
    rowKey,
    disabledSelectedRows,
    setGlobalStateByKey,
  } = props;

  const [isChecked, setIsChecked] = React.useState(false);
  const rows = fetchConfig ? fetchedData.data : filteredData;
  let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);
  const hasSSRSelectAll = !!ssrConfig?.allData && multiSelect;

  const getSSRData = async (data: any): Promise<any[]> => {
    if (data instanceof Function) {
      return Promise.resolve(data?.());
    }
    return data;
  };

  const selectAllRows = async () => {
    const ssrData = await getSSRData(ssrConfig?.allData);
    const rowsData = hasSSRSelectAll ? ssrData : filterRows(rows, disabledSelectedRows, rowKey);
    onSelectedRowsChange?.([...rowsData]);
    setGlobalStateByKey('selectedRows', [...rowsData]);
  };

  const deselectAllRows = () => {
    onSelectedRowsChange?.([]);
    setGlobalStateByKey('selectedRows', []);
  };

  const getCheckStatus = async () => {
    /** If SSRConfig is enable */
    if (ssrConfig) {
      /** If allData is defiend */
      if (hasSSRSelectAll) {
        const ssrData = await getSSRData(ssrConfig?.allData);
        return (!!ssrData && !!ssrData.length) && selectedRows?.length === ssrData.length;
      }
      /** If allData is not defined then check if current visible rows is all selected */
      return filteredData?.every(a => Array.isArray(selectedRows) && selectedRows?.some(b => a?.[rowKey] === b?.[rowKey]))
    }
    return (!!rows && !!rows.length) && selectedRows?.length === rows.length;
  }
  
  useEffect(() => {
    const seCheck = async () => {
      const result = await getCheckStatus();
      setIsChecked(result);
    }

    seCheck();
  }, [rows, ssrConfig?.allData, selectedRows]);

  const getSortDescription = (sorted) => {
    switch(sorted) {
      case "asc":
        return 'desc'
      case "desc":
        return 'none'
      default: return 'asc'
    }
  };

  return (
    <TableRow className="column-header-container">
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn
        isHeader
        {...(multiSelect ? {
          checked: isChecked,
          ...(!!rows && rows.length > 0 ? {
            onChange: (value: any) => value ? selectAllRows() : deselectAllRows()
          } : {})
        } : {})}
      />

      {columns?.map((col, index) => {
        if (col.hidden || col.downloadOnly) return null;
        const showSortIcon = col.enableSorting !== false;
        const { showPinIcon, isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

        if (isPinned) {
          pinnedWidth += colWidth;
        }

        const isDraggable = col.draggable !== false;
        const isresizable = col.resizable !== false;
        const hasControls = col.controls !== "none" ? (showPinIcon || showSortIcon) : false;

        return (
          <TableCell
            key={index}
            width={col.width || col.defaultWidth}
            minWidth={col.minWidth}
            align={col.align}
            isPinned={isPinned}
            style={pinnedStyle}
            className="table-cell"
            data-column-index={index}
            {...(isDraggable ? {
              onDragOver: (e) => onDragOver(e, index),
              onDrop: (e) => onDrop(e, index)
            } : {})}
          >
            <SC.TitleWrapper hasControls={hasControls} align={col.align} title={col.title}>
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
                  <TxCoreIcon icon="bars"/>
                  <CellContent>{col.title}</CellContent>
                </SC.TitleContainer>
              ) : <CellContent>{col.title}</CellContent>}

              {hasControls && (
                <SC.TitleControlsContainer>
                  {showPinIcon && (
                    <SC.PinContainer
                      isPinned={isPinned}
                      title={isPinned ? `Unpin ${col.title}` : `Pin ${col.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newColumns = [...columns];
                        newColumns[index] = {
                          ...newColumns[index],
                          pinned: !newColumns[index].pinned,
                        };

                        setGlobalStateByKey('columns', newColumns);
                        onColumnSettingsChange?.(newColumns);
                      }}
                    >
                      <TxCoreIcon icon="pushpin"/>
                    </SC.PinContainer>
                  )}

                  {showSortIcon && (
                    <SC.ControlContainer
                      title={`Sort ${col.title} (${getSortDescription(col.sorted)})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newColumns = columns?.map((column, idx) => {
                          if (idx === index) {
                            return {
                              ...column,
                              sorted: !column.sorted ? "asc" : column.sorted === "asc" ? "desc" : undefined,
                            };
                          }
                          return { ...column, sorted: undefined };
                        });
                      
                        setGlobalStateByKey('columns', newColumns);
                        onColumnSettingsChange?.(newColumns);
                      }}
                    >
                      <SC.SortContainer sorted={col.sorted}/>
                    </SC.ControlContainer>
                  )}
                </SC.TitleControlsContainer>
              )}
            </SC.TitleWrapper>

            {isDraggable && <ColumnDragHighlighter index={index}/>}
            {isresizable && <ResizeHandle title={`Resize ${col.title}`} className="resize-handle"/>}
          </TableCell>
        );
      })}
    </TableRow>
  )
}));
