import React from 'react';
import { ColumnSettings } from './interface';
export interface DataTableProps {
    dataSource: any[];
    columnSettings: ColumnSettings[];
    pageSize?: number;
    pageIndex?: number;
    selectable?: boolean;
    rowKey: string;
    onPageSizeChange?: (newPageSize: number) => void;
    onPageIndexChange?: (newPageIndex: number) => void;
    onRowClick?: (rowData: any) => void;
    onRowDoubleClick?: (rowData: any) => void;
    onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
    onSelectedRowsChange?: (rowData: any) => void;
    collapsibleRowRender?: (rowData: any) => React.ReactNode;
    collapsibleRowHeight?: string;
}
export declare const DataTable: React.FC<DataTableProps>;
