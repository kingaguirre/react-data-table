interface RequestData {
  pageNumber: number; // The page number to be used when fetching data.
  pageSize: number | null; // The page size to be used when fetching data.
  sortColumn?: string; // Optional. The name of the column by which the data is sorted.
  sortDirection?: string; // Optional. The direction of sorting: 'asc' for ascending or 'desc' for descending.
  method?: string; // Optional. The HTTP method used for the API request, such as 'GET' or 'POST'.
  filter?: { [key: string]: any }; // Optional. An object for filter criteria, with key-value pairs where the key is the column name.
}

interface FetchConfig {
  endpoint: string; // The URL of the API endpoint from which data is fetched.
  requestData?: RequestData; // Optional. Includes pagination, sorting, and filtering information for the API request.
  responseDataPath?: string; // Optional. Path in the API response JSON where the data items array can be found.
  responseTotalDataPath?: string; // Optional. Path in the API response JSON containing the total number of data items.
  filterSettings?: any; // Optional. Custom settings or configurations for filtering data.
}

interface CustomRowSettings {
  column: string; // The name of the column to which these settings apply.
  value: string; // The specific value in the column that triggers these custom settings.
  showColumn?: boolean; // Optional. Whether the column should be displayed.
  width?: string; // Optional. The width of the column, specified as a CSS value (e.g., '100px', '10%').
  title?: string;
  styles?: { // Optional. CSS style properties to apply to the row.
    backgroundColor?: string;
    textDecoration?: string;
    color?: string;
    fontWeight?: string;
  }
}

export enum Actions {
  ADD = "ADD", // Add a new row or item.
  EDIT = "EDIT", // Edit an existing row or item.
  DELETE = "DELETE", // Delete a row or item.
  DUPLICATE = "DUPLICATE", // Duplicate a row or item.
  COPY = "COPY", // Copy a row or item.
  PASTE = "PASTE", // Paste a copied row or item.
}

interface IActionsDropdownItems {
  text: string;
  onClick?: (data?: any) => void
}
export interface DataTableProps {
  dataSource?: any[]; // (Optional) Array of data objects for table rows.
  columnSettings: ColumnSettings[]; // Configuration for each column.
  pageSize?: number; // (Optional) Number of rows per page.
  pageIndex?: number; // (Optional) Current page number.
  selectable?: boolean; // (Optional) If rows can be selected, it will add checkbox at left most of each row.
  multiSelect?: boolean; // (Optional) If row selection is one at a time
  tableHeight?: string; // (Optional) Table height as a CSS value.
  tableMaxHeight?: string; // (Optional) Maximum table height as a CSS value.
  hideHeader?: boolean; // (Optional) If the table header should be hidden.
  collapsibleRowHeight?: string; // (Optional) Height of collapsible rows as a CSS value.
  fetchConfig?: FetchConfig; // (Optional) Configuration for data fetching.
  filterAll?: boolean; // (Optional) Show or hide main search box at main header.
  downloadXLS?: boolean; // (Optional) If downloading table data as XLXS is enabled.
  uploadXLS?: boolean; // (Optional) If uploading table data as XLXS is enabled.
  activeRow?: string; // (Optional) Key of the currently active row.
  selectedRows?: any[]; // (Optional) Array of keys identifying selected rows.
  clickableRow?: boolean; // (Optional) If rows are clickable.
  customRowSettings?: CustomRowSettings[]; // (Optional) Custom settings for rows based on column values.
  actions?: Actions | Actions[]; // (Optional) Actions available in the table.
  actionsDropdownItems?: IActionsDropdownItems[]; // (Optional) Add additional dropdown item in actions row
  rowKey?: string; // (Required) Key from the data source for uniquely identifying each row.
  isPermanentDelete?: boolean; // (Optional) If delete action permanently removes data.
  selectionRange?: boolean; // (Optional) Enable cell selction for copy or paste data from excel.
  onChange?: (updatedData: any[]) => void; // (Optional) Callback when table data is updated.
  onRowClick?: (rowData: any) => void; // (Optional) Callback when a row is clicked.
  onRowDoubleClick?: (rowData: any) => void; // (Optional) Callback when a row is double-clicked.
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void; // (Optional) Callback when column settings change.
  collapsibleRowRender?: (rowData: any) => React.ReactNode; // (Optional) Function to render collapsible row content.
  onPageSizeChange?: (newPageSize: number) => void; // (Optional) Callback when page size changes.
  onPageIndexChange?: (newPageIndex: number) => void; // (Optional) Callback when page index changes.
  onSelectedRowsChange?: (selectedRows: any[]) => void; // (Optional) Callback when selected rows change.
}

export interface ColumnSettings {
  filterConfig?: any; // (Optional) Configuration for column filtering.
  column: string; // The name of the column.
  title: string; // Display title of the column.
  align?: 'left' | 'right' | 'center' | string; // (Optional) Text alignment in the column.
  pinned?: boolean | string; // (Optional) If the column is pinned to a side, can be true | false | none.
  hidden?: boolean; // (Optional) If the column should be hidden.
  width?: string; // (Optional) Width of the column, specified as a CSS value.
  minWidth?: string; // (Optional) Minimum width of the column, as a CSS value.
  groupTitle?: string; // (Optional) Title for a group of columns.
  order?: number; // (Optional) Order of the column in the table.
  sorted?: 'asc' | 'desc' | string | undefined; // (Optional) Sorting direction of the column.
  draggable?: boolean; // (Optional) If the column can be dragged to reorder.
  actionConfig?: any; // (Optional) Configuration for actions specific to this column.
  class?: string; // (Optional) CSS class for styling the column.
  selectable?: boolean; // (Optional) If selecting the column is disabled.
  disableSelection?: boolean; // (Optional) If column cannot be selected when selection is enabled.
  disableCopy?: boolean // (Optional) If column cannot be copy when selection is enabled and user press copy.
  cell?: (value: any, rowData: any, index?: number) => React.ReactNode; // (Optional) Custom renderer for column data, can be any component.
}

export interface IGlobalState {
  localData: any[] | null; // Local data stored in the application.
  columns: ColumnSettings[]; // Configuration for all columns in the table.
  search?: string | undefined; // Search query applied to filter data.
  pageIndex: number; // Current page index of the table.
  pageSize: number; // Number of rows per page in the table.
  fetchedData?: { // Information about fetched data from the API.
    data: any[] | null | undefined; // Fetched data from the API.
    totalData: number; // Total number of data items available.
    fetching: boolean; // Flag indicating whether data is currently being fetched.
  };
  tableWidth: number | null; // Width of the table.
  selectedRows: string[]; // Keys of selected rows in the table.
  activeRow: string | null; // Key of the currently active row.
  advanceFilterValues: any; // Values for advanced filtering criteria.
  filterValues: any; // Values for basic filtering criteria.
  canPaste: boolean; // Flag indicating whether paste action is available.
  selectedColumn: any; // Currently selected column.
  updatedRows: string[]; // Keys of rows that have been updated.
  rightPanelToggle: boolean; // Flag indicating whether the right panel is toggled.
  editingCells: Array<{ // Information about cells being edited.
    rowIndex: number; // Index of the row containing the cell.
    columnIndex: number; // Index of the column containing the cell.
    column?: string; // Name of the column containing the cell.
    value: string; // Value of the cell.
    editable?: boolean; // Flag indicating whether the cell is editable.
    invalid?: boolean; // Flag indicating whether the cell value is invalid.
    error?: string | null; // Error message for invalid cell value.
    isNew?: boolean; // Flag indicating whether the cell belongs to a new row.
  }>;
  observedWidth: number; // Width of the observed area.
}
