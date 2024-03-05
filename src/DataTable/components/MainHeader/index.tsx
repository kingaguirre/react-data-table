import React, { useContext, useRef, useEffect, useState, useCallback, ChangeEvent } from "react";
import { exportToCsv, setColumnSettings, isStringExist, setDeepValue, downloadExcel } from "../../utils";
import { SET_COLUMNS, SET_SEARCH, SET_ADVANCE_FILTER_VALUES} from "../../context/actions";
import { DataTableContext } from "../../index";
import { Actions } from "../../interfaces";
import FilterComponent from "../FilterComponent";
import * as SC from "./styled";

export const MainHeader = () => {
  const {
    filterAll,
    downloadCSV,
    fetchConfig,
    columnSettings,
    filterSettings,
    customRowSettings,
    actions,
    onAddRow,
    rowKey,
    state: { columns, search, selectedRows, tableWidth, fetchedData, localData },
    setState,
    onColumnSettingsChange,
    onResetClick,
    editingCells,
  } = useContext(DataTableContext);

  const downloadDropdownRef = useRef(null);
  const settingsContainerRef: any = useRef<any>(null);
  const toggleButtonRef: any = useRef<any>(null);
  const isAddEnabled = isStringExist(actions, Actions.ADD);
  const isAddDisabled = editingCells?.some(i => i?.isNew === true);
  const dataSource = fetchConfig ? fetchedData.data : localData;

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Temporary state to hold column visibility changes
  const [tempColumnVisibility, setTempColumnVisibility] = useState(
    columns.reduce((acc, col) => {
      if (col.class !== "custom-action-column") {
        acc[col.column] = !col.hidden;
      }
      return acc;
    }, {})
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
  
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

  const handleColumnVisibilityChange = useCallback((columnName, isVisible) => {
    setTempColumnVisibility(prevState => ({
      ...prevState,
      [columnName]: isVisible,
    }));
  }, [tempColumnVisibility]);

  const applyColumnVisibilityChange = () => {
    const newColumns = columns.map(col => ({
      ...col,
      hidden: col.column in tempColumnVisibility ? !tempColumnVisibility[col.column] : col.hidden,
    }));

    setState({ type: SET_COLUMNS, payload: newColumns });
    onColumnSettingsChange?.(newColumns);
    // localStorage.setItem('currentColumnSettings', JSON.stringify(newColumns));
  };

  const handleResetSettingsClick = () => {
    const resetColumns = columns.map(col => ({ ...col, hidden: false }));
    setState({ type: SET_COLUMNS, payload: resetColumns });
    onResetClick?.(resetColumns);
    localStorage.setItem('currentColumnSettings', JSON.stringify(resetColumns));

    // Update tempColumnVisibility to reflect the reset
    setTempColumnVisibility(resetColumns.reduce((acc, col) => {
      acc[col.column] = !col.hidden;
      return acc;
    }, {}));
  };

  // Compare tempColumnVisibility with stored currentColumnSettings to determine button state
  const isResetButtonDisabled = () => {
    const currentSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');
    return currentSettings.every(col => tempColumnVisibility[col.column] === !col.hidden);
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
        {!!downloadCSV && (
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
        <button ref={toggleButtonRef} onClick={() => setDropdownOpen(prev => !prev)}>
          <i className="fa fa-gear"/>
        </button>
        <button onClick={handleResetClick}>
          <i className="fa fa-rotate-left"/>
        </button>
      </SC.ControlsWrapper>
      <SC.SettingsContainer ref={settingsContainerRef} className={`${isDropdownOpen ? 'is-visible' : ''}`}>
        <SC.SettingsHeader>Visible columns</SC.SettingsHeader>
        {columns
          .filter(col => col.class !== "custom-action-column")
          .map((col, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={col.column in tempColumnVisibility ? tempColumnVisibility[col.column] : !col.hidden}
              onChange={(e) => handleColumnVisibilityChange(col.column, e.target.checked)}
            />
            <span>{col.title}</span>
          </label>
        ))}
        <SC.SettingsFooter>
          <button
            onClick={handleResetSettingsClick}
            disabled={isResetButtonDisabled()}
          >Reset</button>
          <div>
            <button onClick={() => setDropdownOpen(false)}>Cancel</button>
            <button onClick={applyColumnVisibilityChange}>Apply</button>
          </div>
        </SC.SettingsFooter>
      </SC.SettingsContainer>
    </SC.MainHeaderWrapper>
  )
}