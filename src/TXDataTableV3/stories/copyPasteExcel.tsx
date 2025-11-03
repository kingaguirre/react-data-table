import React from 'react';
import { TxCoreFormControl } from 'tradeport-web-components/dist/react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { DATA_SOURCE, COLUMN_SETTINGS } from '../data';

export default () => {
  const [actionConfig, setActionConfig] = React.useState<boolean>(false);
  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with the ability to copy and paste from/to excel using <b>selectionRange</b> props</p>
      <TXDataTable
        /** Default settings */
        dataSource={DATA_SOURCE?.txnWorkDeskList}
        columnSettings={COLUMN_SETTINGS.map((i:any) => ({
          ...i,
          // Remove pre-defined pinned value for demo
          pinned: i.pinned === true ? false : i.pinned,
          // Removes all column filterConfig for default view
          filterConfig: undefined,
          // Removes all column actionConfig for default view
          ...(!actionConfig ? {
            actionConfig: undefined
          } : {})
        }))}
        pageSize={10}

        /** Demo props */
        selectionRange
      />
        <ActionsContainer>
          <p>Actions</p>
          <div>
            <div>
              <TxCoreFormControl
                type="checkbox"
                label="Options"
                onChange={(e) => setActionConfig(e.detail)}
                text="Show schema and non-editable columns"
                checked={actionConfig}
                simple
              />
            </div>
          </div>
        </ActionsContainer>
    </Container>
  )
};
