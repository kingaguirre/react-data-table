import React from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { DUMMY_DATA_SOURCE, EDITABLE_COLUMN_SETTINGS } from '../data';

export default () => {
  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with default settings which is <code>dataSource</code> and <code>columnSettings</code></p>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS.map(i => ({
          ...i,
          /** remove preset value in column controls */
          pinned: undefined,
          sorted: undefined,
          draggable: undefined,
          resizable: undefined
        }))}
        headerSearchSettings
      />

    </Container>
  )
}