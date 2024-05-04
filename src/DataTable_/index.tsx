import React, { createContext, useRef, useReducer, useMemo, useCallback, useEffect, useState } from "react";
import { DataTableProps, ColumnSettings, Actions, IGlobalState } from "./interfaces";
import { IFetchedData } from './context/reducer'
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
  getValue,
  mergeWithPrevious,
  processData,
  filterQueryObjByColumns,
  replaceEndpointValues
} from "./utils";
import dataTableReducer, { IReducerState, initialState } from "./context/reducer";
import { SET_COLUMNS, SET_TABLE_WIDTH, SET_FETCHED_DATA, SET_LOCAL_DATA, SET_SELECTED_ROWS, SET_ACTIVE_ROW } from "./context/actions";
import * as SC from "./styled";
import { Rows } from "./components/Rows";
import { LoadingPanel } from "./components/Rows/styled";
import { ColumnHeader } from "./components/ColumnHeader";
import { ColumnGroupHeader } from "./components/ColumnGroupHeader";
import { ColumnFilters } from "./components/ColumnFilters";
import { MainHeader } from "./components/MainHeader";
import { Footer } from "./components/Footer";
import { RightPanel } from "./components/MainHeader/RightPanel";
import UploadCell from "./components/CustomCell/UploadCell";
import { GlobalStateProvider, IComponent, withState } from './components/GlobalStateProvider';
import Ajv from 'ajv';
export const DataTableContext = createContext<any>(null);

