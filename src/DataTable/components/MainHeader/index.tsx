import React, { useContext, useRef, useEffect, useState, useCallback, ChangeEvent } from "react";
import { exportToCsv, exportToExcel, setColumnSettings } from "../../utils";
import { SET_COLUMNS, SET_SEARCH} from "../../context/actions";
import { DataTableContext } from "../../index";
import * as SC from "./styled";

export const MainHeader = () => {
  const {
    filterAll,
    downloadCSV,
    visibleRows,
    state: { columns, search, selectedRows, tableWidth },
    setState,
    onColumnSettingsChange,
    onResetClick,
  } = useContext(DataTableContext);

  const settingsContainerRef: any = useRef<any>(null);
  const toggleButtonRef: any = useRef<any>(null);

  const [isDropdownOpen, setDropdownOpen] = useState(false);

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

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setState({ type: SET_SEARCH, payload: event.target.value });
  }, [search, setState]);

  const handleColumnVisibilityChange = useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hidden = !newColumns[columnIndex].hidden;

    setState({ type: SET_COLUMNS, payload: newColumns });
    onColumnSettingsChange?.(newColumns);

    localStorage.setItem('currentColumnSettings', JSON.stringify(newColumns));
  }, [columns, onColumnSettingsChange, setState]);

  const handleResetClick = () => {
    const defaultColumnSettings = JSON.parse(localStorage.getItem('defaultColumnSettings') || '[]');
    localStorage.setItem('currentColumnSettings', JSON.stringify(defaultColumnSettings));

    const currentSettings = setColumnSettings(defaultColumnSettings, tableWidth);
    setState({ type: SET_COLUMNS, payload: currentSettings });
    onResetClick?.(currentSettings);
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
      <SC.ControlsWrapper>
        {!!downloadCSV && (
          <button onClick={() => {
            exportToCsv('data.csv', selectedRows > 0 ? selectedRows : visibleRows, columns);
            exportToExcel('data', selectedRows > 0 ? selectedRows : visibleRows, columns);
          }}>
            <i className="fa fa-download"/>
          </button>
        )}
        <button ref={toggleButtonRef} onClick={() => setDropdownOpen(prev => !prev)}>
          <i className="fa fa-gear"/>
        </button>
        <button onClick={handleResetClick}>
          <i className="fa fa-rotate-left"/>
        </button>
      </SC.ControlsWrapper>
      <SC.SettingsContainer ref={settingsContainerRef} className={`${isDropdownOpen ? 'is-visible' : ''}`}>
        {columns.map((col, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={!col.hidden}
              onChange={() => handleColumnVisibilityChange(index)}
            />
            <span>{col.title}</span>
          </label>
        ))}
      </SC.SettingsContainer>
    </SC.MainHeaderWrapper>
  )
}