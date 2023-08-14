# DataTable Component

## Overview
The `DataTable` is a flexible and feature-rich React component designed to render tabular data with ease. From pagination to custom rendering, this component encapsulates various functionalities to simplify your data presentation.

## Features

- **Dynamic Column Resizing**: Adjust column widths as needed.
- **Drag & Drop Columns**: Easily rearrange columns.
- **Pagination**: Manage large datasets with paging.
- **Filters**: Quickly narrow down your data.
- **Sortable Columns**: Order your data for better insights.
- **Row Selection**: Select rows for bulk actions.
- **Remote Data Fetching**: Fetch data with custom configurations.
- **Custom Renderers**: Display data the way you want.

## Installation

Include the DataTable component in your project:

```jsx
import { DataTable } from 'react-data-table.eaa';
```

## Basic Usage

Here's a simple example of how to use the DataTable:
```<DataTable
  dataSource={yourDataArray}
  columnSettings={yourColumnSettings}
  rowKey="yourPrimaryKeyField"
/>
```

## Props
- **dataSource**: An array of data to be rendered in the table. Each object within this array represents a row.
- **columnSettings**: Configurations for each column in the table including column name, type, and other behaviors.
- **pageSize**: Determines the number of rows per page. Useful for pagination.
- **pageIndex**: The current page being viewed when pagination is used.
- **selectable**: Allows rows to be selected. Often used in tandem with actions like delete or update.
- **rowKey**: A unique identifier for each row. Useful for optimization and ensuring consistent behavior.
- **tableHeight**: The height of the table. Useful for rendering tables in specific design layouts.
- **collapsibleRowHeight**: Height of the row when expanded. Useful when rows have additional data to show on click.
- **fetchConfig**: Configuration related to fetching data, especially when data is fetched remotely or in chunks.
- **filterAll**: Whether all columns should be searchable with a single search query or not.
- **downloadCSV**: Allows users to download the table data as a CSV file.
- **activeRow**: Indicates which row is currently active. Useful for highlighting or taking action on a specific row.
- **selectedRows**: An array of currently selected rows.
- **onRowClick**: A callback function that fires when a row is clicked.
- **onRowDoubleClick**: A callback function that fires when a row is double-clicked.
- **onColumnSettingsChange**: A callback that fires when column settings are updated, allowing for dynamic column behavior.
- **collapsibleRowRender**: A custom render function that displays additional row data when a row is expanded.
- **onPageSizeChange**: Callback when the number of rows per page (pageSize) changes.
- **onPageIndexChange**: Callback when the current page changes.
- **onSelectedRowsChange**: Callback that fires when the selection of rows changes.

## Contributing
Contributions to improve or expand the DataTable component are always welcome. Make sure to test your changes before submitting a pull request.

## License
MIT License

Copyright (c) [Your Name/Company Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
