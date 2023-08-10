import React from "react";
import { DataTableProps, ColumnSettings } from "./interfaces";
import { getDeepValue, useDragDropManager, useResizeManager, sortData, getTableWidth, debounce } from "./utils";
import dataTableReducer, { IReducerState, initialState } from "./context/reducer";
import { SET_COLUMNS, SET_PARENT_WIDTH, SET_FETCHED_DATA } from "./context/actions";
import * as SC from "./styled";
import Rows from "./components/Rows";
import ColumnHeader from "./components/ColumnHeader";
import ColumnGroupHeader from "./components/ColumnGroupHeader";
import ColumnFilters from "./components/ColumnFilters";
import MainHeader from "./components/MainHeader";
import Footer from "./components/Footer";

export const DataTableContext = React.createContext<any>(null);

export default (props: DataTableProps) => {
  const {
    dataSource,
    columnSettings,
    pageSize = 5,
    pageIndex = 0,
    selectable = false,
    rowKey,
    fetchConfig,
    collapsibleRowHeight = "100px",
    onColumnSettingsChange,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
  } = props;

  /** Refs */
  const tableRef = React.useRef<HTMLDivElement>(null);
  const dragImageRef = React.useRef<HTMLDivElement>(null);

  /** Reducer Start */
  const [state, setState] = React.useReducer(dataTableReducer, {
    ...initialState,
    localPageIndex: pageIndex,
    localPageSize: pageSize,
    filterValues: columnSettings.reduce((initialValues, col: ColumnSettings) => ({
      ...initialValues,
      [col.column]: col.filterBy ? col.filterBy.value : "",
    }), {})
  } as IReducerState);
  /** Reducer End */

  /** Memos Start */
  const updatedColumnSettings = React.useMemo(() => {
    if (state.parentWidth === null) return columnSettings;
  
    const columnsWithWidth = columnSettings.filter(col => col.width);
    const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width!, 10), 0);
    const remainingWidth = state.parentWidth - totalWidthWithWidth;
    const columnsWithoutWidth = columnSettings.filter(col => !col.width);
    const columnWidth = Math.max(remainingWidth / columnsWithoutWidth.length, 120);

    return columnSettings.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) {
        return -1;
      }
      if (b.order !== undefined) {
        return 1;
      }
      return 0;
    }).map((col, index) => ({
      ...col,
      width: col.width || `${columnWidth}px`,
      order: index,
    }));
  }, [columnSettings, state.parentWidth]);

  const filteredData = React.useMemo(() => {
    let filtered = !!dataSource && !!dataSource.length ? dataSource.filter(row => {
      /** Filter by column filter */
      const columnFilterMatches = state.columns.every(col => {
        if (col.filterBy) {
          const filterValue = state.filterValues[col.column].toLowerCase();
          const rowValue = String(getDeepValue(row, col.column)).toLowerCase();
          return rowValue.includes(filterValue);
        }
        return true;
      });
  
      /** Filter by search */
      const searchMatches = state.columns.some(col => {
        const columnValue = String(getDeepValue(row, col.column)).toLowerCase();
        return columnValue.includes(state.search.toLowerCase());
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
  const visibleRows = React.useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  /** Memos End */
  
  /** Callback Start */
  const fetchWithPagination = React.useCallback(async (pageIndex, pageSize, searchString = '', sortColumn = 'none', sortDirection = 'none') => {
    if (fetchConfig) {
      /** Keep current data and totalData */
      setState({ type: SET_FETCHED_DATA, payload: {
        ...state.fetchedData,
        fetching: true
      }});

      const { endpoint, requestData, responseDataPath = "data", responseTotalDataPath = "totalData" } = fetchConfig;

      const endpointWithPagination = endpoint
        .replace('{pageNumber}', (pageIndex + 1).toString())
        .replace('{pageSize}', pageSize.toString())
        .replace('{searchString}', searchString)
        .replace('{sortColumn}', sortColumn)
        .replace('{sortDirection}', sortDirection);

      const response: any = await fetch(endpointWithPagination, {
        method: requestData ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

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
    }
  }, [fetchConfig, state.fetchedData.data, state.fetchedData.totalData]);
  /** Callback End */

  /** Custom Functions Start */
  const setColumns = (payload: ColumnSettings[]) => setState({ type: SET_COLUMNS, payload });
  const setParentWidth = (payload: number) => setState({ type: SET_PARENT_WIDTH, payload });

  const {
    onDragStart,
    onDragOver,
    onDrop,
    showLineAtIndex
  } = useDragDropManager(state.columns, setColumns, dragImageRef, onColumnSettingsChange);
  const { onMouseDown } = useResizeManager(state.columns, setColumns, onColumnSettingsChange);
  /** Custom Functions End */

  /** UseEffects Start */
  React.useEffect(() => {
    setColumns(updatedColumnSettings);
  }, [updatedColumnSettings]);

  React.useEffect(() => {
    if (tableRef.current) {
      setParentWidth(tableRef.current.offsetWidth);
    }
  }, [tableRef]);

  React.useEffect(() => {
    /** Initial fetch */
    if (state.columns.length === 0) {
      fetchWithPagination(pageIndex, pageSize, undefined, undefined, undefined);
      return; /** Exit the effect to prevent the rest of the code from running */
    }
  
    /** Subsequent fetch when state changes */
    const isReadyToFetch = state.columns.length > 0;
    const hasStateChanged = state.localPageIndex !== pageIndex || state.localPageSize !== pageSize || state.columns.some(col => col.sorted && col.sorted !== 'none') || state.search !== null;
  
    if (isReadyToFetch && hasStateChanged) {
      const sortedColumn = state.columns.find(col => col.sorted && col.sorted !== 'none');
      const sortColumn = sortedColumn?.column || 'none';
      const sortDirection = sortedColumn?.sorted || 'none';
  
      fetchWithPagination(state.localPageIndex, state.localPageSize, state.search, sortColumn, sortDirection);
    }
  }, [fetchWithPagination, state.search, state.localPageIndex, state.localPageSize, state.columns, pageIndex, pageSize]);
  /** UseEffects End */

  return (
    <DataTableContext.Provider
      value={{
        rowKey,
        selectable,
        fetchConfig,
        visibleRows,
        filteredData,
        showLineAtIndex,
        collapsibleRowHeight,
        state,
        setState,
        onMouseDown,
        onDragStart,
        onDragOver,
        onDrop,
        onRowClick,
        onRowDoubleClick,
        collapsibleRowRender,
        onColumnSettingsChange,
        fetchWithPagination
      }}
    >
      <SC.TableWrapper>
        <MainHeader />
        <SC.Table ref={tableRef}>
          <SC.TableInnerWrapper>
            <div style={getTableWidth({state, selectable, collapsibleRowRender})}>
              <ColumnGroupHeader />
              <ColumnHeader />
              <ColumnFilters />
              <Rows />
            </div>
          </SC.TableInnerWrapper>
        </SC.Table>
        <Footer />
      </SC.TableWrapper>
    </DataTableContext.Provider>
  );
}
