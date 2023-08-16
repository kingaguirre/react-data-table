import styled from 'styled-components';

export const CollapseIcon = styled.span<{isRowCollapsed?: boolean}>`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: all .3s ease;
  ${({isRowCollapsed}) => !!isRowCollapsed ? "background-color: #eaeaea;" : ""}
  &:hover {
    background-color: #eaeaea;
  }
`;