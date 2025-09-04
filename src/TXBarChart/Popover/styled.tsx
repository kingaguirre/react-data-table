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

export const PopoverContainer = styled.div<any>`
  width: ${({width}) => width || 500}px;
  max-height: 500px;
  height: auto;
  background: #fff;
  border: 1px solid ${({color}) => color || 'var(--color-neutral)'};
  border-radius: 2px;
  box-shadow: 0px 3px 5px 0px rgba(173, 173, 173, 0.5);
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
    z-index: 1;
    content: "";
    position: absolute;
    top: 50%;
    ${({ position }) => (position === 'left' ? 'right: -19px;' : 'left: -19px;')}
    border-width: 10px;
    border-style: solid;
    border-color: transparent;
    ${({ position }) => (position === 'left' ? 'border-left-color: #fff;' : 'border-right-color: #fff;')}
    transform: translateY(-50%);
  }

  &:after {
    z-index: 0;
    content: "";
    position: absolute;
    top: 50%;
    ${({ position }) => (position === 'left' ? 'right: -20px;' : 'left: -20px;')}
    border-width: 10px;
    border-style: solid;
    border-color: transparent;
    ${({ position, color }) => (position === 'left' ? `border-left-color: ${color || 'var(--color-neutral)'};` : `border-right-color: ${color || 'var(--color-neutral)'};`)}
    transform: translateY(-50%);
  }
`;

export const PopoverTitle = styled.div`
  position: relative;
  z-index: 0;
  background-color: var(--color-light-a);
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  text-align: left;
  padding: 4px 16px;
  border-left: 2px solid var(--color-primary);
  color: var(--color-primary-darker);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

export const CloseButton = styled.button<any>`
  position: absolute;
  right: 12px;
  transform: translateY(-50%);
  top: 50%;
  background: none;
  border: none;
  font-size: 26px;
  cursor: pointer;
  color: var(--color-neutral);
  z-index: 1;
  line-height: 1;
  padding: 0;
  transition: all .3s ease;
  &:hover {
    color: var(--color-neutral-darker);
  }
`;

export const PopoverContent = styled.div`
  overflow: auto;
  max-height: calc(500px - 24px);
  padding: 16px;
`;