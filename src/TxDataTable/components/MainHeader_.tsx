import React from "react";
import { TableHeader } from "../styled";
import { exportToCsv } from "../utils";
import { SET_COLUMNS, SET_SEARCH} from "../context/actions";
import { DataTableContext } from "../index";

export default () => {
  const {
    visibleRows,
    state: { columns, search },
    setState,
    onColumnSettingsChange
  } = React.useContext(DataTableContext);

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ type: SET_SEARCH, payload: event.target.value });
  }, [search, setState]);

  const handleColumnVisibilityChange = React.useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hide = !newColumns[columnIndex].hide;

    setState({ type: SET_COLUMNS, payload: newColumns });
    onColumnSettingsChange?.(newColumns);
  }, [columns, onColumnSettingsChange, setState]);

  return (
    <TableHeader>
      <input
        type="text"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search..."
      />
      <button onClick={() => setDropdownOpen(prev => !prev)}>
        Column Visibility
      </button>
      {isDropdownOpen && (
        <div style={{ position: 'absolute', backgroundColor: 'white', zIndex: 20 }}>
          {columns.map((col, index) => (
            <div key={index}>
              <input
                type="checkbox"
                checked={!col.hide}
                onChange={() => handleColumnVisibilityChange(index)}
              />
              <label>{col.title}</label>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => exportToCsv('data.csv', visibleRows, columns)}>Export to Excel</button>
    </TableHeader>
  )
}