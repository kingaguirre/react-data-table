import styled from 'styled-components';

export const TableRowsContainer = styled.div<any>`
  cursor: default;
  position: relative;
  ${({ isFetching }) => !!isFetching ? `
    pointer-events: none;
    opacity: 0.6;
  ` : ''}

  /* Define a class that adds the highlight effect */
  .highlighted {
    > div {
      // animation: fadeOut 2s ease-in-out;
    }
  }

  /* Define a keyframe animation for fading out */
  @keyframes fadeOut {
    0%, 30% {
      background-color: var(--color-primary);
      color: white;
    }
    100% {
      background-color: transparent;
      color: inherit;
    }
  }
`;

export const TableRow = styled.div<{pinnedWidth?: number, className?: any, children: React.ReactNode, style?: any, ref?: any}>`
  display: flex;
  position: relative;
  .input-container {
    min-height: 18px;
  }
  > * {
    &:first-child {
      border-left-color: white!important;
    }
    &:last-child {
      border-right-color: white!important;
    }
  }
  &.column-filters-container {
    position: sticky;
    top: 0;
    z-index: 10008;
    > * {
      background-color: var(--color-light-a);
    }
  }
  &.column-header-container {
    position: sticky;
    top: 0;
    z-index: 10010;
    > * {
      border-top: 1px solid var(--color-neutral-pale);
      background-color: var(--color-light-a);
    }
  }
  &.clickable-row:hover:not(.column-header-container):not(.column-filters-container):not(.group-header) {
    > * {
      background-color: #cbddf6!important;
    }
    .column-drag-highlighter {
      display: none;
    }
  }
  &.is-active {
    &:after {
      opacity: 1;
    }
    .column-drag-highlighter {
      display: none;
    }
  }

  &.is-selected {
    > * {
      background-color: #E5F1FC;
      &.is-not-editable {
        background-color: #d6dfe6!important;
      }
    }
  }
  > &:not(.is-active) {
    &:first-child,
    &:nth-child(2n+3) {
      > div {
        background-color: #F9F9F9;
      }
    }
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0px;
    right: 0;
    bottom: 0;
    border: 2px solid var(--color-primary);
    pointer-events: none;
    z-index: 10002;
    background-color: transparent;
    pointer-events: none;
    transition: all .3s ease;
    opacity: 0;
  }
`;

export const LoadingPanel = styled.div<any>`
  padding: 16px;
  color: #aaa;
  text-shadow: 0 0 0 #222;
  text-align: left;
  border: 1px solid var(--color-neutral-pale);
  border-top: none;
  code {
    font-weight: bold;
    color: black;
  }
`;

export const CollapsibleRowRenderContainer = styled.div`
  display: block;
  font-size: 14px;
  padding: 12px;
  width: 100%;
  background-color: #f2f6f8;
  border: 1px solid var(--color-neutral-light);
  border-top: none;
  overflow: auto;
`;
