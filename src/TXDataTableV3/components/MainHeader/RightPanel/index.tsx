import React, { useRef, useEffect, useState, useCallback } from "react";
import { TXInput } from '@atoms/TXInput';
import { TxCoreButton, TxCoreIcon } from 'tradeport-web-components/dist/react';
import { withState, IComponent } from '../../../GlobalStateProvider';
import { setColumnSettings, getColumnDefaultWidth } from "../../../utils";
import * as SC from "./styled";

export const RightPanel = withState({
  states: [
    'rightPanelToggleButtonRef',
    'rightPanelToggle',
    'onResetClick',
    'onColumnSettingsChange',
    'columns',
    'columnSettings',
    'tableWidth',
    'customRowSettings',
    'actions',
    'localStorageSettingsKey',
    'actionColumnSetting',
    'actionsDropdownItems',
  ],
})(React.memo((props: IComponent) => {
  const {
    rightPanelToggleButtonRef,
    rightPanelToggle,
    onResetClick,
    onColumnSettingsChange,
    columns = [],
    columnSettings,
    tableWidth,
    customRowSettings,
    actions,
    localStorageSettingsKey,
    actionColumnSetting,
    actionsDropdownItems,
    setGlobalStateByKey,
    setGlobalStateByObj,
  } = props;

  const rightPanelRef: any = useRef<any>(null);

  const getColumnsSstatus = (columns: any) => columns.reduce((acc, col) => {
    if (col.class !== "custom-action-column") {
      acc[col.column] = !col.hidden;
    }
    return acc;
  }, {});

  // Temporary state to hold column visibility changes
  const [tempColumnVisibility, setTempColumnVisibility] = useState(getColumnsSstatus(columns));

  useEffect(() => {
    setTempColumnVisibility(getColumnsSstatus(columns));
  }, [columns]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rightPanelRef.current &&
        !rightPanelRef.current.contains(event.target) &&
        rightPanelToggleButtonRef.current &&
        !rightPanelToggleButtonRef.current.contains(event.target)
      ) {
        setGlobalStateByKey('rightPanelToggle', false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleColumnVisibilityChange = useCallback((columnName, isVisible) => {
    setTempColumnVisibility(prevState => ({
      ...prevState,
      [columnName]: isVisible,
    }));
  }, [tempColumnVisibility]);

  const handleResetSettingsClick = () => {
    sessionStorage.removeItem(`${localStorageSettingsKey}-currentColumnSettings`);
    const newColumnSettings = setColumnSettings(
      columnSettings,
      tableWidth - 12,
      customRowSettings,
      actions,
      actionColumnSetting,
      localStorageSettingsKey,
      actionsDropdownItems
    );
    setGlobalStateByKey('columns', newColumnSettings);
    onResetClick?.(newColumnSettings);
    onColumnSettingsChange?.(newColumnSettings);

    // Update tempColumnVisibility to reflect the reset
    setTempColumnVisibility(newColumnSettings.reduce((acc, col) => {
      acc[col.column] = !col.hidden;
      return acc;
    }, {}));
  };

  const applyColumnVisibilityChange = () => {
    const _newHiddenColumns = [...columns].map(col => ({
      ...col,
      hidden: col.column in tempColumnVisibility ? !tempColumnVisibility[col.column] : col.hidden,
    }));

    const defaultWidth = getColumnDefaultWidth(_newHiddenColumns, tableWidth - 12);
    const newColumns = columns.map((col) => ({
      ...col,
      hidden: col.column in tempColumnVisibility ? !tempColumnVisibility[col.column] : col.hidden,
      defaultWidth
    }));

    setGlobalStateByObj({
      columns: newColumns,
      rightPanelToggle: false
    });
    onColumnSettingsChange?.(newColumns);
  };

  const handleCancelClick = () => {
    setTempColumnVisibility(columns);
    setGlobalStateByKey('rightPanelToggle', false);
  };

  return (
    <SC.Container ref={rightPanelRef} className={`${rightPanelToggle ? 'is-visible' : ''}`}>
      <SC.Header>
        <span>visible columns</span>
        <TxCoreIcon icon="cancel" onClick={() => {
          setGlobalStateByKey('rightPanelToggle', false);
        }}/>
      </SC.Header>
      <SC.Body>
        {columns.filter(i => i.class !== "custom-action-column").map((col, index) => (
          <label key={index}>
            <TXInput
              type="checkbox"
              simple
              rawValueOnChange
              checked={col.column in tempColumnVisibility ? tempColumnVisibility[col.column] : !col.hidden}
              onChange={(value) => handleColumnVisibilityChange(col.column, value)}
              text={col.title}
              width="100%"
            />
          </label>
        ))}
      </SC.Body>
      <SC.Footer>
        <TxCoreButton
          size="sm"
          onButtonClick={handleResetSettingsClick}
        >
          Reset
        </TxCoreButton>
        <div>
          <TxCoreButton
            size="sm"
            onClick={handleCancelClick}
          >Cancel</TxCoreButton>

          <TxCoreButton
            size="sm"
            variation="primary"
            onButtonClick={applyColumnVisibilityChange}
          >Confirm</TxCoreButton>
        </div>
      </SC.Footer>
    </SC.Container>
  );
}));
