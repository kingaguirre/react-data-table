import { useState, useCallback } from 'react';
import { ColumnSettings } from './interface';

interface DragDropManagerProps {
  onDragStart: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => void;
  showLineAtIndex: number | null;
}

export const useDragDropManager = (
  columnSettings: ColumnSettings[],
  setColumnSettings: (newColumnSettings: ColumnSettings[]) => void,
  dataSource: any[],
  dragImageRef: React.RefObject<HTMLDivElement>,
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void,
): DragDropManagerProps => {
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(columnSettings[columnIndex]));

      const dragImage = createDragImage(columnSettings[columnIndex], dataSource);
      if (dragImageRef.current) {
        dragImageRef.current.innerHTML = '';
        dragImageRef.current.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
      }

      setDraggedColumnIndex(columnIndex);
    },
    [columnSettings, dataSource, dragImageRef],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
      e.preventDefault();
      if (columnIndex !== draggedColumnIndex) {
        setDropTargetIndex(columnIndex);
      }
    },
    [draggedColumnIndex],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, columnIndex: number) => {
      e.preventDefault();

      if (draggedColumnIndex === null || draggedColumnIndex === columnIndex) {
        setDropTargetIndex(null);
        return;
      }

      const newColumnSettings = [...columnSettings];
      const draggedColumn = newColumnSettings[draggedColumnIndex];
      newColumnSettings.splice(draggedColumnIndex, 1);
      newColumnSettings.splice(columnIndex, 0, draggedColumn);

      // Update defaultOrder property after the drag and drop action
      const orderedColumnSettings = newColumnSettings.map((col, index) => ({
        ...col,
        order: index,
      }));

      setColumnSettings(orderedColumnSettings);
      onColumnSettingsChange?.(orderedColumnSettings);
      setDraggedColumnIndex(null);
      setDropTargetIndex(null);
    },
    [draggedColumnIndex, columnSettings, setColumnSettings, onColumnSettingsChange],
  );

  return {
    onDragStart,
    onDragOver,
    onDrop,
    showLineAtIndex: dropTargetIndex,
  };
};

const createDragImage = (column: ColumnSettings, dataSource: any[]) => {
  const table = document.createElement('div');
  table.style.display = 'table';
  table.style.borderCollapse = 'separate';
  table.style.borderSpacing = '0';
  table.style.backgroundColor = 'white';
  table.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

  const headerRow = document.createElement('div');
  headerRow.style.display = 'table-row';

  const headerCell = document.createElement('div');
  headerCell.style.display = 'table-cell';
  headerCell.style.padding = '8px';
  headerCell.style.textAlign = column.align || 'left';
  headerCell.style.width = column.width || 'auto';
  headerCell.style.minWidth = column.minWidth || 'auto';
  headerCell.style.border = '1px solid #ddd';
  headerCell.innerText = column.title;

  headerRow.appendChild(headerCell);
  table.appendChild(headerRow);

  dataSource.slice(0, 5).forEach((row: any) => {
    const bodyRow = document.createElement('div');
    bodyRow.style.display = 'table-row';

    const bodyCell = document.createElement('div');
    bodyCell.style.display = 'table-cell';
    bodyCell.style.padding = '8px';
    bodyCell.style.textAlign = column.align || 'left';
    bodyCell.style.width = column.width || 'auto';
    bodyCell.style.minWidth = column.minWidth || 'auto';
    bodyCell.style.border = '1px solid #ddd';
    bodyCell.innerText = row[column.column];

    bodyRow.appendChild(bodyCell);
    table.appendChild(bodyRow);
  });

  return table;
};

