import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  position: relative;
  ${({ isResizing }) => isResizing && `
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.1);
      z-index: 1;
    }
  `}
`;

const Table = styled.div`
  display: block;
  width: 100%;
  position: relative;
`;

const ResizingBox = styled.div`
  position: absolute;
  border: 2px dashed #000;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.5);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-weight: bold;
`;

const ResizableTableWrapper = ({
  children,
  initialColumnWidths,
  onColumnWidthChange,
  resizeHandleClassName,
  parentCellClassName,
  columnHeaders,
}) => {
  if (!onColumnWidthChange) {
    return children;
  }

  const [columnWidths, setColumnWidths] = useState(initialColumnWidths);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [startX, setStartX] = useState(null);
  const [resizingWidth, setResizingWidth] = useState(null);
  const [boxLeft, setBoxLeft] = useState(null);
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const [totalWidth, setTotalWidth] = useState(null);

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
    setResizingWidth(columnWidths[parentElem.dataset.columnIndex]);
    const tableRect = tableRef.current.getBoundingClientRect();
    setBoxLeft(cellRect.left - tableRect.left);
  }, [columnWidths, parentCellClassName]);

  const handleMouseMove = useCallback((event) => {
    if (draggingIndex !== null) {
      let newWidth = columnWidths[draggingIndex] + (event.clientX - startX);

      // Ensure the new width is not less than the minimum width
      if (newWidth < 60) {
        newWidth = 60;
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
    const resizeHandles = document.querySelectorAll(`.${resizeHandleClassName}`);
    const handleResizeMouseDown = (event) => handleMouseDown(event);

    resizeHandles.forEach((handle) => {
      handle.addEventListener('mousedown', handleResizeMouseDown);
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizeHandles.forEach((handle) => {
        handle.removeEventListener('mousedown', handleResizeMouseDown);
      });
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
              top: 0,
              height: '100%',
            }}
          >
            <div>{resizingWidth}px</div>
            <div>{columnHeaders[draggingIndex]}</div>
          </ResizingBox>
        )}
      </Table>
    </TableContainer>
  );
};

const TableHeader = styled.div`
  display: table-row;
`;

const TableRowContainer = styled.div`
  display: table-row-group;
`;

const Row = styled.div`
  display: table-row;
`;

const Cell = styled.div`
  display: table-cell;
  padding: 10px;
  border: 1px solid #ddd;
  position: relative;
  min-width: ${(props) => props.width}px;
  max-width: ${(props) => props.width}px;
  z-index: 2;
`;

const ResizeHandle = styled.div`
  width: 5px;
  height: 100%;
  background: #ddd;
  position: absolute;
  right: 0;
  top: 0;
  cursor: col-resize;
  user-select: none;
`;

const columns = [0, 1, 2, 3, 4];
const columnHeaders = ['Header 0', 'Header 1', 'Header 2', 'Header 3', 'Header 4'];

const ResizableTableExample = () => {
  const [columnWidths, setColumnWidths] = useState([100, 100, 100, 100, 100]);

  const handleColumnWidthChange = (index, newWidth) => {
    setColumnWidths((prevWidths) => {
      const newWidths = [...prevWidths];
      newWidths[index] = newWidth;
      return newWidths;
    });
  };

  return (
    <ResizableTableWrapper
      initialColumnWidths={columnWidths}
      onColumnWidthChange={handleColumnWidthChange}
      resizeHandleClassName="resize-handle"
      parentCellClassName="resizable-cell"
      columnHeaders={columnHeaders}
    >
      <TableHeader>
        {columns.map((index) => (
          <Cell key={index} className="resizable-cell" data-column-index={index} width={columnWidths[index]}>
            {columnHeaders[index]}
            <ResizeHandle className="resize-handle" />
          </Cell>
        ))}
      </TableHeader>
      <TableRowContainer>
        {[0, 1, 2].map((rowIndex) => (
          <Row key={rowIndex}>
            {columns.map((index) => (
              <Cell key={index} className="resizable-cell" data-column-index={index} width={columnWidths[index]}>
                {`row ${rowIndex} cell ${index}`}
                <ResizeHandle className="resize-handle" />
              </Cell>
            ))}
          </Row>
        ))}
      </TableRowContainer>
    </ResizableTableWrapper>
  );
};

export default ResizableTableExample;
