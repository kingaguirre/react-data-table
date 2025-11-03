import React, { useEffect, useState, useRef } from 'react';
import { TxCoreGrid, TxCoreButton } from 'tradeport-web-components/dist/react';
import { TXDataTable } from '../index';
import { Container } from './utils';
import { selectRandomString, getRandomNumberBetween } from '../data';
import { getInputProps, getValueFromPath } from '@utils/index';
import { TXInput } from '@atoms/TXInput';
import { Actions } from '../interfaces';

export const DUMMY_DATA_SOURCE = Array(1).fill('').map((_, i) => ({
  userId: `id ${i}`,
  name: `Name ${i}`,
  userType: selectRandomString(['finance', 'it']),
  email: i % 2 === 0 ? `email${i}@example.com` : '',
  balance: getRandomNumberBetween(10000, 20000),
  requestAmount: getRandomNumberBetween(10000, 20000),
  approvedLimit: getRandomNumberBetween(10000, 20000),
}))

const OPTIONS = [{
  text: 'Finance',
  value: 'finance'
}, {
  text: 'IT',
  value: 'it',
}]

const ROW_KEY = 'userId'

const INPUT_ERROR = 'Balance should be more than request amount';
export default () => {
  const dataTableRef = useRef<any>(undefined)
  const [dataSource, setDataSource] = useState(DUMMY_DATA_SOURCE)
  const [currentFields, setCurrentFields] = useState<any | undefined>(undefined);
  const [invalidData, setInvalidData] = React.useState<any>(undefined);

  useEffect(() => {
    // Check current active row state
    // console.log(currentFields)

    // this is where we pass the updated dataSource value
    // props.onChange(dataSource)
    console.log(dataSource)
  }, [dataSource])

  useEffect(() => {
    // Check current active row state
    // console.log(currentFields)

    // this is where we pass the updated dataSource value
    // props.onChange(dataSource)
    console.log(dataSource)
  }, [currentFields])

  // Create a custom error to control outside input validation
  const getInputCustomError = () => {
    let variation = '';
    let helpText = '';
    let helpTextColor = '';

    // check if usertype is a finance
    const isFinance = getValueFromPath(currentFields, 'userType') === 'finance'
    // balance should be more than requestAmount if finance userType
    const isError = parseFloat(getValueFromPath(currentFields, 'balance')) < parseFloat(getValueFromPath(currentFields, 'requestAmount'))

    // do validation state for the outside input
    if (isFinance && isError) {
      variation = 'danger';
      helpText = INPUT_ERROR;
      helpTextColor = 'danger';
    }

    return {
      variation,
      helpText,
      helpTextColor,
    }
  }

  // Create a custom error within data-table
  const getCellCustomError = (rowData: any) => {
    // check if usertype is a finance
    const isFinance = getValueFromPath(rowData, 'userType') === 'finance'
    // balance should be more than requestAmount if finance userType
    const isError = parseFloat(getValueFromPath(rowData, 'balance')) > parseFloat(getValueFromPath(rowData, 'approvedLimit'))

    // do validation, return error message if have error otherwise return null or undefined
    return isFinance && isError ? 'Approved Limit should be more than the balance' : undefined;
  }

  // when data-table change update the states
  const handleDataTableChange = (data) => {
    const rowKeyValue = getValueFromPath(currentFields, ROW_KEY)
    const rowData = data.find(i => getValueFromPath(i, ROW_KEY) === rowKeyValue)
    setCurrentFields(rowData)
    setDataSource(data)
  }

  // update dataSource state when outside input change
  const handleInputChange = (data) => {
    const rowKeyValue = getValueFromPath(currentFields, ROW_KEY)
    // update object in dataSource
    const newData = dataSource.map(obj => getValueFromPath(obj, ROW_KEY) === rowKeyValue ? data : obj)
    setDataSource(newData)
  }

  const inputProps = getInputProps(
    {},
    currentFields,
    setCurrentFields,
    undefined,
    handleInputChange,
    true
  );

  const handleClearClick = () => {
    setCurrentFields(undefined)
    dataTableRef?.current?.clearActiveRow()
  }

  const handleValidate = () => {
    if (dataTableRef.current) {
      // Data-table errors
      const validateData = dataTableRef.current.validate();

      // Since input is outside data-table and it is custom error we manually include errors below
      const requestAmountError = getInputCustomError()?.helpText
      const customInputError = requestAmountError ? [{
        "column": "requestAmount",
        "value": getValueFromPath(currentFields?.requestAmount),
        "error": requestAmountError,
        "errorMessage": requestAmountError,
      }] : [];

      const invalidData = [...validateData, ...customInputError]
      setInvalidData(invalidData)
      console.log(invalidData)
    }
  };
  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with different examples including <code>custom validation</code> for both built-in cell input and input outside data-table.</p>

      <TxCoreGrid>
        <tx-core-column xs="24">
          <TXDataTable
            ref={dataTableRef}
            /** Default settings */
            dataSource={dataSource}
            columnSettings={[
              {
                title: 'Name',
                column: 'name',
                filterConfig: {
                  type: 'text',
                  placeholder: 'Search name'
                },
                actionConfig: {
                  type: 'text',
                  placeholder: 'Set name',
                  isUnique: true,
                  schema: {
                    type: "string",
                    minLength: 1,
                  }
                },
              },
              {
                title: 'User Type',
                column: 'userType',
                filterConfig: {
                  type: 'dropdown',
                  options: OPTIONS,
                  placeholder: 'Search user type'
                },
                actionConfig: {
                  type: 'dropdown',
                  placeholder: 'Select user type',
                  options: OPTIONS
                },
              },
              {
                title: 'Email',
                column: 'email',
                hidden: true, // example with hidden column for download
                actionConfig: false // example for non-editable column
              },
              {
                title: 'Balance',
                column: 'balance',
                actionConfig: {
                  type: 'number',
                  placeholder: 'Enter Balance',
                  
                },
              },
              {
                title: 'Approved Limit',
                column: 'approvedLimit',
                actionConfig: {
                  type: 'number',
                  placeholder: 'Enter approved limit',
                  validation: getCellCustomError,
                  schema: {
                    type: "number",
                  }
                },
              },
            ]}
            onChange={(data) => handleDataTableChange(data)}
            actions={[Actions.EDIT]}
            rowKey={ROW_KEY}
            headerSearchSettings
            headerRightControls
            onRowClick={(data) => setCurrentFields(data)}
            downloadXLS
          />
       </tx-core-column>
      </TxCoreGrid>

      <TxCoreGrid>
        <tx-core-column xs="24" sm="12" md="6" lg="6" xl="6">
          <TXInput
            {...inputProps}
            label='Request Amount'
            name='requestAmount'
            type='number'
            {...getInputCustomError()}
          />
        </tx-core-column>
      </TxCoreGrid>

      <TxCoreGrid>
        <tx-core-column xs="24">
          <TxCoreButton
            size='sm'
            variation='primary'
            onButtonClick={handleClearClick}
          >Clear Active row</TxCoreButton>
        </tx-core-column>
      </TxCoreGrid>

      <TxCoreGrid>
        <tx-core-column xs="24">
          <TxCoreButton
            size='sm'
            variation='primary'
            onButtonClick={handleValidate}
          >Validate table</TxCoreButton>
          <div>
            <code>{JSON.stringify(invalidData)}</code>
          </div>
        </tx-core-column>
      </TxCoreGrid>
    </Container>
  )
}