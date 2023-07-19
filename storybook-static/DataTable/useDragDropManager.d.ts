import { ColumnSettings } from './interface';
interface DragDropManagerProps {
    onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
    showLineAtIndex: number | null;
}
export declare const useDragDropManager: (columnSettings: ColumnSettings[], setColumnSettings: (newColumnSettings: ColumnSettings[]) => void, dataSource: any[], dragImageRef: React.RefObject<HTMLDivElement>, onColumnSettingsChange?: ((newColumnSettings: ColumnSettings[]) => void) | undefined) => DragDropManagerProps;
export {};
