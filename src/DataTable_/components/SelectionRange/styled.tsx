import styled from 'styled-components';

// Styled components
export const ParentContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  .table-cell {
    user-select: none;
  }
`;

export const Row = styled.div`
  display: flex;
`;

export const Col = styled.div`
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

export const SelectionBox = styled.div`
  position: absolute;
  border: 2px dashed #007bff;
  background-color: rgba(0,123,255,0.1);
  pointer-events: none;
  z-index: 20001;
`;