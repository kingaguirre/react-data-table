import React, { useState } from 'react';
import { DataTable, exportToCsv } from '../DataTable';
import { DataTable as SimpleDataTable } from '../SimpleDataTable';

const getRandomBirthdate = () => {
  const minAge = 18; // Minimum age for generated birthdate
  const maxAge = 80; // Maximum age for generated birthdate

  // Calculate a random age within the specified range
  const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  // Calculate birthdate by subtracting the random age from the current date
  const birthdate = new Date();
  birthdate.setFullYear(birthdate.getFullYear() - randomAge);

  // Calculate age based on birthdate and current date
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();

  // Adjust age if birthdate hasn't occurred this year yet
  if (
    today.getMonth() < birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())
  ) {
    age--;
  }

  return { birthdate, age };
}

const getRandomNumberBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const selectRandomString = (stringsArray) => {
  const randomIndex = Math.floor(Math.random() * stringsArray.length);
  return stringsArray[randomIndex];
}

const dataSource = Array(138).fill("").map((_, i) => ({
  userID: { value: `user-id${i}` },
  // userID: `user-id${i}`,
  username: `test-username${i}`,
  password: `test-password${i}`,
  intentAction: selectRandomString(["O", "U", "R"]),
  userDetails: {
    email: `test${i}@email.com`,
    isAdmin: i % 2 === 0,
    other: `other value${i}`,
    birthDay: getRandomBirthdate().birthdate,
    firstName: `John${i}`,
    lastName: `Doe${i}`,
    phoneNumber: `123-456-78${i}0`,
    address: `${i}23 Main St`,
    city: 'New York',
    state: 'NY',
    zipCode: `1000${i}`,
    age: getRandomBirthdate().age
  },
  userAccounts: [
    { account1: `test account1-${i}` },
    { account2: `test account2-${i}` },
    { account3: { accountNumber: `test account number 3-${i}` } },
  ],
}));

const columnSettings = [
  {
    column: 'acknowledgementNumber',
    title: 'Acknowledgement Number',
    align: 'center',
    pinned: true,
    groupTitle: 'test',
    order: 0,
    filterBy: {
      type: 'text',
    },
  },
  {
    column: 'username',
    title: 'Username',
    align: 'center',
    groupTitle: 'test',
    order: 0,
    filterBy: {
      type: 'text',
      // value: "0"
    },
  },
  {
    column: 'password',
    title: 'Password',
    width: '200px',
    sorted: 'none',
    order: 1,
  },
  {
    column: 'userDetails.email',
    title: 'Email',
    groupTitle: 'User Details',
    order: 3,
    pinned: true
  },
  {
    column: 'userDetails.isAdmin',
    title: 'Is Admin',
    groupTitle: 'User Details',
    order: 2,
    pinned: 'none',
    filterBy: {
      type: 'select',
      options: [{
        text: 'clear',
        value: ''
        },{
        text: 'admin',
        value: 'true'
        },{
        text: 'clerk',
        value: 'false'
        }]
    },
  },
  {
    column: 'userDetails.other',
    title: 'Other',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.birthDay',
    title: 'Birth Day',
    groupTitle: 'User Details',
    order: 5,
    filterBy: {
      type: 'date-range',
    },
  },
  {
    column: 'userDetails.age',
    title: 'Age',
    groupTitle: 'test Details',
    order: 4,
    filterBy: {
      type: 'number-range',
      // value: {min: 10, max: 50}
    },
  },
  {
    column: 'userDetails.firstName',
    title: 'First Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.lastName',
    title: 'Last Name',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.phoneNumber',
    title: 'Phone Number',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.address',
    title: 'Address',
    groupTitle: 'User Details',
  },
  {
    column: 'userDetails.city',
    title: 'City',
  },
  {
    column: 'userDetails.state',
    title: 'State',
  },
  {
    column: 'userDetails.zipCode',
    title: 'Zip Code',
  },
  {
    column: 'userAccounts[0].account1',
    title: 'Account 1',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userAccounts[1].account2',
    title: 'Account 2',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userAccounts[2].account3',
    title: 'Account 3',
    groupTitle: 'User Accounts',
    hidden: true
  },
  {
    column: 'userID.value',
    title: '#',
    pinned: "none",
    sorted: "none",
    align: "center",
    columnCustomRenderer: (value) => <button onClick={e => {
      e.stopPropagation();
      console.log(`button ${value} clicked`)
    }} style={{fontSize: 5}}>Button {value}</button>
  },
];

