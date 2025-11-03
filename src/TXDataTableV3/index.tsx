import React, { createContext, useRef, useState, useMemo, useCallback, useEffect, useImperativeHandle } from "react";
import { DataTableProps, ColumnSettings, Actions, IGlobalState } from "./interfaces";
import { debounce } from 'lodash';
import {
  getDeepValue,
  useDragDropManager,
  sortData,
  getTableWidth,
  filterCheck,
  setColumnSettings,
  getAdvanceFilterSettingsObj,
  setDeepValue,
  updateDataByRowKey,
  replaceLocalhostWithDomain,
  getErrorMessage,
  arrayToEmptyObject,
  getValue,
  isStringExist,
  useTXAjvValidation,
  mergeWithPrevious,
  processData,
  filterQueryObjByColumns,
  replaceEndpointValues,
  getTotalWidth,
  getTypedCellValue,
  checkMinLength,
  FIELD_REQUIRED,
  DATA_UNIQUE_TEXT,
  getSchemaObjValue,
  serializeColumns,
  getIsDuplicate,
  getCurrentCellValue,
  checkIsNewRow,
  getCellValue,
  useDoubleClick,
  extractValues,
  getColumnDefaultWidth,
  updateWidthByIndex,
  getActionStatus,
  trimValue,
  getSelectedRows
} from "./utils";
import { GlobalStateProvider } from './GlobalStateProvider';
import * as SC from "./styled";
import { Rows } from "./components/Rows";
import { LoadingPanel } from "./components/Rows/styled";
import { ColumnHeader } from "./components/ColumnHeader";
import { ColumnGroupHeader } from "./components/ColumnGroupHeader";
import { ColumnFilters } from "./components/ColumnFilters";
import { MainHeader } from "./components/MainHeader";
import { RightPanel } from "./components/MainHeader/RightPanel";
import { Footer } from "./components/Footer";
import { CODE_DECODE_DROPDOWN } from '@atoms/TXInput';
import UploadCell from "./components/CustomCell/UploadCell";
import { ResizeWrapper } from "./components/ResizeWrapper";
import { BulkDeletePanel } from "./components/BulkDeletePanel";
import { useValidationMessage } from "@atoms/../hooks";
import { isValidArray, isObjectValuesEmpty } from '@utils/index';

export const DataTableContext = createContext<any>(null);

