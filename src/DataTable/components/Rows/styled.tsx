import styled from 'styled-components';

export const TableRowsContainer = styled.div<{ isFetching?: boolean }>`
  ${({ isFetching }) => !!isFetching ? `
    pointer-events: none;
    opacity: 0.6;
  ` : ''}
`;

export const TableRow = styled.div`
  display: flex;
  position: relative;
  &.is-active {
    > * {
      background-color: #cbddf6;
    }
  }
`;

export const TableCell = styled.div<{ width?: string; minWidth?: string; align?: string, isPinned?: boolean }>`
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
  ${({ isPinned }) => !!isPinned ? `
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
  > * {
    position: relative;
    z-index: 2;
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
  position: relative;
  z-index: 2;
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
  top: 0;
  bottom: 1px;
  right: 0;
  left: 0;
  background-color: #c3e1f7;
  z-index: 1;
  animation: glowingBlue 1.5s infinite;

  @keyframes glowingBlue {
    0%, 100% {
      background: white;
    }
    50% {
      background: #c3e1f7;
    }
  }
`;

export const LoadingPanel = styled.div`
  padding: 16px;
  color: #aaa;
  text-shadow: 0 0 0 #222;
  text-align: left;
  font-weight: bold;
`;

export const CollapsibleRowRenderContainer = styled.div`
  display: block;
  font-size: 14px;
  padding: 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-top: none;
`;