const generateRandomTransactions = (num = 100) => {
  const transactionWorkflowStages = ["AWMFR", "CMPCL", "DABCK", "DABCM", "DABMK", "DABBK", "EXDAB", "EXECA", "EXECR", "EXENC", "EXECK", "EXEMK", "FDRCK", "FDRMK", "IMBCA", "IMBCR", "IMBRI", "PDCMP", "IMBCK", "IMBMK", "PDPRC", "PDREF", "PDRWB", "PDRRM", "PDRTO", "PREXE", "PRXCK", "PRXMK", "PPRCA", "PPRCR", "PPRMK", "PRPRC", "PPRCK", "PRINP", "REPRQ", "REFRJ", "REGCL", "REGFL", "REGIN", "RELPG", "SPLCP", "STWFC", "STWFS", "STREJ", "TXPCK", "TXPCR", "TXPMK", "TWFIN"];
  const txBookingLocations = ["SG02", "SG01"];
  const txpersonas = ["CRRC", "STDU", "CLMO", "HTOP", "CTOP", "REMR"];
  
  function getRandomFromArray(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
  }

  return Array(num).fill("").map((_, i) => ({
    transactionReference: "transactionReference_" + Math.random().toString(36).substring(2, 10),
    transactionWorkflowId: "transactionWorkflowId_" + Math.random().toString(36).substring(2, 10),
    transactionWorkflowStage: getRandomFromArray(transactionWorkflowStages),
    txBookingLocation: getRandomFromArray(txBookingLocations),
    acknowledgementNumber: "acknowledgementNumber_" + Math.random().toString(36).substring(2, 10),
    submissionMode: "submissionMode_" + Math.random().toString(36).substring(2, 10),
    fromDate: new Date().toISOString(),
    toDate: new Date().toISOString(),
    product: "product_" + Math.random().toString(36).substring(2, 10),
    step: "step_" + Math.random().toString(36).substring(2, 10),
    customerID: "customerID_" + Math.random().toString(36).substring(2, 10),
    txpersonas: getRandomFromArray(txpersonas),
    amlStatus: "amlStatus_" + Math.random().toString(36).substring(2, 10),
    lliStatus: "lliStatus_" + Math.random().toString(36).substring(2, 10),
    callbackStatus: "callbackStatus_" + Math.random().toString(36).substring(2, 10),
    sanctionStatus: "sanctionStatus_" + Math.random().toString(36).substring(2, 10),
    clientReference: "clientReference_" + Math.random().toString(36).substring(2, 10),
    urgentFlag: Math.random() >= 0.5,
    segment: "segment_" + Math.random().toString(36).substring(2, 10),
    subStep: "subStep_" + Math.random().toString(36).substring(2, 10),
    countryCode: "countryCode_" + Math.random().toString(36).substring(2, 2 + Math.floor(Math.random() * 4)),
  }))
}

console.log(generateRandomTransactions());


