import { useEffect, useState, useCallback, useRef } from 'react';
import { ColumnSettings } from '../interfaces';

interface DragDropManagerProps {
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  dropTargetIndex: number | null;
  draggedColumnIndex: number | null;
}

export const useDragDropManager = (
  columnSettings: ColumnSettings[],
  setColumnSettings: (newColumnSettings: ColumnSettings[]) => void,
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void,
): DragDropManagerProps => {
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const currentDropTarget = useRef<number | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(columnSettings[columnIndex]));

    setDraggedColumnIndex(columnIndex);
  }, [columnSettings]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.preventDefault();
    if (columnIndex !== draggedColumnIndex && currentDropTarget.current !== columnIndex) {
      setDropTargetIndex(columnIndex);
      currentDropTarget.current = columnIndex;
    }
  }, [draggedColumnIndex]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
    e.preventDefault();

    if (draggedColumnIndex === null || draggedColumnIndex === columnIndex) {
      setDropTargetIndex(null);
      currentDropTarget.current = null;
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
    localStorage.setItem('currentColumnSettings', JSON.stringify(orderedColumnSettings));
    setDraggedColumnIndex(null);
    setDropTargetIndex(null);
    currentDropTarget.current = null;
  }, [draggedColumnIndex, columnSettings, setColumnSettings, onColumnSettingsChange]);

  const onDragEnd = useCallback(() => {
    setDraggedColumnIndex(null);
    setDropTargetIndex(null);
    currentDropTarget.current = null;
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetIndex(null);
      currentDropTarget.current = null;
    }
  }, []);

  const handleEscapeKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && draggedColumnIndex !== null) {
      setDraggedColumnIndex(null);
      setDropTargetIndex(null);
      currentDropTarget.current = null;
    }
  }, [draggedColumnIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleEscapeKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscapeKeyPress);
    };
  }, [handleEscapeKeyPress]);

  return {
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    onDragLeave,
    dropTargetIndex,
    draggedColumnIndex,
  };
};
