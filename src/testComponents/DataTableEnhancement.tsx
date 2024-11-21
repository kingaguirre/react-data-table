import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';

const BulletContainer = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  font-size: 16px;
`;

const BulletTitle = styled.h3`
  margin-bottom: 10px;
  font-weight: bold;
  color: #333;
`;

const TwoColumnList = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  width: 48%;
`;

const BulletItem = styled.li`
  margin-bottom: 10px;
  color: #555;
`;

const Highlight = styled.code`
  color: #569cd6; /* Blue color similar to VSCode interface names */
`;

const PropHighlight = styled.span`
  color: #dcdcaa; /* Yellow color similar to VSCode prop names */
`;

const DownloadButton = styled.button`
  margin: 6px auto 12px;
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

export const DataTableEnhancement = () => {
  return (
    <BulletContainer>
      <TwoColumnList>
        <div>
          <BulletTitle>Current Enhancements Done</BulletTitle>
          <BulletList>
            <BulletItem>Filter all (Top left text-box)</BulletItem>
            <BulletItem>Column resizing</BulletItem>
            <BulletItem>Column re-order</BulletItem>
            <BulletItem>Column pin/unpin</BulletItem>
            <BulletItem>Column show/hide (Top right gear icon)</BulletItem>
            <BulletItem>Column filter</BulletItem>
            <BulletItem>Download rows to .csv file (Top right download icon)</BulletItem>
            <BulletItem>Displaying records (Bottom left text)</BulletItem>
            <BulletItem>Pagination (Previous, Next, First, Last)</BulletItem>
            <BulletItem>Page size selection using dropdown (Bottom right dropdown)</BulletItem>
          </BulletList>
        </div>
        <div>
          <BulletTitle>Current Enhancements for API Integration</BulletTitle>
          <BulletList>
            <BulletItem>Use endpoint to fetch data and use as <Highlight>dataSource</Highlight></BulletItem>
            <BulletItem>Update <Highlight>Filter all</Highlight> based on API</BulletItem>
            <BulletItem>Update column filter based on API</BulletItem>
            <BulletItem>Update sorting based on API</BulletItem>
            <BulletItem>Update <Highlight>pageSize</Highlight> based on API</BulletItem>
            <BulletItem>Download .csv file based on API</BulletItem>
            <BulletItem>Update pagination based on API</BulletItem>
            <BulletItem>Refresh buttons</BulletItem>
            <BulletItem>Advanced filter that can be set through JSON object</BulletItem>
            <BulletItem>Updated style based on the current data table colors, sizing, etc.</BulletItem>
          </BulletList>
        </div>
      </TwoColumnList>

      <DownloadButton onClick={() => action('Download Test File Clicked')()}>Download Test File</DownloadButton>

      <BulletTitle>Interfaces</BulletTitle>
      <pre>{`
interface <Highlight>RequestData</Highlight> {
  <PropHighlight>pageNumber</PropHighlight>: number; // The page number to be used when fetching data.
  <PropHighlight>pageSize</PropHighlight>: string | number; // The page size to be used when fetching data, can be a number or a string.
  <PropHighlight>sortColumn</PropHighlight>?: string; // Optional. The name of the column by which the data is sorted.
  <PropHighlight>sortDirection</PropHighlight>?: string; // Optional. The direction of sorting: 'asc' for ascending or 'desc' for descending.
  <PropHighlight>method</PropHighlight>?: string; // Optional. The HTTP method used for the API request, such as 'GET' or 'POST'.
  <PropHighlight>filter</PropHighlight>?: { [key: string]: any }; // Optional. An object for filter criteria, with key-value pairs where the key is the column name.
}

interface <Highlight>FetchConfig</Highlight> {
  <PropHighlight>endpoint</PropHighlight>: string; // The URL of the API endpoint from which data is fetched.
  <PropHighlight>requestData</PropHighlight>?: <Highlight>RequestData</Highlight>; // Optional. Includes pagination, sorting, and filtering information for the API request.
  <PropHighlight>responseDataPath</PropHighlight>?: string; // Optional. Path in the API response JSON where the data items array can be found.
  <PropHighlight>responseTotalDataPath</PropHighlight>?: string; // Optional. Path in the API response JSON containing the total number of data items.
  <PropHighlight>filterSettings</PropHighlight>?: any; // Optional. Custom settings or configurations for filtering data.
}

