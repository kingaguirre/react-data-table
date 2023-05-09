export interface ColumnSettings {
  column: string;
  title: string;
  align?: string;
  freeze?: boolean;
  width?: string;
  minWidth?: string;
  groupTitle?: string;
  order?: number;
  customColumnRenderer?: (text: any, data: any) => any;
}
