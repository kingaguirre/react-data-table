import React from "react";
import { exportToCsv } from "../../utils";
import { SET_COLUMNS, SET_SEARCH} from "../../context/actions";
import { DataTableContext } from "../../index";
import * as SC from "./styled";

export default () => {
  const {
    visibleRows,
    state: { columns, search },
    setState,
    onColumnSettingsChange,
  } = React.useContext(DataTableContext);

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ type: SET_SEARCH, payload: event.target.value });
  }, [search, setState]);

  const handleColumnVisibilityChange = React.useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hidden = !newColumns[columnIndex].hidden;

    setState({ type: SET_COLUMNS, payload: newColumns });
    onColumnSettingsChange?.(newColumns);
  }, [columns, onColumnSettingsChange, setState]);

  return (
    <SC.MainHeaderWrapper>
      <SC.SearchWrapper>
        <input
          type="text"
          value={search || ""}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
      </SC.SearchWrapper>
      <SC.ControlsWrapper>
        <button onClick={() => exportToCsv('data.csv', visibleRows, columns)}>
          <i className="fa fa-download"/>
        </button>
        <button onClick={() => setDropdownOpen(prev => !prev)}>
          <i className="fa fa-gear"/>
        </button>
        <button onClick={() => {}}>
          <i className="fa fa-rotate-left"/>
        </button>
      </SC.ControlsWrapper>
      <SC.SettingsContainer className={`${isDropdownOpen ? 'is-visible' : ''}`}>
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