import React, { useState, useCallback, Fragment, useRef, useEffect } from "react";
import {
  getDeepValue,
  getPinnedDetails,
  returnAnArray,
  getSelectedRows,
} from "../../utils"
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";
import { SelectionRange } from '../SelectionRange';
import { Cell } from './Cell';
import { withState, IComponent } from '../../GlobalStateProvider';

export const Rows = withState({
  states: [
    'rowKey',
    'visibleRows',
    'collapsibleRowHeight',
    'fetchConfig',
    'selectable',
    'actions',
    'selectedRows',
    'disabledSelectedRows',
    'activeRow',
    'columns',
    'fetchedData',
    'localData',
    'pageIndex',
    'pageSize',
    'onRowClick',
    'onRowDoubleClick',
    'collapsibleRowRender',
    'onSelectedRowsChange',
    'multiSelect',
    'selectionRange',
    'selectionRangeRef',
    'isAllColumnHidden',
    'handleRowClick',
  ],
})(React.memo((props: IComponent) => {
  const {
    rowKey,
    visibleRows,
    collapsibleRowHeight,
    fetchConfig,
    selectable,
    actions,
    selectedRows,
    disabledSelectedRows,
    activeRow,
    columns,
    fetchedData,
    localData,
    pageIndex,
    pageSize,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onSelectedRowsChange,
    multiSelect,
    selectionRange,
    selectionRangeRef,
    setGlobalStateByKey,
    isAllColumnHidden,
    handleRowClick,
  } = props;

  const cellRefs = useRef({});
  const [collapsedRows, setCollapsedRows] = useState<string[]>([]);

  /** Use fetchedData.data when fetchConfig is defined, otherwise use visibleRows */
  const isFetching = fetchConfig && fetchedData.fetching;
  const rows = fetchConfig ? fetchedData.data : visibleRows;
  const dataSource = returnAnArray(fetchConfig ? fetchedData.data : localData);

  const checkIsNewRow = (row) => row?.intentAction === "*";
  const checkIfRowKeyRequired = (actions || selectable) && !rowKey;

  useEffect(() => {
    // Reset refs whenever rows or columns change
    cellRefs.current = {};
    dataSource?.forEach((row) => {
      columns.forEach((column) => {
        cellRefs.current[`${getDeepValue(row, rowKey)}-${column.column}`] = React.createRef();
      });
    });
  }, [dataSource, columns]);

  const toggleRowCollapse = useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, [collapsibleRowHeight]);

  const toggleRowSelection = useCallback((row: any) => {
    if (!multiSelect) {
      // For single select, directly set the selectedRows with the current row
      const payload = [row];
      onSelectedRowsChange?.(payload);
      setGlobalStateByKey('selectedRows', payload);
    } else {
      // Existing multi-select logic...
      const normalizeSelectedRows = (rows: any[]) =>
        rows.map((r) => (typeof r === 'string' ? { [rowKey]: r } : r));

      const normalizedSelectedRows = normalizeSelectedRows(selectedRows);
      const rowKeyValue = getDeepValue(row, rowKey);
      const isSelectedRow = normalizedSelectedRows.find(
        (r) => getDeepValue(r, rowKey) === rowKeyValue
      );
      const payload = isSelectedRow
        ? normalizedSelectedRows.filter((r) => getDeepValue(r, rowKey) !== rowKeyValue)
        : [...normalizedSelectedRows, row];

      onSelectedRowsChange?.(payload);
      setGlobalStateByKey('selectedRows', payload);
    }
  }, [selectedRows, rowKey, onSelectedRowsChange, multiSelect]);

  /** Placeholder for loading */
  if (isFetching && rows === undefined) {
    return <SC.LoadingPanel>Loading the data...</SC.LoadingPanel>;
  }

  /** Placeholder for no data */
  if (!rows || rows.length === 0 || isAllColumnHidden || !Array.isArray(rows) && !isFetching && rows !== undefined) {
    return <SC.LoadingPanel>No data available.</SC.LoadingPanel>;
  }

  /** Placeholder for no rowKey */
  if (checkIfRowKeyRequired) {
    return (
      <SC.LoadingPanel title="rowKey is required if actions or selectable prop is defined">
        <code>rowKey</code> is required if <code>actions</code> or <code>selectable</code> prop is defined.
      </SC.LoadingPanel>
    );
  }

  return (
    <SelectionRange selectionRangeRef={selectionRangeRef} selectionRange={selectionRange} data={localData}>
      <SC.TableRowsContainer isFetching={isFetching}>
        {rows.map((row, _index) => {
          const rowKeyValue = getDeepValue(row, rowKey);
          let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);
          const isRowCollapsed = collapsedRows.includes(rowKeyValue);
          const isActiveRow = rowKeyValue === activeRow;

          const isSelectedRow = getSelectedRows(selectedRows, rowKeyValue, rowKey);
          const isDisabledSelectedRow = getSelectedRows(disabledSelectedRows, rowKeyValue, rowKey);

          const clickableRow = onRowClick || onRowDoubleClick;
          const rowIndex = (pageIndex * pageSize) + _index;

          return (
            <Fragment
              key={_index}>
              <SC.TableRow
                {...(!!clickableRow ? {
                  onClick: () => handleRowClick(row, rowIndex)
                } : {})}
                pinnedWidth={pinnedWidth}
                data-testid={`row-${rowIndex}`}
                className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''} ${clickableRow ? 'clickable-row' : ''}`}
              >
                <CollapsibleRowColumn
                  onClick={() => toggleRowCollapse(rowKeyValue)}
                  isRowCollapsed={isRowCollapsed}
                />
                <SelectCheckboxColumn
                  rowIndex={rowIndex}
                  checked={isSelectedRow}
                  disabled={isDisabledSelectedRow}
                  onChange={() => toggleRowSelection(row)}
                />
                {columns.map((col, colIndex) => {
                  if (col.hidden) return null
                  const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

                  if (isPinned) {
                    pinnedWidth += colWidth;
                  }

                  return (
                    <Fragment key={colIndex}>
                      <Cell
                        column={col}
                        columnKey={col.column}
                        columnIndex={colIndex}
                        row={row}
                        rowKeyValue={rowKeyValue}
                        rowIndex={rowIndex}
                        cellRefs={cellRefs}
                        dataSource={dataSource}
                        pinnedStyle={pinnedStyle}
                        isPinned={isPinned}
                        checkIsNewRow={checkIsNewRow}
                        isSelectedRow={isSelectedRow}
                      />
                    </Fragment>
                  )
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
    </SelectionRange>
  )
}));
