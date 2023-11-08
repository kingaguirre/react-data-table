import React, { createContext, useRef, useReducer, useMemo, useCallback, useEffect } from "react";
import { DataTableProps, ColumnSettings } from "./interfaces";
import {
  getDeepValue,
  setDeepValue,
  useDragDropManager,
  useResizeManager,
  sortData,
  getTableWidth,
  exportToCsv,
  filterCheck,
  serializeColumns,
  setColumnSettings,
  getAdvanceFilterSettingsObj,
  serialize
} from "./utils";
import dataTableReducer, { IReducerState, initialState } from "./context/reducer";
import { SET_COLUMNS, SET_TABLE_WIDTH, SET_FETCHED_DATA, SET_LOCAL_DATA } from "./context/actions";
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
    fetchConfig,
    pageSize = fetchConfig?.requestData?.pageSize || 5,
    pageIndex = (fetchConfig?.requestData?.pageNumber !== undefined ? fetchConfig.requestData.pageNumber - 1 : undefined) || 0,
    selectable = false,
    rowKey,
    collapsibleRowHeight,
    filterAll = true,
    downloadCSV = false,
    activeRow = null,
    selectedRows = [],
    clickableRow = true,
    customRowSettings,
    editable = false,
    actions,
    onChange,
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
    filterValues: {
      ...columnSettings.reduce((initialValues, col: ColumnSettings) => ({
        ...initialValues,
        [col.column]: col.filterBy ? col.filterBy.value : "",
      }), {}),
      ...(fetchConfig?.requestData?.filter || {}),
    },
    ...(!!fetchConfig ? {
      advanceFilterValues: getAdvanceFilterSettingsObj(fetchConfig?.filterSettings)
    } : {})
  } as IReducerState);
  /** Reducer End */

  /** Memos Start */
  const filteredData = useMemo(() => {
    let filtered = !!state.localData && !!state.localData.length ? state.localData.filter(row => {
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
  }, [state.localData, state.columns, state.filterValues, state.search]);

  const start = state.localPageIndex * state.localPageSize;
  const end = start + state.localPageSize;
  const visibleRows = useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  /** Memos End */

  /** Callback Start */
  const onAddRow = useCallback((data, fetchConfig) => {
    try {
      const parsedData = !!data && typeof data === "string" ? JSON.parse(data) : {};
      const rowKeyValue = getDeepValue(parsedData, rowKey);

      if (!!rowKeyValue) {
        const newRowKey = `${rowKeyValue}_copy_${new Date().getTime()}`;
        const newData = setDeepValue(parsedData, rowKey, newRowKey);

        if (fetchConfig) {
          const newFetchedData = [newData, ...(state.localData || [])];
          setState({
            type: SET_FETCHED_DATA,
            payload: { ...state.fetchedData, data: newFetchedData }
          });
          onChange?.(newFetchedData);
        } else {
          const newLocalData = [newData, ...(state.localData || [])];
          setState({ type: SET_LOCAL_DATA, payload: newLocalData });
          onChange?.(newLocalData);
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  }, [state.localData, state.fetchedData.data]);

  const onDeleteRow = useCallback((data, fetchConfig) => {
    const parsedNewData = !!data ? JSON.parse(data) : [];
    const newRowKey = `${getDeepValue(parsedNewData, rowKey)}_copy_${new Date().getTime()}`;
    const newData = setDeepValue(parsedNewData, rowKey, newRowKey);

    if (fetchConfig) {
      const newFetchedData = [newData, ...(state.localData || [])];
      setState({
        type: SET_FETCHED_DATA,
        payload: { ...state.fetchedData, data: newFetchedData }
      });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = [newData, ...(state.localData || [])];
      setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      onChange?.(newLocalData);
    }
  }, [state.localData, state.fetchedData.data]);

  const fetchWithPagination = useCallback(async (
    pageIndex, pageSize, searchString = '', sortColumn = 'none', sortDirection = 'none', filter, advanceFilter
  ) => {
    if (fetchConfig) {
      /** Keep current data and totalData */
      setState({
        type: SET_FETCHED_DATA,
        payload: {
          ...state.fetchedData,
          fetching: true
        }
      });

      const { endpoint, requestData, responseDataPath = "data", responseTotalDataPath = "totalData" } = fetchConfig;

      let url = endpoint;
      let body: any = null;
      let method = 'GET';

      if (requestData!.method === "post") {
        method = 'POST';
        body = JSON.stringify({
          ...requestData,
          pageNumber: pageIndex + 1,
          pageSize,
          searchString,
          sortColumn,
          sortDirection,
          filter: {
            ...filter,
            ...advanceFilter
          }
        });
      } else {
        const queryObj = {
          ...requestData,
          ...requestData!.filter,
          pageNumber: pageIndex + 1,
          pageSize,
          sortColumn,
          sortDirection,
          ...filter,
          ...advanceFilter,
          acknowledgementNumber: searchString,
        };
        delete queryObj.filter;

        // Ensure all undefined values in queryObj are replaced with an empty string
        for (let key in queryObj) {
          if (queryObj[key] === undefined || queryObj[key] === null) {
            queryObj[key] = '';
          }
        }

        const queryString = serialize(queryObj);
        url = `${endpoint}?${queryString}`;
      }

      try {
        const response: any = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch with status ${response.status}`);
        }

        const data = await response.json();

        const fetchedData = JSON.parse(getDeepValue(data, responseDataPath));
        const totalData = getDeepValue(data, responseTotalDataPath);

        setState({
          type: SET_FETCHED_DATA,
          payload: {
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
        console.error(error)
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
    setState({ type: SET_LOCAL_DATA, payload: dataSource });
  }, [dataSource]);

  useEffect(() => {
    const savedCurrentColumnSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');

    if (!savedCurrentColumnSettings.length) {
      localStorage.setItem('currentColumnSettings', JSON.stringify(serializeColumns(columnSettings)));
    }
  }, []);

  useEffect(() => {
    if (tableRef && tableRef.current) {
      setTableWidth(tableRef.current.offsetWidth);
      setColumns(setColumnSettings(columnSettings, tableRef.current.offsetWidth, customRowSettings, actions));
    }
  }, [tableRef, customRowSettings, actions]);

  useEffect(() => {
    if (!!fetchConfig) {
      const hasStateChanged = state.localPageIndex !== pageIndex 
        || state.localPageSize !== pageSize 
        || state.search !== null;
  
      if (hasStateChanged) {
        const sortedColumn = state.columns.find(col => col.sorted && col.sorted !== 'none');
        const sortColumn = sortedColumn?.column || 'none';
        const sortDirection = sortedColumn?.sorted || 'none';
  
        fetchWithPagination(state.localPageIndex, state.localPageSize, state.search, sortColumn, sortDirection, state.filterValues, state.advanceFilterValues);
      }
    }
  }, [state.search, state.localPageIndex, state.localPageSize, state.filterValues, state.advanceFilterValues, pageIndex, pageSize, fetchConfig]);
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
        filterSettings: fetchConfig?.filterSettings,
        columnSettings,
        customRowSettings,
        editable,
        actions,
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
        onChange,
        onAddRow,
        onDeleteRow
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

export { getDeepValue, setDeepValue, exportToCsv };
