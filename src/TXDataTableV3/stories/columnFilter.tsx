import React from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { DATA_SOURCE, COLUMN_SETTINGS } from '../data';

const dropdownValues = [{text:'Amend',icon:'pencil'},{text:'Copy',icon:'pencil'},{text:'Restricted Amend',icon:'create-new'}]

export default () => (
  <Container>
    <h2>TX Data Table V3</h2>
    <p>Data-table with column filters</p>
    <TXDataTable
      /** Default settings */
      dataSource={DATA_SOURCE?.txnWorkDeskList}
      actionsDropdownItems={dropdownValues}
      columnSettings={COLUMN_SETTINGS.map((i: any) => ({
        ...i,
        // Remove pre-defined pinned value for demo
        pinned: i.pinned === true ? false : i.pinned,
        // Removes all column actionConfig for default view
        actionConfig: undefined
      }))}
    />
  </Container>
)