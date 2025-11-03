import styled from 'styled-components';
import { TitleWrapper } from '../ColumnHeader/styled';

export const TableContainer = styled.div<any>`
  width: 100%;
  overflow-x: auto;
  position: relative;
  ${({ isResizing }) => isResizing && `
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.1);
      z-index: 3000;
    }
  `}
`;

export const Table = styled.div<any>`
  display: block;
  width: 100%;
  position: relative;
`;

export const ResizingBox = styled.div<any>`
  position: absolute;
  pointer-events: none;
  z-index: 3001;
  top: 0;
  height: 100%;
  border: 2px dashed #007bff;
  background: rgba(255, 255, 255, 0.75);
  overflow: hidden;

  ${TitleWrapper} {
    width: 100%;
    border-bottom: 1px solid var(--color-neutral-pale);
    background-color: var(--color-light-a);
    height: 24px;
    padding: 2px 4px 2px;
    display: flex;
    align-items: center;
  }
`;

export const WidthSizeContainer = styled.div`
  height: calc(100% - 26px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-neutral-dark);
  font-size: 12px;
`;
