import React, { useEffect, useContext, useState, useCallback, Fragment, useRef } from "react";
import {
  useDoubleClick,
  getDeepValue,
  highlightText,
  getPinnedDetails,
  mergeCustomStylesForRow,
  setDeepValue,
  isStringExist,
  areArraysOfObjectsEqual,
  findUpdatedIndex,
  getValue
} from "../../utils"
import { SET_ACTIVE_ROW, SET_SELECTED_ROWS, SET_LOCAL_DATA, SET_FETCHED_DATA } from "../../context/actions";
import { DataTableContext } from "../../index";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";
import { Actions } from "../../interfaces";
import Ajv from "ajv";

export const Rows = () => {
  const {
    rowKey,
    visibleRows,
    clickableRow,
    collapsibleRowHeight,
    fetchConfig,
    selectable,
    customRowSettings,
    actions,
    onChange,
    state: { selectedRows, activeRow, columns, search, fetchedData, localData },
    setState,
    onMouseDown,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onSelectedRowsChange,
    editingCells,
    setEditingCells
  } = useContext(DataTableContext);

  const cellRefs = useRef({});
  const [collapsedRows, setCollapsedRows] = useState<string[]>([]);
  const [addedRow, setAddedRow] = useState<number>(-1);
  // At the beginning of your functional component
  const [selectedColumn, setSelectedColumn] = useState<any>(null);

  const isEditable = isStringExist(actions, Actions.EDIT);
  const ajv = new Ajv();
  /** Use fetchedData.data when fetchConfig is defined, otherwise use visibleRows */
  const isFetching = fetchConfig && fetchedData.fetching;
  const rows = fetchConfig ? fetchedData.data : visibleRows;
  const dataSource = fetchConfig ? fetchedData.data : localData;
  const savedDataSourceRef = useRef(dataSource);

  const checkIsNewRow = (row) => row?.intentAction === "*";
  const checkIsNewAddedRow = (row) => row?.intentAction === "N";

  const handleDoEdit = useCallback((rowIndex, columnIndex, saveChanges = true) => {
    const cell = editingCells.find(cell => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex);

    if (cell) {
      const { value } = cell;
      const currentRow = dataSource[rowIndex];
      const columnKey = columns[columnIndex].column;
      const columnSchema = columns[columnIndex]?.actionConfig?.schema;
      let isValid = true;

      if (saveChanges) {
        // Only validate if columnSchema is defined
        if (columnSchema) {
          isValid = ajv.validate(columnSchema, value);
        }

        if (isValid) {
          let newData = setDeepValue(currentRow, columnKey, value);
          if (!checkIsNewRow(currentRow)) {
            newData = setDeepValue(setDeepValue(currentRow, columnKey, value), "intentAction", "U");
          }
          // Update the data for the current cell
          // const newData = setDeepValue(setDeepValue(currentRow, columnKey, value), "intentAction", "U");
          const updatedRows = dataSource.map((item, i) => rowIndex === i ? newData : item);

          // Update logic based on whether it's local data or fetched data
          if (fetchConfig) {
            setState({
              type: SET_FETCHED_DATA,
              payload: { ...fetchedData, data: updatedRows }
            });
          } else {
            setState({ type: SET_LOCAL_DATA, payload: updatedRows });
          }

          const isNewRow = checkIsNewRow(currentRow);
          // Trigger onChange if the data has changed
          if (getDeepValue(currentRow, columnKey) !== value && !isNewRow) {
            onChange?.(updatedRows);
          }

          setEditingCells(prev => prev.map(cell => 
            cell.rowIndex === rowIndex && cell.columnIndex === columnIndex 
              ? { ...cell, editable: false } 
              : cell
          ));
        } else {
          // Handle validation errors without clearing the editing cell
          const error = ajv.errorsText(ajv.errors);
          console.error("Validation failed: ", error);
          setEditingCells(prev => prev.map(cell => 
            (cell.rowIndex === rowIndex && cell.columnIndex === columnIndex) 
              ? { ...cell, invalid: true, error } 
              : cell
          ));
        }
      } else {
        // If not saving changes, remove the specific cell from the editing cells
        setEditingCells(prev => prev.filter(cell => 
          cell.rowIndex !== rowIndex || cell.columnIndex !== columnIndex
        ));
      }
    }
  }, [editingCells, dataSource, columns, onChange, fetchConfig, setState, fetchedData, ajv]);

  useEffect(() => {
    // Reset refs whenever rows or columns change
    cellRefs.current = {};
    dataSource?.forEach((row, rowIndex) => {
      columns.forEach((_, colIndex) => {
        cellRefs.current[`${rowIndex}-${colIndex}`] = React.createRef();
      });

      // Initialize editingCells when isNewRow is true
      const isNewRow = checkIsNewRow(row);
      if (isNewRow) {
        columns.forEach((col, colIndex) => {
          if (!col.hidden && !col.columnCustomRenderer) {
            setEditingCells(prev => {
              // Check if this cell is already initialized
              if (prev.some(cell => cell.rowIndex === rowIndex && cell.columnIndex === colIndex)) {
                return prev;
              }
              return [...prev, {
                rowIndex,
                columnIndex: colIndex,
                value: "",
                editable: col?.actionConfig !== false,
                isNew: true
              }];
            });
          }
        });
      }

      /** Reset editingCells isNew value if intentAction is "N" */
      const isNewAddedRow = checkIsNewAddedRow(row);
      if (isNewAddedRow) {
        setEditingCells(prev => prev.filter(i => !(i.rowIndex === rowIndex && i.isNew === true)));
      }
    });


    setAddedRow(findUpdatedIndex(savedDataSourceRef.current, dataSource));
    savedDataSourceRef.current = dataSource;
  }, [dataSource, columns]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingCells.length > 0) {
        editingCells.forEach(cell => {
          // Check if the click was outside and the cell is editable
          if (checkIfClickedOutside(cell, event.target) && cell.editable) {
            // Apply handleDoEdit to save or discard changes
            handleDoEdit(cell.rowIndex, cell.columnIndex, true); // true to save changes, false to discard
          }
        });
      }
    };
  
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      // Cleanup
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCells, handleDoEdit]);

  useEffect(() => {
    const handleCopyToClipboard = (e) => {
      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && selectedColumn !== null) {
        const rowData = rows?.[selectedColumn.rowIndex];
        const columnText = getDeepValue(rowData, selectedColumn.column);
        navigator.clipboard.writeText(columnText);
      }
    };
  
    document.addEventListener('keydown', handleCopyToClipboard);
  
    return () => {
      document.removeEventListener('keydown', handleCopyToClipboard);
    };
  }, [selectedColumn, rows]);

  const checkEditability = (columnEditable, isEditable, isColumnNew) => {
    if ((isColumnNew === true && columnEditable !== false) ||
      (!isEditable && !!columnEditable || !!isEditable &&
      (!!columnEditable || columnEditable === undefined))) {
      return true;
    }
  
    return false;
  };

  const handleCellDoubleClick = useCallback((rowIndex, columnIndex, value) => {
    const columnEditable = columns[columnIndex].actionConfig;
    const isColumnNew = editingCells.find(i => i.rowIndex === rowIndex && i.columnIndex === columnIndex)?.isNew;
    if (checkEditability(columnEditable, isEditable, isColumnNew)) {
      setEditingCells(prev => {
        const isExist = prev?.find(i => rowIndex === i.rowIndex && columnIndex === i.columnIndex);
        return isExist ? prev?.map(i => {
          return rowIndex === i.rowIndex && columnIndex === i.columnIndex ? {
            ...i,
            value,
            editable: true
          } : i
        }) : [...prev, { rowIndex, columnIndex, value, editable: true }]
      });
    }
  }, [isEditable, columns, editingCells]);

  const handleCellChange = (rowIndex, columnIndex) => (e) => {
    const newValue = e.target.value;
    setEditingCells(prev => {
      const cellIndex = prev.findIndex(cell => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex);
      if (cellIndex !== -1) {
        const newCells = [...prev];
        newCells[cellIndex] = { ...newCells[cellIndex], value: newValue };
        return newCells;
      }
      return [...prev, { rowIndex, columnIndex, value: newValue }];
    });
  };

  const handleKeyDown = (rowIndex, columnIndex) => (e) => {
    if (e.key === "Enter") {
      handleDoEdit(rowIndex, columnIndex);
    } else if (e.key === "Escape") {
      handleDoEdit(rowIndex, columnIndex, false); // Discard changes
    }
  };
  
  const checkIfClickedOutside = (cell, target) => {
    const cellRef = cellRefs.current[`${cell.rowIndex}-${cell.columnIndex}`];
    const cellElement = cellRef?.current;
  
    if (cellElement && !cellElement.contains(target)) {
      return true;
    }
  
    return false;
  };

  const handleRowSingleClick = useCallback((row: any) => {
    onRowClick?.(row);
    setState({
      type: SET_ACTIVE_ROW,
      payload: getDeepValue(row, rowKey) === activeRow ? null : getDeepValue(row, rowKey)
    });
  }, [onRowClick, activeRow, rowKey]);

  const handleRowDoubleClick = useCallback((row: any) => {
    onRowDoubleClick?.(row);
    setState({
      type: SET_ACTIVE_ROW,
      payload: getDeepValue(row, rowKey) === activeRow ? null : getDeepValue(row, rowKey)
    });
  }, [onRowDoubleClick, activeRow, rowKey]);

  const handleRowClick = useDoubleClick(
    (row) => handleRowSingleClick(row),
    (row) => handleRowDoubleClick(row),
  );

  const toggleRowCollapse = useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, [collapsibleRowHeight]);

  const toggleRowSelection = useCallback((row: any) => {
    const normalizeSelectedRows = (rows: any[]) =>
      rows.map((r) => (typeof r === 'string' ? { [rowKey]: r } : r));

    const normalizedSelectedRows = normalizeSelectedRows(selectedRows);

    const rowKeyValue = getDeepValue(row, rowKey); // Correctly fetch the deep value

    const isSelectedRow = normalizedSelectedRows.find(
      (r) => getDeepValue(r, rowKey) === rowKeyValue // Compare using the deep value
    );

    const payload = isSelectedRow
      ? normalizedSelectedRows.filter((r) => getDeepValue(r, rowKey) !== rowKeyValue) // Compare using the deep value
      : [...normalizedSelectedRows, row];

    onSelectedRowsChange?.(payload);
    setState({ type: SET_SELECTED_ROWS, payload });
  }, [selectedRows, rowKey, onSelectedRowsChange, setState]);

  const isColumnValid = (columns, colIndex, value) => {
    const columnSchema = columns[colIndex]?.actionConfig?.schema;
    if (!!columnSchema) {
      return ajv.validate(columnSchema, value);
    }

    return true;
  };

  /** Placeholder for loading */
  if (isFetching && rows === undefined) {
    return <SC.LoadingPanel>Loading the data...</SC.LoadingPanel>;
  }

  /** Placeholder for no data */
  if (!rows || rows.length === 0 || !Array.isArray(rows) && !isFetching && rows !== undefined) {
    return <SC.LoadingPanel>No data available.</SC.LoadingPanel>;
  }

  return (
    <SC.TableRowsContainer isFetching={isFetching}>
      {rows?.map((row, rowIndex) => {
        const rowKeyValue = getDeepValue(row, rowKey);
        let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);
        const isRowCollapsed = collapsedRows.includes(rowKeyValue);
        const isActiveRow = rowKeyValue === activeRow;
        const isSelectedRow =
          !!selectedRows.find(selectedRow => {
            // This will get the deep value if it's an object or just return the value if it's a string or number.
            const selectedRowKeyValue = typeof selectedRow === 'object' ? getDeepValue(selectedRow, rowKey) : selectedRow;
            return selectedRowKeyValue === rowKeyValue;
          });

        const customRowStyle = mergeCustomStylesForRow(row, customRowSettings);

        return (
          <Fragment key={rowIndex}>
            <SC.TableRow
              {...(!!clickableRow ? {
                onClick: () => handleRowClick(row)
              } : {})}
              className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''} ${addedRow === rowIndex ? 'highlighted' : ''}`}
            >
              <CollapsibleRowColumn
                onClick={() => toggleRowCollapse(rowKeyValue)}
                isRowCollapsed={isRowCollapsed}
              />
              <SelectCheckboxColumn
                checked={isSelectedRow}
                onChange={() => toggleRowSelection(row)}
              />
              {columns.map((col, colIndex) => {
                if (col.hidden) return null;

                const isSelectedColumn = selectedColumn?.rowIndex === rowIndex && selectedColumn?.column === col.column;
                const ref = cellRefs.current[`${rowIndex}-${colIndex}`];
                const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

                if (isPinned) {
                  pinnedWidth += colWidth;
                }

                let cellContent;
                let _isColumnValid = true;
                let _hasOldValue = "";

                if (search) {
                  cellContent = highlightText(cellContent, search);
                }

                const editingCell = editingCells.find(cell => 
                  cell.rowIndex === rowIndex && cell.columnIndex === colIndex
                );

                const isNotEditable = col?.actionConfig === false;
                const cellValue = getDeepValue(row, col.column);
                const isDeletedRow = getDeepValue(row, "intentAction") === "R";
                const isUpdatedRow = getDeepValue(row, "intentAction") === "U"

                // Render the cell based on whether it's being edited or not
                if (editingCell && editingCell.editable === true && !col?.columnCustomRenderer && !isDeletedRow) {
                  const columnActionConfig = columns[editingCell.columnIndex].actionConfig;
                  const isInvalid = editingCell?.invalid;
                  const error = editingCell?.error;
                  const inputType = columnActionConfig?.type || "text";

                  if (inputType === "select") {
                    cellContent = (
                      <div>
                        <select
                          value={editingCell.value}
                          onChange={handleCellChange(rowIndex, colIndex)}
                          onBlur={() => handleDoEdit(rowIndex, colIndex)}
                          onKeyDown={handleKeyDown(rowIndex, colIndex)}
                          // autoFocus
                          className={isInvalid ? "invalid" : ""}
                        >
                          {columnActionConfig.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.text}
                            </option>
                          ))}
                        </select>
                        {isInvalid && <span>{error}</span>}
                      </div>
                    );
                  } else {
                    // Assuming type "text" for now, but you can add more types
                    cellContent = (
                      <div>
                        <input
                          type="text"
                          value={editingCell.value || ""}
                          onChange={handleCellChange(rowIndex, colIndex)}
                          onBlur={() => handleDoEdit(rowIndex, colIndex)}
                          onKeyDown={handleKeyDown(rowIndex, colIndex)}
                          // autoFocus
                          className={isInvalid ? "invalid" : ""}
                        />
                        {isInvalid && <span>{error}</span>}
                      </div>
                    );
                  }
                } else {
                  // Render normal cell content
                  if (col.columnCustomRenderer) {
                    cellContent = col.columnCustomRenderer(cellValue, row, rowIndex);
                    _isColumnValid = false;
                  } else {
                    if (typeof cellValue === "object" && cellValue !== null) {
                      cellContent = JSON.stringify(cellValue)
                    } else {
                      cellContent = cellValue !== "null" ? cellValue : "";
                    }
                    _isColumnValid = !isColumnValid(columns, colIndex, cellContent);
                    _hasOldValue = getDeepValue(row, `${col.column.replace('.value', '')}.previous.value`, true);
                  }
                }

                return (
                  <SC.TableCell
                    key={colIndex}
                    ref={ref}
                    width={col.width}
                    minWidth={col.minWidth}
                    align={col.align}
                    isPinned={isPinned}
                    style={{
                      ...pinnedStyle,
                      ...(isUpdatedRow ? {
                        backgroundColor: _hasOldValue ? "yellow" : "white"
                      } : customRowStyle)
                    }}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex, cellValue)}
                    className={`${isSelectedColumn ? 'selected' : ''} ${isNotEditable ? 'is-not-editable' : ''} ${col?.class}`}
                    onClick={(e) => {
                      if (editingCell) {
                        e.stopPropagation();
                      }
                      if (col.selectable !== false && !isNotEditable) {
                        setSelectedColumn({rowIndex, column: col.column})
                      }
                    }}
                  >
                    <SC.CellContent
                      className="cell-content"
                      isCustomColumn={!!col.columnCustomRenderer}
                      style={{ maxWidth: col.width }}
                    >
                      {getValue(cellContent)}{_hasOldValue && <i title={_hasOldValue} className="fa fa-info-circle"/>}
                    </SC.CellContent>
                    <ColumnDragHighlighter index={colIndex} />
                    <SC.ResizeHandle onMouseDown={onMouseDown(colIndex)} />
                    {_isColumnValid && <SC.InvalidBorder/>}
                  </SC.TableCell>
                );
              })}
            </SC.TableRow>
            {isRowCollapsed && collapsibleRowRender && (
              <SC.TableRow style={{ height: collapsibleRowHeight }}>
                <SC.CollapsibleRowRenderContainer>
                  {collapsibleRowRender(row)}
                </SC.CollapsibleRowRenderContainer>
              </SC.TableRow>
            )}
          </Fragment>
        )
      })}
    </SC.TableRowsContainer>
  )
}

interface IColumnDragHighlighter {
  index: number;
}
export const ColumnDragHighlighter = (props: IColumnDragHighlighter) => {
  const { index } = props;
  const {
    dropTargetIndex,
    draggedColumnIndex,
  } = useContext(DataTableContext);

  return (dropTargetIndex === index || draggedColumnIndex === index) ? (
    <SC.ColumnDragHighlighter className="column-drag-highlighter" isDraggedColumn={draggedColumnIndex === index} />
  ) : null
}