import styled from 'styled-components';

export const CollapseIconConainer = styled.span<{isRowCollapsed?: boolean,children: React.ReactNode, onClick?: any, title?: string}>`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: all .3s ease;
  font-size: 18px;
  color: var(--color-neutral-dark);
  ${({isRowCollapsed}) => !!isRowCollapsed ? "background-color: var(--color-neutral-pale);" : ""}
  &:hover {
    background-color: var(--color-neutral-pale);
  }
`;

export const CollapseIcon = styled.div<{isRowCollapsed?: boolean}>`
  height: 100%;
  width: 100%;
  &:before, &:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    content: "";
    height: 2px;
    width: 8px;
    background-color: var(--color-primary-dark);
    transform-origin: center;
  }
  &:after {
    transform: rotate(90deg);
    ${({isRowCollapsed}) => !!isRowCollapsed ? 'width: 0;' : ''}
  }
`;