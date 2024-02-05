import React, { useState, useRef } from 'react';
import styled from 'styled-components';

// Styled components
const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
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

export default () => {
  const [isSelecting, setIsSelecting] = useState(false);
  const selectedCellsRef = useRef([]);
  const startCellRef = useRef(null);
  const parentRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!e.target.dataset.column) return;
    setIsSelecting(true);
    const cell = e.target.dataset;
    startCellRef.current = { row: cell.row, column: cell.column };
    selectedCellsRef.current = [{ ...startCellRef.current }];
    e.target.classList.add('selected');
  };

  const handleMouseOver = (e) => {
    if (!isSelecting || !e.target.dataset.column) return;
    const currentCell = e.target.dataset;
    const currentSelection = { row: currentCell.row, column: currentCell.column };
    
    if (!selectedCellsRef.current.some(cell => cell.row === currentSelection.row && cell.column === currentSelection.column)) {
      selectedCellsRef.current.push(currentSelection);
      e.target.classList.add('selected');
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    console.log('Selected Cells:', selectedCellsRef.current);
    Array.from(parentRef.current.querySelectorAll('.selected')).forEach(cell => cell.classList.remove('selected'));
  };

  const renderGrid = () => {
    const rows = 3;
    const cols = 5;
    return Array.from({ length: rows }, (_, rowIndex) => (
      <Row key={rowIndex}>
        {Array.from({ length: cols }, (_, colIndex) => (
          <Col
            key={colIndex}
            data-row={rowIndex}
            data-column={colIndex}
            onMouseDown={handleMouseDown}
            onMouseOver={handleMouseOver}
            onMouseUp={handleMouseUp} // Mouse up can be handled on individual cells too
          >
            {colIndex + 1}
          </Col>
        ))}
      </Row>
    ));
  };

  return (
    <ParentContainer ref={parentRef}>
      {renderGrid()}
    </ParentContainer>
  );
};
