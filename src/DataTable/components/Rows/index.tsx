import React, { useEffect, useContext, useState, useCallback, Fragment } from "react";
import { useDoubleClick, getDeepValue, highlightText, getPinnedDetails, mergeCustomStylesForRow, setDeepValue, isStringExist } from "../../utils"
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
    state: { selectedRows, activeRow, columns, search, fetchedData },
    setState,
    onMouseDown,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
    onSelectedRowsChange,
  } = useContext(DataTableContext);

  const [collapsedRows, setCollapsedRows] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number; columnIndex: number; value: string; invalid?: boolean; error?: string | null
  } | null>(null);
  const isEditable = isStringExist(actions, Actions.EDIT);
  const ajv = new Ajv();
  /** Use fetchedData.data when fetchConfig is defined, otherwise use visibleRows */
  const isFetching = fetchConfig && fetchedData.fetching;
  const rows = fetchConfig ? fetchedData.data : visibleRows;

  /** Placeholder for loading */
  if (isFetching && rows === undefined) {
    return <SC.LoadingPanel>Loading the data...</SC.LoadingPanel>;
  }

  /** Placeholder for no data */
  if (!rows || rows.length === 0 || !Array.isArray(rows) && !isFetching && rows !== undefined) {
    return <SC.LoadingPanel>No data available.</SC.LoadingPanel>;
  }

  const checkEditability = (columnEditable, isEditable) => {
    if (!isEditable && !!columnEditable ||
      !!isEditable && (!!columnEditable || columnEditable === undefined)) {
      return true;
    }
    return false;
  };

  const handleCellDoubleClick = useCallback((rowIndex: number, columnIndex: number, value: string) => {
    const columnEditable = columns[columnIndex].actionConfig;
    if (checkEditability(columnEditable, isEditable)) {
      setEditingCell({ rowIndex, columnIndex, value });
    }
  }, [isEditable, columns]);

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editingCell) {
      const newValue = e.target.value;
      setEditingCell(prev => ({ ...prev!, value: newValue }));
    }
  };

  const handleDoEdit = (saveChanges = true) => {
    if (editingCell) {
      const currentRow = rows[editingCell.rowIndex];
      const columnKey = columns[editingCell.columnIndex].column;
      const columnSchema = columns[editingCell.columnIndex]?.actionConfig?.schema;
      const currentValue = getDeepValue(currentRow, columnKey);
      let isValid = true;

      /** Only validate if columnSchema is defined */
      if (!!columnSchema) {
        isValid = ajv.validate(columnSchema, editingCell.value);
      }

      if (isValid) {
        if (saveChanges && onChange) {
          const newData = setDeepValue(currentRow, columnKey, editingCell.value);
          const updatedRows = rows.map((item, i) => editingCell.rowIndex === i ? newData : item);

          if (fetchConfig) {
            setState({
              type: SET_FETCHED_DATA,
              payload: { ...fetchedData, data: updatedRows }
            });
          } else {
            setState({ type: SET_LOCAL_DATA, payload: updatedRows });
          }

          if (currentValue !== editingCell.value) {
            onChange(updatedRows);
          }
        }
        setEditingCell(null);
      } else {
        const error = ajv.errorsText(ajv.errors);
        console.error("Validation failed: ", error);
        setEditingCell(prev => ({ ...prev!, invalid: true, error }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === "Enter") {
        handleDoEdit();
      } else if (e.key === "Escape") {
        handleDoEdit(false);  // Do not save changes
      }
    }
  };

  useEffect(() => {
    let isEditHandled = false;

    const handleClick = () => {
      if (!isEditHandled && editingCell) {
        handleDoEdit();
        isEditHandled = true;
      }
    };

    if (editingCell) {
      window.addEventListener('click', handleClick);
    }

    return () => {
      if (editingCell) {
        window.removeEventListener('click', handleClick);
      }
    };
  }, [editingCell, handleDoEdit]);

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

  return (
    <SC.TableRowsContainer isFetching={isFetching}>
      {rows.map((row, rowIndex) => {
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
              className={`${isActiveRow ? 'is-active' : ''} ${isSelectedRow ? 'is-selected' : ''}`}
            >
              <CollapsibleRowColumn
                onClick={() => toggleRowCollapse(rowKeyValue)}
                isRowCollapsed={isRowCollapsed}
              />
              <SelectCheckboxColumn
                checked={isSelectedRow}
                onChange={() => toggleRowSelection(row)}
              />
              {columns.map((col, index) => {
                if (col.hidden) return null;

                const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

                if (isPinned) {
                  pinnedWidth += colWidth;
                }

                const rowValue = getDeepValue(row, col.column);
                let cellContent = col.columnCustomRenderer
                  ? col.columnCustomRenderer(rowValue, row)
                  : typeof rowValue === "object" ? JSON.stringify(rowValue) : rowValue;

                if (search) {
                  cellContent = highlightText(cellContent, search);
                }

                if (editingCell && editingCell.rowIndex === rowIndex && editingCell.columnIndex === index) {
                  const columnActionConfig = columns[editingCell.columnIndex].actionConfig;
                  const isInvalid = editingCell?.invalid;
                  const error = editingCell?.error;

                  if (columnActionConfig?.type === "select") {
                    cellContent = (
                      <div>
                        <select
                          value={editingCell.value}
                          onChange={handleCellChange}
                          onBlur={() => handleDoEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
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
                          onChange={handleCellChange}
                          onBlur={() => handleDoEdit()}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className={isInvalid ? "invalid" : ""}
                        />
                        {isInvalid && <span>{error}</span>}
                      </div>
                    );
                  }
                }

                return (
                  <SC.TableCell
                    key={index}
                    width={col.width}
                    minWidth={col.minWidth}
                    align={col.align}
                    isPinned={isPinned}
                    style={{ ...customRowStyle, ...pinnedStyle }}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, index, rowValue)}
                    onClick={(e) => {
                      if (editingCell && editingCell.rowIndex === rowIndex && editingCell.columnIndex === index) {
                        e.stopPropagation(); // Stop event propagation
                      }
                    }}
                  >
                    <SC.CellContent
                      className="cell-content"
                      style={{ maxWidth: col.width }}
                    >
                      {cellContent}
                    </SC.CellContent>
                    <ColumnDragHighlighter index={index} />
                    <SC.ResizeHandle onMouseDown={onMouseDown(index)} />
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