// styled.tsx
import styled, { keyframes, css } from 'styled-components';

const BAR_WIDTH = '50px';

export const Container = styled.div<any>`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: ${({ chartHeight }) => chartHeight || '600px'};
  padding-top: 40px;
`;

export const ChartWrapper = styled.div`
  position: relative;
  width: ${BAR_WIDTH};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-wrap: wrap;
  &:after {
    content: "";
    position: absolute;
    border: 1px solid #111;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const barStyles = (height: string, contentAlign: string = 'left', textAlign: string = 'left') => `
  width: 100%;
  height: ${height || 'auto'};
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;
  > div {
    position: relative;
    text-align: ${textAlign};
    width: 160px;
    transform: translate(${contentAlign === 'left' ? '-100%' : `calc(${BAR_WIDTH} + 20px)`}, -50%);
    font-size: 12px;
    padding-right: 24px;
    > p {
      margin-bottom: 0;
    }
  }
`;

export const Label = styled.div<any>`
  ${({ height }) => barStyles(height)}
  &:not(:first-child) {
    border-top: 1px dashed #111;
  }
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0px;
    height: 0px;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid black;
    transform: translate(-130%, -50%);
  }
`;

const grow = (height: string) => keyframes`
  from {
    height: 0;
  }
  to {
    height: ${height};
  }
`;

export const Values = styled.div<any>`
  ${({ height, color }) => css`
    ${barStyles(height, 'right')}
    position: relative;
    align-self: flex-end;
    background-color: ${color || 'grey'};
    z-index: 1;
    animation: ${grow(height)} 0.6s ease-out forwards;
    > div {
      top: 50%;
      > b {
        color: ${color || '#000'};
      }
    }
    &:after {
      content: "";
      position: absolute;
      right: -8px;
      top: 1px;
      bottom: 1px;
      width: 4px;
      background-color: ${color || 'grey'};
      border-radius: 4px;
    }
  `}
`;