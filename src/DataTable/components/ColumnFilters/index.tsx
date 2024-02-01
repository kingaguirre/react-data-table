import React from "react";
import { TableRow, TableCell } from "../Rows/styled";
import { ColumnDragHighlighter } from "../Rows";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import { SET_FILTER_VALUES } from "../../context/actions";
import { DataTableContext } from "../../index";
import { getPinnedDetails } from "../../utils";

export const ColumnFilters = () => {
  const {
    state: { filterValues, columns },
    setState,
    collapsibleRowRender,
    selectable,
    hasAnyFilterConfig
  } = React.useContext(DataTableContext);

  let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);

  if (!hasAnyFilterConfig) {
    return null;
  }

  const handleSetFilterValues = (value: any, column: string) => {
    setState({ type: SET_FILTER_VALUES, payload: {
      ...filterValues,
      [column]: value,
    }})
  };

  const handleSetFilterObjValues = (value: any, column: string, isMin: boolean = false) => {
    setState({ type: SET_FILTER_VALUES, payload: {
      ...filterValues,
      [column]: {
        ...filterValues[column],
        [isMin ? "min" : "max"]: value,
      },
    }})
  };

  return (
    <TableRow>
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn/>
      {columns.map((col, index) => {
        if (col.hidden) return null;

        const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

        if (isPinned) {
          pinnedWidth += colWidth;
        }

        return (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            isPinned={isPinned}
            style={pinnedStyle}
          >
            {(col.filterConfig) ? col.filterConfig.type === "text" ? (
              <input
                className="sm"
                type="text"
                value={filterValues[col.column] || ""}
                onChange={e => handleSetFilterValues(e.target.value, col.column)}
              />
            ) : col.filterConfig.type === "select" ? (
              <select
                className="sm"
                value={filterValues[col.column] || ""}
                onChange={e => handleSetFilterValues(e.target.value, col.column)}
              >
                {col.filterConfig.options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option.value}>
                    {option.text}
                  </option>
                ))}
              </select>
            ) : col.filterConfig.type === "number-range" ? (
              <div>
                <input
                  className="sm"
                  type="number"
                  value={filterValues[col.column]?.min || ""}
                  onChange={e => handleSetFilterObjValues(e.target.value, col.column, true)}
                  placeholder="Min"
                />
                <input
                  className="sm"
                  type="number"
                  value={filterValues[col.column]?.max || ""}
                  onChange={e => handleSetFilterObjValues(e.target.value, col.column, false)}
                  placeholder="Max"
                />
              </div>
              ) : col.filterConfig.type === "date-range" ? (
                <div>
                  <input
                    className="sm"
                    type="date"
                    value={filterValues[col.column]?.min || ""}
                    onChange={e => handleSetFilterObjValues(e.target.value, col.column, true)}
                    placeholder="Min"
                  />
                  <input
                    className="sm"
                    type="date"
                    value={filterValues[col.column]?.max || ""}
                    onChange={e => handleSetFilterObjValues(e.target.value, col.column, false)}
                    placeholder="Max"
                  />
                </div>
              ) : null : null}
            <ColumnDragHighlighter index={index}/>
          </TableCell>
        )
      })}
    </TableRow>
  )
}