export const DataTable = React.forwardRef((props: DataTableProps, ref: React.Ref<any>) => {
  /** Refs */
  const tableRef = useRef<HTMLDivElement>(null);
  const rightPanelToggleButtonRef: any = useRef<any>(null);
  const selectionRangeRef = useRef<any>(null);

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
    downloadXLS = false,
    uploadXLS = false,
    activeRow = null,
    selectedRows = [],
    clickableRow = false,
    customRowSettings,
    actions,
    isPermanentDelete = false,
    multiSelect = false,
    onChange,
    onColumnSettingsChange,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onPageSizeChange,
    onPageIndexChange,
    onSelectedRowsChange,
    selectionRange,
    actionsDropdownItems,
    tableHeight,
    tableMaxHeight
  } = props;

  const ajv = new Ajv();
  // const [canPaste, setCanPaste] = useState(false);
  // const [selectedColumn, setSelectedColumn] = useState<any>(null);
  // const [updatedRows, setUpdatedRows] = useState<string[]>([]);
  // const [rightPanelToggle, setRightPanelToggle] = useState(false);
  // const [editingCells, setEditingCells] = useState<Array<{
  //   rowIndex: number,
  //   columnIndex: number;
  //   column?: string;
  //   value: string;
  //   editable?: boolean;
  //   invalid?: boolean;
  //   error?: string | null;
  //   isNew?: boolean
  // }>>([]);
  // const [observedWidth, setObservedWidth] = useState(0);

  // search: undefined,
  // tableWidth: null,
  // localPageIndex: null,
  // localPageSize: null,
  // columns: [],
  // activeRow: null,
  // selectedRows: [],
  // filterValues: {},
  // advanceFilterValues: {},
  // fetchedData: { data: undefined, totalData: 0, fetching: false },
  // localData: null,

  /** States */
  // const [localData, setLocalData] = useState<any>(null);
  // const [columns, setColumns] = useState<any[]>([]);
  // const [search, setSearch] = useState<string | undefined>(undefined);
  // const [localPageIndex, setlocalPageIndex] = useState<number>(pageIndex);
  // const [localPageSize, setLocalPageSize] = useState<number>(pageSize as number);
  // const [fetchedData, setFetchedData] = useState<IFetchedData>({ data: undefined, totalData: 0, fetching: false });
  // const [tableWidth, setTableWidth] = useState<number | null>(null);
  // const [localselectedRows, setLocalSelectedRows] = useState<string[] | null>(selectedRows);
  // const [localactiveRow, setLocalActiveRow] = useState<string | null>(activeRow);
  // const [advanceFilterValues, setAdvanceFilterValues] = useState<any>(!!fetchConfig ? {
  //   advanceFilterValues: getAdvanceFilterSettingsObj(fetchConfig?.filterSettings)
  // } : {});
  // const [filterValues, setFilterValues] = useState<any>({
  //   ...columnSettings.reduce((initialValues, col: ColumnSettings) => ({
  //     ...initialValues,
  //     [col.column]: col.filterConfig ? col.filterConfig.value : "",
  //   }), {}),
  //   ...(fetchConfig?.requestData?.filter || {}),
  // });

  // const [canPaste, setCanPaste] = useState(false);
  // const [selectedColumn, setSelectedColumn] = useState<any>(null);
  // const [updatedRows, setUpdatedRows] = useState<string[]>([]);
  // const [rightPanelToggle, setRightPanelToggle] = useState(false);
  // const [editingCells, setEditingCells] = useState<Array<{
  //   rowIndex: number,
  //   columnIndex: number;
  //   column?: string;
  //   value: string;
  //   editable?: boolean;
  //   invalid?: boolean;
  //   error?: string | null;
  //   isNew?: boolean
  // }>>([]);
  // const [observedWidth, setObservedWidth] = useState(0);

  const [globalState, setGlobalState] = useState<IGlobalState>({
    localData: null,
    columns: [],
    search: undefined,
    pageIndex,
    pageSize,
    fetchedData: { data: undefined, totalData: 0, fetching: false },
    tableWidth: null,
    selectedRows,
    activeRow,
    advanceFilterValues: !!fetchConfig ? {
      advanceFilterValues: getAdvanceFilterSettingsObj(fetchConfig?.filterSettings)
    } : {},
    filterValues: {
      ...columnSettings.reduce((initialValues, col: ColumnSettings) => ({
        ...initialValues,
        [col.column]: col.filterConfig ? col.filterConfig.value : "",
      }), {}),
      ...(fetchConfig?.requestData?.filter || {}),
    },
    canPaste: false,
    selectedColumn: null,
    updatedRows: [],
    rightPanelToggle: false,
    editingCells: [],
    observedWidth: 0
  })

  /** Utility function to set globalState easier for this file. Note: dont pass this functions to context */
  /** Use to set multiple object in the state */
  const setGlobalStateByObj = (newValue: {[key: string]: any}) => setGlobalState(prev => ({ ...prev, ...newValue }))
  /** Use to set single object in the state */
  const setGlobalStateByKey = (key: string, value: any) => setGlobalState(prev => ({ ...prev, [key]: value }))
  // const setColumns = (payload: ColumnSettings[]) => setState({ type: SET_COLUMNS, payload });
  const setColumns = (payload: ColumnSettings[]) => setGlobalStateByKey('columns', payload);
  // const setTableWidth = (payload: number) => setState({ type: SET_TABLE_WIDTH, payload });

  /** UseEffects Start */
  useEffect(() => {
    setGlobalStateByKey('localData', dataSource);
    // setLocalData(dataSource)
    // setState({ type: SET_LOCAL_DATA, payload: dataSource });
  }, [dataSource]);

  useEffect(() => {
    const savedCurrentColumnSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');

    if (!savedCurrentColumnSettings.length) {
      localStorage.setItem('currentColumnSettings', JSON.stringify(serializeColumns(columnSettings)));
    }
  }, []);

  // Resize observer setup
  useEffect(() => {
    const observeTable = tableRef.current;
    if (observeTable) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          // Assuming you want to track width only; adjust if necessary
          setGlobalStateByKey('observedWidth', entry.contentRect.width);
          // setObservedWidth(entry.contentRect.width);
        }
      });
      resizeObserver.observe(observeTable);
      return () => resizeObserver.unobserve(observeTable);
    }
  }, [tableRef.current]); // Depend on tableRef.current so this effect re-runs if that changes
  
  useEffect(() => {
    if (tableRef.current) {
      setGlobalStateByObj({
        tableWidth: tableRef.current.offsetWidth,
        columns: setColumnSettings(columnSettings, tableRef.current.offsetWidth, customRowSettings, actions)
      });
      // setTableWidth(tableRef.current.offsetWidth);
      // setColumns(setColumnSettings(columnSettings, tableRef.current.offsetWidth, customRowSettings, actions));
    }
  }, [tableRef, customRowSettings, actions, globalState.observedWidth]); // Include observedWidth in the dependency array

  useEffect(() => {
    if (!!fetchConfig) {
      const hasStateChanged = globalState.pageIndex !== pageIndex 
        || globalState.pageSize !== pageSize 
        || globalState.search !== null;
  
      if (hasStateChanged) {
        const sortedColumn = globalState.columns.find(col => col.sorted && col.sorted !== 'none');
        const sortColumn = sortedColumn?.column || 'none';
        const sortDirection = sortedColumn?.sorted || 'none';
  
        fetchWithPagination(globalState.pageIndex, globalState.pageSize, globalState.search, sortColumn, sortDirection, globalState.filterValues, globalState.advanceFilterValues);
      }
    }
  }, [globalState.search, globalState.pageIndex, globalState.pageSize, globalState.filterValues, globalState.advanceFilterValues, pageIndex, pageSize, fetchConfig]);
  /** UseEffects End */

  /** Reducer Start */
  // const [state, setState] = useReducer(dataTableReducer, {
  //   ...initialState,
  //   activeRow, -
  //   selectedRows, -
  //   localPageIndex: pageIndex, -
  //   localPageSize: pageSize, -
  //   filterValues: {
  //     ...columnSettings.reduce((initialValues, col: ColumnSettings) => ({
  //       ...initialValues,
  //       [col.column]: col.filterConfig ? col.filterConfig.value : "",
  //     }), {}),
  //     ...(fetchConfig?.requestData?.filter || {}),
  //   },
  //   ...(!!fetchConfig ? {
  //     advanceFilterValues: getAdvanceFilterSettingsObj(fetchConfig?.filterSettings)
  //   } : {})
  // } as IReducerState);
  /** Reducer End */

  /** Memos Start */
  const filteredData = useMemo(() => {
    let filtered = !!globalState.localData && !!globalState.localData.length ? globalState.localData.filter(row => {
      /** Filter by column filter */
      const columnFilterMatches = globalState.columns.every(col => {
        if (col.filterConfig) {
          const rowValue = getDeepValue(row, col.column);
          if (col.filterConfig.type === "number-range" || col.filterConfig.type === "date-range") {
            const filterValue = globalState.filterValues[col.column];
            return filterCheck(filterValue, rowValue, col.filterConfig.type)
          } else {
            const filterValue = globalState.filterValues[col.column]?.toLowerCase() || "";
            return String(rowValue).toLowerCase().includes(filterValue);
          }
        }
        return true;
      });

      /** Filter by search */
      const searchMatches = globalState.columns.some(col => {
        const columnValue = String(getDeepValue(row, col.column)).toLowerCase();
        return columnValue.includes(!!globalState.search ? globalState.search.toLowerCase() : '');
      });

      return columnFilterMatches && searchMatches;
    }) : null;

    /** get the first sorted column */
    const sortedColumn: any = globalState.columns.find(col => col.sorted && col.sorted !== 'none');

    if (sortedColumn) {
      filtered = sortData(filtered, sortedColumn.column, sortedColumn.sorted);
    }
    return filtered;
  }, [globalState.localData, globalState.columns, globalState.filterValues, globalState.search]);
  
  const start = globalState.pageIndex * globalState.pageSize;
  const end = start + globalState.pageSize;
  const hasAnyFilterConfig = globalState.columns.some(col => col.filterConfig);
  const visibleRows = useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  /** Memos End */

  /** Callback Start */
  const onAddRow = useCallback((data, rowIndex, isNewAddedRow = false) => {
    try {
      /** Clear selection if there's any */
      selectionRangeRef?.current?.clearSelection();

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
          const newFetchedData = [...(globalState.fetchedData?.data || [])];
          newFetchedData.splice(rowIndex + 1, 0, newData);
          setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
          // setFetchedData({ ...globalState.fetchedData, data: newFetchedData })
          // setState({
          //   type: SET_FETCHED_DATA,
          //   payload: { ...fetchedData, data: newFetchedData }
          // });
        } else {
          const newLocalData = [...(globalState.localData || [])];
          newLocalData.splice(rowIndex + 1, 0, newData);
          setGlobalStateByKey('localData', newLocalData);
          // setLocalData(newLocalData)
          // setState({ type: SET_LOCAL_DATA, payload: newLocalData });
        }

        setGlobalStateByKey('updatedRows', [...globalState.updatedRows, rowKeyValue]);
        // setUpdatedRows(prev => ([...prev, rowKeyValue]));
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  }, [globalState.localData, globalState.fetchedData?.data, columnSettings]);

  const onPasteRow = useCallback((rowData, copiedData) => {
    try {
      /** Clear selection if there's any */
      selectionRangeRef?.current?.clearSelection();
      const updatedData = mergeWithPrevious(rowData, copiedData, rowKey);
      const currentRowKeyValue = getDeepValue(rowData, rowKey);
      setGlobalStateByKey('updatedRows', [...globalState.updatedRows, currentRowKeyValue]);
      // setUpdatedRows(prev => ([...prev, currentRowKeyValue]));

      if (fetchConfig) {
        const newFetchedData = [...(globalState.fetchedData?.data || [])]?.map(i => ({
          ...i,
          ...(getDeepValue(i, rowKey) === currentRowKeyValue ? { ...updatedData } : {})
        }));
        setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
        // setFetchedData({ ...globalState.fetchedData, data: newFetchedData })
        // setState({
        //   type: SET_FETCHED_DATA,
        //   payload: { ...fetchedData, data: newFetchedData },
        // });
      } else {
        const newLocalData = [...(globalState.localData || [])]?.map(i => ({
          ...i,
          ...(getDeepValue(i, rowKey) === currentRowKeyValue ? {...updatedData} : {})
        }));
        setGlobalStateByKey('localData', newLocalData)
        // setLocalData(newLocalData)
        // setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      }

    } catch (error) {
      console.error("Error: ", error);
    }
  }, [globalState.localData, globalState.fetchedData?.data, globalState.updatedRows, columnSettings]);

  const onCancel = useCallback((data) => {
    try {
      const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
      const rowKeyValue = getDeepValue(parsedData, rowKey);

      if (!!rowKeyValue) {
        const dataToUse: any = fetchConfig ? globalState.fetchedData?.data : globalState.localData;
        const cancelledRowIndex = dataToUse?.findIndex(i => getDeepValue(i, rowKey) === getDeepValue(parsedData, rowKey));
        const newData = dataToUse?.filter(i => getDeepValue(i, rowKey) !== rowKeyValue);

        // Remove row values in state
        setGlobalStateByKey('editingCells', globalState.editingCells.filter((cell: any) => cell.rowIndex !== cancelledRowIndex));
        // setEditingCells(prev => prev.filter((cell: any) => cell.rowIndex !== cancelledRowIndex));

        // When permanent delete, remove selected cell if its same row
        setGlobalStateByKey('selectedColumn', globalState.selectedColumn?.rowIndex === cancelledRowIndex ? null : globalState.selectedColumn);
        // setSelectedColumn(prev => prev?.rowIndex === cancelledRowIndex ? null : prev);

        if (fetchConfig) {
          setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newData });
          // setFetchedData({ ...globalState.fetchedData, data: newData })
          // setState({
          //   type: SET_FETCHED_DATA,
          //   payload: { ...state.fetchedData, data: newData }
          // });
        } else {
          setGlobalStateByKey('localData', newData );
          // setLocalData(newData);
          // setState({ type: SET_LOCAL_DATA, payload: newData });
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  }, [globalState.localData, globalState.fetchedData?.data, globalState.editingCells, globalState.selectedColumn]);

  const doUpdateRowIntentAction = useCallback((data, intentAction = "R") => {
    const parsedNewData = !!data ? JSON.parse(data) : {};
    const rowKeyValue = getDeepValue(parsedNewData, rowKey);
    setGlobalStateByKey('updatedRows', [...globalState.updatedRows, rowKeyValue]);
    // setUpdatedRows(prev => ([...prev, rowKeyValue]));

    if (fetchConfig) {
      const newFetchedData = updateDataByRowKey(parsedNewData, globalState.fetchedData?.data, rowKey, intentAction);
      setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
      // setFetchedData({ ...globalState.fetchedData, data: newFetchedData });
      // setState({
      //   type: SET_FETCHED_DATA,
      //   payload: { ...fetchedData, data: newFetchedData }
      // });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = updateDataByRowKey(parsedNewData, globalState.localData, rowKey, intentAction);
      setGlobalStateByKey('localData', newLocalData);
      // setLocalData(newLocalData);
      // setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      onChange?.(newLocalData);
    }
  }, [globalState.localData, globalState.fetchedData?.data, globalState.updatedRows]);

  const doPermanentDelete = useCallback((data) => {
    const parsedNewData = !!data ? JSON.parse(data) : {};
    const rowKeyValue = getValue(getDeepValue(parsedNewData, rowKey));
    if (fetchConfig) {
      const newFetchedData: any = [...(globalState.fetchedData?.data || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setGlobalStateByKey('fetchedData', newFetchedData);
      // setFetchedData(newFetchedData)
      // setState({
      //   type: SET_FETCHED_DATA,
      //   payload: { data: newFetchedData }
      // });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = [...(globalState.localData || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setGlobalStateByKey('localData', newLocalData);
      // setLocalData(newLocalData)
      // setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      onChange?.(newLocalData);
    }
  }, [globalState.localData, globalState.fetchedData?.data]);

  const onDeleteRow = (data, rowIndex) => {
    /** Clear selection if there's any */
    selectionRangeRef?.current?.clearSelection();

    if (isPermanentDelete) {
      doPermanentDelete(data);
    } else {
      doUpdateRowIntentAction(data);
    }

    // Remove all data with same row in editingCells state
    // setEditingCells(prev => prev.filter((cell: any) => cell.rowIndex !== rowIndex));
    setGlobalStateByKey('editingCells', globalState.editingCells.filter((cell: any) => cell.rowIndex !== rowIndex));

    // Remove selected cell if its same row
    setGlobalStateByKey('selectedColumn', globalState.selectedColumn?.rowIndex === rowIndex ? null : globalState.selectedColumn);
    // setSelectedColumn(prev => prev?.rowIndex === rowIndex ? null : prev);
  };

  const onSave = useCallback((data) => {
    doUpdateRowIntentAction(JSON.stringify({...processData(globalState.editingCells), ...JSON.parse(data)}), "N");
  }, [globalState.editingCells]);

  const onUndo = (data) => doUpdateRowIntentAction(data, "U");

  const fetchWithPagination = useCallback(async (
    pageIndex, pageSize, searchString = '', sortColumn = 'none', sortDirection = 'none', filter, advanceFilter
  ) => {
    if (fetchConfig) {
      /** Keep current data and totalData */
      setGlobalStateByKey('fetchedData', {
        ...globalState.fetchedData,
        fetching: true
      });

      // setState({
      //   type: SET_FETCHED_DATA,
      //   payload: {
      //     ...state.fetchedData,
      //     fetching: true
      //   }
      // });

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
          ...requestData?.filter,
          pageNumber: pageIndex + 1,
          pageSize,
          sortColumn,
          sortDirection,
          ...filter,
          ...advanceFilter,
          acknowledgementNumber: searchString,
        };
        // console.log(queryObj)
        // console.log(endpoint)
        // console.log(replaceEndpointValues(queryObj, endpoint))
        const endpointDetails = replaceEndpointValues(queryObj, endpoint);
        console.log(filterQueryObjByColumns(queryObj, columnSettings, requestData, endpointDetails.parameters))
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

        setGlobalStateByKey('fetchedData', {
          data: fetchedData !== null && fetchedData !== undefined ? fetchedData : null,
          totalData: totalData || fetchedData.totalData,
          fetching: false
        });
        // setState({
        //   type: SET_FETCHED_DATA,
        //   payload: {
        //     data: fetchedData !== null && fetchedData !== undefined ? fetchedData : null,
        //     totalData: totalData || state.fetchedData.totalData,
        //     fetching: false
        //   }
        // });
      } catch (error) {
        setGlobalStateByKey('fetchedData', {
          data: null,
          totalData: 0,
          fetching: false
        })
        // setState({
        //   type: SET_FETCHED_DATA,
        //   payload: {
        //     data: null,
        //     totalData: 0,
        //     fetching: false
        //   }
        // });
        console.error(error)
      }
    }
  }, [fetchConfig, globalState.fetchedData?.data, globalState.fetchedData?.totalData, globalState.columns]);

  const hasAction = (action: Actions) => Array.isArray(actions) ? actions.includes(action) : actions === action;
  /** Callback End */

  const {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    dropTargetIndex,
    draggedColumnIndex
  } = useDragDropManager(globalState.columns, setColumns, onColumnSettingsChange);
  const { onMouseDown } = useResizeManager(globalState.columns, setColumns, onColumnSettingsChange);

  const validateData = useCallback(() => {
    const data = fetchConfig ? globalState.fetchedData?.data : globalState.localData;
    const invalidData: any = [];
  
    data?.forEach((item, rowIndex) => {
      globalState.columns.forEach(column => {
        // Check if column has an actionConfig with a schema
        if (column.actionConfig?.schema) {
          const value = getDeepValue(item, column.column, true); // True to potentially return objects
          const currentEditingValue = globalState.editingCells?.find(i => i?.column === column.column && i?.rowIndex === rowIndex)?.value;
          const parsedValue = getValue(currentEditingValue !== undefined ? currentEditingValue : value); // Ensure the value is correctly formatted for validation
  
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
  }, [globalState.localData, globalState.fetchedData?.data, globalState.columns, globalState.editingCells])

  React.useImperativeHandle(ref, () => ({
    validate: validateData,
    getSelectedRows: () => globalState.selectedRows,
    // clearSelectedRows: () => setState({ type: SET_SELECTED_ROWS, payload: [] }),
    clearSelectedRows: () => setGlobalStateByKey('selectedRows', []),
    // clearActiveRow: () => setState({ type: SET_ACTIVE_ROW, payload: null }),
    clearActiveRow: () => setGlobalStateByKey('activeRow', null),
  }));
  /** Custom Functions End */

  return (
    <GlobalStateProvider
      globalState={{
        rowKey,
        selectable,
        fetchConfig,
        visibleRows,
        filteredData,
        dropTargetIndex,
        draggedColumnIndex,
        collapsibleRowHeight,
        filterAll,
        downloadXLS,
        uploadXLS,
        clickableRow,
        filterSettings: fetchConfig?.filterSettings,
        columnSettings,
        customRowSettings,
        actions,
        // state,
        // setState,
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
        // editingCells,
        // setEditingCells,
        onPasteRow,
        // canPaste,
        // setCanPaste,
        hasAction,
        hasAnyFilterConfig,
        multiSelect,
        // selectedColumn,
        // setSelectedColumn,
        selectionRange,
        selectionRangeRef,
        actionsDropdownItems,
        tableHeight,
        tableMaxHeight,
        // updatedRows,
        // setUpdatedRows,
        rightPanelToggleButtonRef,
        // rightPanelToggle,
        // setRightPanelToggle,

        /** Context to state */
        ...globalState,
        setGlobalState,
      }}
    >
      <SC.TableWrapper>
        <MainHeader />
        <SC.Table ref={tableRef}>
          <RightPanel/>
          {globalState.tableWidth !== null ? (
            <SC.TableInnerWrapper>
              <div style={{
                ...getTableWidth({ columns: globalState.columns, selectable, collapsibleRowRender }),
                height: tableHeight, maxHeight: tableMaxHeight
              }}>
                {/* <ColumnGroupHeader />
                <ColumnHeader />
                <ColumnFilters />
                <Rows /> */}
              </div>
            </SC.TableInnerWrapper>
          ) : <LoadingPanel>Loading Rows...</LoadingPanel>}
        </SC.Table>
        <Footer />
      </SC.TableWrapper>
    </GlobalStateProvider>
  );
});

export { getDeepValue, setDeepValue, exportToCsv, UploadCell };
