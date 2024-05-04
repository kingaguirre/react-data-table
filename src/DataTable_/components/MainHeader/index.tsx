import React, { useContext, useRef, useEffect, useState, useCallback, ChangeEvent } from "react";
import { setColumnSettings, isStringExist, setDeepValue, downloadExcel } from "../../utils";
import { SET_COLUMNS, SET_SEARCH, SET_ADVANCE_FILTER_VALUES } from "../../context/actions";
import { DataTableContext } from "../../index";
import { Actions } from "../../interfaces";
import FilterComponent from "../FilterComponent";
import { UploadButton } from './UploadButton';
import * as SC from "./styled";
import { useFlasher } from '../GlobalStateTest/utils';
import { withState, IComponent } from '../GlobalStateProvider';

export const MainHeader = withState({
  states: [
    'filterAll',
    'downloadXLS',
    'fetchConfig',
    'columnSettings',
    'filterSettings',
    'customRowSettings',
    'actions',
    'onAddRow',
    'rowKey',
    'columns',
    'search',
    'selectedRows',
    'tableWidth',
    'fetchedData',
    'localData',
    'onResetClick',
    'editingCells',
    'rightPanelToggleButtonRef',
    // 'setRightPanelToggle',
    // 'setSearch',
    // 'setColumns',
    'advanceFilterValues',
    // 'rightPanelToggle',
    // 'setGlobalStateByKey',
    'setGlobalState'
  ],
})(React.memo((props: IComponent) => {
  const {
    filterAll,
    downloadXLS,
    fetchConfig,
    columnSettings,
    filterSettings,
    customRowSettings,
    actions,
    onAddRow,
    rowKey,
    columns,
    search,
    selectedRows,
    tableWidth,
    fetchedData,
    localData,
    onResetClick,
    editingCells,
    rightPanelToggleButtonRef,
    // setRightPanelToggle,
    // setSearch,
    // setColumns,
    advanceFilterValues,
    // rightPanelToggle,
    // setState
    // setGlobalStateByKey,
    setGlobalState
  } = props;

  const downloadDropdownRef = useRef(null);
  const isAddEnabled = isStringExist(actions, Actions.ADD);
  const isAddDisabled = editingCells?.some(i => i?.isNew === true);
  const dataSource = fetchConfig ? fetchedData.data : localData;

  const [showDownload, setShowDownload] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current.contains(event.target)
      ) {
        setShowDownload(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    // setState?.(event.target.value, 'search')
    setGlobalState((prev) => ({...prev, search: event.target.value}))
    // setGlobalStateByKey('search', event.target.value);
    // setSearch?.(event.target.value)
    // setState({ type: SET_SEARCH, payload: event.target.value });
  };

  const handleResetClick = () => {
    localStorage.setItem('currentColumnSettings', JSON.stringify(columnSettings));

    const currentSettings = setColumnSettings(columnSettings, tableWidth, customRowSettings, actions);
    setGlobalState((prev) => ({...prev, columns: currentSettings}))
    // setGlobalStateByKey('columns', currentSettings);
    // setColumns(currentSettings)
    // setState({ type: SET_COLUMNS, payload: currentSettings });
    onResetClick?.(currentSettings);
  };

  // const setFilterValues = (values: any) => setState({ type: SET_ADVANCE_FILTER_VALUES, payload: values});
  const setFilterValues = (values: any) => advanceFilterValues(values);

  const handleOnAddRow = () => {
    const newData = setDeepValue({
      intentAction: "*"
    }, rowKey, `new-${new Date().getTime()}`);
    onAddRow(newData, undefined, true);
  };

  return (
    <SC.MainHeaderWrapper ref={useFlasher()}>
      {!!filterAll && (
        <SC.SearchWrapper>
          <input
            type="text"
            value={search || ""}
            onChange={handleSearchChange}
            placeholder="Search..."
          />
          <i className="fa fa-search"/>
        </SC.SearchWrapper>
      )}
      {!!filterSettings && !!filterSettings.length && (
        <> 
          <button onClick={() => setShowFilter(!showFilter)}>Filter</button>
          {showFilter && (
            <FilterComponent
              filterSettings={filterSettings}
              onApply={(values) => setFilterValues(values)}
              onChange={(data) => console.log(data)}
            />
          )}
        </>
      )}
      <SC.ControlsWrapper>
        {isAddEnabled && <button className="add-button" disabled={isAddDisabled} onClick={handleOnAddRow}>Add</button>}
        {!!downloadXLS && (
          <SC.DownloadWrapper>
            <button onClick={() => setShowDownload(!showDownload)}>
              <i className="fa fa-download"/>
            </button>
            {showDownload && (
              <SC.DownloadDropdown ref={downloadDropdownRef}>
                <span onClick={() => {
                  downloadExcel(columns, dataSource);
                }}>Download All</span>
                <span onClick={() => {
                  downloadExcel(columns, selectedRows);
                }}>Download selected</span>
              </SC.DownloadDropdown>
            )}
          </SC.DownloadWrapper>
        )}
        <UploadButton/>
        <button ref={rightPanelToggleButtonRef} onClick={() => setGlobalState((prev) => ({...prev, rightPanelToggle: !prev.rightPanelToggle}))}>
          <i className="fa fa-gear"/>
        </button>
        <button onClick={handleResetClick}>
          <i className="fa fa-rotate-left"/>
        </button>
      </SC.ControlsWrapper>
    </SC.MainHeaderWrapper>
  )
}));