export const TXDataTable = React.forwardRef((props: DataTableProps, ref: React.Ref<any>) => {
  /** Refs */
  const tableRef = useRef<HTMLDivElement>(null);
  const rightPanelToggleButtonRef: any = useRef<any>(null);
  const selectionRangeRef = useRef<any>(null);
  const timeoutRef: any = useRef();
  const tableInnerWrapperRef: any = useRef();

  const {
    /** Only put props with default value */
    minPageSize = 10,
    pageSize = props.fetchConfig?.requestData?.pageSize || minPageSize,
    multiSelect = !!props.isBulkDelete ? true : props.multiSelect,
    pageIndex = (props.fetchConfig?.requestData?.pageNumber !== undefined ? props.fetchConfig.requestData.pageNumber : undefined) || 0,
    selectable = !!props.isBulkDelete ? true : props.selectable || false,
    downloadXLS = false,
    uploadXLS = false,
    activeRow = null,
    selectedRows = [],
    headerSearchSettings = false,
    hideFooter = false,
    isPermanentDelete = false,
    headerRightControls = false,
    actionColumnSetting = {},
    actionsDropdownItems,
    isAddDisabled = false,
    showPreviousValue = false,
    isLoading = false,
    disabledPagination = false,
    setActiveRowOnClick = true,
    setActiveRowOnDoubleClick = true,
    undoRedoCellEditingLimit = 5,
    downloadHiddenColumn = true
  } = props;
  const { getTranslatedMessage } = useValidationMessage();
  
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
    advanceFilterValues: !!props.fetchConfig ? {
      advanceFilterValues: getAdvanceFilterSettingsObj(props.fetchConfig?.filterSettings)
    } : {},
    filterValues: {
      ...props?.columnSettings.reduce((initialValues, col: ColumnSettings) => ({
        ...initialValues,
        [col.column]: col.filterConfig ? (col.filterConfig.value ?? "") : "",
      }), {}),
      ...(props.fetchConfig?.requestData?.filter || {}),
    },
    canPaste: false,
    selectedCell: null,
    updatedRows: [],
    rightPanelToggle: false,
    editingCells: [],
    observedWidth: 0,
    isFetching: false,
    initialData: null,
    undoHistory: [],
    redoHistory: [],
    highlightedCell: {},
    showActionDropdown: false,
  });

  /** 
   * Utility function to set globalState easier for this file. 
   * Note: No need to pass this functions to GlobalStateProvider.value
   * GlobalStateProvider already have the same functions within withState.
   * This function is intent to use with in this file only which is the parent 
   */
  /** Use to set multiple object in the state */
  const setGlobalStateByObj = useCallback((newValue: {[key: string]: any}) => setGlobalState(prev => ({ ...prev, ...newValue })), []);
  /** Use to set single object in the state */
  const setGlobalStateByKey = useCallback((key: string, value: any) => setGlobalState(prev => ({ ...prev, [key]: value })), [globalState]);
  const setColumns = useCallback((payload: ColumnSettings[]) => setGlobalStateByKey('columns', payload), []);

  /** Memos Start */
  const filteredData = useMemo(() => {
    let filtered = !!globalState.localData && !!globalState.localData.length ? globalState.localData.filter(row => {
      /** Filter by column filter */
      const columnFilterMatches = globalState.columns?.every(col => {
        if (col.filterConfig) {
          const rowValue = getDeepValue(row, col.column);
          if (col.filterConfig.type === "number-range" || col.filterConfig.type === "date-range") {
            const filterValue = globalState.filterValues[col.column];
            return filterCheck(filterValue, rowValue, col.filterConfig.type)
          } else if (col.filterConfig.type === CODE_DECODE_DROPDOWN && col.filterConfig.multiSelect === true) {
            const filterValue = globalState.filterValues[col.column];
            return !!filterValue && filterValue.length > 0 ? filterValue.includes(rowValue) : true
          } else {
            const filterValue = globalState.filterValues[col.column]?.toLowerCase() || "";
            return String(rowValue)?.toLowerCase().includes(filterValue);
          }
        }
        return true;
      });

      /** Filter by search */
      const searchMatches = globalState.columns?.some(col => {
        /** Check if column has columnCustomRenderer */
        const isColumnCustomRenderer = !!col.columnCustomRenderer ? col.columnCustomRenderer(null, row ?? null) : undefined;
        /** Get value based on column isColumnCustomRenderer or not */
        const columnValue = isColumnCustomRenderer ?? getValue(getDeepValue(row, col.column));
        /** Check if column has 'type' and use getTypedCellValue function */
        const columnValueWithType = col?.type ? getTypedCellValue(columnValue, col?.type) : columnValue;
        /** Convert value to lowercase */
        const columnValueToLowerCase = String(columnValueWithType).toLowerCase();
        return columnValueToLowerCase?.includes(!!globalState.search ? globalState.search.toLowerCase() : '');
      });

      return columnFilterMatches && searchMatches;
    }) : null;

    /** get the first sorted column */
    const sortedColumn: any = globalState.columns?.find(col => col.sorted && col.sorted !== 'none');

    if (sortedColumn) {
      filtered = sortData(filtered, sortedColumn, sortedColumn.sorted);
    }

    return filtered;
  }, [JSON.stringify(globalState.localData), globalState.columns, globalState.filterValues, globalState.search]);

  const start = props?.totalItems !== undefined ? 0 : globalState.pageIndex * globalState.pageSize;
  const end = start + globalState.pageSize;
  const hasAnyFilterConfig = globalState.columns?.some(col => col.filterConfig);
  const visibleRows = useMemo(() => filteredData !== null ? filteredData.slice(start, end) : null, [filteredData, start, end]);
  const shouldShowHeader = headerSearchSettings !== false ||
    isStringExist(props?.actions, Actions.ADD) ||
    headerRightControls ||
    downloadXLS ||
    props?.headerMainContent ||
    props?.headerLeftContent ||
    props?.headerRightContent;
  const isAllColumnHidden = globalState.columns?.every(col => col.hidden === true);
  /** Memos End */

  /** Callback Start */
  const onAddRow = (data, rowIndex, isNewAddedRow = false) => {
    const { rowKey, columnSettings, fetchConfig } = props;
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
          ...extractValues(columnSettings),
          ...arrayToEmptyObject(notEditableColumns) // not editable column will always be empty
        };

        if (fetchConfig) {
          const newFetchedData = [...(globalState.fetchedData?.data || [])];
          newFetchedData.splice(rowIndex + 1, 0, newData);
          setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
        } else {
          const newLocalData = [...(globalState.localData || [])];
          newLocalData.splice(rowIndex + 1, 0, newData);
          setGlobalStateByKey('localData', newLocalData);
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.");
    }
  };

  const onPasteRow = (rowData, copiedData) => {
    const { rowKey, fetchConfig } = props;
    try {
      /** Clear selection if there's any */
      selectionRangeRef?.current?.clearSelection();
      const updatedData = mergeWithPrevious(rowData, copiedData, rowKey);
      const currentRowKeyValue = getDeepValue(rowData, rowKey);

      if (fetchConfig) {
        const newFetchedData = [...(globalState.fetchedData?.data || [])]?.map(i => ({
          ...i,
          ...(getDeepValue(i, rowKey) === currentRowKeyValue ? { ...updatedData } : {})
        }));
        setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
      } else {
        const newLocalData = [...(globalState.localData || [])]?.map(i => ({
          ...i,
          ...(getDeepValue(i, rowKey) === currentRowKeyValue ? {...updatedData} : {})
        }));
        setGlobalStateByKey('localData', newLocalData);
      }

    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const onCancel = (data) => {
    const { rowKey, fetchConfig } = props;
    try {
      const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
      const rowKeyValue = getDeepValue(parsedData, rowKey);

      if (!!rowKeyValue) {
        const dataToUse: any = fetchConfig ? globalState.fetchedData?.data : globalState.localData;
        const newData = dataToUse?.filter(i => getDeepValue(i, rowKey) !== rowKeyValue);

        // Remove row values in state
        setGlobalStateByKey('editingCells', globalState.editingCells.filter((cell: any) => cell.rowKeyValue !== rowKeyValue));

        // When permanent delete, remove selected cell if its same row
        setGlobalStateByKey('selectedCell', globalState.selectedCell?.rowKeyValue === rowKeyValue ? null : globalState.selectedCell);
    
        if (fetchConfig) {
          setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newData });
        } else {
          setGlobalStateByKey('localData', newData );
        }
      } else {
        console.error("Invalid data.");
      }
    } catch (error) {
      console.error("Invalid data.", error);
    }
  };

  const doUpdateRowIntentAction = (data, intentAction = "D") => {
    const { rowKey, fetchConfig, onChange } = props;
    const parsedNewData = !!data ? JSON.parse(data) : {};

    if (fetchConfig) {
      const newFetchedData = updateDataByRowKey(parsedNewData, globalState.fetchedData?.data, rowKey, intentAction);
      setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: newFetchedData });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = updateDataByRowKey(parsedNewData, globalState.localData, rowKey, intentAction);
      setGlobalStateByKey('localData', newLocalData);
      onChange?.(newLocalData);
    }

  };

  const doPermanentDelete = (rowKeyValue) => {
    const { rowKey, fetchConfig, onChange } = props;

    if (fetchConfig) {
      const newFetchedData = [...(globalState.fetchedData?.data || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setGlobalStateByKey('fetchedData', newFetchedData);
      onChange?.(newFetchedData);
    } else {
      const newLocalData = [...(globalState.localData || [])].filter(i => getValue(getDeepValue(i, rowKey)) !== rowKeyValue);
      setGlobalStateByKey('localData', newLocalData);
      onChange?.(newLocalData);
    }
  }

  const onDeleteRow = (data) => {
    const parsedNewData = !!data ? JSON.parse(data) : {};
    const rowKeyValue = getDeepValue(parsedNewData, props?.rowKey);

    if (isPermanentDelete) {
      doPermanentDelete(rowKeyValue);
    } else {
      doUpdateRowIntentAction(data);
    }

    // Remove data in state when removed
    setGlobalStateByKey('editingCells', globalState.editingCells.filter((cell: any) => cell.rowKeyValue !== rowKeyValue));
    // Remove selected cell if its same row
    setGlobalStateByKey('selectedCell', globalState.selectedCell?.rowKeyValue === rowKeyValue ? null : globalState.selectedCell);
  };

  const onSave = (data) => {
    const parsedNewData = !!data ? JSON.parse(data) : {};
    const rowKeyValue = getDeepValue(parsedNewData, props?.rowKey);
    doUpdateRowIntentAction(JSON.stringify({...parsedNewData, ...processData(globalState.editingCells, props?.rowKey, rowKeyValue)}), "N");
    setGlobalStateByKey('selectedCell', globalState.selectedCell?.rowKeyValue === rowKeyValue ? null : globalState.selectedCell);
    // Remove data in state when removed
    setGlobalStateByKey('editingCells', globalState.editingCells.filter((cell: any) => cell.rowKeyValue !== rowKeyValue));
  };

  const onUndo = (data) => {
    const parseData = JSON.parse(data);
    const rowKeyValue = getDeepValue(parseData, props?.rowKey);
    /** When doing undo use the current value if column is in editable mode */
    setGlobalStateByKey('editingCells', globalState.editingCells.map((cell: any) => cell?.rowKeyValue === rowKeyValue ? {
      ...cell, value: parseData?.[cell.column], error: null
    } : cell));

    doUpdateRowIntentAction(data, "U");
  };

  const getData = async (url: string, params: any, callApi: any) => {
    try {
      const api: any = !!callApi && typeof callApi === "function" ? await callApi() : console.warn("Warning: No coreApi() function found.");

      return await api?.get(url, { params });
    } catch(error) {
      console.error("Error fetching data: ", error);
      throw error;
    }
  };

  const handleOnColumnSettingsChange = (newColumnSettings) => {
    props?.onColumnSettingsChange?.(newColumnSettings);
    if (!!props.localStorageSettingsKey) {
      sessionStorage.setItem(`${props.localStorageSettingsKey}-currentColumnSettings`, JSON.stringify(newColumnSettings));
    }
  };

  const fetchWithPagination = useCallback(async (sortColumn = 'none', sortDirection = 'none') => {
    const { pageIndex, pageSize, search, filterValues, advanceFilterValues } = globalState;
    const { columnSettings, fetchConfig } = props;
    if (fetchConfig) {
      // Show loading
      setGlobalStateByKey('isFetching', true);

      const { endpoint, requestData, responseDataPath = "data", responseTotalDataPath = "totalData" } = fetchConfig;
      const _searchString = { [(headerSearchSettings as any)?.column || "searchString"]: search };

      try {
        const queryObj = {
          ...requestData,
          ...requestData?.filter,
          pageNumber: pageIndex,
          pageSize,
          search,
          sortColumn,
          sortDirection,
          ...advanceFilterValues,
          ...filterValues,
          ..._searchString,
        };
        delete queryObj?.filter;

        const endpointDetails = replaceEndpointValues(queryObj, endpoint);
        const params = filterQueryObjByColumns(queryObj, columnSettings, requestData, endpointDetails.parameters);
        const response = await getData(endpointDetails.endpoint, params, fetchConfig?.callApi);

        if (response?.status !== 200) {
          throw new Error(`Failed to fetch with status ${response?.status}`);
        }

        const fetchedData = JSON.parse(getDeepValue(response, responseDataPath));
        const totalData = getDeepValue(response, responseTotalDataPath);

        setGlobalStateByObj({
          fetchedData: {
            data: fetchedData !== null && fetchedData !== undefined ? fetchedData : null,
            totalData: totalData || globalState.fetchedData?.totalData,
          },
          isFetching: false
        });
      } catch (error) {
        setGlobalStateByObj({
          fetchedData: {
            data: null,
            totalData: 0
          },
          isFetching: false
        });
        console.error("Error: ", error)
      }
    }
  }, []);

  const hasAction = (action: Actions) => Array.isArray(props?.actions) ? props?.actions.includes(action) : props?.actions === action;

  /** Evet call for editing cell */
  const handleDoCellEdit = (values) => {
    const { _row, _column, triggerOnChange = true, showEditError = false } = values;
    const rowKeyValue = getDeepValue(_row, props?.rowKey);
    const { column: columnKey } = _column;

    const cell = globalState.editingCells.find(cell => cell.rowKeyValue === rowKeyValue && cell.column === columnKey);

    if (cell) {
      const { value } = cell;
      doEdit({ _row, _column, value, triggerOnChange, showEditError})
    }
  };

  /** Function to use if input onChange will trigger edit like dropdown */
  const handleDoCellEditOnChange = (values) => {
    const { _row, _column, value, triggerOnChange = true, showEditError = false } = values;
    doEdit({ _row, _column, value, triggerOnChange, showEditError});
  }

  const doEdit = (values) => {
    const { _row, _column, value, triggerOnChange, showEditError } = values;
    const _trimmedValue = trimValue(value);
    
    const rowKeyValue = getDeepValue(_row, props?.rowKey);
    const { column: columnKey, actionConfig, title } = _column;
    const isDeletedRow = getDeepValue(_row, "intentAction") === "D";
    const dataSource = props?.fetchConfig ? globalState.fetchedData?.data : globalState.localData;
    
    /** Only do below code if its not deleted row */ 
    if (!isDeletedRow) {
      const saveDataSourceCurrentRow = globalState.initialData?.find(i => getDeepValue(i, props?.rowKey) === rowKeyValue);
      const isSelectedRow = getSelectedRows(globalState.selectedRows, rowKeyValue, props?.rowKey);
      const columnSchema = getActionStatus(actionConfig?.schema, _row, isSelectedRow);
      const isUnique = actionConfig?.isUnique;
      const validation = actionConfig?.validation;

      let isValid = true;
      let errorMessage = "";
      let isDuplicate = false;
      let validationErrors: any = undefined;

      if (triggerOnChange) {
        if (isUnique && (_trimmedValue !== null && _trimmedValue !== undefined)) {
          /** Check if the value is unique across the dataSource zz */

          isDuplicate = getIsDuplicate(dataSource, _trimmedValue, columnKey, props?.rowKey, rowKeyValue);

          if (isDuplicate) {
            isValid = false;
            errorMessage = DATA_UNIQUE_TEXT;
          }
        }

        /** Only validate if columnSchema is defined and its valid. */
        if (columnSchema && isValid) {
          const isRequired = checkMinLength(columnSchema) && !_trimmedValue;
          validationErrors = isRequired ? FIELD_REQUIRED : useTXAjvValidation(getSchemaObjValue(_trimmedValue, _column), columnSchema);
          isValid = validationErrors === null;
        }

        if (validation && isValid) {
          const editingCell: any = globalState.editingCells.find(e => e.column === columnKey);
          errorMessage = validation({..._row, [columnKey]: editingCell.value}, isSelectedRow);
          isValid = !errorMessage;
        }

        const currentValue = getCurrentCellValue(saveDataSourceCurrentRow, columnKey, _column);
        const shouldChangeIntentAction = !checkIsNewRow(saveDataSourceCurrentRow) && !!saveDataSourceCurrentRow;
        const isValueUdpated = currentValue !== _trimmedValue && !!saveDataSourceCurrentRow;

        const newData = setDeepValue({
          ..._row,
          ...(shouldChangeIntentAction ? {intentAction: "U"} : {}),
        }, columnKey, getCellValue({
          isValueUdpated,
          currentValue,
          value,
          column: _column,
        }));

        if (props?.undoRedoCellEditing) {
          /** Update history array with the current state */
          const newUndoHistoryEntry = { rowKeyValue, columnKey, oldValue: getValue(getDeepValue(_row, columnKey)), _trimmedValue };
          const updatedUndoHistory = [ ...globalState.undoHistory, newUndoHistoryEntry ];

          /** Limit the undo history to the specified limit */
          if (updatedUndoHistory.length > undoRedoCellEditingLimit) {
            updatedUndoHistory.shift();
          }

          setGlobalStateByKey('undoHistory', updatedUndoHistory);
          setGlobalStateByKey('redoHistory', []);
        }

        /** Update the data for the current cell  */
        const _updatedRows: any = dataSource?.map((item) => getDeepValue(item, props?.rowKey) === rowKeyValue ? newData : item);
        /** Update logic based on whether it's local data or fetched data  */
        if (props?.fetchConfig) {
          setGlobalStateByKey('fetchedData', { ...globalState.fetchedData, data: _updatedRows });
        } else {
          setGlobalStateByKey('localData', _updatedRows);
        }

        const isNewRow = checkIsNewRow(_row);
        /** Trigger onChange if the data has changed */
        if (getValue(getDeepValue(_row, columnKey)) !== _trimmedValue && !isNewRow) {
          props?.onChange?.(_updatedRows);
        }

        if (isValid) {
          setGlobalStateByKey('editingCells', globalState.editingCells.map(cell => 
            cell.rowKeyValue === rowKeyValue && cell.column === columnKey 
              ? { ...cell, value: _trimmedValue, editable: false, invalid: false, error: null } 
              : cell
          ));

          setGlobalStateByKey('selectedCell', null);
          errorMessage = "";
        } else {
          /** Handle validation errors, including unique constraint  */
          if (!errorMessage) {
            errorMessage = getErrorMessage(validationErrors, title, getTranslatedMessage);
          }
          setGlobalStateByKey('editingCells', globalState.editingCells.map(cell => 
            cell.rowKeyValue === rowKeyValue && cell.column === columnKey
              ? { ...cell, value: _trimmedValue, editable: showEditError, invalid: true, error: errorMessage } 
              : cell
          ));
        }
      } else {
        setGlobalStateByKey('selectedCell', null);
        /** If not saving changes, remove the specific cell from the editing cells  */
        setGlobalStateByKey('editingCells', globalState.editingCells.filter(cell => 
          cell.rowKeyValue !== rowKeyValue || cell.column !== columnKey
        ));
      }
    }
  };

  const highlightCell = (cellKey) => {
    setGlobalStateByKey('highlightedCell', {[cellKey]: true});
    setTimeout(() => {
      setGlobalStateByKey('highlightedCell', {[cellKey]: false});
    }, 1000);
  };

  const handleUndoEditCell = () => {
    const { undoHistory, redoHistory, localData } = globalState;

    if (undoHistory.length > 0) {
      const lastEdit = undoHistory[undoHistory.length - 1]; // Get the last saved change
      const { rowKeyValue, columnKey, oldValue } = lastEdit;
      const row = localData?.find(item => getDeepValue(item, props?.rowKey) === rowKeyValue);
      if (!row) return; // row not found

      const cellKey = `${rowKeyValue}-${columnKey}`;

      /** Revert the cell to the previous value */
      const updatedDataSource: any = localData?.map(item => 
        getDeepValue(item, props?.rowKey) === rowKeyValue ? {...item, [columnKey]: oldValue} : item
      );

      /** Add the undo action to the redo stack */
      const updatedRedoHistory = [...redoHistory, lastEdit];

      /** Remove the last edit from the undoHistory */
      const updatedUndoHistory = undoHistory.slice(0, -1);

      /** Update redo/undo history for this cell */
      setGlobalStateByKey('redoHistory', updatedRedoHistory);
      setGlobalStateByKey('undoHistory', updatedUndoHistory);

      /** Update datasource with the previous value */
      setGlobalStateByKey('localData', updatedDataSource);
      
      /** Update editingCells state */
      const updatedEditingCells: any = globalState?.editingCells?.map(item => 
        item.rowKeyValue === rowKeyValue ? {...item, editable: false, value: oldValue} : item
      );
      setGlobalStateByKey('editingCells', updatedEditingCells);

      /** Trigger onChange */
      props?.onChange?.(updatedDataSource);

      /** Highlight cell */
      highlightCell(cellKey);
    }
  };

  const handleRedoEditCell = () => {
    const { redoHistory, undoHistory, localData } = globalState;
    if (redoHistory.length > 0) {
      const lastUndo = redoHistory[redoHistory.length -1]; /** Get the most recent undo change */
      const { rowKeyValue, columnKey, value } = lastUndo;
      const row = localData?.find(item => getDeepValue(item, props?.rowKey) === rowKeyValue);
      if (!row) return; // row not found

      const cellKey = `${rowKeyValue}-${columnKey}`;

      /** Reapply the redo value to the localData */
      const updatedDataSource: any = localData?.map(item => 
        getDeepValue(item, props?.rowKey) === rowKeyValue ? {...item, [columnKey]: value} : item
      );

      /** Add the undo action to the redo stack */
      const updatedUndoHistory = [...undoHistory, lastUndo];

      /** Remove the last edit from the undoHistory */
      const updatedRedoHistory = redoHistory.slice(0, -1);

      /** Update redo/undo history for this cell */
      setGlobalStateByKey('redoHistory', updatedRedoHistory);
      setGlobalStateByKey('undoHistory', updatedUndoHistory);

      /** Update datasource with the previous value */
      setGlobalStateByKey('localData', updatedDataSource);

      /** Update editingCells state */
      const updatedEditingCells: any = globalState?.editingCells?.map(item => 
        item.rowKeyValue === rowKeyValue ? {...item, editable: false, value} : item
      );
      setGlobalStateByKey('editingCells', updatedEditingCells);

      /** Trigger onChange */
      props?.onChange?.(updatedDataSource);

      /** Highlight cell */
      highlightCell(cellKey);
    }
  }

  const doEditBasedOnEditingCells = (triggerOnChange?: boolean) => {
    const dataSource = props?.fetchConfig ? globalState.fetchedData?.data : globalState.localData;
    if(globalState?.selectedCell !== null) {
      setGlobalStateByKey('selectedCell', null);
    }
    if (globalState.editingCells.length > 0) {
      globalState.editingCells.forEach(cell => {
        /** Check if the click was outside and the cell is editable  */
        if (cell.editable) {
          const _column = globalState.columns.find(i => i.column === cell.column);
          const _row = dataSource?.find(i => getDeepValue(i, props?.rowKey) === cell.rowKeyValue);
          /** Apply handleDoEdit to save or discard changes */
          handleDoCellEdit({_row, _column, triggerOnChange});
        }
      });
    }
  };

  const handleRowSingleClick = (row: any, rowIndex?: number) => {
    const clickedRow = getDeepValue(row, props?.rowKey);
    const isActiveRow = clickedRow === activeRow;
    props?.onRowClick?.(isActiveRow ? null : row, rowIndex);
    if (setActiveRowOnClick) {
      setGlobalStateByKey('activeRow', isActiveRow ? null : clickedRow);
    }
  };

  const handleRowDoubleClick = (row: any, rowIndex?: number) => {
    const clickedRow = getDeepValue(row, props?.rowKey);
    const isActiveRow = clickedRow === activeRow;
    props?.onRowDoubleClick?.(isActiveRow ? null : row, rowIndex);
    if (setActiveRowOnDoubleClick) {
      setGlobalStateByKey('activeRow', isActiveRow ? null : clickedRow);
    }
  };

  const handleRowClick = useDoubleClick(
    (row, rowIndex) => handleRowSingleClick(row, rowIndex),
    (row, rowIndex) => handleRowDoubleClick(row, rowIndex),
  );
  /** Callback End */

  const {
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onDragLeave,
    dropTargetIndex,
    draggedColumnIndex
  } = useDragDropManager(globalState.columns, setColumns, handleOnColumnSettingsChange);

  const validateData = useCallback(() => {
    const data = props?.fetchConfig ? globalState.fetchedData?.data : globalState.localData;
    const columns = globalState.columns;
    const invalidData: any = [];
  
    columns?.filter(column => column.class !== "custom-action-column").forEach(column => {
      const columnValueMap = new Map<any, any>();
      if (typeof column.actionConfig !== 'boolean' && typeof column.actionConfig !== undefined) {
        const isUnique = column.actionConfig?.isUnique;
        const validation = column?.actionConfig?.validation;
        if (isUnique) {
          data?.forEach(item => {
            const value = getDeepValue(item, column.column, true);
            const rowKeyValue = getDeepValue(item, props?.rowKey);
            const currentEditingValue = globalState.editingCells?.find((i: any) => i?.column === column.column && i?.rowKeyValue === rowKeyValue)?.value;
            const trimmedValue = trimValue(getValue(currentEditingValue !== undefined ? getSchemaObjValue(currentEditingValue, column) : value));
            const _trimmedValue = typeof trimmedValue === 'string' ? trimmedValue.toLowerCase() : trimmedValue;
            const isDeletedRow = getDeepValue(item, "intentAction") === "D";
            if (_trimmedValue && !isDeletedRow) {
              columnValueMap.set(rowKeyValue, _trimmedValue);
            }
          });
        }
        data?.forEach((item, rowIndex) => {
          const rowKeyValue = getDeepValue(item, props?.rowKey);
          if (item?.intentAction !== 'D') {
            /** Only check columns that is not built-in with data-table */
            const value = getDeepValue(item, column.column, true);
            const currentEditingValue = globalState.editingCells?.find((i: any) => i?.column === column.column && i?.rowKeyValue === rowKeyValue)?.value;
            const _trimmedValue = trimValue(getValue(currentEditingValue !== undefined ? currentEditingValue : value));
          
            const columnSchema = (column.actionConfig as any)?.schema;

            let isValid = true;
            let errorMessage: any = "";
            let validationErrors: any = undefined;

            if (isUnique) {
              /** Check if the value is unique across the dataSource  */
              const newColumnValueMap = new Map(columnValueMap);
              newColumnValueMap.delete(rowKeyValue);
              const columnValueSet = new Set(newColumnValueMap.values());
              const trimmedValue = typeof _trimmedValue === 'string' ? _trimmedValue.toLowerCase() : _trimmedValue
              if (trimmedValue && columnValueSet.has(trimmedValue)) {
                isValid = false;
                errorMessage = DATA_UNIQUE_TEXT;
              }
            }

            /** Only validate if columnSchema is defined and its valid. */
            if (columnSchema && isValid) {
              const isRequired = checkMinLength(columnSchema) && !_trimmedValue;
              validationErrors = isRequired ? FIELD_REQUIRED : useTXAjvValidation(getSchemaObjValue(_trimmedValue, column), columnSchema);
              isValid = validationErrors === null;
              errorMessage = getErrorMessage(validationErrors, column.title, getTranslatedMessage);
            }

            if (validation && isValid) {
              const isSelectedRow = getSelectedRows(selectedRows, rowKeyValue, props?.rowKey);
              errorMessage = validation(item, isSelectedRow);
              isValid = !errorMessage;
            }
  
            if (!isValid) {
              invalidData.push({
                column: column.column,
                value: _trimmedValue,
                error: validationErrors || errorMessage,
                errorMessage,
                rowIndex,
                rowKeyValue
              });
            }
          }
        });
      }
    });
    return invalidData;
  }, [globalState.localData, globalState.fetchedData?.data, globalState.columns, globalState.editingCells])

  useImperativeHandle(ref, () => ({
    validate: validateData,
    clearActiveRow: () => {
      setGlobalStateByKey('activeRow', null);
    },
    clearSelectedRows: () => {
      setGlobalStateByKey('selectedRows', []);
    },
    getSelectedRows: (selectedRows) => selectedRows?.(globalState.selectedRows)
  }));
  /** Custom Functions End */

  /** UseEffects Start */
  useEffect(() => {
    setGlobalStateByKey('initialData', props?.fetchConfig ? globalState.fetchedData?.data : props?.dataSource);
  }, [props?.fetchConfig, props?.dataSource]);

  useEffect(() => {
    setGlobalStateByKey('localData', props?.dataSource);
  }, [props?.dataSource]);

  useEffect(() => {
    setGlobalStateByKey('selectedRows', props?.selectedRows ?? []);
  }, [props?.selectedRows]);

  useEffect(() => {
    setGlobalStateByKey('activeRow', props?.activeRow ?? '');
  }, [props?.activeRow]);

  /** Save current columnSettings if not yet saved in localstorage on mount */
  useEffect(() => {
    if (!!props?.localStorageSettingsKey) {
      const savedCurrentColumnSettings = JSON.parse(sessionStorage.getItem(`${props?.localStorageSettingsKey}-currentColumnSettings`) || '[]');

      if (!savedCurrentColumnSettings.length) {
        sessionStorage.setItem(`${props?.localStorageSettingsKey}-currentColumnSettings`, JSON.stringify(serializeColumns(props.columnSettings)));
      }
    }
  }, []);

  // Resize observer setup
  useEffect(() => {
    const observeTable = tableRef.current;
    if (observeTable) {
      const resizeObserver = new ResizeObserver(entries => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Clear the existing timeout

        // Set a new timeout to update the width
        timeoutRef.current = setTimeout(() => {
          for (let entry of entries) {
            setGlobalStateByKey('observedWidth', entry.contentRect.width);
          }
        }, 100); // Delay in ms, adjust as needed
      });

      resizeObserver.observe(observeTable);

      return () => {
        resizeObserver.unobserve(observeTable);
        if (timeoutRef.current) clearTimeout(timeoutRef.current); // Clean up the timeout
      };
    }
  }, [tableRef.current]); // Depend on tableRef.current and setObservedWidth to re-run if these change

  useEffect(() => {
    const { columnSettings, collapsibleRowRender, customRowSettings, actions } = props;

    if (tableRef.current) {
      setGlobalStateByObj({
        tableWidth: tableRef.current.offsetWidth,
        columns: setColumnSettings(
          columnSettings,
          getTotalWidth(globalState.observedWidth, !!collapsibleRowRender, selectable),
          customRowSettings,
          actions,
          actionColumnSetting,
          props?.localStorageSettingsKey,
          actionsDropdownItems,
          globalState.columns
        )
      });
    }
  }, [tableRef, props?.columnSettings, props?.customRowSettings, props?.actions, globalState.observedWidth]); // Include observedWidth in the dependency array

  useEffect(() => {
    if (!!props?.fetchConfig) {
      const hasStateChanged = globalState.pageIndex !== pageIndex
        || globalState.pageSize !== pageSize
        || globalState.search !== null;

      if (hasStateChanged) {
        const sortedColumn = globalState.columns?.find(col => col.sorted && col.sorted !== 'none');
        const sortColumn = sortedColumn?.column || 'none';
        const sortDirection = sortedColumn?.sorted || 'none';

        fetchWithPagination(sortColumn, sortDirection);
      }
    }
  }, [globalState.search, globalState.pageIndex, globalState.pageSize, globalState.filterValues, globalState.advanceFilterValues, pageIndex, pageSize, props?.fetchConfig]);

  useEffect(() => {
    /** Update local page index if pageindex props is changed */
    setGlobalStateByKey('pageIndex', pageIndex);
  }, [pageIndex]);

  useEffect(() => {
    /** Update local page size if pageindex props is changed */
    setGlobalStateByKey('pageSize', pageSize);
  }, [pageSize]);

  useEffect(() => {
    /** If global search is not empty */
    if ((globalState.search !== undefined || globalState.search !== '' || isObjectValuesEmpty(globalState.filterValues)) && globalState.pageIndex !== 0) {
      setGlobalStateByKey('pageIndex', 0);
    }
  }, [globalState.search, globalState.filterValues]);

  /** Do fetchPageData on globalState change */
  useEffect(() => {
    if (props?.ssrConfig?.fetchPageData) {
      props.ssrConfig.fetchPageData({
        pageIndex: globalState.pageIndex,
        pageSize: globalState.pageSize,
        searchQuery:  globalState.search,
        filterValues: globalState.filterValues
      });
    }
  }, [globalState.pageIndex, globalState.pageSize, props?.ssrConfig?.fetchPageData, globalState.filterValues, globalState.search]);

  useEffect(() => {
    const { fetchConfig, onDataChange } = props;
    let data: any = null;
    let totalData: any = null;

    if (fetchConfig) {
      data = globalState.fetchedData?.data;
      totalData = globalState.fetchedData?.totalData;
    } else {
      data = globalState.localData;
      totalData = globalState.localData?.length;
    }

    onDataChange?.({
      data,
      totalData,
      filteredData,
      pageIndex: globalState.pageIndex,
      internalPageIndex: globalState.pageIndex,
      pageSize: globalState.pageSize,
      selectedRows: globalState.selectedRows,
    });

  }, [props?.fetchConfig, globalState.selectedRows, globalState.localData, globalState.fetchedData, globalState.pageIndex, globalState.pageSize]);

  useEffect(() => {
    const handleClickOutside = debounce((event) => {
      /** Add class to disable trigger save when clicked  */
      if (event.target.closest('.form-control-dropdown-options-container') ||
        event.target.closest('.table-cell.is-in-editable-status') ||
        event.target.closest('.flatpickr-calendar') ||
        event.target.closest('.custom-action-column') ||
        (event.target.closest('.table-inner-wrapper') && !event.target.closest('.table-inner-container'))
      ) {
        return;
      } else {
        doEditBasedOnEditingCells();
      }

      if (!event.target.closest('.action-dropdown-container')) {
        if (globalState.showActionDropdown !== false) {
          setGlobalStateByKey('showActionDropdown', false);
        }
      }
    }, 150);

    const handlePressEscape = (e) => {
      if (e.key === "Escape") {
        doEditBasedOnEditingCells(false);
      }
    };

    const handleScroll = () => {
      if (globalState.showActionDropdown !== false) {
        setGlobalStateByKey('showActionDropdown', false);
      }
    }

    /** Add event listener */
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handlePressEscape);
    document.addEventListener('scroll', handleScroll);
    tableInnerWrapperRef?.current?.addEventListener('scroll', handleScroll);

    return () => {
      /** Cleanup  */
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handlePressEscape);
      document.removeEventListener('scroll', handleScroll);
      tableInnerWrapperRef?.current?.removeEventListener('scroll', handleScroll);
    };
  }, [globalState.editingCells, globalState.showActionDropdown]);

  // Update state when actions prop is changed
  useEffect(() => {
    const { actions, fetchConfig } = props;
    const dataSource = fetchConfig ? globalState.fetchedData?.data : globalState.localData;
    const hasAddAction = !!(actions as any)?.find(i => i === Actions.ADD);
    const hasEditAction = !!(actions as any)?.find(i => i === Actions.EDIT);
    const hasAddRow = isValidArray(dataSource) && !!dataSource?.find(i => i.intentAction === "*");
    if (!hasAddAction && hasAddRow) {
      if (fetchConfig) {
        const newFetchedData = [...(globalState?.fetchedData!.data || [])].filter(i => i.intentAction !== "*");
        setGlobalStateByKey('globalState?.fetchedData', { ...globalState?.fetchedData!, data: newFetchedData });
      } else {
        const newLocalData = [...(globalState.localData || [])].filter(i => i.intentAction !== "*");
        setGlobalStateByKey('localData', newLocalData);
      }
      setGlobalState(prev => ({
        ...prev, 
        editingCells: prev.editingCells.filter(i => i.isNew !== true)
      }));
    }

    if (!hasEditAction) {
      setGlobalStateByKey('selectedCell', null);
    }
  }, [props?.actions, globalState.localData]);

  useEffect(() => {
    const rows = props?.fetchConfig ? globalState.fetchedData?.data : visibleRows;
    const handleKeyDown = (e) => {
      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && globalState.selectedCell !== null) {
        const rowData = rows?.[globalState.selectedCell.rowIndex];
        const columnText = getDeepValue(rowData, globalState.selectedCell.column);
        navigator.clipboard.writeText(columnText);
      }


      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        /** Cmd + Z for undo */
        e.preventDefault();
        handleUndoEditCell();
      }

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        /** Cmd + Y for undo */
        e.preventDefault();
        handleRedoEditCell();
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [globalState.selectedCell, visibleRows]);
  /** UseEffects End */

  const handleColumnWidthChange = (index, newWidth) => {
    const { columns, tableWidth } = globalState;

    const columnWidthUpdatedWidths = updateWidthByIndex(columns, index, newWidth);
    const defaultWidth = getColumnDefaultWidth(columnWidthUpdatedWidths, tableWidth! - 12);

    const updatedColumns = columnWidthUpdatedWidths.map(i => ({...i, defaultWidth}));

    handleOnColumnSettingsChange(updatedColumns);
    setGlobalStateByKey('columns', updatedColumns);
  };

  return (
    <GlobalStateProvider
      values={{
        /** Pass all props */
        ...props,

        /** Pass props with pre-set value */
        pageSize,
        pageIndex,
        selectable,
        downloadXLS,
        uploadXLS,
        activeRow,
        headerSearchSettings,
        hideFooter,
        isPermanentDelete,
        headerRightControls,
        actionColumnSetting,
        isAddDisabled,
        showPreviousValue,
        isLoading,
        disabledPagination,
        minPageSize,
        multiSelect,
        downloadHiddenColumn,

        /** Variable within the main file */
        visibleRows,
        filteredData,
        dropTargetIndex,
        draggedColumnIndex,
        filterSettings: props?.fetchConfig?.filterSettings,
        onDragStart,
        onDragEnd,
        onDragOver,
        onDrop,
        onAddRow,
        onDeleteRow,
        onSave,
        onCancel,
        onUndo,
        onPasteRow,
        hasAction,
        hasAnyFilterConfig,
        rightPanelToggleButtonRef,
        selectionRangeRef,
        fetchWithPagination,
        isAllColumnHidden,
        onColumnSettingsChange: handleOnColumnSettingsChange,
        handleDoCellEdit,
        handleDoCellEditOnChange,
        handleRowClick,

        /** Context state to be use in the component*/
        globalState,
        setGlobalState,
      }}
    >
      <BulkDeletePanel/>
      <SC.TableWrapper ref={tableRef}>
        {!!headerRightControls && !!shouldShowHeader && <RightPanel/>}
        <SC.Loader
          hasHeader={!!shouldShowHeader}
          hasFooter={!hideFooter}
          show={globalState.isFetching || isLoading}
        />
        {!!shouldShowHeader && <MainHeader />}
        <ResizeWrapper
          columns={globalState.columns}
          onColumnWidthChange={handleColumnWidthChange}
          resizeHandleClassName="resize-handle"
          parentCellClassName="table-cell"
        >
          <SC.Table onDragLeave={onDragLeave}>
            {globalState.tableWidth !== null ? (
              <SC.TableInnerWrapper
                className="table-inner-wrapper"
                ref={tableInnerWrapperRef}
                style={{ maxHeight: props?.tableMaxHeight ?? props?.tableHeight ?? 156, height: props?.tableHeight }}
              >
                <div
                  className="table-inner-container"
                  style={{ ...getTableWidth({...globalState, ...props, isAllColumnHidden}) }}
                >
                  <ColumnGroupHeader />
                  <ColumnHeader />
                  <ColumnFilters />
                  <Rows />
                </div>
              </SC.TableInnerWrapper>
            ) : <LoadingPanel>Loading Rows...</LoadingPanel>}
          </SC.Table>
        </ResizeWrapper>
        {!hideFooter && <Footer />}
      </SC.TableWrapper>
    </GlobalStateProvider>
  )
});

export { getDeepValue, getValue, setDeepValue, replaceLocalhostWithDomain, UploadCell };
