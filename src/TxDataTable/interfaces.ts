interface FetchConfig {
  endpoint: string; // Endpoint string should have {pageNumber}, {pageSize}, {searchString}
  requestData?: any;
  responseDataPath?: string; // Path to the array of 'data' from api response.
  responseTotalDataPath?: string; // Path to the 'totalData' from api response.
}
export interface DataTableProps {
  dataSource?: any[];
  columnSettings: ColumnSettings[];
  pageSize?: number;
  pageIndex?: number;
  selectable?: boolean;
  rowKey: string;
  tableHeight?: string;
  // onPageSizeChange?: (newPageSize: number) => void;
  // onPageIndexChange?: (newPageIndex: number) => void;
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
  // onSelectedRowsChange?: (rowData: any) => void;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  collapsibleRowHeight?: string;
  fetchConfig?: FetchConfig;
}

export interface ColumnSettings {
  filterBy?: any;
  column: string;
  title: string;
  align?: 'left' | 'right' | 'center' | string;
  pinned?: boolean | string;
  hidden?: boolean;
  width?: string;
  minWidth?: string;
  groupTitle?: string;
  order?: number;
  sorted?: 'asc' | 'desc' | string;
  customColumnRenderer?: (value: any, rowData: any) => React.ReactNode;
}

