import React from 'react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer, Highlight, BulletContainer, BulletTitle, BulletList, BulletItem, BulletSubList, BulletSubItem } from './utils';
import { DUMMY_DATA_SOURCE, EDITABLE_COLUMN_SETTINGS, CUSTOM_ROW_SETTINGS } from '../data';
import { TxCoreFormControl } from 'tradeport-web-components/dist/react';

export default () => {
  const [isPermanentDelete, setIsPermanentDelete] = React.useState<any>(false);

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with defined <Highlight>isBulkDelete: <b>true</b></Highlight>.</p>
      <TXDataTable
        /** Default settings */
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={EDITABLE_COLUMN_SETTINGS}
        customRowSettings={CUSTOM_ROW_SETTINGS}
        onChange={(data) => console.log(data)}
        rowKey="id"
        headerRightControls
        isPermanentDelete={isPermanentDelete}
        
        isBulkDelete // Enable bulk delete
        onBulkDelete={(deletedRows) => console.log(deletedRows)} // Function to return deleted rows
      />
      
      <ActionsContainer>
        <p>Actions</p>
        <div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Set isPermanentDelete"
              onChange={(value) => setIsPermanentDelete(value.detail)}
              text="True"
              checked={isPermanentDelete}
              simple
            />
          </div>
        </div>
      </ActionsContainer>

      <FeatureDescription/>
    </Container>
  )
}

const FeatureDescription = () => {
  return (
    <BulletContainer>
      <BulletTitle>Bulk Delete Feature</BulletTitle>
      <BulletList>
        <BulletItem>
          If <Highlight>isBulkDelete</Highlight> is <b>true</b>:
          <BulletSubList>
            <BulletSubItem>
              The selection mode is always set to <Highlight>multiSelect: true</Highlight>, allowing multiple rows to be selected for deletion.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          A <Highlight>panel</Highlight> will appear above the table when rows are selected, providing delete action button.
        </BulletItem>
        <BulletItem>
          Clicking the <Highlight>Delete</Highlight> button in the panel:
          <BulletSubList>
            <BulletSubItem>
              Triggers the <Highlight>onBulkDelete</Highlight> function, returning the <Highlight>deleted rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              Executes the row deletion process.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          <Highlight>isPermanentDelete</Highlight> prop behavior:
          <BulletSubList>
            <BulletSubItem>
              If <Highlight>true</Highlight>, selected rows are permanently removed from the table.
            </BulletSubItem>
            <BulletSubItem>
              If <Highlight>false</Highlight>, the <Highlight>intentAction</Highlight> value for selected rows is set to <Highlight>'D'</Highlight>, indicating a soft delete.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          If <Highlight>ssrConfig</Highlight> is defined:
          <BulletSubList>
            <BulletSubItem>
              Row deletion is handled server-side by the API.
            </BulletSubItem>
            <BulletSubItem>
              The API updates the <Highlight>dataSource</Highlight> accordingly.
            </BulletSubItem>
            <BulletSubItem>
              The <Highlight>onBulkDelete</Highlight> function still returns the <Highlight>deleted rows</Highlight> for reference.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
      </BulletList>
    </BulletContainer>
  );
};