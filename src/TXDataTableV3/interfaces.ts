import { ReactNode } from 'react';
import { IOptions } from 'tradeport-web-components/dist/types/atoms/form-control/utils';

export interface RequestData {
  pageNumber: number; // The page number to be used when fetching data.
  pageSize: number; // The page size to b eused when fetching data, can be a number or a string.
  sortColumn?: string; // Optional. The name of the column by which the data is sorted.
  sortDirection?: string; // Optional. The direction of sorting: 'asc' for ascending or 'desc' for descending.
  method?: string; // Optional. The HTTP method used for the API request, such as 'GET' or 'POST'.
  filter?: { [key: string]: any }; // Optional. An object for filter criteria, with key-value pairs where the key is the column name.
}

export interface FetchConfig {
  endpoint: string; // The URL of the API endpoint from which data is fetched.
  requestData?: RequestData; // Optional. Includes pagination, sorting, and filtering information for the API request.
  responseDataPath?: string; // Optional. Path in the API response JSON where the data items array can be found.
  responseTotalDataPath?: string; // Optional. Path in the API response JSON containing the total number of data items.
  filterSettings?: any; // Optional. Custom settings or configurations for filtering data.
  callApi?: any; // Optional. Use to set fetching function
}

export interface CustomRowSettings {
  column: string; // The name of the column to which these settings apply.
  value: string; // The specific value in the column that triggers these custom settings.
  showColumn?: boolean; // Optional. Whether the column should be displayed.
  width?: string; // Optional. The width of the column, specified as a CSS value (e.g., '100px', '10%').
  styles?: { // Optional. CSS style properties to apply to the row.
    backgroundColor?: string;
    textDecoration?: string;
    color?: string;
    fontWeight?: string;
    fontStyle?: string;
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

export interface HeaderSearchSettings {
  column?: string; // If defined then use this column to to pass in filter object
  placeholder?: string;
  width?: string;
}

export interface IActionsDropdownItems {
  text: any;
  icon?: string;
  disabled?: boolean;
  onClick?: (data?: any) => void
}

export interface IActionColumnSetting {
  width?: string;
  title?: string;
}

interface IDataChange {
  data?: any; /** Updated data-table data */
  filteredData?: any; /** Updated filtered data-table data */
  totalData?: number; /** Total row or data count */
  pageIndex?: number; /** Current page index showed in footer */
  internalPageIndex?: number; /** Current page index used as internal state in data-table */
  pageSize?: number; /** Current page size showed in footer */
  selectedRows?: any[]; /** Current selected rows */
}

export interface DataTableProps {
  dataSource?: any[]; // (Optional) Array of data objects for table rows.
  columnSettings: ColumnSettings[]; // Configuration for each column.
  isDownloadDisabled?: boolean; // (Optional) Property to disable download button.
  isUploadDisabled?: boolean; // (Optional) Property to disable upload button.
  pageSize?: number; // (Optional) Number of rows per page.
  minPageSize?: number; // (Optional) Set minimum page size if user entered 0 or empty.
  pageIndex?: number; // (Optional) Current page number.
  selectable?: boolean; // (Optional) If rows can be selected, it will add checkbox at left most of each row.
  multiSelect?: boolean; // (Optional) If row selection is one at a time
  rowKey?: string; // (Required) Key from the data source for uniquely identifying each row.
  tableHeight?: string; // (Optional) Table height as a CSS value.
  tableMaxHeight?: string; // (Optional) Maximum table height as a CSS value.
  headerSearchSettings?: HeaderSearchSettings | boolean; // (Optional) Main search box settings.
  hideFooter?: boolean; // (Optional) If the table footer should be hidden.
  collapsibleRowHeight?: string; // (Optional) Height of collapsible rows as a CSS value.
  fetchConfig?: FetchConfig; // (Optional) Configuration for data fetching.
  downloadXLS?: boolean; // (Optional) If downloading table data as XLXS is enabled.
  onDownloadAllClick?: (data: any[]) => void; // (Optional) Function triggers when download all menu is clicked.
  disableDefaultDownload?: boolean; // (Optional) Props to disable built-in download.
  downloadAllText?: string; // (Optional) Props to set download all text in dropdown menu item.
  downloadAllIcon?: string; // (Optional) Props to set download all icon in dropdown menu item.
  onDownloadSelectedClick?: (data: any[]) => void; // (Optional) Function triggers when download selected items menu is clicked.
  disableDefaultDownloadSelected?: boolean; // (Optional) Props to disable built-in download selected items.
  downloadSelectedText?: string; // (Optional) Props to set download selected text in dropdown menu item.
  downloadSelectedIcon?: string; // (Optional) Props to set download selected icon in dropdown menu item.
  downloadDropdownWidth?: number; // (Optional) Props to set download dropdown wrapper width.
  maxRowDownload?: number; // (Optional) Set max row to be download.
  maxRowUpload?: number; // (Optional) Set max row to be uploaded.
  downloadFileName?: string; // (Optional) used to name download file.
  downloadHiddenColumn?: boolean; // (Optional) Use to enable/disable hidden coloumn when downloding excel
  uploadXLS?: boolean; // (Optional) If uploading table data as XLXS is enabled.
  onServerSideUpload?: (file: any) => void; // (Optional) If defined client-side upload will not work.
  activeRow?: string; // (Optional) Key of the currently active row.
  selectedRows?: any[]; // (Optional) Array of keys identifying selected rows.
  disabledSelectedRows?: any[]; // Keys of selected rows in the table that want to be disabled.
  customRowSettings?: CustomRowSettings[]; // (Optional) Custom settings for rows based on column values.
  actions?: Actions | Actions[]; // (Optional) Actions available in the table.
  actionsDropdownItems?: IActionsDropdownItems[]; // (Optional) Add additional dropdown item in actions row.
  actionsDropdownContainerWidth?: string; // (Optional) Set dropdown container width.
  isAddDisabled?: boolean; // (Optional) controls enable or disable of add button action.
  actionColumnSetting?: IActionColumnSetting; // (Optional) Action column settings.
  isPermanentDelete?: boolean; // (Optional) If delete action permanently removes data.
  isBulkDelete?: boolean; // (Optional) If enabled user will be able to bulk delete by checkng checkbox.
  onBulkDelete?: (deletedRwos: any[]) => void; // (Optional) Returns the deleted rows.
  selectionRange?: boolean; // (Optional) Enable cell selction for copy or paste data from excel.
  headerRightControls?: boolean; // (Optional) Control show/hide of header right controls.
  showPreviousValue?: boolean; // (Optional) Controls whether previous value will show in tooltip or not.
  headerMainContent?: ReactNode; // (Optional) Element to be render before search textbox.
  headerLeftContent?: ReactNode; // (Optional) Element to be render after search textbox.
  headerRightContent?: ReactNode; // (Optional) Element to be render before right controls.
  headerRightIcons?: { // (Optional) Icons that will appearin right controls after the default icons
    icon: string;
    onIconClick?: () => void;
    title?: string
  }[]
  isLoading?: boolean; // (Optional) Show loading component.
  disabledPagination?: boolean; // (Optional) Force disable pagination.
  isDisablePageSizeChange?: boolean; // (Optional) Disable Page Size Change
  overrideUpdateStyle?: boolean;
  /** 
   * NOTE: If (totalItems or ssrConfig) prop is defined the default table behavior will not work,
   * instead it will render what prop data that is being passed only.
   * (Not work default behavior) meaning the pagination will not update table items.
   * Don't provide any value on this prop if you intent to use the table in default behavior.
   * Use this only if you want to dynamically render row item based on the api
   */
  totalItems?: number;
  ssrConfig?: {
    /**
     * When pageIndex, pageSize or search value is change within the data-table the 'fetchPageData' will trigger.
     * This function returns 3 parameters which is:
     * pageIndex = current page index of data-table.
     * pageSize = current page size of data-table.
     * searchQuery = current search text value when user press enter.
     */
    fetchPageData?: (values: {
      pageIndex: number,
      pageSize: number,
      searchQuery?: string,
      filterValues?: {
        [key: string]: any;
      }
    }) => void;
    /** 
     * If this function is define 'download all' dropdown will be 
     * visible and this function should return an array of objects 
     * that will be use as download data */
    onDownloadAllClick?: () => any[] | Promise<any[]> | boolean;
    /** 
     * This prop is either an array of all data or a function to get all data in api.
     * If its a function it should return an array of objects that will be use in select all data.
     * This prop is required so select all checkbox will select all data.
     * */
    allData?: () => any[] | Promise<any[]> | any[];
  }
  isSelectableDisabled?: boolean; // (Optional) Property to set disabled for the checkboxes when selectable props is true.
  localStorageSettingsKey?: string; // (Optional) Property to enable saving of column settings in sessionStorage.
  setActiveRowOnClick?: boolean; // (Optional) Property to enable/disable setting active row on single click.
  setActiveRowOnDoubleClick?: boolean; // (Optional) Property to enable/disable setting active row on double click.
  withDownloadUploadAction?: boolean; // (Optional) Property to enable/disable additional column (Row Key, Intent Action) when downloading or uploading.
  undoRedoCellEditing?: boolean; // (Optional) Property to enable/disable undo/redo when cell editing.
  undoRedoCellEditingLimit?: number; // (Optional) Property to set how many undo/redo history can be store. Default is 5.
  onChange?: (updatedData: any[]) => void; // (Optional) Callback when table data is updated.
  onRowClick?: (rowData: any, index?: number) => void; // (Optional) Callback when a row is clicked.
  onRowDoubleClick?: (rowData: any, index?: number) => void; // (Optional) Callback when a row is double-clicked.
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void; // (Optional) Callback when column settings change.
  onResetClick?: (columnSettings: ColumnSettings[]) => void; // (Optional) Callback when reset icon clicked.
  collapsibleRowRender?: (rowData: any) => React.ReactNode; // (Optional) Function to render collapsible row content.
  onPageSizeChange?: (newPageSize: number) => void; // (Optional) Callback when page size changes.
  onPageIndexChange?: (newPageIndex: number) => void; // (Optional) Callback when page index changes.
  onSelectedRowsChange?: (selectedRows: any[]) => void; // (Optional) Callback when selected rows change.
  onDataChange?: (values?: IDataChange) => void; // (Optional) Callback when data is changed.
  onSelectionChange?: (cells?: any) => void; // (Optional) Callback when selection of cells is triggered.
  onRefreshIconClick?: () => void; // (Optional) If function is defined then the refresh icon in footer will be visible.
  onResetIconClick?: () => void; // (Optional) Callback function when reset icon is clicked.
  showReset?: boolean; // (optional) property to enable/disable reset button
}

export interface IFilterConfig {
  type: string;
  value?: any;
  multiSelect?: boolean;
  options?: IOptions[];
  codeId?: string;
  placeholder?: string;
}

export interface IActionConfig {
  type?: string;
  value?: any;
  options?: IOptions[];
  codeId?: string;
  placeholder?: string;
  isUnique?: boolean;
  disabled?: boolean | ((rowData: any, isSelected: boolean) => boolean | undefined);
  schema?: any;
  verticalAlign?: boolean;
  validation?: (rowData: any, isSelected: boolean) => string | undefined

  /** Force the editor to be visible without click */
  alwaysShowEditor?: boolean;
  render?: (ctx: {
    value: any;
    rowValues: any;
    column: ColumnSettings;
    rowIndex: number;
    isInvalid: boolean;
    error?: string | null;
    disabled: boolean;
    inputRef?: any;
    onChange: (next: any, opts?: { commit?: boolean }) => void;
    onCancel: () => void;
  }) => React.ReactNode;
}
export interface ColumnSettings {
  filterConfig?: IFilterConfig; // (Optional) Configuration for column filtering.
  column: string; // The name of the column.
  title: string; // Display title of the column.
  align?: 'left' | 'right' | 'center' | string; // (Optional) Text alignment in the column.
  pinned?: boolean | string; // (Optional) If the column is pinned to a side, can be true | false | none.
  hidden?: boolean; // (Optional) If the column should be hidden.
  width?: string | number; // (Optional) Width of the column, specified as a CSS value.
  minWidth?: string | number; // (Optional) Minimum width of the column, as a CSS value.
  groupTitle?: string; // (Optional) Title for a group of columns.
  order?: number; // (Optional) Order of the column in the table.
  sorted?: 'asc' | 'desc' | string; // (Optional) Sorting direction of the column. can be 'asc | 'desc' | none
  enableSorting?: boolean; //(Optional) Indicates whether sorting is enabled for the column
  draggable?: boolean; // (Optional) If the column can be dragged to reorder.
  resizable?: boolean; // (Optional) IF the column can be resized.
  actionConfig?: IActionConfig | boolean; // (Optional) Configuration for actions specific to this column.
  class?: string; // (Optional) CSS class for styling the column.
  selectable?: boolean; // (Optional) If false, selecting the column is disabled.
  type?: string; // (Optional) Convert cell base on type passed.
  columnCustomRenderer?: (value: any, rowData: any) => React.ReactNode; // (Optional) Custom renderer for column data, can be any component.
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
  selectedRows?: any[]; // Keys of selected rows in the table.
  disabledSelectedRows?: any[]; // Keys of selected rows in the table that want to be disabled.
  activeRow?: string | null; // Key of the currently active row.
  advanceFilterValues?: any; // Values for advanced filtering criteria.
  filterValues?: any; // Values for basic filtering criteria.
  canPaste?: boolean; // Flag indicating whether paste action is available.
  selectedCell?: any; // Currently selected column.
  updatedRows?: string[]; // Keys of rows that have been updated.
  rightPanelToggle: boolean; // Flag indicating whether the right panel is toggled.
  // Information about cells being edited.
  editingCells: Array<{
    rowKeyValue?: string;
    column?: string; // Name of the column containing the cell.
    value: string; // Value of the cell.
    editable?: boolean; // Flag indicating whether the cell is editable.
    invalid?: boolean; // Flag indicating whether the cell value is invalid.
    error?: string | null; // Error message for invalid cell value.
    isNew?: boolean; // Flag indicating whether the cell belongs to a new row.
  }>;
  observedWidth: number; // Width of the observed area.
  isFetching?: boolean; // Use to set loading when fetching in screen.
  initialData?: any; // Store initial data on load to be use in previous data.
  undoHistory?: any // Store undo hostiry
  redoHistory?: any // Store redo history
  highlightedCell?: any // Store highlighted cell
  showActionDropdown?: boolean | string // Dropdown action visible state
}