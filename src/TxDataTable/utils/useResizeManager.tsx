import { useState, useCallback, useEffect } from 'react';
import { ColumnSettings } from '../interfaces';

interface ResizeManagerProps {
  onMouseDown: (columnIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const useResizeManager = (
  columnSettings: ColumnSettings[],
  setColumnSettings: (newColumnSettings: any) => void,
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void,
): ResizeManagerProps => {
  const [resizingColumnIndex, setResizingColumnIndex] = useState<number | null>(null);
  const [initialClientX, setInitialClientX] = useState<number>(0);
  const [initialWidth, setInitialWidth] = useState<number>(0);

  const onMouseDown = useCallback((columnIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const initialColumnWidth = parseInt(columnSettings[columnIndex].width || '0', 10);
    setInitialWidth(initialColumnWidth);
    setResizingColumnIndex(columnIndex);
    setInitialClientX(e.clientX);
  }, [columnSettings]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (resizingColumnIndex === null) return;

    e.preventDefault();

    const widthChange = e.clientX - initialClientX;
    const newWidth = Math.max(initialWidth + widthChange, 100);

    const newColumnSettings = [...columnSettings];
    const column = newColumnSettings[resizingColumnIndex];
    newColumnSettings[resizingColumnIndex] = { ...column, width: `${newWidth}px` };
    setColumnSettings(newColumnSettings);

    // Show the vertical line for all cells in the resizing column
    const tableRows = document.querySelectorAll('.table-row');
    tableRows.forEach((row) => {
      const cell = row.children[resizingColumnIndex];
      const verticalLine: any = cell.querySelector('.vertical-line');
      if (verticalLine) {
        verticalLine.style.display = 'block';
      }
    });
  }, [resizingColumnIndex, initialClientX, initialWidth, setColumnSettings]);

  const onMouseUp = useCallback(() => {
    if (resizingColumnIndex !== null) {
      setResizingColumnIndex(null);

      // Trigger onColumnSettingsChange when resizing is done
      onColumnSettingsChange?.(columnSettings);
    }
  }, [resizingColumnIndex, columnSettings, onColumnSettingsChange]);

  useEffect(() => {
    if (resizingColumnIndex !== null) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingColumnIndex, onMouseMove, onMouseUp]);

  return { onMouseDown };
};
