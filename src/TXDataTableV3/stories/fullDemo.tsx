import React from 'react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { TxCoreButton, TxCoreFormControl, TxCoreIcon } from 'tradeport-web-components/dist/react';
import { DATA_SOURCE, COLUMN_SETTINGS, CUSTOM_ROW_SETTINGS } from '../data';
import { Actions } from "../interfaces";
import { TXInput } from '@atoms/TXInput';

const ACTIONS_LIST = [Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE, Actions.ADD, Actions.EDIT]
export default (args) => {
  const dataTableRef = React.createRef<any>();
  const [actions, setActions] = React.useState<any>(ACTIONS_LIST);
  const [customRowSettings, setCustomRowSettings] = React.useState<any>(CUSTOM_ROW_SETTINGS);
  const [columnSettings, setColumnSettings] = React.useState<any>(COLUMN_SETTINGS);
  const [pageIndex, setPageIndex] = React.useState<number>(0);

  const handleValidate = () => {
    if (dataTableRef.current) {
      const invalidData = dataTableRef.current.validate();
      console.log("Invalid Data:", invalidData);
    }
  };

  const handleRowClick = (rowData: any) => {
    console.log("Clicked row:", rowData);
  };

  const handleRowDoubleClick = (rowData: any) => {
    console.log("Double-clicked row:", rowData);
  };

  const handleColumnSettingsChange = (newColumnSettings: any) => {
    console.log("Column settings:", newColumnSettings);
  };

  const handleAddActionCheckboxChange = (value) =>{
    const { detail } = value;
    const actionsWithoutAdd = [Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE, Actions.EDIT];
    setActions(detail ? ACTIONS_LIST : actionsWithoutAdd);
  }

  const handleRowHighlightsCheckboxChange = (value) =>{
    const { detail } = value;
    setCustomRowSettings(detail ? CUSTOM_ROW_SETTINGS : undefined);
  }

  const handleColumnFiltersCheckboxChange = (value) =>{
    const { detail } = value;
    const noFilers = [...COLUMN_SETTINGS].map(i => ({
      ...i,
      filterConfig: undefined,
    }));
    setColumnSettings(detail ? COLUMN_SETTINGS : noFilers);
  }

  const handleColumnSchemaCheckboxChange = (value) =>{
    const { detail } = value;
    const noSchema = [...COLUMN_SETTINGS].map((i: any) => {
      const { actionConfig } = i;

      return typeof actionConfig === "object" && actionConfig !== null ? {
        ...i,
        actionConfig: {
          ...(i?.actionConfig as any),
          schema: undefined
        }
      } : i
    })

    setColumnSettings(detail ? COLUMN_SETTINGS : noSchema);
  }

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <TXDataTable
        {...args}
        ref={dataTableRef}
        actions={actions}
        dataSource={DATA_SOURCE?.txnWorkDeskList}
        columnSettings={columnSettings}
        // onRowClick={handleRowClick}
        // onRowDoubleClick={handleRowDoubleClick}
        rowKey="transactionReference"
        // showPreviousValue
        disabledSelectedRows={["SPBTR22RFC000016", "SPBTR22RFC000012"]}
        overrideUpdateStyle
        selectable
        multiSelect
        downloadXLS
        pageSize={10}
        pageIndex={pageIndex}
        collapsibleRowRender={(rowData) => (<div>This is a collapsible row for {JSON.stringify(rowData)}</div>)}
        onColumnSettingsChange={handleColumnSettingsChange}
        onChange={v => console.log(v)}
        customRowSettings={customRowSettings}
        tableMaxHeight="250px"
        clickableRow={false}
        headerSearchSettings={{ // Controls the width of search textbox in header
          width: "200px"
        }}
        // selectionRange
        onDataChange={(values: any) => {
          const { data, totalData, pageIndex, internalPageIndex, pageSize, selectedRows } = values;
          setPageIndex(internalPageIndex);
          console.log('onDataChange data: ', data);
          console.log('onDataChange totalData: ', totalData);
          console.log('onDataChange pageIndex: ', pageIndex);
          console.log('onDataChange internalPageIndex: ', internalPageIndex);
          console.log('onDataChange pageSize: ', pageSize);
          console.log('onDataChange selectedRows: ', selectedRows);
        }}
        onPageIndexChange={(index) => console.log('onPageIndexChange: ', index)}
        headerLeftContent={
          <TXInput
            type="checkbox"
            text="Hide ACR Steps"
            disabled
            simple
          />
        }
        headerRightContent={
          <TxCoreButton
            size="sm"
            variation="success"
            onButtonClick={handleValidate}
          >
            Registration&nbsp;<TxCoreIcon icon="plus-circle"/>
          </TxCoreButton>
        }
        onRefreshIconClick={() => {}}
        // isSelectableDisabled
        onDownloadAllClick={() => console.log('Download all is clicked!')}
        onDownloadSelectedClick={() => console.log('Download selected items is clicked!')}
      />

      <ActionsContainer>
        <p>Actions</p>
        <div>
          <div>
            <TxCoreButton size="sm" onButtonClick={() => handleValidate()}>Validate Table</TxCoreButton>
          </div>
          <div>
            <TxCoreButton size="sm" onButtonClick={() => setPageIndex(0)}>Set PageIndex to first</TxCoreButton>
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Add Action"
              onChange={handleAddActionCheckboxChange}
              text="Show"
              checked={JSON.stringify(actions) === JSON.stringify(ACTIONS_LIST)}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Row Highlights"
              onChange={handleRowHighlightsCheckboxChange}
              text="Show"
              checked={JSON.stringify(customRowSettings) === JSON.stringify(CUSTOM_ROW_SETTINGS)}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Column Filters"
              onChange={handleColumnFiltersCheckboxChange}
              text="Show"
              checked={JSON.stringify(columnSettings) === JSON.stringify(COLUMN_SETTINGS)}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Column Schema"
              onChange={handleColumnSchemaCheckboxChange}
              text="Add"
              checked={JSON.stringify(columnSettings) === JSON.stringify(COLUMN_SETTINGS)}
              simple
            />
          </div>
        </div>
      </ActionsContainer>

      <InfoPanel/>
    </Container>
  )
}

