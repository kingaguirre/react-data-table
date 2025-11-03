import React from 'react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { DUMMY_DATA_SOURCE } from '../data';
import { TxCoreFormControl } from 'tradeport-web-components/dist/react';
import { Actions } from '../interfaces';

export default () => {
  const [downloadHiddenColumn, setDownloadHiddenColumn] = React.useState<any>(true);

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with custom column when excel is downloaded.</p>
      <TXDataTable
        rowKey='text'
        dataSource={[{text: 'Some name 0'}, ...DUMMY_DATA_SOURCE]}
        actions={[Actions.EDIT]}
        columnSettings={[
          {
            title: 'Name (regular text)',
            column: 'text',
          },
          {
            title: 'Birthday (disable col. download)',
            column: 'birthdate',
            hidden: true,
          },
          {
            title: 'user id (Disable col. upload)',
            column: 'userID',
            hidden: true,
          }
        ]}
        onChange={(data) => console.log(data)}
        downloadHiddenColumn={downloadHiddenColumn}

        /** Demo props */
        headerRightControls
        downloadXLS
        uploadXLS
        downloadFileName='test-file-name'
      />
      <ActionsContainer>
        <p>Actions</p>
        <div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Add hidden column when downloading"
              onChange={(value) => setDownloadHiddenColumn(value?.detail)}
              text="Column (birthdate, userID)"
              checked={downloadHiddenColumn}
              simple
            />
          </div>
        </div>
      </ActionsContainer>
    </Container>
  )
}