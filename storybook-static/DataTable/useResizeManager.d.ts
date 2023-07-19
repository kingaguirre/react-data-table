import { ColumnSettings } from './interface';
interface ResizeManagerProps {
    onMouseDown: (columnIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => void;
}
export declare const useResizeManager: (columnSettings: ColumnSettings[], setColumnSettings: (newColumnSettings: any) => void, onColumnSettingsChange?: ((newColumnSettings: ColumnSettings[]) => void) | undefined) => ResizeManagerProps;
export {};
