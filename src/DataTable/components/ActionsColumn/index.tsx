import React, { useState, useEffect, useRef, useContext } from 'react';
import ReactDOM from 'react-dom';
import { ActionsContainer, DropdownContainer, ActionsIconContainer } from './styled';
import { Actions } from '../../interfaces';
import { DataTableContext } from "../../index";
import { isStringExist } from "../../utils/index";

interface IProps {
  data?: any;
  actions?: Actions | Actions[];
}

export const ActionsColumn: React.FC<IProps> = (props: IProps) => {
  const { data } = props;
  const { actions, onAddRow, onDeleteRow, onSave, onCancel, onUndo } = useContext(DataTableContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const actionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAction = (action: Actions) => Array.isArray(actions) ? actions.includes(action) : actions === action;

  const updateDropdownPosition = () => {
    if (actionRef.current) {
      const { top, left, width } = actionRef.current.getBoundingClientRect();
      return {
        top: top,
        left: left + width,
      };
    }
    return { top: 0, left: 0 };
  };

  const toggleDropdown = () => {
    if (!showDropdown) {
      const position = updateDropdownPosition();
      setPosition(position);
    }
    setShowDropdown(prevShow => !prevShow);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
    } catch (err) {
    } finally {
      setShowDropdown(false);
    }
  };

  const handlePaste = async () => {
    const clipboardText = await navigator.clipboard.readText();
    onAddRow(clipboardText);
    setShowDropdown(false);
  };

  const handleDuplicate = (data) => {
    onAddRow(data);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          actionRef.current && !actionRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', () => setShowDropdown(false));
    return () => {
      window.removeEventListener('scroll', () => setShowDropdown(false));
    };
  }, []);

  const dropdown = showDropdown ? (
    ReactDOM.createPortal(
      <DropdownContainer ref={dropdownRef} style={position}>
        {hasAction(Actions.COPY) && <div onClick={handleCopy}>Copy</div>}
        {hasAction(Actions.PASTE) && <div onClick={handlePaste}>Paste</div>}
        {hasAction(Actions.DUPLICATE) && <div onClick={() => handleDuplicate(data)}>Duplicate</div>}
      </DropdownContainer>,
      document.body
    )
  ) : null;

  const getActionIcons = (data) => {
    const isNewRow = JSON.parse(data)?.intentAction === "*";
    const isDeletedRow = JSON.parse(data)?.intentAction === "R";

    switch(true) {
      case isNewRow:
        return (
          <>
            <i className="fa fa-check" onClick={() => onSave(data)}/>
            <i className="fa fa-close" onClick={() => onCancel(data)}/>
          </>
        );
      case isDeletedRow:
        return (
          <i className="fa fa-undo" onClick={() => onUndo(data)}/>
        )
      default: return (
        <>
          {hasAction(Actions.DELETE) && <i className="fa fa-trash-o" onClick={() => onDeleteRow(data)}/>}
          {isStringExist(actions, [Actions.COPY, Actions.PASTE, Actions.DUPLICATE]) && (
            <ActionsIconContainer ref={actionRef} onClick={toggleDropdown}>
              <i className="fa fa-ellipsis-v" />
            </ActionsIconContainer>
          )}
          {dropdown}
        </>
      );
    }
  }
  return (
    <ActionsContainer>
      {getActionIcons(data)}
    </ActionsContainer>
  );
};
