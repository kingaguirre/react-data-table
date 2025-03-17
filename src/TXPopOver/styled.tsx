import styled, { css } from 'styled-components';

export const PopoverContainer = styled.div<any>`
  width: ${({ popoverWidth }) => popoverWidth ? popoverWidth + 'px' : 'auto'};
  position: absolute;
  background: #fff;
  border: 1px solid ${({ popoverBorderColor }) => popoverBorderColor || 'var(--color-primary)'};
  border-radius: 2px;
  box-shadow: 0px 3px 5px 0px rgba(173, 173, 173, 0.5);
  text-align: left;
  z-index: ${props => (props.isOpen ? 9999 : -1)};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
  left: ${props => props.left === 0 ? 'auto' : props.left + 'px'};
  right: ${props => props.right === 0  ? 'auto' : props.right + 'px'};
  top: ${props => props.top}px;
  box-sizing: border-box;
  color: #111;
  font-size: 12px;
  line-height: 1.4;
  * {
    box-sizing: border-box;
  }

  &:before,
  &:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px;
    border-color: transparent transparent white transparent;
    z-index: 1;

    ${props => props.placement === 'top' && css`
      left: ${props.popoverKnobPosition};
      bottom: 0;
      transform: translate(-50%, 100%) rotate(180deg);
    `}

    ${props => props.placement === 'bottom' && css`
      left: ${props.popoverKnobPosition};
      top: 0;
      transform: translate(-50%, -100%);
    `}

    ${props => props.placement === 'left' && css`
      right: 0;
      top: 50%;
      transform: translate(100%, -50%) rotate(90deg);
    `}

    ${props => props.placement === 'right' && css`
      left: 0;
      top: 50%;
      transform: translate(-100%, -50%) rotate(-90deg);
    `}
  }

  &:after {
    border-width: 6px;
    z-index: 0;
    border-color: transparent transparent ${({ popoverPointerColor }) => popoverPointerColor || 'var(--color-primary)'} transparent;
  }
`;

export const PopoverTitle = styled.div<any>`
  padding: 6px 12px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  line-height: 16px;
  text-align: left;
  padding: 4px 16px;
  border-left: 2px solid  ${({ popoverBorderColor }) => popoverBorderColor || 'var(--color-primary)'};
  color: ${({ popoverTitleColor }) => popoverTitleColor || 'var(--color-primary-darker)'}; ;
  background-color: var(--color-light-a);
  font-weight: 700;
  text-transform: uppercase;
`;

export const PopoverContent = styled.div`
  position: relative;
  overflow: auto;
  max-height: calc(500px - 24px);
  padding: 16px;
`;

export const CloseButton = styled.button<any>`
  position: absolute;
  right: 12px;
  transform: translateY(-50%);
  top: 11px;
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

export const Container = styled.div`
  > * {
    margin-bottom: 16px;
  }
  p {
    margin-bottom: 4px;
  }
`;