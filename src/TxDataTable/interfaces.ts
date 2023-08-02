export interface DataTableProps {
  dataSource: any[];
  columnSettings: ColumnSettings[];
  pageSize?: number;
  pageIndex?: number;
  selectable?: boolean;
  rowKey: string;
  // onPageSizeChange?: (newPageSize: number) => void;
  // onPageIndexChange?: (newPageIndex: number) => void;
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
  // onSelectedRowsChange?: (rowData: any) => void;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  collapsibleRowHeight?: string;
}

export interface ColumnSettings {
  filterBy?: any;
  column: string;
  title: string;
  align?: string;
  freeze?: boolean;
  hide?: boolean;
  width?: string;
  minWidth?: string;
  groupTitle?: string;
  order?: number;
  sorted?: 'asc' | 'desc' | 'none';
  customColumnRenderer?: (value: any, rowData: any) => React.ReactNode;
}

