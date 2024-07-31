import styled, { keyframes } from 'styled-components';

const popoverFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const popoverFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const PopoverContainer = styled.div<{ position: string, width?: number }>`
  width: ${({width}) => width || 500}px;
  max-height: 500px;
  height: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: left;
  position: absolute;
  top: 50%;
  ${({ position }) => (position === 'left' ? 'right: 100%;' : 'left: 100%;')}
  transform: translateY(-50%);
  color: #111;
  animation: ${popoverFadeIn} 0.15s ease-in-out forwards;
  z-index: 1000;
  &.popover-exit {
    animation: ${popoverFadeOut} 0.15s ease-in-out forwards;
  }

  &:before {
    content: "";
    position: absolute;
    top: 50%;
    ${({ position }) => (position === 'left' ? 'right: -20px;' : 'left: -20px;')}
    border-width: 10px;
    border-style: solid;
    border-color: transparent;
    ${({ position }) => (position === 'left' ? 'border-left-color: #ccc;' : 'border-right-color: #ccc;')}
    transform: translateY(-50%);
  }

  > div {
    overflow: auto;
    padding: 20px;
  }
`;

export const PopupTitle = styled.div`
  position: relative;
  z-index: 0;
  border-bottom: 1px solid #111;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #111;
  z-index: 1;
`;