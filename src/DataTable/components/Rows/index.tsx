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
  getValue,
  useCheckOverflow
} from "../../utils"
import { SET_ACTIVE_ROW, SET_SELECTED_ROWS, SET_LOCAL_DATA, SET_FETCHED_DATA } from "../../context/actions";
import { DataTableContext } from "../../index";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";
import { Actions } from "../../interfaces";
import Ajv from "ajv";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import DraggedElements from '../DraggedElements';

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
    setEditingCells,
    hasAction,
    isSingleSelect,
    selectedColumn,
    setSelectedColumn
  } = useContext(DataTableContext);

  const cellRefs = useRef({});
  const [collapsedRows, setCollapsedRows] = useState<string[]>([]);
  const [addedRow, setAddedRow] = useState<number>(-1);
  // At the beginning of your functional component

  const isEditable = isStringExist(actions, Actions.EDIT);
  const ajv = new Ajv();
  const { addElement, ellipsisMap, refsMap } = useCheckOverflow();

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
      const saveDataSourceCurrentRow = savedDataSourceRef?.current?.find(i => getDeepValue(i, rowKey) === getDeepValue(currentRow, rowKey));
      const columnKey = columns[columnIndex].column;
      const columnSchema = columns[columnIndex]?.actionConfig?.schema;
      const isUnique = columns[columnIndex]?.actionConfig?.isUnique;

      let isValid = true;
      let errorMessage = "";
      let isDuplicate = false;
  
      if (saveChanges) {

        if (isUnique) {
          // Check if the value is unique across the dataSource
          isDuplicate = dataSource.some((row, index) => {
            const rowValue = getDeepValue(row, columnKey);
            // Check against all other rows except the current row being edited
            return index !== rowIndex && getValue(rowValue).toLowerCase() === value.toLowerCase();
          });
    
          if (isDuplicate) {
            isValid = false;
            errorMessage = "Data should be unique";
          }
        }

        // Only validate if columnSchema is defined and its not duplicae
        if (columnSchema && !isDuplicate) {
          isValid = ajv.validate(columnSchema, value);
        }

        if (isValid) {
          const curVal = getValue(getDeepValue(saveDataSourceCurrentRow, columnKey));
          const shouldChangeIntentAction = !checkIsNewRow(saveDataSourceCurrentRow) && !!saveDataSourceCurrentRow;
          const isValueUdpated = curVal !== value && !!saveDataSourceCurrentRow;

          const newData = setDeepValue({
            ...currentRow,
            ...(shouldChangeIntentAction ? {intentAction: "U"} : {}),
          }, columnKey, isValueUdpated ? {
            previous: { value: curVal },
            isChanged: true,
            value
          } : value);

          // Update the data for the current cell
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
              ? { ...cell, editable: false, invalid: false, erorr: null } 
              : cell
          ));
        } else {
          // Handle validation errors, including unique constraint
          if (!errorMessage) {
            // If the error message wasn't set by the unique check, get it from AJV validation
            errorMessage = ajv.errorsText(ajv.errors);
          }
          console.error("Validation failed: ", errorMessage);
          setEditingCells(prev => prev.map(cell => 
            (cell.rowIndex === rowIndex && cell.columnIndex === columnIndex) 
              ? { ...cell, invalid: true, erorr: errorMessage } 
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
  }, [editingCells, dataSource, columns, onChange, fetchConfig, setState, fetchedData, ajv, savedDataSourceRef]);

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
                isNew: true,
                column: col.column
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

    // Use setTimeout to reset addedRow after 2 seconds
    const timeoutId = setTimeout(() => {
      setAddedRow(-1);
    }, 2000);

    return () => {
      clearTimeout(timeoutId); // Cleanup the timeout to avoid memory leaks
    };
  }, [dataSource, columns]);

  // Update state when actions prop is changed
  useEffect(() => {
    const hasAddAction = !!actions.find(i => i === Actions.ADD);
    const hasAddRow = !!dataSource.find(i => i.intentAction === "*")
    if (!hasAddAction && hasAddRow) {
      if (fetchConfig) {
        const newFetchedData = [...(fetchedData.data || [])].filter(i => i.intentAction !== "*");
        setState({
          type: SET_FETCHED_DATA,
          payload: { ...fetchedData, data: newFetchedData }
        });
      } else {
        const newLocalData = [...(localData || [])].filter(i => i.intentAction !== "*");
        setState({ type: SET_LOCAL_DATA, payload: newLocalData });
      }
      setEditingCells(prev => prev.filter(i => i.isNew !== true));
    }
  }, [actions, dataSource]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.test-123') || event.target.closest('.test-1234')) {
        // If clicked inside an element with the '.test-123' class, do nothing
        return;
      }
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
    if (columnEditable === undefined) {
      return true;
    }
    if ((isColumnNew === true && columnEditable !== false) ||
      (!isEditable && !!columnEditable || !!isEditable &&
      (!!columnEditable || columnEditable === undefined))) {
      return true;
    }
  
    return false;
  };

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

  const handleCellClick = useCallback((props) => {
    const { event, editingCell, rowIndex, colIndex: columnIndex, cellValue } = props;
    const columnEditable = columns[columnIndex].actionConfig;
    const isColumnNew = editingCells.find(i => i.rowIndex === rowIndex && i.columnIndex === columnIndex)?.isNew;
    const _val = getValue(cellValue);
    const value = _val !== "null" ? _val : "";

    if (editingCell) {
      event.stopPropagation();
    }

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

      setSelectedColumn({rowIndex, column: columns[columnIndex]?.column})
    }
  }, [isEditable, columns, editingCells]);

  const toggleRowCollapse = useCallback((id: string) => {
    setCollapsedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  }, [collapsibleRowHeight]);

  const toggleRowSelection = useCallback((row: any) => {
    if (isSingleSelect) {
      // For single select, directly set the selectedRows with the current row
      const payload = [row];
      onSelectedRowsChange?.(payload);
      setState({ type: SET_SELECTED_ROWS, payload });
    } else {
      // Existing multi-select logic...
      const normalizeSelectedRows = (rows: any[]) =>
        rows.map((r) => (typeof r === 'string' ? { [rowKey]: r } : r));

      const normalizedSelectedRows = normalizeSelectedRows(selectedRows);
      const rowKeyValue = getDeepValue(row, rowKey);
      const isSelectedRow = normalizedSelectedRows.find(
        (r) => getDeepValue(r, rowKey) === rowKeyValue
      );
      const payload = isSelectedRow
        ? normalizedSelectedRows.filter((r) => getDeepValue(r, rowKey) !== rowKeyValue)
        : [...normalizedSelectedRows, row];

      onSelectedRowsChange?.(payload);
      setState({ type: SET_SELECTED_ROWS, payload });
    }
  }, [selectedRows, rowKey, onSelectedRowsChange, setState, isSingleSelect]);

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
                let _isColumnInValid = false;
                let _hasOldValue = "";

                const editingCell = editingCells.find(cell => 
                  cell.rowIndex === rowIndex && cell.columnIndex === colIndex
                );

                const cellValue = getDeepValue(row, col.column);
                const isDeletedRow = getDeepValue(row, "intentAction") === "R";
                const isUpdatedRow = getDeepValue(row, "intentAction") === "U";
                const isNewRow = checkIsNewRow(row);
                const hasEditAction = hasAction(Actions.EDIT);
                const isNotEditable = col?.actionConfig === false || !hasEditAction;

                // Render the cell based on whether it's being edited or not
                if (editingCell && editingCell.editable === true && !col?.columnCustomRenderer && !isDeletedRow && isNewRow) {
                  const columnActionConfig = columns[editingCell.columnIndex].actionConfig;
                  const isInvalid = editingCell?.invalid;
                  const error = editingCell?.error;
                  const inputType = columnActionConfig?.type || "text";

                  // Upload
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
                    _isColumnInValid = false;
                  } else {
                    if ((typeof cellValue === "object" && cellValue !== null) || typeof cellValue === "number") {
                      cellContent = JSON.stringify(cellValue)
                    } else {
                      cellContent = cellValue !== "null" ? cellValue : "";
                    }
                    cellContent = getValue(cellContent);
                    _isColumnInValid = !isColumnValid(columns, colIndex, cellContent);
                    _hasOldValue = getDeepValue(row, `${col.column.replace('.value', '')}.previous.value`, true);
                    
                    if (search) {
                      cellContent = highlightText(cellContent, search);
                    }
                  }
                }

                const cellKey = `row-${rowIndex}-col-${colIndex}`;
                const hasEllipsis = ellipsisMap.get(cellKey);
                // const columnRef = refsMap.current.get(cellKey); // way to get each column ref

                return (
                  <Fragment key={colIndex}>
                    <SC.TableCell
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
                      {...((!isNotEditable && !isDeletedRow || isNewRow) ? {
                        onClick: (event) => handleCellClick({event, col, rowIndex, colIndex, cellValue, editingCell, isNotEditable})
                      } : {})}
                      className={`${isSelectedColumn ? 'selected' : ''} ${hasEditAction ? isNotEditable ? 'is-not-editable' : !isDeletedRow ? 'is-editable' : '' : ''} ${col?.class}`}
                    >
                      <SC.CellContent
                        className="cell-content"
                        isCustomColumn={!!col.columnCustomRenderer}
                        style={{ maxWidth: col.width }}
                        ref={node => addElement(node, cellKey)}
                      >
                        {cellContent}
                      </SC.CellContent>
                      <ColumnDragHighlighter index={colIndex} />
                      <SC.ResizeHandle onMouseDown={onMouseDown(colIndex)} />
                      {_isColumnInValid && <SC.InvalidBorder/>}
                    </SC.TableCell>
                    {hasEllipsis && <Tippy content={cellContent} placement="bottom" reference={ref} />}
                    {_hasOldValue && <Tippy content={_hasOldValue} placement="top" reference={ref} />}
                  </Fragment>
                )
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
      <DraggedElements/>
      {/* <div className="test-123" style={{height: 100, background: 'black'}}></div>
      <div className="test-1234" style={{height: 100, background: 'red'}}></div> */}
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