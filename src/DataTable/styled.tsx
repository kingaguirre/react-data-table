import styled from 'styled-components';

export const TableInnerWrapper = styled.div`
  overflow-x: scroll;
  width: 100%;
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  background-color: #eaeaea;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
`;

export const TableRow = styled.div`
  display: flex;
`;

export const TableCell = styled.div<{ width?: string; minWidth?: string; align?: string }>`
  display: block;
  padding: 8px;
  text-align: ${({ align }) => align || 'left'};
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  position: relative;
  border: 1px solid #ddd;
  background-color: white;
`;

export const VerticalLine = styled.div`
  position: absolute;
  top: -1px;
  bottom: -1px;
  right: -1px;
  width: 2px;
  background-color: #007bff;
  z-index: 2;
`;

export const DragHandle = styled.div`
  cursor: grab;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const ResizeHandle = styled.div`
  cursor: col-resize;
  width: 5px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
`;

export const GroupHeader = styled.div<{ width?: string; minWidth?: string; align?: string }> `
  display: block;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #ddd;
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
`;

export const TableFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #eaeaea;
  padding: 8px;
  border-top: 1px solid #ddd;
`;

export const TableBodyWrapper = styled.div`
`;

export const CellContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CollapseIcon = styled.span`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const TableHeader = styled.div``

