import React from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { DUMMY_DATA_SOURCE, EDITABLE_COLUMN_SETTINGS } from '../data';
import { Actions } from "../interfaces";

export default () => (
  <Container>
    <h2>TX Data Table V3</h2>
    <p>Data-table with different types of editable columns.</p>
    <p>Undo and redo of edited cell is also enabled by using <b>undoRedoCellEditing</b> property.</p>
    <TXDataTable
      /** Default settings */
      dataSource={DUMMY_DATA_SOURCE}
      columnSettings={EDITABLE_COLUMN_SETTINGS}
      onChange={(data) => console.log(data)}
      actions={[Actions.EDIT, Actions.ADD, Actions.DELETE]}
      headerRightIcons={[{icon: 'check', title: "Custom icon", onIconClick: () => console.log("Icon is clicked!")}]}
      rowKey="id"
      undoRedoCellEditing
      downloadXLS
      uploadXLS
      headerSearchSettings
    />
  </Container>
)
