import styled from 'styled-components';

export const TableWrapper = styled.div`
  position: relative;
  display: block;
  width: 100%;
  background-color: #eaeaea;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: 0 0 4px 3px #ddd;
  * {
    box-sizing: border-box;
    line-height: 1.2;
  }
  input[type="text"], select {
    border: 1px solid #b8babc;
    border-bottom-color: #939598;
    background-color: white;
    border-radius: 2px;
    height: 24px;
    font-size: 12px;
    &.sm {
      height: 16px;
      font-size: 9px;
    }
  }

  /* Scrollbar style for WebKit based browsers (e.g., Chrome, Safari) */
  *::-webkit-scrollbar {
    width: 12px; /* Set the width of the scrollbar */
    height: 12px;
    background-color: #f2f6f8;
    box-shadow: 0 0 2px 0 #bcbec0;
    border-radius: 12px; /* Rounded edges */
  }

  *::-webkit-scrollbar-thumb {
    background-color: #bcbec0; /* Grey cursor color */
    border: 1.5px solid #f2f6f8;
    border-radius: 8px; /* Rounded edges */
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: #a8aaac; /* Change cursor color on hover */
  }

  /* Scrollbar style for Firefox */
  /* Firefox doesn't support changing the scrollbar color directly via CSS.
    However, you can use a browser-specific feature called scrollbar-color (only works in Firefox 64+). */

  @-moz-document url-prefix() {
    scrollbar-color: #bcbec0 #fff; /* Cursor and track colors */
    scrollbar-width: thin; /* Set the width of the scrollbar */
  }

  /* Scrollbar style for Edge and Internet Explorer (10+) */
  /* Microsoft Edge and IE 10+ support a different set of scrollbar CSS properties. */

  @supports (-ms-overflow-style: none) {
    /* Hide the default scrollbar */
    *::-webkit-scrollbar {
      display: none;
    }

    /* Define the custom scrollbar */
    & {
      -ms-overflow-style: none; /* Hide the default scrollbar */
      scrollbar-width: thin; /* Set the width of the scrollbar */
    }

    *::-ms-scrollbar-thumb {
      background-color: #bcbec0; /* Grey cursor color */
      border: 1.5px solid #f2f6f8;
      border-radius: 8px; /* Rounded edges */
    }

    *::-ms-scrollbar-thumb:hover {
      background-color: #a8aaac; /* Change cursor color on hover */
    }
  }
`;

export const TableInnerWrapper = styled.div`
  overflow-x: scroll;
  width: 100%;
  font-family: 'Helvetica';
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
  padding: 4px 6px;
  /* text-align: ${({ align }) => align || 'left'}; */
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  position: relative;
  /* border: 1px solid #ddd; */
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => !!align ? align === 'center' ? 'center' : 'flex-end' : 'flex-start'};
  border-right: 1px solid #ddd;
  border-left: 1px solid #ddd;
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

export const VerticalLine = styled.div`
  position: absolute;
  top: -1px;
  bottom: -1px;
  right: -1px;
  width: 2px;
  background-color: #007bff;
  z-index: 2;
`;

// remove
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

// remove
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

export const TableRowsContainer = styled.div`
`;

export const CellContent = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  line-height: 1.2;
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

// remove
export const TableHeader = styled.div``;
