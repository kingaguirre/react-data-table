import styled from 'styled-components';

export const TableRowsContainer = styled.div<{ isFetching?: boolean }>`
  cursor: default;
`;

export const TableRow = styled.div`
  display: flex;
  position: relative;
  &.column-header-container {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    overflow: hidden;
  }
  &.is-active {
    > * {
      background-color: #F3F2FD;
    }
  }
  &.is-selected {
    > * {
      background-color: #F3F2FD;
    }
  }
`;

export const TableCell = styled.div<{ width?: string; minWidth?: string; align?: string, isPinned?: boolean }>`
  display: block;
  padding: 16px;
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  position: relative;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => !!align ? align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' : 'center'};
  transition: all .3s ease;
  &:not(:last-child) {
    border-right: 1px solid #e3e3e3;
  }
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
    border-bottom: 1px solid #e3e3e3;
    content: "";
  }

  > * {
    position: relative;
    z-index: 2;
  }
`;

export const CellContent = styled.div`
  line-height: 1.2;
  position: relative;
  z-index: 2;
  font-size: 14px;
  font-weight: 400;
  line-height: 21px;
  word-break: break-word;
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
  padding: 16px;
  width: 100%;
  background-color: #f2f6f8;
  border: 1px solid #e3e3e3;
  border-top: none;
  overflow: auto;
`;
