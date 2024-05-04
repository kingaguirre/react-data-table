import styled from 'styled-components';

export const GroupHeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 10009;
`;

export const GroupHeader = styled.div<{ width?: string; minWidth?: string; align?: string }> `
  display: block;
  padding: 6px 6px 4px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid rgb(221, 221, 221);
  border-left: 1px solid rgb(221, 221, 221);
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  background-color: #eaeaea;
  > * {
    text-transform: uppercase;
    font-size: 11px;
  }
`;