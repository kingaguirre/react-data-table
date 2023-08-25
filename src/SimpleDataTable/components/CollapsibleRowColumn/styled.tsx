import styled from 'styled-components';

export const CollapseIcon = styled.span<{isRowCollapsed?: boolean}>`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 24px;
  font-weight: bold;
  transition: all .3s ease;
  color: #5045E8;
  padding-bottom: 3px;
  border-radius: 2px;
  ${({isRowCollapsed}) => !!isRowCollapsed ? "background-color: #F3F2FD;" : ""}
  &:hover {
    background-color: #F3F2FD;
  }
`;