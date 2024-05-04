import React, { useRef, useEffect, useState, useCallback } from "react";
import { SET_COLUMNS } from "../../../context/actions";
import * as SC from "./styled";
import { DataTableContext } from "../../../index";
import { withState, IComponent } from '../../GlobalStateProvider';

export const RightPanel = withState({
  states: [
    'columns',
    'rightPanelToggleButtonRef',
    'rightPanelToggle',
    // 'setRightPanelToggle',
    'onResetClick',
    'onColumnSettingsChange',
    // 'setColumns'
    'setGlobalStateByKey'
  ],
})(React.memo((props: IComponent) => {
  const {
    columns,
    rightPanelToggleButtonRef,
    rightPanelToggle,
    // setRightPanelToggle,
    onResetClick,
    onColumnSettingsChange,
    // setColumns
    setGlobalStateByKey,
  } = props;

  const rightPanelRef: any = useRef<any>(null);

  // Temporary state to hold column visibility changes
  const [tempColumnVisibility, setTempColumnVisibility] = useState(
    columns?.reduce((acc, col) => {
      if (col.class !== "custom-action-column") {
        acc[col.column] = !col.hidden;
      }
      return acc;
    }, {})
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rightPanelRef.current &&
        !rightPanelRef.current.contains(event.target) &&
        rightPanelToggleButtonRef.current &&
        !rightPanelToggleButtonRef.current.contains(event.target)
      ) {
        setGlobalStateByKey('rightPanelToggle', false);
        // setRightPanelToggle(false);
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
    const resetColumns = columns.map(col => ({ ...col, hidden: false }));
    // setState({ type: SET_COLUMNS, payload: resetColumns });
    setGlobalStateByKey('columns', resetColumns);
    // setColumns(resetColumns);
    onResetClick?.(resetColumns);
    localStorage.setItem('currentColumnSettings', JSON.stringify(resetColumns));

    // Update tempColumnVisibility to reflect the reset
    setTempColumnVisibility(resetColumns.reduce((acc, col) => {
      acc[col.column] = !col.hidden;
      return acc;
    }, {}));
  };

  // Compare tempColumnVisibility with stored currentColumnSettings to determine button state
  const isResetButtonDisabled = () => {
    const currentSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');
    return currentSettings?.every(col => tempColumnVisibility?.[col.column] === !col.hidden);
  };

  const applyColumnVisibilityChange = () => {
    const newColumns = columns.map(col => ({
      ...col,
      hidden: col.column in tempColumnVisibility ? !tempColumnVisibility[col.column] : col.hidden,
    }));

    // setState({ type: SET_COLUMNS, payload: newColumns });
    setGlobalStateByKey('columns', newColumns);
    // setColumns(newColumns);
    onColumnSettingsChange?.(newColumns);
  };

  return (
    <SC.SettingsContainer ref={rightPanelRef} className={`${rightPanelToggle ? 'is-visible' : ''}`}>
        <SC.SettingsHeader>Visible columns</SC.SettingsHeader>
        {columns
          ?.filter(col => col.class !== "custom-action-column")
          ?.map((col, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={col.column in tempColumnVisibility ? tempColumnVisibility[col.column] : !col.hidden}
              onChange={(e) => handleColumnVisibilityChange(col.column, e.target.checked)}
            />
            <span>{col.title}</span>
          </label>
        ))}
        <SC.SettingsFooter>
          <button
            onClick={handleResetSettingsClick}
            disabled={isResetButtonDisabled()}
          >Reset</button>
          <div>
            <button onClick={() => setGlobalStateByKey('rightPanelToggle', false)}>Cancel</button>
            <button onClick={applyColumnVisibilityChange}>Apply</button>
          </div>
        </SC.SettingsFooter>
      </SC.SettingsContainer>
  );
}));
