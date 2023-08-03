import styled from 'styled-components';

export const GrouoHeaderWrapper = styled.div``;

export const GroupHeader = styled.div<{ width?: string; minWidth?: string; align?: string }> `
  display: block;
  padding: 4px 6px 2px;
  text-align: center;
  font-weight: bold;
  /* border: 1px solid #ddd; */
  width: ${({ width }) => width || 'auto'};
  min-width: ${({ width }) => width || 'auto'};
  > * {
    text-transform: uppercase;
    font-size: 11px;
  }
`;