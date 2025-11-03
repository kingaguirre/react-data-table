import React from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import {
  BulletContainer,
  BulletTitle,
  BulletList,
  BulletItem,
  BulletSubList,
  BulletSubItem,
  Highlight,
} from './utils';

export const DownloadButton = styled.button<any>`
  margin: 6px auto 12px;
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #45a049;
  }
`;

export const UploadSummary = () => {
  return (
    <BulletContainer>
      <Highlight><b>Note:</b> Below feature only works if <b>withDownloadUploadAction</b> is enabled.</Highlight>
      <BulletTitle>Upload Summary</BulletTitle>
      <BulletList>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'U'</Highlight> (Update):
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> from the <Highlight>uploaded data</Highlight> (e.g., Excel) exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              For each key, it compares the current value in the <Highlight>data-table rows</Highlight> with the new value from the <Highlight>uploaded data</Highlight>.
              <BulletSubList>
                <BulletSubItem>
                  If values differ, the updated key will have the following structure:
                  <pre>{`{
  "previous": { "value": "oldValue" },
  "value": "newValue",
  "isChanged": true
}`}</pre>
                </BulletSubItem>
                <BulletSubItem>If values are the same, no changes are made.</BulletSubItem>
              </BulletSubList>
            </BulletSubItem>
            <BulletSubItem>The row in the <Highlight>data-table rows</Highlight> is updated with the new values.</BulletSubItem>
            <BulletSubItem>
              <strong>Note:</strong> If the <Highlight>intentAction</Highlight> is <Highlight>'U'</Highlight> (Update) and the <Highlight>rowKeys</Highlight> do not exist in the <Highlight>data-table rows</Highlight>, the function does nothing (ignores the row).
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'D'</Highlight> (Delete):
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the row exists, it updates only the <Highlight>intentAction</Highlight> to <Highlight>'D'</Highlight>, but does not modify any other data in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the row does not exist, the function ignores the object (does nothing).
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          When uploading, if <strong>intentAction</strong> is <Highlight>'N'</Highlight>, <Highlight>'O'</Highlight>, <Highlight>null</Highlight>, or <Highlight>undefined</Highlight>:
          <BulletSubList>
            <BulletSubItem>
              The function checks if the <Highlight>rowKeys</Highlight> already exist in the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>
              If the <Highlight>rowKeys</Highlight> don’t exist, it prepends the new row with <Highlight>intentAction</Highlight> set to <Highlight>'N'</Highlight> into the <Highlight>data-table rows</Highlight>.
            </BulletSubItem>
            <BulletSubItem>If the <Highlight>rowKeys</Highlight> exist, the row is ignored (does nothing).</BulletSubItem>
          </BulletSubList>
        </BulletItem>
        {/* <BulletItem>
          <strong>Important:</strong> If the <Highlight>rowKeys</Highlight> (or first column) do not exist in the <Highlight>data-table rows</Highlight>, for any <Highlight>intentAction</Highlight> (or second column), the function prepends the row to the <Highlight>data-table rows</Highlight> and sets the <Highlight>intentAction</Highlight> to <Highlight>'N'</Highlight>, regardless of the original <Highlight>intentAction</Highlight>.
        </BulletItem> */}
        {/* New section for Test Files */}
        <BulletItem>
          <strong>Test Files:</strong> Use the following Excel templates to test Excel upload:
          <BulletSubList>
            <BulletSubItem>
              Use <Highlight>Download Test File 1</Highlight> to download an Excel template with multiple rows containing different <Highlight>intentAction</Highlight> values.
              <div><DownloadButton onClick={downloadTestFile1}>Download Test File 1</DownloadButton></div>
            </BulletSubItem>
            <BulletSubItem>
              Use <Highlight>Download Test File 2</Highlight> to download an Excel template with one row and a <Highlight>rowKey</Highlight> but without an <Highlight>intentAction</Highlight>.
              <div><DownloadButton onClick={downloadTestFile2}>Download Test File 2</DownloadButton></div>
            </BulletSubItem>
            <BulletSubItem>
              Use <Highlight>Download Test File 3</Highlight> to download an Excel template with one row and without both <Highlight>rowKey</Highlight> and <Highlight>intentAction</Highlight>.
              <div><DownloadButton onClick={downloadTestFile3}>Download Test File 3</DownloadButton></div>
            </BulletSubItem>
            <BulletSubItem>
              Use <Highlight>Download Test File 4</Highlight> to download an Excel template with one row and with both <Highlight>rowKey</Highlight> and <Highlight>intentAction</Highlight>.
              <div><DownloadButton onClick={downloadTestFile4}>Download Test File 4</DownloadButton></div>
            </BulletSubItem>
            <BulletSubItem>
              Use <Highlight>Download Test File 5</Highlight> to download an Excel template with 30 rows and complete cells.
              <div><DownloadButton onClick={downloadTestFile5}>Download Test File 5</DownloadButton></div>
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
        <BulletItem>
          <strong>Important:</strong> If the first column is <Highlight>undefined</Highlight> or does not match the <Highlight>rowKeys</Highlight>, or the second column is not the <Highlight>intentAction</Highlight>, the functions will not work as expected and will just prepend the row. This means:
          <BulletSubList>
            <BulletSubItem>
              The first column of the uploaded data must be the <Highlight>rowKeys</Highlight>, identifying each unique row.
            </BulletSubItem>
            <BulletSubItem>
              The second column of the uploaded data must be the <Highlight>intentAction</Highlight>, determining the action to take (Update, Delete, etc.).
            </BulletSubItem>
            <BulletSubItem>
              If either of these conditions is not met, the function prepends the row to the <Highlight>data-table rows</Highlight> and sets the <Highlight>intentAction</Highlight> to <Highlight>'N'</Highlight>, regardless of the original <Highlight>intentAction</Highlight>.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
      </BulletList>
    </BulletContainer>
  );
};

