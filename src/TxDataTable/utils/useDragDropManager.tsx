import { useState, useCallback } from 'react';
import { ColumnSettings } from '../interfaces';

interface DragDropManagerProps {
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  showLineAtIndex: number | null;
}

export const useDragDropManager = (
  columnSettings: ColumnSettings[],
  setColumnSettings: (newColumnSettings: ColumnSettings[]) => void,
  dragImageRef: React.RefObject<HTMLDivElement>,
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void,
): DragDropManagerProps => {
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(columnSettings[columnIndex]));

    setDraggedColumnIndex(columnIndex);
  }, [columnSettings, dragImageRef]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.preventDefault();
    if (columnIndex !== draggedColumnIndex) {
      setDropTargetIndex(columnIndex);
    }
  }, [draggedColumnIndex]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.preventDefault();

    if (draggedColumnIndex === null || draggedColumnIndex === columnIndex) {
      setDropTargetIndex(null);
      return;
    }

    const newColumnSettings = [...columnSettings];
    const draggedColumn = newColumnSettings[draggedColumnIndex];
    newColumnSettings.splice(draggedColumnIndex, 1);
    newColumnSettings.splice(columnIndex, 0, draggedColumn);

    /** Update defaultOrder property after the drag and drop action */
    const orderedColumnSettings = newColumnSettings.map((col, index) => ({
      ...col,
      order: index,
    }));

    setColumnSettings(orderedColumnSettings);
    onColumnSettingsChange?.(orderedColumnSettings);
    setDraggedColumnIndex(null);
    setDropTargetIndex(null);
  }, [draggedColumnIndex, columnSettings, setColumnSettings, onColumnSettingsChange]);

  return {
    onDragStart,
    onDragOver,
    onDrop,
    showLineAtIndex: dropTargetIndex,
  };
};
