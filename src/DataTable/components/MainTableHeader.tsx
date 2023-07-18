import React, { useState, useCallback } from 'react';
import { exportToCsv } from "../utils"
import { TableHeader } from '../styled';
import { ColumnSettings } from '../interface';

interface IProps {
  columns: ColumnSettings[];
  setColumns: (value: ColumnSettings[]) => void;
  search: string;
  setSearch: (value: string) => void;
  visibleRows: any[];
  onColumnSettingsChange: (newColumnSettings: ColumnSettings[]) => void;
}

export default (props: IProps) => {
  const { columns, setColumns, search, setSearch, visibleRows, onColumnSettingsChange } = props;
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const handleColumnVisibilityChange = useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hide = !newColumns[columnIndex].hide;
    setColumns(newColumns);
    if (onColumnSettingsChange) {
      onColumnSettingsChange(newColumns);
    }
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