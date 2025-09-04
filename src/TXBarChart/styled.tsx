import styled, { keyframes, css } from 'styled-components';

const BAR_VERTICAL_WIDTH = '32px';
const BAR_HORIZONTAL_WIDTH = '24px';

export const Container = styled.div<any>`
  min-width: 360px;
  box-sizing: border-box;
  overflow: hidden;
  ${({ orientation, paddingTop }) => orientation === 'vertical' ? `
    padding: 30px 16px 16px;
    width: 100%;
  ` : `
    width: calc(100% - 6px);
    padding: ${100 + (paddingTop ? paddingTop - 40 : 0)}px 4px 50px;
  `}
  * {
    box-sizing: border-box;
  }

  /* Scrollbar style for WebKit based browsers (e.g., Chrome, Safari) */
  *::-webkit-scrollbar-track {
    width: 10px; /* Set the width of the scrollbar */
    height: 10px;
    background-color: #F2F6F8;
    border: 1px solid var(--color-neutral-light);
  }

  *::-webkit-scrollbar {
    width: 10px; /* Set the width of the scrollbar */
    height: 10px;
    background-color: #F2F6F8;
    border: 1px solid var(--color-neutral-light);
  }

  *::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-light); /* Grey cursor color */
    border: 2px solid #F2F6F8;
    border-radius: 6px; /* Rounded edges */
    transition: all .3s ease;
    height: 6px;
    width: 6px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-neutral); /* Change cursor color on hover */
  }

  /* Scrollbar style for Firefox */
  /* Firefox doesn't support changing the scrollbar color directly via CSS.
    However, you can use a browser-specific feature called scrollbar-color (only works in Firefox 64+). */

  @-moz-document url-prefix() {
    scrollbar-color: var(--color-neutral-light) #fff; /* Cursor and track colors */
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
      background-color: var(--color-neutral-light); /* Grey cursor color */
      border: 1.5px solid #F2F6F8;
      border-radius: 6px; /* Rounded edges */
    }

    *::-ms-scrollbar-thumb:hover {
      background-color: #a8aaac; /* Change cursor color on hover */
    }
  }
`;

export const ChartWrapper = styled.div<any>`
  margin: 0 auto;
  position: relative;
  width: ${({ orientation }) => orientation === 'vertical' ? BAR_VERTICAL_WIDTH : '100%'};
  height: ${({ chartHeight, orientation }) => orientation === 'vertical' ? chartHeight : BAR_HORIZONTAL_WIDTH};
  display: flex;
  flex-direction: ${({orientation}) => orientation === 'vertical' ? 'column' : 'row-reverse'};
  justify-content: flex-end;
  flex-wrap: wrap;
  &:after {
    content: "";
    position: absolute;
    border: 1px solid var(--color-neutral);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const barStyles = (height: string, contentAlign: string = 'left', textAlign: string = 'left', orientation = 'vertical') => `
  width: ${orientation === 'vertical' ? '100%' : height || 'auto'};
  height: ${orientation === 'vertical' ? height || 'auto' : '100%'};
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;
  > div {
    position: relative;
    text-align: ${textAlign};
    width: 140px;
    font-size: 10px;
    line-height: 14px;
    color: var(--color-neutral-dark);
    background-color: rgba(255, 255, 255, 0.7);
    ${orientation === 'vertical' ? `
      padding-right: 12px;
      transform: translate(${contentAlign === 'left' ? '-100%' : `calc(${BAR_VERTICAL_WIDTH} + 20px)`}, -50%);
    ` : `
      bottom: 0;
      padding-top: 6px;
      left: 50%;
      transform: translate(-50%, 100%);
      text-align: center;
    `}
    > p {
      margin: 0;
    }
    > b {
      color: var(--color-neutral-darker);
    }
  }
`;

export const Segment = styled.div<any>`
  ${({ height, orientation }) => barStyles(height, 'left', 'left', orientation)}
  z-index: ${({zIndex}) => zIndex};
  ${({orientation}) => orientation === 'horizontal' ? `
    &.horizontal-bar-chart-left {
      > div {
        text-align: center;
        transform: translate(100%, -100%);
      }
    }
    &.horizontal-bar-chart-right {
      > div {
        text-align: right;
        transform: translate(0, -100%);
      }
    }
    > div {
      background-color: white;
      position: absolute;
      display: block;
      height: fit-content;
      right: 0;
      left: auto;
      transform: none;
      margin: 0;
      padding: 0;
      top: 0;
      transform: translate(50%, calc(-100% - 60px));
    }
  ` : ''}
  &:not(:first-child) {
    ${({orientation}) => orientation === 'vertical' ? `border-top: 1px dashed #111;` : `border-right: 1px dashed transparent;`}
  }

  ${({orientation, arrowColor, horizontalOffset}) => orientation === 'horizontal' ? `
    &:after {
      content: '';
      position: absolute;
      top: 24px;
      height: ${horizontalOffset + 55 + 24}px;
      border-right: 1px dashed ${arrowColor || 'var(--color-neutral-dark)'};
      right: 0;
      transform: translateY(-100%);
    }
  ` : ``}

  &:before {
    z-index: 1;
    content: "";
    position: absolute;
    top: 0;
    width: 0px;
    height: 0px;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid ${({arrowColor}) => arrowColor || 'var(--color-neutral-dark)'};
    ${({orientation, horizontalOffset}) => orientation === 'vertical' ? `
      left: 0;
      transform: translate(-130%, -50%);
    ` : `
      right: 0;
      transform: rotate(-90deg) translate(calc(100% + ${horizontalOffset + 55}px), 3px);
    `}
  }
`;

const grow = (height: string, orientation = 'vertical') => keyframes`
  from {
    ${orientation === 'vertical' ? 'height: 0;' : 'width: 0;'}
  }
  to {
    ${orientation === 'vertical' ? `height: ${height};` : `width: ${height};`}
  }
`;

export const Data = styled.div<any>`
  ${({ height, color, orientation }) => css`
    ${barStyles(height, 'right', 'left', orientation)}
    position: relative;
    align-self: flex-end;
    background-color: ${color || 'var(--color-neutral-light)'};
    z-index: 10;
    animation: ${grow(height, orientation)} 0.6s ease-out forwards;
    > div {
      ${orientation === 'vertical' ? `top: 50%;` : `bottom: 0;`}
      outline: none;
      > b {
        color: ${color || '#000'};
      }
    }
    ${orientation === 'vertical' ? '' : `
      &.horizontal-bar-text-top {
        > div {
          padding: 0;
          transform: translate(-50%, calc(-100% - 12px));
        }
        &:after {
          top: -4px;
        }
      }
      &.text-align-left {
        > div {
          transform: translate(0, 100%);
          text-align: left;
        }
        &.horizontal-bar-text-top {
          > div {
            transform: translate(0, calc(-100% - 12px));
          }
        }
      }
    `}
    &:after {
      z-index: 2;
      content: "";
      position: absolute;
      background-color: ${color || 'var(--color-neutral-light)'};
      border-radius: 2px;
      ${orientation === 'vertical' ? `
        right: -6px;
        top: 1px;
        bottom: 1px;
        width: 2px;
      ` : `
        left: 1px;
        right: 1px;
        height: 2px;
        bottom: -4px;
      `}
    }
  `}
`;

export const BottomContent = styled.div`
  text-align: center;
  padding: 24px 16px 0;
`;
