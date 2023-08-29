import React, { createContext, useRef, useReducer, useMemo, useCallback, useEffect } from "react";
import { DataTableProps, ColumnSettings } from "./interfaces";
import {
  getDeepValue,
  useDragDropManager,
  useResizeManager,
  sortData,
  getTableWidth,
  exportToCsv,
  filterCheck,
  serializeColumns,
  setColumnSettings
} from "./utils";
import dataTableReducer, { IReducerState, initialState } from "./context/reducer";
import { SET_COLUMNS, SET_TABLE_WIDTH, SET_FETCHED_DATA } from "./context/actions";
import * as SC from "./styled";
import { Rows } from "./components/Rows";
import { LoadingPanel } from "./components/Rows/styled";
import { ColumnHeader } from "./components/ColumnHeader";
import { ColumnGroupHeader } from "./components/ColumnGroupHeader";
import { ColumnFilters } from "./components/ColumnFilters";
import { MainHeader } from "./components/MainHeader";
import { Footer } from "./components/Footer";

export const DataTableContext = createContext<any>(null);

export const DataTable = (props: DataTableProps) => {
  /** Refs */
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    dataSource,
    columnSettings,
    pageSize = 5,
    pageIndex = 0,
    selectable = false,
    rowKey,
    fetchConfig,
    collapsibleRowHeight,
    filterAll = true,
    downloadCSV = false,
    activeRow = null,
    selectedRows = [],
    clickableRow = true,
    onColumnSettingsChange,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onPageSizeChange,
    onPageIndexChange,
    onSelectedRowsChange,
  } = props;

  /** Reducer Start */
  const [state, setState] = useReducer(dataTableReducer, {
    ...initialState,
    activeRow,
    selectedRows,
    localPageIndex: pageIndex,
    localPageSize: pageSize,
    filterValues: columnSettings.reduce((initialValues, col: ColumnSettings) => ({
      ...initialValues,
      [col.column]: col.filterBy ? col.filterBy.value : "",
    }), {})
  } as IReducerState);
  /** Reducer End */

  /** Memos Start */
  const filteredData = useMemo(() => {
    let filtered = !!dataSource && !!dataSource.length ? dataSource.filter(row => {
      /** Filter by column filter */
      const columnFilterMatches = state.columns.every(col => {
        if (col.filterBy) {
          const rowValue = getDeepValue(row, col.column);
          if (col.filterBy.type === "number-range" || col.filterBy.type === "date-range") {
            const filterValue = state.filterValues[col.column];
            return filterCheck(filterValue, rowValue, col.filterBy.type)
          } else {
            const filterValue = state.filterValues[col.column]?.toLowerCase() || "";
            return String(rowValue).toLowerCase().includes(filterValue);
          }
        }
        return true;
      });

      /** Filter by search */
      const searchMatches = state.columns.some(col => {
        const columnValue = String(getDeepValue(row, col.column)).toLowerCase();
        return columnValue.includes(!!state.search ? state.search.toLowerCase() : '');
      });

      return columnFilterMatches && searchMatches;
    }) : null;

    /** get the first sorted column */
    const sortedColumn = state.columns.find(col => col.sorted && col.sorted !== 'none');

    if (sortedColumn) {
      filtered = sortData(filtered, sortedColumn.column, sortedColumn.sorted);
    }

    return filtered;
  }, [dataSource, state.columns, state.filterValues, state.search]);

  const start = state.localPageIndex * state.localPageSize;
  const end = start + state.localPageSize;
  const visibleRows = useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  /** Memos End */

  /** Callback Start */
  const fetchWithPagination = useCallback(async (pageIndex, pageSize, searchString = '', sortColumn = 'none', sortDirection = 'none') => {
    if (fetchConfig) {
      /** Keep current data and totalData */
      setState({
        type: SET_FETCHED_DATA, payload: {
          ...state.fetchedData,
          fetching: true
        }
      });

      const { endpoint, requestData, responseDataPath = "data", responseTotalDataPath = "totalData" } = fetchConfig;

      const endpointWithPagination = endpoint
        .replace('{pageNumber}', (pageIndex + 1).toString())
        .replace('{pageSize}', pageSize.toString())
        .replace('{searchString}', searchString)
        .replace('{sortColumn}', sortColumn)
        .replace('{sortDirection}', sortDirection);

      try {
        const response: any = await fetch(endpointWithPagination, {
          method: requestData ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch with status ${response.status}`);
        }

        if (requestData) {
          response.body = JSON.stringify(requestData)
        }

        const data = await response.json();

        const fetchedData = JSON.parse(getDeepValue(data, responseDataPath));
        const totalData = getDeepValue(data, responseTotalDataPath);

        setState({
          type: SET_FETCHED_DATA,
          payload: {
            /** set to null if undefined or null */
            data: fetchedData !== null && fetchedData !== undefined ? fetchedData : null,
            totalData: totalData || state.fetchedData.totalData,
            fetching: false
          }
        });
      } catch (error) {
        setState({
          type: SET_FETCHED_DATA,
          payload: {
            data: null,
            totalData: 0,
            fetching: false
          }
        });
        console.error("There was an issue fetching the endpoint. Please try again later.")
      }
    }
  }, [fetchConfig, state.fetchedData.data, state.fetchedData.totalData]);

  /** Callback End */

  /** Custom Functions Start */
  const setColumns = (payload: ColumnSettings[]) => setState({ type: SET_COLUMNS, payload });
  const setTableWidth = (payload: number) => setState({ type: SET_TABLE_WIDTH, payload });

  const {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    dropTargetIndex,
    draggedColumnIndex
  } = useDragDropManager(state.columns, setColumns, onColumnSettingsChange);
  const { onMouseDown } = useResizeManager(state.columns, setColumns, onColumnSettingsChange);
  /** Custom Functions End */

  /** UseEffects Start */
  useEffect(() => {
    const savedCurrentColumnSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');

    if (!savedCurrentColumnSettings.length) {
        localStorage.setItem('currentColumnSettings', JSON.stringify(serializeColumns(columnSettings)));
    }
}, []);

  useEffect(() => {
    if (tableRef && tableRef.current) {
      setTableWidth(tableRef.current.offsetWidth);
      setColumns(setColumnSettings(columnSettings, tableRef.current.offsetWidth));
    }
  }, [tableRef]);

  useEffect(() => {
    if (state.columns.length > 0 && !!fetchConfig) {
      const hasStateChanged = state.localPageIndex !== pageIndex || state.localPageSize !== pageSize || state.columns.some(col => col.sorted && col.sorted !== 'none') || state.search !== null;

      if (hasStateChanged) {
        const sortedColumn = state.columns.find(col => col.sorted && col.sorted !== 'none');
        const sortColumn = sortedColumn?.column || 'none';
        const sortDirection = sortedColumn?.sorted || 'none';

        fetchWithPagination(state.localPageIndex, state.localPageSize, state.search, sortColumn, sortDirection);
      }
    }
  }, [state.search, state.localPageIndex, state.localPageSize, state.columns, pageIndex, pageSize]);
  /** UseEffects End */

  return (
    <DataTableContext.Provider
      value={{
        rowKey,
        selectable,
        fetchConfig,
        visibleRows,
        filteredData,
        dropTargetIndex,
        draggedColumnIndex,
        collapsibleRowHeight,
        filterAll,
        downloadCSV,
        clickableRow,
        columnSettings,
        state,
        setState,
        onMouseDown,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDrop,
        onRowClick,
        onRowDoubleClick,
        collapsibleRowRender,
        onColumnSettingsChange,
        onPageSizeChange,
        onPageIndexChange,
        onSelectedRowsChange,
      }}
    >
      <SC.TableWrapper>
        <MainHeader />
        <SC.Table ref={tableRef}>
          {state.tableWidth !== null ? (
            <SC.TableInnerWrapper>
              <div style={{ ...getTableWidth({ state, selectable, collapsibleRowRender }) }}>
                <ColumnGroupHeader />
                <ColumnHeader />
                <ColumnFilters />
                <Rows />
              </div>
            </SC.TableInnerWrapper>
          ) : <LoadingPanel>Loading Rows...</LoadingPanel>}
        </SC.Table>
        <Footer />
      </SC.TableWrapper>
    </DataTableContext.Provider>
  );
}

export { getDeepValue, exportToCsv };
