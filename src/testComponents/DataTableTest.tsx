import React, { useState } from 'react';
import { DataTable, exportToCsv, UploadCell } from '../DataTable';
import { DataTable as DataTable_ } from '../DataTable_';
import { Actions } from "../DataTable/interfaces";
import { replaceLocalhostWithDomain } from "../DataTable/utils/index";
import { App } from '../DataTable_/components/GlobalStateTest'
import { MenuForm } from '../MenuForm';
import { DataTable as SimpleDataTable } from '../SimpleDataTable';
import DynamicChart from '../DynamicChart';
// import BarChart from '../BarChart';
import Panel from '../Panel';
import ResizableTable from '../ResizableTable';
import Chart from '../Chart';
import CombinedChart from '../CombinedChart';
import TXChart from '../TXChart';
import { dateFormat } from '../DataTable_/utils/index'
import { volume_vertical_bar_chart_labels, volume_vertical_bar_chart_datasets, distribution_horizontal_bar_chart_labels, distribution_horizontal_bar_chart_datasets } from './data';
import {UploadSummary, DownloadSummary} from './UploadSummary'
import {DevelopersGuide} from './DevelopersGuide'
import { ParentComponent } from './ReRenderComponent'
import { DataTableEnhancement } from './DataTableEnhancement'
import Popover from './Popover'

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

const dataSource = Array(2).fill("").map((_, i) => ({
  intentAction: i !== 0 ? selectRandomString(["O", "U", "R", "N"]) : "O",
  // acknowledgementNumber: `ack-${i}`,
  ...((i === 0 || i === 1 || i === 2) ? {
    acknowledgementNumber: {
      value: i === 0 ? '231' : i === 2 ? '123123123123123112313131231231312' : '23123',
      ...((i === 0 || i === 2) ? {
        isChanged: true,
        previous: { value: '2222' }
      } : {}),
    },
  } : {
    acknowledgementNumber: null
  }),
  userID: { value: `user-id${i}` },
  // userID: `user-id${i}`,
  username: i === 0 ? ['test1', 'test2', 'test3'] : i === 2 ? 'new item must not be 2' : i === 1 ? ['2020', '12', '24'] : `test-username${i}`,
  password: `test-password${i}`,
  test: null,
  test1: undefined,
  userDetails: {
    image: "asdasdasd",
    email: `test${i}@email.com`,
    email1: {
      value: `test${i}@email1.com`
    },
    isAdmin: {
      value: (i % 2 === 0).toString()
    },
    other: `other value${i}`,
    other1: {
      value: `other1 value${i}`
    },
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
  remarks: "",
  userAccounts: [
    { account1: `test account1-${i}` },
    { account2: `test account2-${i}` },
    { account3: { accountNumber: `test account number 3-${i}` } },
  ],
}));

const FORM_MENU_FIELD_SETTINGS = {
  menuColumn: "userDetails.email",
  fields: [
    {
      column: "username",
      label: "Username",
      placeholder: "Enter Username",
      size: {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 8
      },
      schema: {
        type: "string",
        minLength: 1
      }
    },
    {
      column: "intentAction",
      label: "Intent Action",
      placeholder: "Enter IntentAction",
      schema: {
        type: "string",
        maxLength: 1,
        minLength: 1,
        pattern: "^[a-zA-Z]$"
      }
    },
    {
      column: "userDetails.email",
      label: "Email",
      placeholder: "Enter Email",
    },
    {
      column: "userDetails.address",
      label: "Address",
      placeholder: "Enter Address",
      type: "textarea",
      size: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24
      }
    },
    {
      column: "userDetails.birthDay",
      label: "BirthDay",
      placeholder: "Enter BirthDay",
      type: "date"
    },
    {
      column: "userDetails.isAdmin",
      label: "Admin",
      placeholder: "Select BirthDay",
      type: "select",
      options: [
        {value: "true", text: "Admin"},
        {value: "false", text: "Not Admin"},
      ]
    },
    {
      column: "remarks",
      label: "Remarks",
      placeholder: "Enter remarks",
      type: "textarea",
      required: (data) => {
        const { userDetails } = data;
        return userDetails?.isAdmin === "true";
      },
      size: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24
      }
    },
  ]
}

