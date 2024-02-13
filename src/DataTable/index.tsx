import React, { createContext, useRef, useReducer, useMemo, useCallback, useEffect, useState } from "react";
import { DataTableProps, ColumnSettings, Actions } from "./interfaces";
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
  serialize,
  updateDataByRowKey,
  hasDomain,
  arrayToEmptyObject,
  getValue
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
import UploadCell from "./components/CustomCell/UploadCell";
import Ajv from 'ajv';

export const DataTableContext = createContext<any>(null);

export const DataTable = React.forwardRef((props: DataTableProps, ref: React.Ref<any>) => {
// export const DataTable = (props: DataTableProps) => {
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
    clickableRow = false,
    customRowSettings,
    actions,
    isPermanentDelete = false,
    isSingleSelect = false,
    onChange,
    onColumnSettingsChange,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onPageSizeChange,
    onPageIndexChange,
    onSelectedRowsChange,
  } = props;

  const [canPaste, setCanPaste] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [editingCells, setEditingCells] = useState<Array<{
    cancelledRowIndex
    columnIndex: number;
    value: string;
    editable?: boolean;
    invalid?: boolean;
    error?: string | null;
    isNew?: boolean
  }>>([]);
  const ajv = new Ajv();

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
        [col.column]: col.filterConfig ? col.filterConfig.value : "",
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
        if (col.filterConfig) {
          const rowValue = getDeepValue(row, col.column);
          if (col.filterConfig.type === "number-range" || col.filterConfig.type === "date-range") {
            const filterValue = state.filterValues[col.column];
            return filterCheck(filterValue, rowValue, col.filterConfig.type)
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
  const hasAnyFilterConfig = state.columns.some(col => col.filterConfig);
  const visibleRows = useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  /** Memos End */

  /** Callback Start */
  const onAddRow = useCallback((data, rowIndex, isNewAddedRow = false) => {
    try {
      const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
      const rowKeyValue = getDeepValue(parsedData, rowKey);
      const intentAction = getDeepValue(parsedData, 'intentAction');

      if (!!rowKeyValue) {
        const notEditableColumns = columnSettings.filter(i => i?.actionConfig === false).map(i => i?.column);
        const newRowKey = intentAction !== "*" ? `${rowKeyValue}_copy_${new Date().getTime()}` : rowKeyValue;
        const newData = {
          ...setDeepValue(parsedData, rowKey, newRowKey),
          intentAction: isNewAddedRow ? "*" : "N",
          ...arrayToEmptyObject(notEditableColumns) // not editable column will always be empty
        };

        if (fetchConfig) {
          const newFetchedData = [...(state.fetchedData.data || [])];
          newFetchedData.splice(rowIndex + 1, 0, newData);
          setState({
            type: SET_FETCHED_DATA,
            payload: { ...state.fetchedData, data: newFetchedData }
          });
        } else {
          const newLocalData = [...(state.localData || [])];
          newLocalData.splice(rowIndex + 1, 0, newData);
          setState({ type: SET_LOCAL_DATA, payload: newLocalData });
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  }, [state.localData, state.fetchedData.data, columnSettings]);

  const onCancel = useCallback((data) => {
    try {
      const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
      const rowKeyValue = getDeepValue(parsedData, rowKey);

      if (!!rowKeyValue) {
        const dataToUse: any[] = fetchConfig ? state.fetchedData.data : state.localData;
        const cancelledRowIndex = dataToUse.findIndex(i => getDeepValue(i, rowKey) === getDeepValue(parsedData, rowKey));
        const newData = dataToUse?.filter(i => getDeepValue(i, rowKey) !== rowKeyValue);

        // Remove row values in state
        setEditingCells(prev => prev.filter((cell: any) => cell.rowIndex !== cancelledRowIndex));
        // When permanent delete, remove selected cell if its same row
        setSelectedColumn(prev => prev.rowIndex === cancelledRowIndex ? null : prev);

        if (fetchConfig) {
          setState({
            type: SET_FETCHED_DATA,
            payload: { ...state.fetchedData, data: newData }
          });
        } else {
          setState({ type: SET_LOCAL_DATA, payload: newData });
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  }, [state.localData, state.fetchedData.data, editingCells, setEditingCells]);

  const doUpdateRowIntentAction = (data, intentAction = "R") => {
    const parsedNewData = !!data ? JSON.parse(data) : {};

    if (fetchConfig) {
      const newFetchedData = updateDataByRowKey(parsedNewData, state.fetchedData.data, rowKey, intentAction);
      setState({
        type: SET_FETCHED_DATA,
        payload: { ...state.fetchedData, data: newFetchedData }
      });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = updateDataByRowKey(parsedNewData, state.localData, rowKey, intentAction);
      setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      onChange?.(newLocalData);
    }
  };

  const doPermanentDelete = (data) => {
    const parsedNewData = !!data ? JSON.parse(data) : {};
    const rowKeyValue = getValue(getDeepValue(parsedNewData, rowKey));
    if (fetchConfig) {
      const newFetchedData = [...(state.fetchedData.data || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setState({
        type: SET_FETCHED_DATA,
        payload: { data: newFetchedData }
      });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = [...(state.localData || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      onChange?.(newLocalData);
    }
  };

  const onDeleteRow = useCallback((data, rowIndex) => {
    if (isPermanentDelete) {
      doPermanentDelete(data);
      // When permanent delete, remove all data with same row in editingCells state
      setEditingCells(prev => prev.filter((cell: any) => cell.rowIndex !== rowIndex));
      // When permanent delete, remove selected cell if its same row
      setSelectedColumn(prev => prev.rowIndex === rowIndex ? null : prev);
    } else {
      doUpdateRowIntentAction(data);
    }
  }, [state.localData, state.fetchedData.data]);

  const onSave = useCallback((data) => doUpdateRowIntentAction(data, "N"), [state.localData, state.fetchedData.data]);
  
  const onUndo = useCallback((data) => doUpdateRowIntentAction(data, "U"), [state.localData, state.fetchedData.data]);

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
      if (!hasDomain(url)) {
        url = `${window.location.origin}${url}`;
      }
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

  const hasAction = (action: Actions) => Array.isArray(actions) ? actions.includes(action) : actions === action;
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

  const validateData = useCallback(() => {
    const data = fetchConfig ? state.fetchedData.data : state.localData;
    const columns = state.columns;
    const invalidData: any = [];
  
    data.forEach((item, rowIndex) => {
      columns.forEach(column => {
        // Check if column has an actionConfig with a schema
        if (column.actionConfig?.schema) {
          const value = getDeepValue(item, column.column, true); // True to potentially return objects
          const parsedValue = getValue(value); // Ensure the value is correctly formatted for validation
  
          const schema = column.actionConfig.schema;
          const isSchemaInvalid = ajv.validate(schema, parsedValue);
          const error = ajv.errorsText(ajv.errors);

          if (!isSchemaInvalid) {
            invalidData.push({
              column: column.column,
              value: parsedValue,
              error,
              rowIndex
            });
          }
        }
      });
    });

    return invalidData;
  }, [state.localData, state.fetchedData.data, state.columns])

  React.useImperativeHandle(ref, () => ({
    validate: validateData
  }));

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
        onDeleteRow,
        onSave,
        onCancel,
        onUndo,
        editingCells,
        setEditingCells,
        canPaste,
        setCanPaste,
        hasAction,
        hasAnyFilterConfig,
        isSingleSelect,
        selectedColumn,
        setSelectedColumn
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
});

export { getDeepValue, setDeepValue, exportToCsv, UploadCell };
