import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Styled components
const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Row = styled.div`
  display: flex;
`;

const Col = styled.div`
  width: 60px;
  height: 60px;
  border: 1px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &.selected {
    background-color: lightblue;
  }
`;

const SelectionBox = styled.div`
  position: absolute;
  border: 2px dashed #007bff;
  background-color: rgba(0,123,255,0.1);
  pointer-events: none;
`;

export default () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedCells, setSelectedCells] = useState([]);
  const parentRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !parentRef.current.contains(event.target)) {
        setSelectedCells([]);
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const clearSelection = () => {
    const cells = parentRef.current.querySelectorAll('.selected');
    cells.forEach(cell => {
      cell.classList.remove('selected');
    });
  };

  const handleCellClick = (rowIndex, columnIndex, e) => {
    e.stopPropagation(); // Prevent event from bubbling to handleMouseDown

    const cellKey = `r${rowIndex}c${columnIndex}`;
    const cellIndex = selectedCells.findIndex(cell => cell.key === cellKey);
    if (cellIndex >= 0) {
      const newSelectedCells = [...selectedCells];
      newSelectedCells.splice(cellIndex, 1);
      setSelectedCells(newSelectedCells);
    } else {
      const newSelectedCells = [...selectedCells, { key: cellKey, rowIndex, columnIndex, column: `colname-${columnIndex}` }];
      setSelectedCells(newSelectedCells);
    }
    e.target.classList.toggle('selected');
  };

  const updateSelection = () => {
    const newSelectedCells = [];
    const cells = parentRef.current.querySelectorAll('.cell-container');

    cells.forEach(cell => {
      const cellRect = cell.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();
      const cellTop = cellRect.top - parentRect.top + parentRef.current.scrollTop;
      const cellLeft = cellRect.left - parentRect.left + parentRef.current.scrollLeft;
      const cellBottom = cellTop + cellRect.height;
      const cellRight = cellLeft + cellRect.width;

      const isInSelectionBox =
        cellRight > selectionBox.x &&
        cellLeft < selectionBox.x + selectionBox.width &&
        cellBottom > selectionBox.y &&
        cellTop < selectionBox.y + selectionBox.height;

      if (isInSelectionBox) {
        cell.classList.add('selected');
        const rowIndex = parseInt(cell.dataset.rowIndex, 10);
        const columnIndex = parseInt(cell.dataset.columnIndex, 10);
        newSelectedCells.push({
          rowIndex,
          columnIndex,
          column: cell.dataset.column,
        });
      } else {
        cell.classList.remove('selected');
      }
    });

    setSelectedCells(newSelectedCells);
  };

  const handleMouseDown = (e) => {
    setIsSelecting(true);
    const rect = parentRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setStartPoint({ x: startX, y: startY });
    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });
    e.stopPropagation(); // Prevent event from bubbling
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    const rect = parentRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setSelectionBox({
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    });

    updateSelection();
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    console.log(selectedCells); // Log the selected cells for debugging
    setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
  };

  const renderGrid = () => {
    const rows = 3;
    const cols = 5;
    return Array.from({ length: rows }, (_, rowIndex) => (
      <Row key={rowIndex}>
        {Array.from({ length: cols }, (_, colIndex) => (
          <Col
            key={`${rowIndex}-${colIndex}`}
            className="cell-container"
            data-row-index={rowIndex}
            data-column-index={colIndex}
            data-column={`colname-${colIndex}`}
            onMouseDown={handleMouseDown}
            onClick={(e) => handleCellClick(rowIndex, colIndex, e)}
          >
            {colIndex + 1}
          </Col>
        ))}
      </Row>
    ));
  };

  return (
    <ParentContainer
      ref={parentRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {renderGrid()}
      {isSelecting && (
        <SelectionBox
          style={{
            left: `${selectionBox.x}px`,
            top: `${selectionBox.y}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
          }}
        />
      )}
    </ParentContainer>
  );
};
