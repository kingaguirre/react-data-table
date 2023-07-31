import React from "react";
import { TableRow, TableCell } from "../styled";
import { ColumnSettings } from "../interfaces";

interface IProps {
  selectable?: boolean;
  columns: ColumnSettings[];
  filterValues: any;
  setFilterValues: React.Dispatch<React.SetStateAction<{}>>;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
}

export default (props: IProps) => {
  const { selectable, columns, filterValues, setFilterValues, collapsibleRowRender } = props;

  const anyFilterBy = columns.some(col => col.filterBy);
  let frozenWidth = 0;

  if (!anyFilterBy) {
    return null;
  }

  return (
    <TableRow>
      {selectable && <TableCell width="42px" />}
      {collapsibleRowRender && <TableCell width="38px" />}
      {columns.map((col, index) => {
        if (col.hide) return null;
        const isFrozen = col.freeze;
        if (isFrozen) {
          frozenWidth += parseInt(col.width || "", 10);
        }
        return (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: '#fff' } : {}}
          >
            {(col.filterBy) ? col.filterBy.type === "text" ? (
              <input
                type="text"
                value={filterValues[col.column]}
                onChange={e => {
                  setFilterValues(prev => ({
                    ...prev,
                    [col.column]: e.target.value,
                  }));
                }}
              />
            ) : col.filterBy.type === "select" ? (
              <select
                value={filterValues[col.column]}
                onChange={e => {
                  setFilterValues(prev => ({
                    ...prev,
                    [col.column]: e.target.value,
                  }));
                }}
              >
                {col.filterBy.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            ) : null : null}
          </TableCell>
        )
      })}
    </TableRow>
  )
}