interface <Highlight>CustomRowSettings</Highlight> {
  <PropHighlight>column</PropHighlight>: string; // The name of the column to which these settings apply.
  <PropHighlight>value</PropHighlight>: string; // The specific value in the column that triggers these custom settings.
  <PropHighlight>showColumn</PropHighlight>?: boolean; // Optional. Whether the column should be displayed.
  <PropHighlight>width</PropHighlight>?: string; // Optional. The width of the column, specified as a CSS value (e.g., '100px', '10%').
  <PropHighlight>title</PropHighlight>?: string;
  <PropHighlight>styles</PropHighlight>?: { // Optional. CSS style properties to apply to the row.
    <PropHighlight>backgroundColor</PropHighlight>?: string;
    <PropHighlight>textDecoration</PropHighlight>?: string;
    <PropHighlight>color</PropHighlight>?: string;
    <PropHighlight>fontWeight</PropHighlight>?: string;
  }
}

export enum <Highlight>Actions</Highlight> {
  ADD = "ADD", // Add a new row or item.
  EDIT = "EDIT", // Edit an existing row or item.
  DELETE = "DELETE", // Delete a row or item.
  DUPLICATE = "DUPLICATE", // Duplicate a row or item.
  COPY = "COPY", // Copy a row or item.
  PASTE = "PASTE", // Paste a copied row or item.
}

interface <Highlight>IActionsDropdownItems</Highlight> {
  <PropHighlight>text</PropHighlight>: string;
  <PropHighlight>onClick</PropHighlight>?: (data?: any) => void;
}

export interface <Highlight>DataTableProps</Highlight> {
  <PropHighlight>dataSource</PropHighlight>?: any[]; // (Optional) Array of data objects for table rows.
  <PropHighlight>columnSettings</PropHighlight>: <Highlight>ColumnSettings</Highlight>[]; // Configuration for each column.
  <PropHighlight>pageSize</PropHighlight>?: number; // (Optional) Number of rows per page.
  <PropHighlight>pageIndex</PropHighlight>?: number; // (Optional) Current page number.
  <PropHighlight>selectable</PropHighlight>?: boolean; // (Optional) If rows can be selected, it will add checkbox at left most of each row.
  <PropHighlight>multiSelect</PropHighlight>?: boolean; // (Optional) If row selection is one at a time.
  <PropHighlight>tableHeight</PropHighlight>?: string; // (Optional) Table height as a CSS value.
  <PropHighlight>tableMaxHeight</PropHighlight>?: string; // (Optional) Maximum table height as a CSS value.
  <PropHighlight>hideHeader</PropHighlight>?: boolean; // (Optional) If the table header should be hidden.
  <PropHighlight>collapsibleRowHeight</PropHighlight>?: string; // (Optional) Height of collapsible rows as a CSS value.
  <PropHighlight>fetchConfig</PropHighlight>?: <Highlight>FetchConfig</Highlight>; // (Optional) Configuration for data fetching.
  <PropHighlight>filterAll</PropHighlight>?: boolean; // (Optional) Show or hide main search box at main header.
  <PropHighlight>downloadXLS</PropHighlight>?: boolean; // (Optional) If downloading table data as XLXS is enabled.
  <PropHighlight>uploadXLS</PropHighlight>?: boolean; // (Optional) If uploading table data as XLXS is enabled.
  <PropHighlight>activeRow</PropHighlight>?: string; // (Optional) Key of the currently active row.
  <PropHighlight>selectedRows</PropHighlight>?: any[]; // (Optional) Array of keys identifying selected rows.
  <PropHighlight>clickableRow</PropHighlight>?: boolean; // (Optional) If rows are clickable.
  <PropHighlight>customRowSettings</PropHighlight>?: <Highlight>CustomRowSettings</Highlight>[]; // (Optional) Custom settings for rows based on column values.
  <PropHighlight>actions</PropHighlight>?: <Highlight>Actions</Highlight> | <Highlight>Actions</Highlight>[]; // (Optional) Actions available in the table.
  <PropHighlight>actionsDropdownItems</PropHighlight>?: <Highlight>IActionsDropdownItems</Highlight>[]; // (Optional) Add additional dropdown item in actions row.
  <PropHighlight>rowKey</PropHighlight>?: string; // (Required) Key from the data source for uniquely identifying each row.
  <PropHighlight>isPermanentDelete</PropHighlight>?: boolean; // (Optional) If delete action permanently removes data.
  <PropHighlight>selectionRange</PropHighlight>?: boolean; // (Optional) Enable cell selection for copy or paste data from excel.
  <PropHighlight>onChange</PropHighlight>?: (updatedData: any[]) => void; // (Optional) Callback when table data is updated.
  <PropHighlight>onRowClick</PropHighlight>?: (rowData: any) => void; // (Optional) Callback when a row is clicked.
  <PropHighlight>onRowDoubleClick</PropHighlight>?: (rowData: any) => void; // (Optional) Callback when a row is double-clicked.
  <PropHighlight>onColumnSettingsChange</PropHighlight>?: (newColumnSettings: <Highlight>ColumnSettings</Highlight>[]) => void; // (Optional) Callback when column settings change.
  <PropHighlight>collapsibleRowRender</PropHighlight>?: (rowData: any) => React.ReactNode; // (Optional) Function to render collapsible row content.
  <PropHighlight>onPageSizeChange</PropHighlight>?: (newPageSize: number) => void; // (Optional) Callback when page size changes.
  <PropHighlight>onPageIndexChange</PropHighlight>?: (newPageIndex: number) => void; // (Optional) Callback when page index changes.
  <PropHighlight>onSelectedRowsChange</PropHighlight>?: (selectedRows: any[]) => void; // (Optional) Callback when selected rows change.
}

