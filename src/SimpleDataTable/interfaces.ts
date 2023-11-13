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
  collapsibleRowHeight?: string;
  fetchConfig?: FetchConfig;
  filterAll?: boolean;
  downloadCSV?: boolean;
  activeRow?: string;
  selectedRows?: any[];
  clickableRow?: boolean;
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  onPageSizeChange?: (newPageSize: number) => void;
  onPageIndexChange?: (newPageIndex: number) => void;
  onSelectedRowsChange?: (selectedRows: any[]) => void;
}

export interface ColumnSettings {
  filterConfig?: any;
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
  columnCustomRenderer?: (value: any, rowData: any) => React.ReactNode;
}

