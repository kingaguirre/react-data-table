import styled from 'styled-components';
import { CellContent } from "../Rows/Cell/styled";

export const TitleWrapper = styled.div<{hasControls?: boolean, align?: string,children: React.ReactNode, title?: string}>`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: ${({hasControls, align}) => !!hasControls ? "space-between" : !!align ? align === 'right' ? 'flex-end' : 'flex-start' : 'center'};
  ${({hasControls}) => !!hasControls ? `width: 100%;` : ""}
  ${CellContent} {
    font-size: 11px;
    color: var(--color-neutral-darker);
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

export const TitleContainer = styled.div<{isDraggedOver?: boolean, hasControls?: boolean, align?: string, children: React.ReactNode}>`
  position: relative;
  flex: 1;
  cursor: grab;
  padding: 4px 6px;
  margin: -4px 0 -4px -6px;
  text-align: ${({ align }) => !!align ? align === 'center' ? 'center' : 'right' : 'left'};
  ${({hasControls}) => !!hasControls ? `
    width: calc(100% - 60px);
    text-align: left;
  ` : "width: 100%;"}
  ${({isDraggedOver}) => !isDraggedOver ? 'background-color: var(--color-light-a);' : ''}
  tx-core-icon {
    opacity: 0;
    position: absolute;
    top: calc(50% - 1px);
    left: 6px;
    transform: translateY(-50%);
    font-size: 9px;
    line-height: 1;
    transition: all .3s ease;
    color: var(--color-primary);
  }
  > * {
    transition: all .3s ease;
    &:last-child {
      bottom: 0;
    }
  }
  &:hover {
    tx-core-icon {
      opacity: 1;
    }
    > div {
      transform: translateX(14px);
    }
  }
`;

export const TitleControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 5px;
`;

export const ControlContainer = styled.div<any>`
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  margin-right: -5px;
  transition: all .3s ease;
  border-radius: 2px;
  &:hover {
    background-color: var(--color-neutral-pale);
  }
`;

export const PinContainer = styled<any>(ControlContainer)<{isPinned?: boolean, children: React.ReactNode, onClick?: any}>`
  margin: 0;
  font-size: 10px;
  color: var(--color-neutral-dark);
  ${({isPinned}) => isPinned ? `color: var(--color-primary);` : ''}
`;

interface ISortContainer {
  sorted: string;
}
export const SortContainer = styled.div<ISortContainer>`
  display: block;
  position: relative;
  width: 16px;
  height: 16px;
  z-index: 1;
  &:before, &:after {
    position: absolute;
    content: "";
    width: 2px;
    height 2px;
    border: 1px solid var(--color-primary);
    border-width: 0 0 1px 1px;
    left: 0;
    right: 0;
    margin: auto;
  }
  &:before {
    top: 5px;
    transform: rotate(135deg);
  }
  &:after {
    bottom: 5px;
    transform: rotate(-45deg);
  }
  ${p => p.sorted !== undefined ? p.sorted === "asc" ? `
    &:before {
      border-color: var(--color-neutral-pale);
    }
    &:after {
      border-color: var(--color-primary-darker);
    }
  ` : `
    &:before {
      border-color: var(--color-primary-darker);
    }
    &:after {
      border-color: var(--color-neutral-pale);
    }
  ` : `
    &:after,
    &:before {
      border-color: var(--color-primary-darker);
    }
  `}
`;
