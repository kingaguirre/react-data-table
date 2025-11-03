import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TableContainer, Table, ResizingBox, WidthSizeContainer } from './styled';
import { ColumnSettings } from '../../interfaces';
import { CellContent } from "../Rows/Cell/styled";
import { TitleWrapper } from '../ColumnHeader/styled';

const MIN_COLUMN_WIDTH = 60; // Define the minimum column width

interface IProps {
  children?: any;
  columns?: any[];
  onColumnWidthChange?: (index: number, newWidth: number) => void;
  resizeHandleClassName?: string;
  parentCellClassName?: string;
}
export const ResizeWrapper = (props: IProps) => {
  const {
    children,
    columns,
    onColumnWidthChange,
    resizeHandleClassName,
    parentCellClassName,
  } = props;

  // If onColumnWidthChange is not defined, render children directly
  if (!onColumnWidthChange) {
    return children;
  }

  const [columnWidths, setColumnWidths] = useState<any>([]);
  const [draggingIndex, setDraggingIndex] = useState<any>(null);
  const [startX, setStartX] = useState<any>(null);
  const [resizingWidth, setResizingWidth] = useState<any>(null);
  const [boxLeft, setBoxLeft] = useState<any>(null);
  const tableRef: any = useRef(null);
  const containerRef: any = useRef(null);
  const [totalWidth, setTotalWidth] = useState(null);
  const mouseMoveHandlerRef: any = useRef<any>();
  const mouseUpHandlerRef: any = useRef<any>();

  useEffect(() => {
    setColumnWidths(columns?.map(i => parseInt((i.width || i.defaultWidth) as string)));
  }, [columns]);

  useEffect(() => {
    if (containerRef.current) {
      setTotalWidth(containerRef.current.clientWidth);
    }
  }, []);

  const handleMouseDown = useCallback((event) => {
    const parentElem = event.target.closest(`.${parentCellClassName}`);
    const cellRect = parentElem.getBoundingClientRect();

    setDraggingIndex(parentElem.dataset.columnIndex);
    setStartX(event.clientX);
    setResizingWidth(columnWidths?.[parentElem.dataset.columnIndex]);
    const tableRect = tableRef.current.getBoundingClientRect();
    setBoxLeft(cellRect.left - tableRect.left);
  }, [columnWidths, parentCellClassName]);

  const handleMouseMove = useCallback((event) => {
    if (draggingIndex !== null) {
      let newWidth = columnWidths[draggingIndex] + (event.clientX - startX);

      // Ensure the new width is not less than the minimum width
      if (newWidth < MIN_COLUMN_WIDTH) {
        newWidth = MIN_COLUMN_WIDTH;
      }

      setResizingWidth(newWidth);
    }
  }, [draggingIndex, columnWidths, startX]);

  const handleMouseUp = useCallback(() => {
    if (draggingIndex !== null) {
      setColumnWidths((prevWidths) => {
        const newWidths = [...prevWidths];
        newWidths[draggingIndex] = resizingWidth;
        return newWidths;
      });
      onColumnWidthChange(draggingIndex, resizingWidth);
      setDraggingIndex(null);
      setStartX(null);
      setResizingWidth(null);
      setBoxLeft(null);
    }
  }, [draggingIndex, resizingWidth, onColumnWidthChange]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setDraggingIndex(null);
      setStartX(null);
      setResizingWidth(null);
      setBoxLeft(null);
    }
  };

  useEffect(() => {
    const handleResizeMouseDown = (event) => handleMouseDown(event);

    mouseMoveHandlerRef.current = (event: any) => handleMouseMove(event);
    mouseUpHandlerRef.current = () => handleMouseUp();

    const resizeHandles = containerRef.current.querySelectorAll(`.${resizeHandleClassName}`);

    resizeHandles.forEach((handle) => {
      handle.addEventListener('mousedown', handleResizeMouseDown);
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', mouseMoveHandlerRef.current);
    document.addEventListener('mouseup', mouseUpHandlerRef.current);

    return () => {
      resizeHandles.forEach((handle) => {
        handle.removeEventListener('mousedown', handleResizeMouseDown);
      });
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', mouseMoveHandlerRef.current);
      document.removeEventListener('mouseup', mouseUpHandlerRef.current);
    };
  }, [resizeHandleClassName, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <TableContainer ref={containerRef} isResizing={draggingIndex !== null}>
      <Table ref={tableRef} totalWidth={totalWidth}>
        {children}
        {draggingIndex !== null && resizingWidth !== null && (
          <ResizingBox
            style={{
              width: resizingWidth,
              left: boxLeft,
            }}
          >
            <TitleWrapper>
              <CellContent>{columns?.[draggingIndex || 0].title}</CellContent>
            </TitleWrapper>
            <WidthSizeContainer>
              <div>
                <div>Width:</div>
                <div>{resizingWidth}px</div>
              </div>
            </WidthSizeContainer>
          </ResizingBox>
        )}
      </Table>
    </TableContainer>
  );
};