const columnSettings = [
  {
    column: 'acknowledgementNumber',
    title: 'Acknowledgement Number',
    align: 'center',
    pinned: true,
    groupTitle: 'test',
    order: 0,
    // filterConfig: {
    //   type: 'text',
    // },
    actionConfig: {
      type: "text",
      isUnique: true,
      // value: "option2",
      // options: [
      //   { value: "option1", text: "Option 1" },
      //   { value: "option2", text: "Option 2" },
      // ],
      schema: {
        type: "string",
        maxLength: 3,
        minLength: 1,
        // pattern: "^[a-zA-Z]$"
      }
    }
  },
  // {
  //   column: 'username',
  //   title: 'Username',
  //   align: 'center',
  //   groupTitle: 'test',
  //   order: 0,
  //   actionConfig: false,
  //   filterConfig: {
  //     type: 'text',
  //     // value: "0"
  //   },
  // },
  // {
  //   column: 'password',
  //   title: 'Password',
  //   width: '200px',
  //   sorted: 'none',
  //   order: 1,
  //   hidden: true
  // },
  // {
  //   column: 'userDetails.image',
  //   title: 'Image',
  //   width: '120px',
  //   sorted: 'none',
  //   order: 1,
  //   cell: () => {
  //     return (
  //       <UploadCell
  //         editable
  //         onFileChange={(file) => console.log(file)}
  //         accept="image/*" // Accept only images
  //       />
  //     )
  //   }
  // },
  // {
  //   column: 'userDetails.email',
  //   title: 'Email',
  //   groupTitle: 'User Details',
  //   order: 3,
  //   pinned: true,
  // },


  // {
  //   column: 'userDetails.email1',
  //   title: 'Emails1',
  //   groupTitle: 'User Details',
  // },

  // {
  //   column: 'userDetails',
  //   title: 'Emails and other',
  //   groupTitle: 'User Details',
  //   order: 4,
  //   cell: (_, data) => `${data?.userDetails?.email1?.value} ${data?.userDetails?.other1.value}`
  // },
  // {
  //   column: 'userDetails.isAdmin',
  //   title: 'Is Admin',
  //   groupTitle: 'User Details',
  //   order: 2,
  //   pinned: 'none',
  //   actionConfig: {
  //     type: 'select',
  //     options: [{
  //       text: 'clear',
  //       value: ''
  //       },{
  //       text: 'admin',
  //       value: 'true'
  //       },{
  //       text: 'clerk',
  //       value: 'false'
  //       }]
  //   },
  //   // filterConfig: {
  //   //   type: 'select',
  //   //   options: [{
  //   //     text: 'clear',
  //   //     value: ''
  //   //     },{
  //   //     text: 'admin',
  //   //     value: 'true'
  //   //     },{
  //   //     text: 'clerk',
  //   //     value: 'false'
  //   //     }]
  //   // },
  // },
  // {
  //   column: 'userDetails.other',
  //   title: 'Other',
  //   groupTitle: 'User Details',
  // },
  // {
  //   column: 'userDetails.birthDay',
  //   title: 'Birth Day',
  //   groupTitle: 'User Details',
  //   order: 5,
  //   // filterConfig: {
  //   //   type: 'date-range',
  //   // },
  //   actionConfig: {
  //     type: 'date'
  //   }
  // },
  // {
  //   column: 'userDetails.age',
  //   title: 'Age',
  //   groupTitle: 'test Details',
  //   order: 4,
  //   // filterConfig: {
  //   //   type: 'number-range',
  //   //   // value: {min: 10, max: 50}
  //   // },
  // },
  // {
  //   column: 'userDetails.firstName',
  //   title: 'First Name',
  //   groupTitle: 'User Details',
  // },
  // {
  //   column: 'userDetails.lastName',
  //   title: 'Last Name',
  //   groupTitle: 'User Details',
  // },
  // {
  //   column: 'userDetails.phoneNumber',
  //   title: 'Phone Number',
  //   groupTitle: 'User Details',
  // },
  // {
  //   column: 'userDetails.address',
  //   title: 'Address',
  //   groupTitle: 'User Details',
  // },
  // {
  //   column: 'userDetails.city',
  //   title: 'City',
  // },
  // {
  //   column: 'userDetails.state',
  //   title: 'State',
  // },
  // {
  //   column: 'userDetails.zipCode',
  //   title: 'Zip Code',
  // },
  // {
  //   column: 'userAccounts[0].account1',
  //   title: 'Account 1',
  //   groupTitle: 'User Accounts',
  //   hidden: true
  // },
  // {
  //   column: 'userAccounts[1].account2',
  //   title: 'Account 2',
  //   groupTitle: 'User Accounts',
  //   hidden: true
  // },
  // {
  //   column: 'userAccounts[2].account3',
  //   title: 'Account 3',
  //   groupTitle: 'User Accounts',
  //   hidden: true
  // },
  // {
  //   column: 'userID.value',
  //   title: '#',
  //   pinned: "none",
  //   sorted: "none",
  //   align: "center",
  //   cell: (value) => <button onClick={e => {
  //     e.stopPropagation();
  //     console.log(`button ${value} clicked`)
  //   }} style={{fontSize: 5}}>Button {value}</button>
  // },
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

const openJsonInNewWindow = (jsonObject) => {
  // Convert the JSON object to a pretty-printed string
  const jsonString = JSON.stringify(jsonObject, null, 2);

  // Open a new window
  const newWindow: any = window.open('', 'JSON');

  // Escape HTML to prevent XSS attacks
  const escapedJsonString = jsonString.replace(/[&<>"']/g, (match) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });

  // Add some basic styling and pre-formatting to the new window's document for readability
  newWindow.document.write(`
    <html>
      <head>
        <title>JSON Data</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <pre>${escapedJsonString}</pre>
      </body>
    </html>
  `);

  // Ensure the new window's document is closed so it displays correctly
  newWindow.document.close();
};

const ACTIONS_LIST = [Actions.DELETE, Actions.ADD, Actions.COPY, Actions.PASTE, Actions.DUPLICATE, Actions.EDIT]
export default () => {
  const [selectedRow, setSselectedRow] = useState<any>(null);
  const menuFormRef = React.createRef<any>();
  const dataTableRef = React.createRef<any>();
  const [actions, setActions] = useState<any>(ACTIONS_LIST)
  const [colSettings, setColSettings] = useState<any>(columnSettings)
  const popoverRef = React.useRef();

  const handleClick = () => {
    if (menuFormRef.current) {
      const isValid = menuFormRef.current.validate();
      console.log("Form is valid:", isValid);
    }
    if (dataTableRef.current) {
      const isValid = dataTableRef.current.validate();
      console.log("validate data-table:", isValid);
    }
  };

  const handleRowClick = (rowData: any) => {
    console.log("Clicked row:", rowData);
  };

  const handleRowDoubleClick = (rowData: any) => {
    console.log("Double-clicked row:", rowData);
  };

  const handleColumnSettingsChange = (newColumnSettings: any) => {
    console.log("Column settings:", newColumnSettings);
  };

  const handleGetSelectedRows = () => {
    const selectedRows = dataTableRef.current.getSelectedRows();
    console.log('Selected Rows:', selectedRows);
  };

  const handleClearSelectedRows = () => {
    dataTableRef.current.clearSelectedRows();
  };

  const handleClearActiveRow = () => {
    dataTableRef.current.clearActiveRow();
  };

  return (
    <div style={{padding: 16}}>
      {/* <div style={{margin: 400}}>
        <Popover
          trigger="click"
          content={<div style={{width: 600}}>Your content here</div>}
          title="Some title"
          placement="top"
        >
          <button>Show Popover on click</button>
        </Popover>

        <Popover
          // trigger="click"
          content={<div style={{width: 600}}>Your content here 1</div>}
          title="Some title"
          placement="top"
          target="test1"
        />
        <button data-popover-id="test1">Show Popover on hover</button>
      </div> */}
      {/* <TXChart
        title='1testasdasda'
        type="volume-vertical-bar-chart"
        labels={volume_vertical_bar_chart_labels}
        datasets={volume_vertical_bar_chart_datasets}
        volumeVerticalBarChartOptions={{
          y1Title: 'Custom Volume Title',
          y2Title: 'Custom USD Title',
        }}
      /> */}
      {/* <TXChart
        title='1231123'
        type="distribution-horizontal-bar-chart"
        labels={distribution_horizontal_bar_chart_labels}
        datasets={distribution_horizontal_bar_chart_datasets}
      />
      <TXChart
        title='testasdasda'
        type="distribution-horizontal-bar-chart"
        labels={distribution_horizontal_bar_chart_labels}
        datasets={distribution_horizontal_bar_chart_datasets}
        distributionHorizontalBarChartOptions={{
          hideLabels: true, // Option to hide labels
          valueFormatter: (value) => `$${value}`, // Custom formatter for values
        }}
      /> */}
      {/* <ParentComponent/> */}
      {/* <TXChart
        title='1testasdasda'
        type="volume-vertical-bar-chart"
        labels={volume_vertical_bar_chart_labels}
        datasets={volume_vertical_bar_chart_datasets}
        volumeVerticalBarChartOptions={{
          y1Title: 'Custom Volume Title',
          y2Title: 'Custom USD Title',
        }}
      />
      <TXChart
        title='1231123'
        type="distribution-horizontal-bar-chart"
        labels={distribution_horizontal_bar_chart_labels}
        datasets={distribution_horizontal_bar_chart_datasets}
      />
      <TXChart
        title='testasdasda'
        type="distribution-horizontal-bar-chart"
        labels={distribution_horizontal_bar_chart_labels}
        datasets={distribution_horizontal_bar_chart_datasets}
        distributionHorizontalBarChartOptions={{
          hideLabels: true, // Option to hide labels
          valueFormatter: (value) => `$${value}`, // Custom formatter for values
        }}
      />
      <TXChart labels={distribution_horizontal_bar_chart_labels} datasets={distribution_horizontal_bar_chart_datasets} />
      <TXChart
        type="line-chart"
        labels={['January', 'February', 'March', 'April', 'May', 'June', 'July']}
        datasets={[
          {
            label: 'Sales',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'blue',
            tension: 0.1,
          },
        ]}
        title="Line Chart Example"
      />

      <TXChart
        type="pie-chart"
        labels={['Red', 'Blue', 'Yellow']}
        datasets={[
          {
            data: [300, 50, 100],
            backgroundColor: ['red', 'blue', 'yellow'],
          },
        ]}
        title="Pie Chart Example"
      />

      <TXChart
        type="pie-chart"
        labels={['Red', 'Blue', 'Yellow']}
        datasets={[
          {
            data: [300, 50, 100],
            backgroundColor: ['red', 'blue', 'yellow'],
            cutout: '50%', // This makes it a doughnut chart
          },
        ]}
        title="Doughnut Chart Example"
      />

      <TXChart
        type="radar-chart"
        labels={['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running']}
        datasets={[
          {
            label: 'My First Dataset',
            data: [65, 59, 90, 81, 56, 55, 40],
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)',
          },
          {
            label: 'My Second Dataset',
            data: [28, 48, 40, 19, 96, 27, 100],
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)',
          },
        ]}
        title="Radar Chart Example"
      />

      <TXChart
        type="polar-area-chart"
        labels={['Red', 'Green', 'Yellow', 'Grey', 'Blue']}
        datasets={[
          {
            data: [11, 16, 7, 3, 14],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(255, 205, 86, 0.2)',
              'rgba(201, 203, 207, 0.2)',
              'rgba(54, 162, 235, 0.2)',
            ],
          },
        ]}
        title="Polar Area Chart Example"
      />

      <TXChart
        type="bubble-chart"
        labels={[]}
        datasets={[
          {
            label: 'Bubble Dataset 1',
            data: [
              { x: 20, y: 30, r: 15 },
              { x: 40, y: 10, r: 10 },
              { x: 30, y: 20, r: 25 },
              { x: 10, y: 40, r: 15 },
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
          },
          {
            label: 'Bubble Dataset 2',
            data: [
              { x: 25, y: 20, r: 10 },
              { x: 35, y: 15, r: 20 },
              { x: 20, y: 30, r: 10 },
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
          },
        ]}
        title="Bubble Chart Example"
      />

    <TXChart
      type="scatter-chart"
      labels={[]}
      datasets={[
        {
          label: 'Scatter Dataset 1',
          data: [
            { x: -10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 5 },
            { x: 2, y: 7 },
            { x: -5, y: -5 },
          ],
          backgroundColor: 'rgba(255, 99, 132, 1)',
        },
        {
          label: 'Scatter Dataset 2',
          data: [
            { x: -15, y: -5 },
            { x: -8, y: 8 },
            { x: 5, y: -3 },
            { x: 6, y: 6 },
          ],
          backgroundColor: 'rgba(54, 162, 235, 1)',
        },
      ]}
      title="Scatter Chart Example"
    />


      
     */}
     {/* <BarChart/> */}
     {/* <DynamicChart/>
      <div style={{transform: 'translateZ(0)'}}>
        <Panel title="test" width='500px' height='400px'>
          <DynamicChart/>
        </Panel>
      </div> */}
      {/* <Chart/> */}
      {/* <CombinedChart/> */}
      {/* <ResizableTable/>
      <ResizableTable/> */}
      {/* <App/> */}
      <button onClick={handleClick}>Validate</button>
      <button onClick={handleGetSelectedRows}>Get Selected Rows</button>
      <button onClick={handleClearSelectedRows}>Clear Selected Rows</button>
      <button onClick={handleClearActiveRow}>Clear Active Rows</button>
      {/* <MenuForm
        ref={menuFormRef}
        formSettings={FORM_MENU_FIELD_SETTINGS}
        dataSource={dataSource}
        onChange={v => console.log(v)}
      /> */}
      {/* <button onClick={() => exportToCsv("data.csv", selectedRow, columnSettings)}>download selected</button>
      <button onClick={() => {
        setActions([Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE])
      }}>Remove "Add Action"</button>
      <button onClick={() => setActions(ACTIONS_LIST)}>Add "Add Action"</button>

      <button onClick={() => setColSettings(columnSettings)}>Add "Column Schema"</button>
      <button onClick={() => {
        setColSettings(columnSettings.map(i => {
          const { actionConfig } = i;

          return typeof actionConfig === "object" && actionConfig !== null ? {
            ...i,
            actionConfig: {
              ...(i.actionConfig as any),
              schema: undefined
            }
          } : i
        }))
      }}>Remove "Column Schema"</button>

      <button onClick={() => setColSettings(columnSettings)}>Add "Column Filter"</button>
      <button onClick={() => {
        setColSettings(columnSettings.map(i => ({
          ...i,
          filterConfig: undefined
        })))
      }}>Remove "Column Filter"</button>

      <DataTable_
        ref={dataTableRef}
        actions={actions}
        dataSource={dataSource}
        columnSettings={colSettings}
        // onRowClick={handleRowClick}
        // onRowDoubleClick={handleRowDoubleClick}
        rowKey="userID.value"
        activeRow="user-id2"
        // selectedRows={[{"userID": { "value": "user-id0" }}]}
        // selectedRows={[{"userID": "user-id0"}]}
        // selectedRows={["user-id0"]}
        selectable
        multiSelect
        downloadXLS
        uploadXLS
        onChange={v => console.log("New Value: ", v)}
        // isPermanentDelete
        pageSize={10}
        tableHeight='200px'
        actionsDropdownItems={[{
          text: "test",
          onClick: (data) => openJsonInNewWindow(data)
        }]}
        customRowSettings={[
          {
            column: "intentAction",
            value: "R",
            title: "Action",
            width: "60px",
            showColumn: true,
            styles: {
              backgroundColor: "red",
              textDecoration: "line-through"
            }
          },
          {
            column: "intentAction",
            value: "U",
            title: "Action",
            width: "60px",
            showColumn: true,
            styles: {
              backgroundColor: "orange",
            }
          },
          {
            column: "intentAction",
            value: "O",
            title: "Action",
            width: "60px",
            showColumn: false,
            styles: {
              backgroundColor: "rgba(0,0,0,0.3)",
            }
          },
          {
            column: "intentAction",
            value: "N",
            title: "Action",
            width: "60px",
            showColumn: false,
            styles: {
              backgroundColor: "#a3ee9e",
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
        // onSelectedRowsChange={rows => setSselectedRow(rows)}
        onSelectedRowsChange={rows => console.log('Selected Rows: ', rows)}
        selectionRange

      /> */}
       {/* <DataTable
        ref={dataTableRef}
        actions={actions}
        dataSource={dataSource}
        columnSettings={colSettings}
        // onRowClick={handleRowClick}
        // onRowDoubleClick={handleRowDoubleClick}
        rowKey="userID.value"
        activeRow="user-id2"
        // selectedRows={[{"userID": { "value": "user-id0" }}]}
        // selectedRows={[{"userID": "user-id0"}]}
        // selectedRows={["user-id0"]}
        selectable
        multiSelect
        downloadXLS
        uploadXLS
        onChange={v => console.log("New Value: ", v)}
        // isPermanentDelete
        pageSize={10}
        tableHeight='200px'
        actionsDropdownItems={[{
          text: "test",
          onClick: (data) => openJsonInNewWindow(data)
        }]}
        customRowSettings={[
          {
            column: "intentAction",
            value: "R",
            title: "Action",
            width: "60px",
            showColumn: true,
            styles: {
              backgroundColor: "red",
              textDecoration: "line-through"
            }
          },
          {
            column: "intentAction",
            value: "U",
            title: "Action",
            width: "60px",
            showColumn: true,
            styles: {
              backgroundColor: "orange",
            }
          },
          {
            column: "intentAction",
            value: "O",
            title: "Action",
            width: "60px",
            showColumn: false,
            styles: {
              backgroundColor: "rgba(0,0,0,0.3)",
            }
          },
          {
            column: "intentAction",
            value: "N",
            title: "Action",
            width: "60px",
            showColumn: false,
            styles: {
              backgroundColor: "#a3ee9e",
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
        // onSelectedRowsChange={rows => setSselectedRow(rows)}
        onSelectedRowsChange={rows => console.log('Selected Rows: ', rows)}
        selectionRange

      />
      <DataTableEnhancement/> */}
      <DevelopersGuide/>
      {/*<UploadSummary/>
      <DownloadSummary/> */}
    <div style={{height: 100}}/>
      {/* <DataTable
        fetchConfig={{
          endpoint: "http://localhost:3001/custom-items/{{pageNumber}}/{{pageSize}}",
          // endpoint: replaceLocalhostWithDomain("http://localhost:3002/custom-items", "http://localhost:3002"),
          responseTotalDataPath: "data.count",
          responseDataPath: "data.dataTableItem",
          requestData: {
            pageNumber: 1,
            pageSize: 10,
            filter: {
              username: ['TEST1','TEST2','TEST3'],
              test: ['TEST1','TEST2','TEST3'],
              password: ''
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
        downloadXLS
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
      /> */}
      <div style={{height: 100}}/>
      {/* <DataTable
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
        downloadXLS
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
      /> */}
      <div style={{height: 100}}/>
{/*       
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