export interface <Highlight>ColumnSettings</Highlight> {
  <PropHighlight>filterConfig</PropHighlight>?: any; // (Optional) Configuration for column filtering.
  <PropHighlight>column</PropHighlight>: string; // The name of the column.
  <PropHighlight>title</PropHighlight>: string; // Display title of the column.
  <PropHighlight>align</PropHighlight>?: 'left' | 'right' | 'center' | string; // (Optional) Text alignment in the column.
  <PropHighlight>pinned</PropHighlight>?: boolean | string; // (Optional) If the column is pinned to a side, can be true | false | none.
  <PropHighlight>hidden</PropHighlight>?: boolean; // (Optional) If the column should be hidden.
  <PropHighlight>width</PropHighlight>?: string; // (Optional) Width of the column, specified as a CSS value.
  <PropHighlight>minWidth</PropHighlight>?: string; // (Optional) Minimum width of the column, as a CSS value.
  <PropHighlight>groupTitle</PropHighlight>?: string; // (Optional) Title for a group of columns.
  <PropHighlight>order</PropHighlight>?: number; // (Optional) Order of the column in the table.
  <PropHighlight>sorted</PropHighlight>?: 'asc' | 'desc' | string; // (Optional) Sorting direction of the column.
  <PropHighlight>draggable</PropHighlight>?: boolean; // (Optional) If the column can be dragged to reorder.
  <PropHighlight>actionConfig</PropHighlight>?: any; // (Optional) Configuration for actions specific to this column.
  <PropHighlight>class</PropHighlight>?: string; // (Optional) CSS class for styling the column.
  <PropHighlight>selectable</PropHighlight>?: boolean; // (Optional) If selecting the column is disabled.
  <PropHighlight>disableSelection</PropHighlight>?: boolean; // (Optional) If column cannot be selected when selection is enabled.
  <PropHighlight>disableCopy</PropHighlight>?: boolean; // (Optional) If column cannot be copied when selection is enabled and user presses copy.
  <PropHighlight>cell</PropHighlight>?: (value: any, rowData: any, index?: number) => React.ReactNode; // (Optional) Custom renderer for column data, can be any component.
}
      `}</pre>
    </BulletContainer>
  );
};
