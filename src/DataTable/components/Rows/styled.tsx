import styled from 'styled-components';

export const TableRowsContainer = styled.div<{ isFetching?: boolean }>`
  cursor: default;
  ${({ isFetching }) => !!isFetching ? `
    pointer-events: none;
    opacity: 0.6;
  ` : ''}
`;

export const TableRow = styled.div`
  display: flex;
  position: relative;
  &.column-header-container {
    > * {
      border-top: 1px solid #ddd;
      background-color: #eaeaea;
    }
  }
  &.is-active {
    > * {
      background-color: #cbddf6!important;
    }
    .column-drag-highlighter {
      display: none;
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
  transition: all .15s ease;
  ${({ isPinned }) => !!isPinned ? `
    position: sticky;
    z-index: 10;
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
  &.empty-cell {
    background-color: white !important
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

export const ColumnDragHighlighter = styled.div<{isDraggedColumn?: boolean}>`
  position: absolute;
  top: 0;
  bottom: 1px;
  right: 0;
  left: 0;
  z-index: 1;
  ${({isDraggedColumn}) => !!isDraggedColumn ? `
    background-color: #eee;
  ` : `
    background-color: #c3e1f7;
    animation: glowingBlue 1.5s infinite;
  `}

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
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
`;

export const CollapsibleRowRenderContainer = styled.div`
  display: block;
  font-size: 14px;
  padding: 12px;
  width: 100%;
  background-color: #f2f6f8;
  border: 1px solid #ddd;
  border-top: none;
  overflow: auto;
`;
