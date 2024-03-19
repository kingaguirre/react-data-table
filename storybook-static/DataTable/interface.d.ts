export interface ColumnSettings {
    filterConfig?: any;
    column: string;
    title: string;
    align?: string;
    freeze?: boolean;
    hide?: boolean;
    width?: string;
    minWidth?: string;
    groupTitle?: string;
    order?: number;
    cell?: (value: any, rowData: any) => React.ReactNode;
}
