import React from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { DUMMY_DATA_SOURCE, EDITABLE_COLUMN_SETTINGS } from '../data';
import styled from 'styled-components';
import { Actions } from '../interfaces';

const InnerContainer = styled.div`
  > h5 {
    margin: 20px 0 5px;
  }
  p {
    font-size: 12px;
    margin: 0 0 12px;
  }
`;

export default () => (
  <Container>
    <h2>TX Data Table V3</h2>
    <p>Data-table with different examples.</p>

    <InnerContainer>
      <h5>Reziable</h5>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.map(i => ({...i, resizable: true}))}
        onChange={(data) => console.log(data)}
        rowKey="id"
        headerRightControls
        localStorageSettingsKey="resizable-table" // use to save column settings in localStorage
      />

      <h5>Draggable</h5>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.map(i => ({...i, draggable: true}))}
        onChange={(data) => console.log(data)}
        rowKey="id"
      />

      <h5>Hidden columns with settings panel</h5>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.map((i, index) => ({...i, hidden: index === 0}))}
        onChange={(data) => console.log(data)}
        headerRightControls
        rowKey="id"
      />

      <h5>Validation with unique column and deleted row</h5>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.slice(0, 4).map((i, index) => ({
          ...i,
          actionConfig: index !== 2 ? {
            ...(i?.actionConfig as any),
            isUnique: index === 0 // add isUnique: true to first column
          } : false,
        }))}
        onChange={(data) => console.log(data)}
        actions={[Actions.ADD, Actions.DELETE, Actions.EDIT]}
        rowKey="id"
      />

      <h5>Single and Double row click.</h5>
      <p>Setting <b>setActiveRowOnClick</b> or <b>setActiveRowOnDoubleClick</b> to <b>false</b> will disable <b>active</b> row style when row is clicked.
        below example have <b>setActiveRowOnDoubleClick</b> set to false, so double clicking row will not set active row.
      </p>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.slice(0, 6).map((i, index) => ({
          ...i,
          pinned: index === 0
        }))}

        onRowClick={(e) => console.log('Row is Clicked', e)}
        onRowDoubleClick={(e) => console.log('Row is Double Clicked', e)}
        setActiveRowOnDoubleClick={false} // Dont set active row when double clicked
      />
    </InnerContainer>
  </Container>
)
