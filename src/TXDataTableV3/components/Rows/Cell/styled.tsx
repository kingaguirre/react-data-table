import styled from 'styled-components';

export const TableCell = styled.div<any>`
  display: block;
  padding: 2px 6px;
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  min-height: 24px;
  position: relative;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => !!align ? align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start': 'flex-start'};
  text-align: ${({ align }) => !!align ? align === 'center' ? 'center' : align === 'right' ? 'right' : 'left': 'left'};
  border-right: 1px solid var(--color-neutral-light);
  color: var(--color-neutral-dark);
  min-height: 26px;
  transition: all .15s ease 0s;

  &.highlighted {
    background-color: var(--color-secondary-pale);
  }
  &.is-editable:not(.custom-action-column):not(.is-in-editable-status) {
    &:hover {
      background-color: var(--color-neutral-pale)!important;
      box-shadow: inset -3px -4px white, inset 3px 4px white;
      color: var(--color-neutral-dark)!important;
    }
  }

  &.is-not-editable.custom-action-column {
    background-color: white !important;
  }

  &.is-not-editable:not(.custom-action-column) {
    background-color: var(--color-light-a)!important;
  }

  &.table-cell.selected {
    background-color: lightblue!important;
  }

  &.is-in-editable-status {
    z-index: 10;
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
    border-bottom: 1px solid var(--color-neutral-pale);
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
    background-color: white !important;
    z-index: 101
  }
`;

export const CellContent = styled.div<{isCustomCell?: boolean,children: React.ReactNode, className?: any, style?: any, ref?: any, title?: string}>`
  ${({isCustomCell}) => !isCustomCell ? `
    white-space: nowrap;
    text-overflow: ellipsis;
  ` : ``}
  overflow: hidden;
  font-size: 12px;
  line-height: 1.2;
  position: relative;
  z-index: 2;
  width: 100%;
`;

export const ResizeHandle = styled.div<any>`
  cursor: col-resize;
  width: 5px;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  transition: all .3s ease;
  ${({isVisible}) => isVisible === true ? `
    background-color: var(--color-neutral-pale);
    &:hover {
      width: 8px;
    }
  ` : ''}
`;

export const ColumnDragHighlighter = styled.div<{isDraggedColumn?: boolean, className?: any,}>`
  position: absolute;
  top: 0;
  bottom: 1px;
  right: 0;
  left: 0;
  z-index: 1;
  ${({isDraggedColumn}) => !!isDraggedColumn ? `
    background-color: var(--color-light-a);
  ` : `
    background-color: var(--color-primary-pale);
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

export const InvalidBorder = styled.div<{ isInEditableStatus?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 1px;
  border: 2px solid var(--color-danger);
  z-index: ${({ isInEditableStatus }) => !!isInEditableStatus ? 0 : 100};
`;

export const ToolTipContent = styled.span`
  font-size: 12px;
  word-break: break-word;
`

export const InvalidToolTip = styled(ToolTipContent)`
  color: var(--color-danger);
`;
