import React, { useContext, useRef, useEffect, useState, useCallback, ChangeEvent } from "react";
import { setColumnSettings, isStringExist, setDeepValue, downloadExcel } from "../../utils";
import { SET_COLUMNS, SET_SEARCH, SET_ADVANCE_FILTER_VALUES } from "../../context/actions";
import { DataTableContext } from "../../index";
import { Actions } from "../../interfaces";
import FilterComponent from "../FilterComponent";
import { UploadButton } from './UploadButton';
import * as SC from "./styled";

export const MainHeader = () => {
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
    state: { columns, search, selectedRows, tableWidth, fetchedData, localData },
    setState,
    onResetClick,
    editingCells,
    rightPanelToggleButtonRef,
    setRightPanelToggle
  } = useContext(DataTableContext);

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
  
  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setState({ type: SET_SEARCH, payload: event.target.value });
  }, [search, setState]);

  const handleResetClick = () => {
    localStorage.setItem('currentColumnSettings', JSON.stringify(columnSettings));

    const currentSettings = setColumnSettings(columnSettings, tableWidth, customRowSettings, actions);
    setState({ type: SET_COLUMNS, payload: currentSettings });
    onResetClick?.(currentSettings);
  };

  const setFilterValues = (values: any) => setState({ type: SET_ADVANCE_FILTER_VALUES, payload: values});

  const handleOnAddRow = () => {
    const newData = setDeepValue({
      intentAction: "*"
    }, rowKey, `new-${new Date().getTime()}`);
    onAddRow(newData, undefined, true);
  };

  return (
    <SC.MainHeaderWrapper>
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
                  downloadExcel(columns, dataSource, rowKey);
                }}>Download All</span>
                <span onClick={() => {
                  downloadExcel(columns, selectedRows, rowKey);
                }}>Download selected</span>
              </SC.DownloadDropdown>
            )}
          </SC.DownloadWrapper>
        )}
        <UploadButton/>
        <button ref={rightPanelToggleButtonRef} onClick={() => setRightPanelToggle(prev => !prev)}>
          <i className="fa fa-gear"/>
        </button>
        <button onClick={handleResetClick}>
          <i className="fa fa-rotate-left"/>
        </button>
      </SC.ControlsWrapper>
    </SC.MainHeaderWrapper>
  )
}