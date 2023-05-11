export interface ColumnSettings {
  column: string;
  title: string;
  align?: string;
  freeze?: boolean;
  hide?: boolean;
  width?: string;
  groupTitle?: string;
  order?: number;
  customColumnRenderer?: (value: any, rowData: any) => React.ReactNode;
}
