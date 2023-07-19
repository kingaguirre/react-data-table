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
  customColumnRenderer?: (value: any, rowData: any) => React.ReactNode;
}
