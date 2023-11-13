interface RequestData {
  pageNumber: number;
  pageSize: string | number;
  sortColumn?: string;
  sortDirection?: string;
  method?: string;
  filter?: { [key: string]: any }; // Add filter property
}

interface FetchConfig {
  endpoint: string; // Endpoint string
  requestData?: RequestData;
  responseDataPath?: string; // Path to the array of 'data' from api response.
  responseTotalDataPath?: string; // Path to the 'totalData' from api response.
  filterSettings?: any
}

interface CustomRowSettings {
  column: string;
  value: string;
  showColumn?: boolean;
  width?: string;
  styles?: {
    backgroundColor?: string;
    textDecoration?: string;
    color?: string;
    fontWeight?: string;
  }
}

export enum Actions {
  ADD = "ADD",
  EDIT = "EDIT",
  DELETE = "DELETE",
  DUPLICATE = "DUPLICATE",
  COPY = "COPY",
  PASTE = "PASTE",
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
  customRowSettings?: CustomRowSettings[];
  actions?: Actions | Actions[];
  onChange?: (updatedData: any[]) => void;
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
  draggable?: boolean;
  actionConfig?: any;
  columnCustomRenderer?: (value: any, rowData: any) => React.ReactNode;
}

