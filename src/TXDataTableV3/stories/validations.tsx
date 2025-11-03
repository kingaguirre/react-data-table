import React from 'react';
import { TxCoreButton } from 'tradeport-web-components/dist/react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { DATA_SOURCE, COLUMN_SETTINGS } from '../data';
import { Actions } from '../interfaces';

export default () => {
  const dataTableRef = React.createRef<any>();
  const [invalidData, setInvalidData] = React.useState<any>(undefined);

  const handleValidate = () => {
    if (dataTableRef.current) {
      const validateData = dataTableRef.current.validate();
      setInvalidData(validateData)
      console.log(validateData)
    }
  };

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with validation using is <b>.validate()</b> method</p>
      <p>NOTE: hovering the <b style={{color: 'var(--color-danger)'}}>red border</b> will show what error the cell has.</p>
      <TXDataTable
        /** Default settings */
        dataSource={DATA_SOURCE?.txnWorkDeskList}
        columnSettings={COLUMN_SETTINGS.map((i: any) => ({
          ...i,
          // Remove pre-defined pinned value for demo
          pinned: i?.pinned === true ? false : i?.pinned,
          // Removes all column filter for default view
          filterConfig: undefined,
        }))}
        rowKey="transactionReference"
        actions={[Actions.EDIT]}
        selectable
        multiSelect

        /** Ref */
        ref={dataTableRef}
      />
      
      <ActionsContainer>
        <p>Actions</p>
        <div>
          <div>
            <TxCoreButton onButtonClick={() => handleValidate()}>Validate Table</TxCoreButton>
          </div>
          <div>
            <code>{JSON.stringify(invalidData)}</code>
          </div>
        </div>
      </ActionsContainer>
    </Container>
  )
}