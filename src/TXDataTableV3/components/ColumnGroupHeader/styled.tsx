import styled from 'styled-components';

export const GroupHeaderWrapper = styled.div<any>`
  position: sticky;
  top: 0;
  z-index: 10009;
`;

export const GroupHeader = styled.div<{hasTitle?: boolean;key?:any; style?: any, children: React.ReactNode}>`
  min-height: 26px;
  display: flex;
  align-items: center;
  padding: 4px 6px;
  text-align: center;
  border-right: 1px solid var(--color-neutral-light);
  background-color: ${({hasTitle}) => !!hasTitle ? "var(--color-light-a)" : "white"};
  > * {
    text-transform: uppercase;
    font-size: 11px;
    font-weight: bold;
    line-height: 1;
    color: var(--color-neutral-darker);
    width: 100%;
  }
`;