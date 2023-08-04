import React from "react";
import { TableRow, TableCell } from "../Rows/styled";
import SelectCheckboxColumn from "../SelectCheckboxColumn";
import CollapsibleRowColumn from "../CollapsibleRowColumn";
import { SET_FILTER_VALUES } from "../../context/actions";
import { DataTableContext } from "../../index";

export default () => {
  const {
    state: { filterValues, columns },
    setState
  } = React.useContext(DataTableContext);

  const anyFilterBy = columns.some(col => col.filterBy);
  let frozenWidth = 0;

  if (!anyFilterBy) {
    return null;
  }

  const handleSetFilterValues = (value: any, column: string) => {
    setState({ type: SET_FILTER_VALUES, payload: {
      ...filterValues,
      [column]: value,
    }})
  };

  return (
    <TableRow>
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn/>
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
                className="sm"
                type="text"
                value={filterValues[col.column]}
                onChange={e => handleSetFilterValues(e.target.value, col.column)}
              />
            ) : col.filterBy.type === "select" ? (
              <select
                className="sm"
                value={filterValues[col.column]}
                onChange={e => handleSetFilterValues(e.target.value, col.column)}
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