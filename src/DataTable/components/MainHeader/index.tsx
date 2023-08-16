import { useContext, useState, useCallback, ChangeEvent, useEffect } from "react";
import { exportToCsv } from "../../utils";
import { SET_COLUMNS, SET_SEARCH } from "../../context/actions";
import { DataTableContext } from "../../index";
import * as SC from "./styled";

export const MainHeader = () => {
  const {
    filterAll,
    downloadCSV,
    visibleRows,
    state: { columns, search, selectedRows },
    setState,
    onColumnSettingsChange,
  } = useContext(DataTableContext);

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target;

      const isGearButton = target.closest("button") && target.closest("button").querySelector(".fa-gear");
      const isSettingsContainer = target.closest(".SettingsContainer");
      
      if (isDropdownOpen && !isGearButton && !isSettingsContainer) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isDropdownOpen]);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setState({ type: SET_SEARCH, payload: event.target.value });
  }, [search, setState]);

  const handleColumnVisibilityChange = useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hidden = !newColumns[columnIndex].hidden;

    setState({ type: SET_COLUMNS, payload: newColumns });
    onColumnSettingsChange?.(newColumns);
  }, [columns, onColumnSettingsChange, setState]);

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
          <button onClick={() => exportToCsv('data.csv', selectedRows > 0 ? selectedRows : visibleRows, columns)}>
            <i className="fa fa-download"/>
          </button>
        )}
        <button onClick={() => setDropdownOpen(prev => !prev)}>
          <i className="fa fa-gear"/>
        </button>
      </SC.ControlsWrapper>
      <SC.SettingsContainer className={`SettingsContainer ${isDropdownOpen ? 'is-visible' : ''}`}>
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
