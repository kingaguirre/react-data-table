import React, { useEffect, useState, useRef, Fragment } from "react";
import { TXInput, CODE_DECODE_DROPDOWN } from '@atoms/TXInput';
import { TXAmount } from '@atoms/TXAmount';
import * as SC from "./styled";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/themes/material.css';
import Tippy from '@tippyjs/react';
import {
  getDeepValue,
  highlightText,
  mergeCustomStylesForRow,
  getValue,
  useCheckOverflow,
  useTXAjvValidation,
  getTableCellClass,
  getErrorMessage,
  checkMinLength,
  FIELD_REQUIRED,
  getTypedCellValue,
  isCurrencyObjFormat,
  getParsedValue,
  getSchemaObjValue,
  renderColumnCustomRenderer,
  getIsDuplicate,
  DATA_UNIQUE_TEXT,
  getActionStatus,
  trimValue,
} from "../../../utils"
// Cell component utility functions
import {
  getTitle,
  isAutoHeightTableCell
} from './utils';
import { Actions } from "../../../interfaces";
import { useValidationMessage } from "@atoms/../hooks";
import { withState, IComponent } from '../../../GlobalStateProvider';
import { debounce } from "lodash";

export const Cell = withState({
  states: [
    'rowKey',
    'customRowSettings',
    'columns',
    'search',
    'editingCells',
    'hasAction',
    'selectedCell',
    'showPreviousValue',
    'selectionRangeRef',
    'handleDoCellEdit',
    'handleDoCellEditOnChange',
    'overrideUpdateStyle',
    'highlightedCell',
  ],
})(React.memo((props: IComponent) => {
  const {
    /** state */
    rowKey,
    customRowSettings,
    columns,
    search,
    editingCells,
    hasAction,
    selectedCell,
    showPreviousValue,
    selectionRangeRef,
    handleDoCellEdit,
    handleDoCellEditOnChange,
    highlightedCell,
    setGlobalStateByKey,
    setGlobalState,

    /** props */
    column,
    columnKey,
    columnIndex,
    row,
    rowIndex,
    cellRefs,
    rowKeyValue,
    dataSource,
    pinnedStyle,
    isPinned,
    checkIsNewRow,
    overrideUpdateStyle,
    isSelectedRow
  } = props;

  let enterDelay: any = useRef(null);
  const inputRef = useRef<any>(null);
  const cellRef = cellRefs?.current[`${rowKeyValue}-${columnKey}`];
  const { getTranslatedMessage } = useValidationMessage();
  const { addElement, ellipsisMap } = useCheckOverflow();
  const cellKey = `row-${rowKeyValue}-col-${columnKey}`;
  const hasEllipsis = ellipsisMap.get(cellKey);

  const customRowStyle = mergeCustomStylesForRow(row, customRowSettings);
  const isUpdatedRow = getValue(getDeepValue(row, "intentAction")) === "U";
  const isDeletedRow = getValue(getDeepValue(row, "intentAction")) === "D";
  const isNewRow = checkIsNewRow(row);
  const _hasOldValue = getDeepValue(row, `${columnKey?.replace('.value', '')}.previous.value`, true);

  /** Get current editingCell */
  const editingCell = editingCells.find(cell =>
    cell.rowKeyValue === rowKeyValue && cell.column === columnKey
  );
  const isInEditableStatus = !!(editingCell && editingCell.editable === true);
  const forceAlwaysEditor = !!column?.actionConfig?.alwaysShowEditor;
  const isSelectedCell = selectedCell?.rowKeyValue === rowKeyValue && selectedCell?.column === columnKey;
  const hasEditAction = hasAction(Actions.EDIT);
  const noActionConfig = column?.actionConfig === false;
  const isCellNotEditable = (editingCells?.some(i => i?.isNew === true) || dataSource?.find(i => i.intentAction === '*')) && getDeepValue(row, "intentAction") !== "*";
  const isCellEditable = (isNewRow && !noActionConfig) ? true : !noActionConfig && hasEditAction && !isDeletedRow && !column?.columnCustomRenderer && !isCellNotEditable;

  const getIsCustomCell = (_column) => {
    const { columnCustomRenderer } = _column || {};
    return columnCustomRenderer && typeof getCellContent(_column) !== 'string';
  };

  const handleKeyDown = (_row, _column) => (e) => {
    if (e.key === "Enter") {
      enterDelay = setTimeout(() => {
        handleDoCellEdit({_row, _column, showEditError: true});
        clearTimeout(enterDelay?.current);
      }, 160);
    } else if (e.key === "Escape") {
      handleDoCellEdit({_row, _column, triggerOnChange: false}); /** Discard changes  */
    }
  };

  /** Update editingCells state whenever value change */
  const handleCellChange = (newValue, rowKeyValue, columnKey) => {
    setGlobalState(prev => {
      const cellIndex = prev.editingCells.findIndex(
        cell => cell.rowKeyValue === rowKeyValue && cell.column === columnKey
      );

      if (cellIndex !== -1) {
        const newCells = [...prev.editingCells];
        newCells[cellIndex] = { ...newCells[cellIndex], value: newValue };
        return {
          ...prev,
          editingCells: newCells
        };
      }
      return {
        ...prev,
        editingCells: [...prev.editingCells, { rowKeyValue, column, value: newValue}]
      };
    });
  };

  const handleEditOnChange = (value, _row, _column) => handleDoCellEditOnChange({ value, _column, _row });

  /** Return correct input types based on the configs  */
  const getInputs = (_column, _editingCell) => {
    const { actionConfig, column: columnKey }: any = _column || {};
    const { type, text, placeholder, multiSelect, codeId, disabled } = actionConfig || {};
    const isInvalid = _editingCell?.invalid;
    const error = _editingCell?.error;

    const isDefaultType = type === "text" || type === "number" || !type;
    const isDropdownOrCodeDecodeDropdown = type === "dropdown" || type === CODE_DECODE_DROPDOWN;

    // inside getInputs before the switch
    if (typeof actionConfig?.render === 'function') {
      return actionConfig.render({
        value: _editingCell.value,
        rowValues: row,
        column: _column,
        rowIndex,
        isInvalid,
        error,
        disabled: !!getActionStatus(actionConfig?.disabled, row),
        inputRef,
        onChange: (next, opts) => {
          if (opts?.commit) {
            // immediate commit – mirrors dropdown path
            handleDoCellEditOnChange({ value: next, _row: row, _column });
          } else {
            // stage – mirrors text input typing
            handleCellChange(next, rowKeyValue, columnKey);
          }
        },
        onCancel: () => handleDoCellEdit({ _row: row, _column, triggerOnChange: false }),
      });
    }

    switch (true) {
      case isDefaultType:
        // focus textbox
        inputRef?.current?.setFocus();
        return (
          <TXInput
            innerRef={inputRef}
            size="xs"
            rawValueOnChange
            type={type || "text"}
            placeholder={placeholder}
            value={_editingCell.value}
            onChange={(e) => handleCellChange(e, rowKeyValue, columnKey)}
            onKeyDown={handleKeyDown(row, _column)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            onBlur={() => handleDoCellEdit({_row: row, _column})}
            disabled={!!getActionStatus(disabled, row)}
          />
        );
      case isDropdownOrCodeDecodeDropdown:
        return (
          <TXInput
            size="xs"
            rawValueOnChange
            type={type}
            placeholder={placeholder}
            value={_editingCell.value}
            onChange={(e) => handleEditOnChange(e, row, column)}
            options={actionConfig.options}
            multiSelect={multiSelect}
            multiSelectCheckbox={multiSelect}
            codeId={codeId}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "date":
        return (
          <TXInput
            size="xs"
            type="date"
            rawValueOnChange
            placeholder={placeholder}
            value={_editingCell.value}
            onChange={debounce((e) => handleEditOnChange(e, row, column), 150)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "checkbox":
        return (
          <TXInput
            simple
            size="xs"
            type="checkbox"
            rawValueOnChange
            text={text}
            value={_editingCell.value}
            onChange={(e) => handleEditOnChange(e, row, column)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "radio":
        return (
          <TXInput
            simple
            size="xs"
            type="radio"
            rawValueOnChange
            text={text}
            value={_editingCell.value}
            onChange={(e) => handleEditOnChange(e, row, column)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "checkbox-group":
        return (
          <TXInput
            simple
            size="xs"
            rawValueOnChange
            type="checkbox-group"
            value={_editingCell.value}
            options={actionConfig.options}
            verticalAlign={actionConfig.verticalAlign}
            onChange={(e) => handleCellChange(e, rowKeyValue, columnKey)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "radio-group":
        return (
          <TXInput
            simple
            size="xs"
            rawValueOnChange
            type="radio-group"
            value={_editingCell.value}
            options={actionConfig.options}
            verticalAlign={actionConfig.verticalAlign}
            onChange={(e) => handleCellChange(e, rowKeyValue, columnKey)}
            variation={isInvalid ? "danger" : undefined}
            helpText={error || undefined}
            showPreviousValue={false}
            disabled={!!getActionStatus(disabled, row)}
          />
        )
      case type === "tx-amount":
        return (
          <TXAmount
            size="xs"
            path={columnKey}
            name={columnKey}
            value={_editingCell.value || {}}
            onChange={(e) => handleCellChange(e, rowKeyValue, columnKey)}
            variation={isInvalid ? "danger" : undefined}
            errorHelpText={error || undefined}
            showPreviousValue={false}
            disabledCurrency={!!getActionStatus(disabled, row)}
          />
        )
      default: return null;
    }
  }

  /** Render the cell based on whether it's being edited or not */
  const getCellContent = (_column) => {
    const { columnCustomRenderer, column: columnKey, type } = _column || {};
    /** Get cellValue based on column_settings */
    const cellValue = getDeepValue(row, columnKey);
    const _rowKeyValue = getDeepValue(row, rowKey);

    const _editingCell = editingCells.find(cell =>
      cell.rowKeyValue === _rowKeyValue && cell.column === columnKey
    );
    const _isInEditableStatus = !!(_editingCell && _editingCell.editable === true);
    const _forceAlways = !!_column?.actionConfig?.alwaysShowEditor;
    const { isValid: _colValid, errorMessage: _colErr } = isColumnValid(_column, row, dataSource);

    // Normalize current value (same logic used by click-to-edit)
    const _trimmedValue = trimValue(getParsedValue(cellValue, _column));
    const _currentValue = (_trimmedValue !== "null" && _trimmedValue !== null) ? _trimmedValue : "";


    if ((_isInEditableStatus || _forceAlways) && !columnCustomRenderer && isCellEditable) {
      const synthetic = _editingCell ?? { value: _currentValue, invalid: !_colValid, error: _colErr };
      return getInputs(_column, synthetic);
    } else {
      /** Render normal cell content */
      if (columnCustomRenderer) {
        if (!!cellValue || !!row) {
          return renderColumnCustomRenderer(columnCustomRenderer(cellValue ?? null, row ?? null));
        }
      } else {
        if (typeof cellValue === "object" && cellValue !== null) {
          return JSON.stringify(cellValue);
        } else {
          if (cellValue !== "null") {
            return type ? getTypedCellValue(cellValue, type) : getValue(cellValue);
          }
          return "";
        }
      }
    }
  }

  /** Return cellContent when highlighted */
  const getHighlightedCellContent = (cellContent, _column, _search) => {
    if (_search) {
      const { columnCustomRenderer } = _column || {};
      const _isCustomCell = columnCustomRenderer && typeof cellContent !== 'string';
  
      if (search && !_isCustomCell) {
        return highlightText(cellContent, search);
      }
    }
    return cellContent;
  }

  const handleCellClick = (_column, _row) => {
    const columnKey = _column.column;
    const cellValue = getDeepValue(row, columnKey);
    const _trimmedValue = trimValue(getParsedValue(cellValue, _column));
    const value = (_trimmedValue !== "null" && _trimmedValue !== null) ? _trimmedValue : "";

    /** Remove selection when editing */
    selectionRangeRef?.current?.clearSelection();

    const { isValid, errorMessage } = isColumnValid(_column, _row, dataSource);

    setGlobalStateByKey('editingCells', [{
      rowKeyValue,
      value,
      column: columnKey,
      type: _column?.actionConfig?.type,
      editable: true,
      invalid: !isValid,
      error: errorMessage
    }]);
    setGlobalStateByKey('selectedCell', { rowKeyValue, column: columnKey });
  };

  const isColumnValid = (_column, _row, _dataSource) => {
    const _rowKeyValue = getDeepValue(_row, rowKey);

    const value = getDeepValue(row, _column.column) || _column?.actionConfig?.value;
    const hasCustomCell = columns?.columnCustomRenderer;
    let validationErrors: any = undefined;
    let errorMessage = "";
    let isValid = true;

    if (hasCustomCell ) {
      return {
        isValid,
        errorMessage
      }
    } else {
      const isUnique = _column?.actionConfig?.isUnique;
      const validation = _column?.actionConfig?.validation;
      const _trimmedValue = trimValue(getParsedValue(value, _column));

      const columnSchema = getActionStatus(_column?.actionConfig?.schema, row, isSelectedRow);

      let isDuplicate = false;

      /** Skip unique checking if value is undefined, null or empty string */
      if (isUnique && (_trimmedValue !== undefined && _trimmedValue !== null && _trimmedValue !== '')) {
        /** Check if the value is unique across the dataSource  */
        isDuplicate = getIsDuplicate(_dataSource, _trimmedValue, _column.column, rowKey, _rowKeyValue)

        if (isDuplicate) {
          isValid = false;
          errorMessage = DATA_UNIQUE_TEXT;
        }
      }

      if (columnSchema && isValid) {
        const isRequired = checkMinLength(columnSchema) && !_trimmedValue;
        validationErrors = isRequired ? FIELD_REQUIRED : useTXAjvValidation(getSchemaObjValue(_trimmedValue, _column), columnSchema);
        isValid = validationErrors === null;
      }

      if (validation && isValid) {
        errorMessage = validation(row, isSelectedRow);
        isValid = !errorMessage;
      }
  
      if (!isValid) {
        if (!errorMessage) {
          errorMessage = getErrorMessage(validationErrors, _column.title, getTranslatedMessage);
        }
      }

      return {
        isValid,
        errorMessage
      }
    }
  };

  const isCustomCell = getIsCustomCell(column);
  const { errorMessage, isValid } = isColumnValid(column, row, dataSource);

  return !column.hidden ? (
    <Fragment>
      <SC.TableCell
        data-testid={`table-cell-${rowIndex}-${columnKey}`}
        ref={cellRef}
        width={column?.width || column.defaultWidth}
        minWidth={column?.minWidth}
        align={!!isCurrencyObjFormat('cellValue') ? "right" : column.align}
        isPinned={isPinned}
        style={{
          ...pinnedStyle,
          ...((isUpdatedRow && !!customRowSettings && !overrideUpdateStyle) ? {
            backgroundColor: (_hasOldValue && !isInEditableStatus && showPreviousValue) ? "#FFE380" : "white"
          } : customRowStyle),
          ...((((isInEditableStatus || forceAlwaysEditor) && isAutoHeightTableCell(column)) || editingCell?.invalid || isCustomCell) ? { height: "auto" } : {})
        }}
        {...(isCellEditable && !(isInEditableStatus || forceAlwaysEditor) ? {
          onClick: () => handleCellClick(column, row)
        } : {})}
        className={getTableCellClass({
          isInEditableStatus: (isInEditableStatus || forceAlwaysEditor),
          isSelectedCell,
          hasEditAction,
          isCellEditable,
          noActionConfig,
          column,
          highlighted: highlightedCell[`${rowKeyValue}-${columnKey}`]
        })}
        data-row-index={rowIndex}
        data-column-index={columnIndex}
        data-column={column.column}
        data-disable-selection={column.disableSelection}
        data-disable-copy={column.disableCopy || !!column.columnCustomRenderer}
        data-disable-paste={noActionConfig || isDeletedRow}
        data-column-name={column.title}
      >
        <SC.CellContent
          className={`cell-content ${isCustomCell ? 'is-custom-cell' : ''}`}
          isCustomCell={isCustomCell || isInEditableStatus}
          style={{ maxWidth: column?.width }}
          ref={node => addElement(node, cellKey)}
          title={columnKey === 'intentAction' ? getTitle(row) : ''}
        >
          {getHighlightedCellContent(getCellContent(column), column, search)}
        </SC.CellContent>
        <ColumnDragHighlighter index={columnIndex} />
        {column.resizable !== false && <SC.ResizeHandle className="resize-handle"/>}
        {(!isValid && !isDeletedRow) && (
          <Tippy
            content={
              <SC.InvalidToolTip>
                {errorMessage}
              </SC.InvalidToolTip>
            }
            placement="top"
            theme="light"
          >
            <SC.InvalidBorder isInEditableStatus={(isInEditableStatus || forceAlwaysEditor)} data-testid={`invalid-border-${rowIndex}-${columnKey}`}/>
          </Tippy>
        )}
      </SC.TableCell>
      {(hasEllipsis && !(isInEditableStatus || forceAlwaysEditor) && !isCustomCell) && (
        <Tippy content={<SC.ToolTipContent>{getCellContent(column)}</SC.ToolTipContent>} placement="bottom" reference={cellRef} />
      )}
      {!!(_hasOldValue && !(isInEditableStatus || forceAlwaysEditor) && showPreviousValue) && (
        <Tippy
          content={`Previous Value: ${_hasOldValue}`}
          placement="top"
          theme="light"
          reference={cellRef}
        />
      )}
    </Fragment>
  ) : null;
}));

export const ColumnDragHighlighter = withState({
  states: [
    'dropTargetIndex',
    'draggedColumnIndex',
  ],
})(React.memo((props: IComponent) => {
  const { index, dropTargetIndex, draggedColumnIndex } = props;

  return (dropTargetIndex === index || draggedColumnIndex === index) ? (
    <SC.ColumnDragHighlighter className="column-drag-highlighter" isDraggedColumn={draggedColumnIndex === index} />
  ) : null
}));
