import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ActionsContainer, DropdownContainer, ActionsIconContainer } from './styled';
import { TxCoreIcon, TxCoreButton } from 'tradeport-web-components/dist/react';
import { Actions } from '../../interfaces';
import { TXModal } from '@atoms/TXModal';
import { isStringExist, isValidDataWithSchema, getDeepValue, isValidJsonObj } from "../../utils/index";
import { withState, IComponent } from '../../GlobalStateProvider';
const DEFAULT_MODAL_DETAILS = { type: "message", text: "copied text and row data are the same" };

export const ActionsColumn = withState({
  states: [
    'actions',
    'onAddRow',
    'onDeleteRow',
    'onSave',
    'onCancel',
    'onUndo',
    'canPaste',
    'onPasteRow',
    'hasAction',
    'editingCells',
    'fetchConfig',
    'columns',
    'fetchedData',
    'localData',
    'actionsDropdownItems',
    'rowKey',
    'actionsDropdownContainerWidth',
    'showActionDropdown'
  ],
})(React.memo((props: IComponent) => {
  const {
    data,
    rowIndex,
    actions,
    onAddRow,
    onDeleteRow,
    onSave,
    onCancel,
    onUndo,
    canPaste,
    onPasteRow,
    hasAction,
    editingCells,
    fetchConfig,
    columns,
    fetchedData,
    localData,
    actionsDropdownItems,
    rowKey,
    actionsDropdownContainerWidth,
    showActionDropdown,
    setGlobalStateByKey,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDetails, setModalDetails] = useState(DEFAULT_MODAL_DETAILS);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const actionRef = useRef<HTMLDivElement>(null);
  const dataSource = fetchConfig ? fetchedData.data : localData;
  const isActionsDisabled = editingCells?.some(i => i?.isNew === true) || dataSource?.find(i => i.intentAction === '*');

  const updateDropdownPosition = () => {
    if (actionRef.current) {
      const { top, left, width } = actionRef.current.getBoundingClientRect();
      return {
        top: top - 4,
        left: left + width + 7,
      };
    }
    return { top: 0, left: 0 };
  };

  const toggleDropdown = () => {
    if (!showActionDropdown) {
      const position = updateDropdownPosition();
      setPosition(position);
    }
    setGlobalStateByKey('showActionDropdown', !showActionDropdown ? getRowKeyValue() : false);
  };

  const handleCopy = async () => {
    try {
      await navigator?.clipboard?.writeText(data);
      setGlobalStateByKey('canPaste', true);
    } catch (err) {
      console.error("Error copying: ", err);
    } finally {
      setGlobalStateByKey('showActionDropdown', false);
    }
  };

  const getRowKeyValue = () => {
    const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
    return getDeepValue(parsedData, rowKey);
  }

  const getCopiedDetails = async () => {
    const clipboardText = await navigator.clipboard?.readText();

    const parsedData = !!data ? (typeof data === "string" ? JSON.parse(data) : data) : {};
    const parsedClipboardText = !!clipboardText ? (typeof clipboardText === "string" ? JSON.parse(clipboardText) : clipboardText) : {};
    const dataRowKeyValue = getDeepValue(parsedData, rowKey);
    const clipboardRowKeyValue = getDeepValue(parsedClipboardText, rowKey);

    return { parsedData, parsedClipboardText, dataRowKeyValue, clipboardRowKeyValue };
  };

  /** Event trigger when clicking paste dropdown item */
  const handlePaste = async () => {
    const { dataRowKeyValue, clipboardRowKeyValue } = await getCopiedDetails();
    const isDefaultModal = dataRowKeyValue === clipboardRowKeyValue;
    setModalDetails(isDefaultModal ? DEFAULT_MODAL_DETAILS : { type: "confirm", text: "Do you want to proceed?" });
    setIsModalOpen(true);
  };

  /** Event triger when "Yes" button is click in modal */
  const doPaste = async () => {
    try {
      const { parsedData, parsedClipboardText } = await getCopiedDetails();

      // User clicked on "OK"
      onPasteRow?.(parsedData, parsedClipboardText);

      // Clear the clipboard after pasting
      await navigator.clipboard.writeText('');
      setGlobalStateByKey('canPaste', false);
      setIsModalOpen(false);

    } catch (err) {
      console.error("Error pasting: ", err);
    } finally {
      setIsModalOpen(false);
      setGlobalStateByKey('showActionDropdown', false);
    }
  };

  const handleDuplicate = (data) => {
    onAddRow(data, rowIndex);
    setGlobalStateByKey('showActionDropdown', false);
  };

  const dropdown = showActionDropdown === getRowKeyValue() ? (
    ReactDOM.createPortal(
      <DropdownContainer
        className="action-dropdown-container"
        style={{
          ...position,
          ...(actionsDropdownContainerWidth ? {maxWidth: actionsDropdownContainerWidth} : {})
        }}
      >
        {hasAction(Actions.COPY) && <div onClick={handleCopy}>Copy</div>}
        {hasAction(Actions.COPY) && hasAction(Actions.PASTE) && (
          <div
            {...(canPaste ? { onClick: handlePaste } : { className: 'disabled' })}
          >Paste</div>
        )}
        {hasAction(Actions.DUPLICATE) && <div onClick={() => handleDuplicate(data)}>Duplicate</div>}
        {actionsDropdownItems?.map((d, i) => (
          <div
            key={i}
            className={d.disabled ? 'disabled' : ''}
            onClick={() => {
              d.onClick(JSON.parse(data));
              setGlobalStateByKey('showActionDropdown', false);
            }}
          >
            {d.icon && <TxCoreIcon icon={d.icon}/>}
            {d.text}
          </div>
        ))}
      </DropdownContainer>,
      document.body
    )
  ) : null;

  const getActionIcons = (_data) => {
    const data = typeof _data === 'string' ? _data : JSON.stringify(_data);
    if (data !== undefined ) {
      const isNewRow = JSON.parse(data)?.intentAction === "*";
      const isDeletedRow = JSON.parse(data)?.intentAction === "D";
      switch (true) {
        case isNewRow:
          return (
            <>
              <div
                title="Save"
                {...(isValidDataWithSchema(columns, editingCells, dataSource, rowKey)) ? {
                  onClick: () => onSave(data),
                  className: "save-container"
                } : {
                    disabled: true,
                    className: "save-container disabled"
                  }}
              >
                <TxCoreIcon icon="check" />
              </div>
              <div
                className="cancel-container"
                onClick={() => onCancel(data)}
                title="Cancel"
              >
                <TxCoreIcon icon="cross" />
              </div>
            </>
          );
        case isDeletedRow && hasAction?.(Actions.DELETE):
          return (
            <div
              className={`redo-container ${isActionsDisabled ? 'disabled' : ''}`}
              title="Undo Delete"
              {...!isActionsDisabled ? {
                onClick: () => onUndo(data)
              } : {}}
            >
              <TxCoreIcon icon="redo" />
            </div>
          )
        default: return (
          <>
            {hasAction?.(Actions.DELETE) && (
              <div
                className={`delete-container ${isActionsDisabled ? 'disabled' : ''}`}
                title="Delete"
                {...!isActionsDisabled ? {
                  onClick: () => onDeleteRow(data)
                } : {}}
              >
                <TxCoreIcon icon="trash" />
              </div>
            )}
            {(isStringExist(actions, [Actions.COPY, Actions.PASTE, Actions.DUPLICATE]) || actionsDropdownItems) && (
              <ActionsIconContainer
                className={`options-container ${isActionsDisabled ? 'disabled' : ''}`}
                ref={actionRef}
                title="Options"
                {...!isActionsDisabled ? {
                  onClick: toggleDropdown
                } : {}}
              >
                <TxCoreIcon icon="ellipsis-vertical-square" />
              </ActionsIconContainer>
            )}
            {dropdown}
          </>
        );
      }
    }
    return null;
  }

  return (
    <ActionsContainer data-testid='actions-container'>
      {getActionIcons(data)}
      <TXModal
        modalWidth="small"
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zIndex={10002}
      >
        <TXModal.Header>Confirm</TXModal.Header>
        <TXModal.Body>
          {modalDetails?.text}
        </TXModal.Body>
        <TXModal.Footer align="right">
          {modalDetails?.type === 'confirm' && (
            <TxCoreButton variation="primary" onClick={doPaste}>Confirm</TxCoreButton>
          )}
          <TxCoreButton onClick={() => setIsModalOpen(false)}>Close</TxCoreButton>
        </TXModal.Footer>
      </TXModal>
    </ActionsContainer>
  );
}));
