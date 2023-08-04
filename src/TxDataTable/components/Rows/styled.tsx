import styled from 'styled-components';

export const TableRowsContainer = styled.div`
`;

export const TableRow = styled.div`
  display: flex;
`;

export const TableCell = styled.div<{ width?: string; minWidth?: string; align?: string, isFrozen?: boolean }>`
  display: block;
  padding: 4px 6px;
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  position: relative;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => !!align ? align === 'center' ? 'center' : 'flex-end' : 'flex-start'};
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
  ${({isFrozen}) => !!isFrozen ? `
    position: sticky;
    z-index: 1;
  ` : ''}
  &:after {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0;
    border-bottom: 1px solid #ddd;
    content: "";
  }
  select, input {
    width: 100%;
  }
`;

export const CollapseIcon = styled.span`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

export const CellContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.2;
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

export const VerticalLine = styled.div`
  position: absolute;
  top: -1px;
  bottom: -1px;
  right: -1px;
  width: 2px;
  background-color: #007bff;
  z-index: 2;
`;