const InfoPanel = () => {
  return (
    <>
      <p><b>Data table enhancement still on progress, please check below for the details.</b></p>
      <p>Current <span style={{color: 'red'}}>Figma</span> link for new data table can be found <a href="https://www.figma.com/proto/wu8uoWpP16lXyigqhwH19s/Data-Grid--UI-Enhancement?type=design&node-id=1202-959366&t=yMP9ITqjydYSubqp-0&scaling=min-zoom&page-id=1208%3A278564" target="_blank">here</a></p>
      <tx-core-grid>
        <tx-core-column>
          <h4>Current enhancement done:</h4>
          <ol>
            <li>Filter all (Top left text-box)</li>
            <li>Column resizing</li>
            <li>Column re-order</li>
            <li>Column pin/unpin</li>
            <li>Column show/hide (Top right gear icon)</li>
            <li>Column filter</li>
            <li>Download rows to .csv file (Top right download icon)</li>
            <li>Displaying records (Bottom left text)</li>
            <li>Pagination (Previous, Next, First, Last)</li>
            <li>Page size selection using dropdown (Bottom right dropdown)</li>
            <li>Sorting (Asc, Desc, None)</li>
            <li>Collapsible Row (Left most of each row + icon)</li>
            <li>Able to edit column by double-clicking</li>
            <li>Copy row</li>
            <li>Paste row</li>
            <li>Delete row</li>
            <li>Duplicate row</li>
            <li>Codes and performance are more optimized</li>
            <li>When any column is updated by the user, <b>onColumnSettingsChange</b> is triggered and it returns updated column settings</li>
            <li><b style={{color: "var(--color-primary)"}}>All Features from current TXDataTable are included</b></li>
          </ol>
        </tx-core-column>
        <tx-core-column>
          <h5>Current enhancements for Api integration feature</h5>
          <ol>
            <li>Use endpoint to fetch data and use as dataSource</li>
            <li>Update Filter all based on api</li>
            <li>Update column filter based on api</li>
            <li>Update sorting based on api</li>
            <li>Update pageSize based on api</li>
            <li>Download .csv file based on api</li>
            <li>Update pagination (Previous, Next, First, Last) based on api</li>
            <li>Refresh buttons</li>
            <li>Advance filter that can be set through json object</li>
            <li><b style={{color: "var(--color-primary)"}}>Updated style based on the current data table colors, sizing, etc.</b></li>
          </ol>
        </tx-core-column>
      </tx-core-grid>
    </>
  )
}