export const DownloadSummary = () => {
  return (
    <BulletContainer>
      <BulletTitle>Download Summary</BulletTitle>
      <BulletList>
        <BulletItem>
          When downloading data:
          <BulletSubList>
            <BulletSubItem>
              The first column in the downloaded file will contain the <Highlight>rowKeys</Highlight>, representing the unique identifier for each row.
            </BulletSubItem>
            <BulletSubItem>
              The second column in the downloaded file will contain the <Highlight>intentAction</Highlight>, indicating the action associated with each row (e.g., Update, Delete).
            </BulletSubItem>
            <BulletSubItem>
              Additional columns will reflect the rest of the data in the <Highlight>data-table rows</Highlight>, depending on the structure of the data.
            </BulletSubItem>
          </BulletSubList>
        </BulletItem>
      </BulletList>
    </BulletContainer>
  );
};

const download = (data, fileName) => {

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, fileName);
}

// Function to generate and download the second Excel file
const downloadTestFile1 = () => {
  const data = [
    { "Row Key": "id-0", "Intent Action": "U", "Name (regular text)": "First Row new value" },
    { "Row Key": "id-2", "Intent Action": "U", "Name (regular text)": "Third Row new value" },
    { "Row Key": "id-3", "Intent Action": "N", "Name (regular text)": "Some name 3" },
    { "Row Key": "id-4", "Intent Action": "D", "Name (regular text)": "Some name 4" },
    { "Row Key": "id-1", "Intent Action": "O", "Name (regular text)": "Old Value" },
    { "Row Key": "id-xxx", "Intent Action": "", "Name (regular text)": "New row to be added" },
  ];
  download(data, 'TestFile1.xlsx')
};

// Function to generate and download the first Excel file
const downloadTestFile2 = () => {
  const data = [
    { "Row Key": "id-xxxx", "Intent Action": "", "Name (regular text)": "Add new without intentAction" }
  ];

  download(data, 'TestFile2.xlsx')
};