export default () => {
  const [selectedRow, setSselectedRow] = useState<any>(null);

  const handleRowClick = (rowData: any) => {
    console.log("Clicked row:", rowData);
  };

  const handleRowDoubleClick = (rowData: any) => {
    console.log("Double-clicked row:", rowData);
  };

  const handleColumnSettingsChange = (newColumnSettings: any) => {
    console.log("Column settings:", newColumnSettings);
  };

  return (
    <div style={{padding: 16}}>
      <button onClick={() => exportToCsv("data.csv", selectedRow, columnSettings)}>download selected</button>
      <DataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        rowKey="userID.value"
        activeRow="user-id2"
        selectedRows={[{"userID": { "value": "user-id0" }}]}
        // selectedRows={[{"userID": "user-id0"}]}
        // selectedRows={["user-id0"]}
        selectable
        downloadCSV
        customRowSettings={[
          {
            column: "intentAction",
            value: "R",
            showColumn: false,
            styles: {
              backgroundColor: "red",
              textDecoration: "line-through"
            }
          },
          {
            column: "intentAction",
            value: "U",
            showColumn: false,
            styles: {
              backgroundColor: "orange",
            }
          },
          {
            column: "intentAction",
            value: "O",
            showColumn: false,
            styles: {
              backgroundColor: "rgba(0,0,0,0.3)",
            }
          }
        ]}
        // collapsibleRowRender={() => (
        //   <DataTable
        //     dataSource={dataSource}
        //     columnSettings={[{
        //       column: 'userDetails.birthDay',
        //       title: 'Birth Day',
        //       order: 5,
        //       width: "200px"
        //     },
        //     {
        //       column: 'userDetails.firstName',
        //       title: 'First Name',
        //       width: "150px"
        //     }]}
        //     rowKey="userID.value"
        //     clickableRow
        //   />
        // )}
        onColumnSettingsChange={handleColumnSettingsChange}
        onPageIndexChange={e => console.log(`Page index: ${e}`)}
        onPageSizeChange={e => console.log(`Page size: ${e}`)}
        onSelectedRowsChange={rows => setSselectedRow(rows)}
      />
    <div style={{height: 100}}/>
      {/* <DataTable
        fetchConfig={{
          endpoint: "http://localhost:3002/custom-items",
          responseTotalDataPath: "data.count",
          responseDataPath: "data.dataTableItem",
          requestData: {
            pageNumber: 1,
            pageSize: 10,
            filter: {
              username: "test-username1",
            }
          },
          filterSettings: [{
            id: "ack-settings",
            title: "Ack Settings",
            fields: [{
                id: "keyID1",
                type: "text",
                value: "test"
            }, {
                id: "keyID2",
                type: "select",
                value: "test-dropdown",
                options: [{
                    value: "test-dropdown",
                    text: "Test Dropdown"
                }, {
                    value: "test-dropdown1",
                    text: "Test Dropdown 1"
                }, {
                    value: "test-dropdown2",
                    text: "Test Dropdown 2"
                }]
            }]
        }, {
          id: "trn-settings",
          title: "TRN Settings",
          default: true,
          fields: [{
              id: "keyID11",
              type: "text",
              value: "test"
          }, {
              id: "keyID21",
              type: "select",
              value: "test-dropdown",
              options: [{
                  value: "test-dropdown",
                  text: "Test Dropdown"
              }, {
                  value: "test-dropdown1",
                  text: "Test Dropdown 1"
              }, {
                  value: "test-dropdown2",
                  text: "Test Dropdown 2"
              }]
          }, {
            id: "keyID111",
            type: "text",
            value: "testtestest"
        },]
      }]
        }}
        dataSource={dataSource}
        columnSettings={columnSettings}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        rowKey="userID"
        activeRow="user-id2"
        selectedRows={[{"userID": { "value": "user-id0" }}]}
        // selectedRows={[{"userID": "user-id0"}]}
        // selectedRows={["user-id0"]}
        selectable
        downloadCSV
        collapsibleRowRender={() => (
          <DataTable
            dataSource={dataSource}
            columnSettings={[{
              column: 'userDetails.birthDay',
              title: 'Birth Day',
              order: 5,
              width: "200px"
            },
            {
              column: 'userDetails.firstName',
              title: 'First Name',
              width: "150px"
            }]}
            rowKey="userID.value"
            clickableRow
          />
        )}
        onColumnSettingsChange={handleColumnSettingsChange}
        onPageIndexChange={e => console.log(`Page index: ${e}`)}
        onPageSizeChange={e => console.log(`Page size: ${e}`)}
        onSelectedRowsChange={rows => setSselectedRow(rows)}
      />
      <div style={{height: 100}}/>
      <DataTable
        fetchConfig={{
          endpoint: "http://localhost:3001/custom-items",
          responseTotalDataPath: "data.count",
          responseDataPath: "data.dataTableItem",
          requestData: {
            method: "post",
            pageNumber: 1,
            pageSize: 10,
            filter: {
              username: "test-username1",
            }
          },
          filterSettings: [{
            id: "ack-settings",
            title: "Ack Settings",
            fields: [{
                id: "keyID1",
                type: "text",
                value: "test"
            }, {
                id: "keyID2",
                type: "select",
                value: "test-dropdown",
                options: [{
                    value: "test-dropdown",
                    text: "Test Dropdown"
                }, {
                    value: "test-dropdown1",
                    text: "Test Dropdown 1"
                }, {
                    value: "test-dropdown2",
                    text: "Test Dropdown 2"
                }]
            }]
        }, {
          id: "trn-settings",
          title: "TRN Settings",
          default: true,
          fields: [{
              id: "keyID11",
              type: "text",
              value: "test"
          }, {
              id: "keyID21",
              type: "select",
              value: "test-dropdown",
              options: [{
                  value: "test-dropdown",
                  text: "Test Dropdown"
              }, {
                  value: "test-dropdown1",
                  text: "Test Dropdown 1"
              }, {
                  value: "test-dropdown2",
                  text: "Test Dropdown 2"
              }]
          }, {
            id: "keyID111",
            type: "text",
            value: "testtestest"
        },]
      }]
        }}
        dataSource={dataSource}
        columnSettings={columnSettings}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        rowKey="userID"
        activeRow="user-id2"
        selectedRows={[{"userID": { "value": "user-id0" }}]}
        // selectedRows={[{"userID": "user-id0"}]}
        // selectedRows={["user-id0"]}
        selectable
        downloadCSV
        collapsibleRowRender={() => (
          <DataTable
            dataSource={dataSource}
            columnSettings={[{
              column: 'userDetails.birthDay',
              title: 'Birth Day',
              order: 5,
              width: "200px"
            },
            {
              column: 'userDetails.firstName',
              title: 'First Name',
              width: "150px"
            }]}
            rowKey="userID.value"
            clickableRow
          />
        )}
        onColumnSettingsChange={handleColumnSettingsChange}
        onPageIndexChange={e => console.log(`Page index: ${e}`)}
        onPageSizeChange={e => console.log(`Page size: ${e}`)}
        onSelectedRowsChange={rows => setSselectedRow(rows)}
      />
      <div style={{height: 100}}/>
      
    <SimpleDataTable
      dataSource={dataSource}
      columnSettings={columnSettings}
      rowKey="userID"
      selectable
      collapsibleRowRender={() => (
        <DataTable
          dataSource={dataSource}
          columnSettings={[{
            column: 'userDetails.birthDay',
            title: 'Birth Day',
            order: 5,
            width: "200px"
          },
          {
            column: 'userDetails.firstName',
            title: 'First Name',
            width: "150px"
          }]}
          rowKey="userID"
          clickableRow
        />
      )}
    /> */}

    
    </div>
  )
}
