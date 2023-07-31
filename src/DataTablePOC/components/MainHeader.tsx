import React from "react";
import { TableHeader } from "../styled";
import { ColumnSettings } from "../interfaces";
import { exportToCsv } from "../utils";

interface IProps {
  columns: ColumnSettings[];
  visibleRows: any[];
  search: string;
  setSearch: (value: React.SetStateAction<string>) => void;
  setColumns: React.Dispatch<React.SetStateAction<ColumnSettings[]>>;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
}

export default (props: IProps) => {
  const { columns, visibleRows, search, setSearch, setColumns, onColumnSettingsChange } = props;

  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value), []);

  const handleColumnVisibilityChange = React.useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hide = !newColumns[columnIndex].hide;
    setColumns(newColumns);
    onColumnSettingsChange?.(newColumns);
  }, [columns, onColumnSettingsChange]);

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