const downloadTestFile3 = () => {
  const data = [
    { "Row Key": "", "Intent Action": "", "Name (regular text)": "Add new without rowKey and intentAction" }
  ]; // One row with neither rowKey nor intentAction
  download(data, 'TestFile3.xlsx')
};

const downloadTestFile4 = () => {
  const data = [
    { "Row Key": "id-0", "Intent Action": "U", "Name (regular text)": "test" }
  ];

  download(data, 'TestFile4.xlsx')
};

const downloadTestFile5 = () => {
  const data = [
    {
      "intentAction": "U",
      "id": "id-0",
      "text": {
        "previous": {
          "value": "Test previous value"
        },
        "value": "Some name 0",
        "isChanged": true
      },
      "birthdate": "2005-11-21",
      "age": 19,
      "userID": 868501,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,mouse",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-1",
      "text": "Some name 1",
      "birthdate": "1989-11-21",
      "age": 35,
      "userID": 789384,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "O",
      "id": "id-2",
      "text": "Some name 2",
      "birthdate": "1953-11-21",
      "age": 71,
      "userID": 994085,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "O",
      "id": "id-3",
      "text": "Some name 3",
      "birthdate": "1966-11-21",
      "age": 58,
      "userID": 213783,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "O",
      "id": "id-4",
      "text": "Some name 4",
      "birthdate": "1961-11-21",
      "age": 63,
      "userID": 994454,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-5",
      "text": "Some name 5",
      "birthdate": "1954-11-21",
      "age": 70,
      "userID": 980048,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-6",
      "text": "Some name 6",
      "birthdate": "1950-11-21",
      "age": 74,
      "userID": 721860,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-7",
      "text": "Some name 7",
      "birthdate": "1981-11-21",
      "age": 43,
      "userID": 635027,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-8",
      "text": "Some name 8",
      "birthdate": "1947-11-21",
      "age": 77,
      "userID": 678648,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-9",
      "text": "Some name 9",
      "birthdate": "1966-11-21",
      "age": 58,
      "userID": 367067,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-10",
      "text": "Some name 10",
      "birthdate": "1980-11-21",
      "age": 44,
      "userID": 355858,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-11",
      "text": "Some name 11",
      "birthdate": "1964-11-21",
      "age": 60,
      "userID": 248063,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-12",
      "text": "Some name 12",
      "birthdate": "1971-11-21",
      "age": 53,
      "userID": 715305,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-13",
      "text": "Some name 13",
      "birthdate": "1981-11-21",
      "age": 43,
      "userID": 174684,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-14",
      "text": "Some name 14",
      "birthdate": "1997-11-21",
      "age": 27,
      "userID": 751343,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-15",
      "text": "Some name 15",
      "birthdate": "2002-11-21",
      "age": 22,
      "userID": 820588,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-16",
      "text": "Some name 16",
      "birthdate": "1946-11-21",
      "age": 78,
      "userID": 602406,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-17",
      "text": "Some name 17",
      "birthdate": "1948-11-21",
      "age": 76,
      "userID": 558172,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-18",
      "text": "Some name 18",
      "birthdate": "1956-11-21",
      "age": 68,
      "userID": 584982,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    },
    {
      "intentAction": "",
      "id": "id-19",
      "text": "Some name 19",
      "birthdate": "1961-11-21",
      "age": 63,
      "userID": 607538,
      "isActive": true,
      "isOnLeave": false,
      "needDevice": false,
      "level": "level-1",
      "country": "US",
      "devices": "laptop,",
      "amount": {
        "currency": {
          "value": "USD"
        },
        "unFormattedValue": {
          "value": 999
        },
        "formattedValue": {
          "value": 999
        }
      },
      "reqWorkflowStage": "Registration Completed",
      "acknowledgementCreatedTimestamp": "2023-10-30T04:31:10.291937Z"
    }
  ];

  download(data, 'TestFile5.xlsx')
};