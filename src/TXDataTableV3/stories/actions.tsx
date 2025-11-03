import React from 'react';
import { TxCoreFormControl } from 'tradeport-web-components/dist/react';
import { TXInput } from '@atoms/TXInput';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { DATA_SOURCE, COLUMN_SETTINGS, CUSTOM_ROW_SETTINGS } from '../data';
import { Actions } from "../interfaces";

const ACTIONS_LIST = [Actions.ADD, Actions.EDIT, Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE];

export default () => {
  const [actions, setActions] = React.useState<any>(ACTIONS_LIST);
  const [addDisable, setAddDisable] = React.useState<any>(false);
  const [showPreviousValue, setShowPreviousValue] = React.useState<any>(false);
  const [customRowSettings, setCustomRowSettings] = React.useState<any>(undefined);
  const [isPermanentDelete, setIsPermanentDelete] = React.useState<any>(false);
  const [currentActiveRow, setCurrentActiveRow] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setCurrentActiveRow("23100022-001")
  }, [])

  const handleActions = React.useCallback((e, action) => {
    const isTrue = e.detail;
    /** Add/Remove to actions array */
    setActions(isTrue ? actions.filter(i => i !== action) : [...actions, action])
  }, [actions]);

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with actions (Add, Edit, Delete, Copy, Past, Duplicate) using <b>actions</b>.</p>
      <TXDataTable
        /** Default settings */
        dataSource={DATA_SOURCE?.txnWorkDeskList}
        columnSettings={COLUMN_SETTINGS.map((i: any) => ({
          ...i,
          // Remove pre-defined pinned value for demo
          pinned: i.pinned === true ? false : i.pinned,
          // Removes all column filterConfig for default view
          filterConfig: undefined,
        }))}
        pageSize={pageSize}
        tableMaxHeight='250px'
        activeRow={currentActiveRow}

        /** Actions */
        actions={actions}
        /** Required if actions prop is defined */
        rowKey="transactionWorkflowID.value"
        /** Controls enabled/disabled of add button */
        isAddDisabled={addDisable}
        /** Controls show/hide of previous value tooltip */
        showPreviousValue={showPreviousValue}
        /** Settings for custom row highlighter */
        customRowSettings={customRowSettings}
        /** Controls action delete behavior, 
         * if true deleting row will completely remove 
         * row instead of updating intentAction */
        isPermanentDelete={isPermanentDelete}
        /** Custom Action item in dropdown */
        actionsDropdownItems={[{
          text: "test action",
          icon: "check",
          onClick: (data) => openJsonInNewWindow(data)
        }]}
        /** Custom width for dropdown actions */
        actionsDropdownContainerWidth='200px'
      />
      
      <ActionsContainer>
        <p>Actions</p>
        <div>
          {ACTIONS_LIST.map((i, index) => (
            <div key={index}>
              <TxCoreFormControl
                type="checkbox"
                label={`Remove ${i} Action`}
                onChange={(e) => handleActions(e, i)}
                text="Remove"
                checked={!actions?.includes(i)}
                simple
              />
            </div>
          ))}
        </div>
        <br/>
        <p>Others</p>
        <div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Enable/Disable ADD Action button"
              onChange={(e) => setAddDisable(e.detail)}
              text="Disabled"
              checked={addDisable}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Controls DELETE action if it will be permanent deleted"
              onChange={(e) => setIsPermanentDelete(e.detail)}
              text="Permanent"
              checked={isPermanentDelete}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Show previous value"
              onChange={(e) => setShowPreviousValue(e.detail)}
              text="Show"
              checked={showPreviousValue}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Add custom row highligher"
              onChange={(e) => setCustomRowSettings(e.detail ? CUSTOM_ROW_SETTINGS : undefined)}
              text="Add"
              checked={!!customRowSettings}
              simple
            />
          </div>
          <div>
            <TXInput
              type="dropdown"
              label="Change page size dynamically"
              onChange={(e) => setPageSize(e)}
              rawValueOnChange
              value={pageSize}
              options={[
                {text: '10', value: '10'},
                {text: '15', value: '15'},
                {text: '20', value: '20'},
              ]}
            />
          </div>
        </div>
      </ActionsContainer>
    </Container>
  )
}

const openJsonInNewWindow = (jsonObject) => {
  // Convert the JSON object to a pretty-printed string
  const jsonString = JSON.stringify(jsonObject, null, 2);

  // Open a new window
  const newWindow: any = window.open('', 'JSON');

  // Escape HTML to prevent XSS attacks
  const escapedJsonString = jsonString.replace(/[&<>"']/g, (match: any) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });

  // Add some basic styling and pre-formatting to the new window's document for readability
  newWindow.document.write(`
    <html>
      <head>
        <title>JSON Data</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <pre>${escapedJsonString}</pre>
      </body>
    </html>
  `);

  // Ensure the new window's document is closed so it displays correctly
  newWindow.document.close();
};