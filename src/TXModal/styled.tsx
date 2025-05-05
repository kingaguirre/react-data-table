import styled from 'styled-components';

const containerStyle = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
`;

const getSize = (size: any) => {
  switch(true) {
    case size === "small":
      return "300px";
    case size === "large":
      return "900px";
    case !!size && typeof size === "string" && size !== "small" && size !== "large" && size !== "medium":
      return size;
    case !size || size === "medium":
    default: return "600px";
  }
}

export const ModalContainer = styled.div<IProps>`
  ${p => !p.autoWidth ? 'width: 100%;' : ''}
  max-width: ${p => getSize(p.size)};
  background-clip: padding-box;
  outline: 0;
  z-index: 1;
  margin: auto;
  ${p => p.verticalAlign === 'top' ? 'margin-top: 0;' : ''}
  ${p => p.verticalAlign === 'bottom' ? 'margin-bottom: 0;' : ''}
  ${p => p.position === 'top-right' ? 'position: absolute; top: 50px; right: 140px;' : 'position: relative;'}  
  background-color: var(--color-light);
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.16), 0px 0px 6px rgba(0, 0, 0, 0.08);
  min-width: 0;
  border-radius: 4px;
  overflow: hidden;
  opacity: 0;
`;

interface IProps {
  show?: boolean;
  size?: any;
  align?: "right" | "left" | "center" | undefined;
  autoWidth?: boolean;
  buttonsWidth?: number;
  verticalAlign?: 'top' | 'center' | 'bottom';
  overlayHeight?: number;
  contentScrollable?: boolean;
  children: React.ReactNode;
  className?: any;
  onClick?: any;
  ref?: any;
  zIndex?: number;
  position?: string | undefined;
}

export const Container = styled.div<IProps>`
  ${containerStyle}
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 16px;
  z-index: ${({zIndex}) => zIndex || 2050};
  transform: scale(0);
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  &.viewed {
    transform: scale(1);
    ${ModalContainer} {
      animation: fadeIn .3s cubic-bezier(0.165, 0.840, 0.440, 1.000) .2s forwards;
    }
    &.hide {
      animation: fadeOutContainer 0s .3s linear forwards;
      ${ModalContainer} {
        animation: fadeOut .3s cubic-bezier(0.165, 0.840, 0.440, 1.000)  forwards;
      }
    }
  }

  @keyframes fadeOutContainer {
    0% { transform: scale(1); }
    99.9% { transform: scale(1); }
    100% { transform: scale(0); }
  }

  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }
`;

export const Overlay = styled.div<any>`
  ${containerStyle}
  z-index: 0;
  background-color: var(--color-neutral-darker);
  opacity: 0;
  height: ${p => (p.overlayHeight || 0) + 32}px;
  min-height: 100vh;

  &.viewed {
    animation: fadeInBD .6s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards;
    &.hide {
      animation: fadeOutBD .6s cubic-bezier(0.165, 0.840, 0.440, 1.000) forwards;
    }
  }

  @keyframes fadeInBD { 0% { opacity: 0; } 100% { opacity: 0.5; } }
  @keyframes fadeOutBD { 0% { opacity: 0.5; } 100% { opacity: 0; } }
`;

export const CloseIcon = styled.div<any>`
  cursor: pointer;
  top: 8px;
  right: 16px;
  position: absolute;
  display: block;
  line-height: 1;
  &:hover {
    > tx-core-icon {
      color: var(--color-neutral-pale);
    }
  }
  > tx-core-icon {
    color: var(--color-light-a);
    font-size: 12px;
    line-height: 1;
    transition: all .3s ease;
  }
`;

export const ModalHeader = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-primary-dark);
  padding: 8px 16px;
  height: 32px;
  border-top: 1px solid var(--color-neutral-light);
  border-bottom: 1px solid var(--color-neutral-light);
  text-transform: uppercase;
  font-family: var(--font-family-bold);
  color: var(--color-light-a);
  font-size: 11px;
  line-height: 16px;
`;

export const ModalBody = styled.div<any>`
  display: block;
  padding: 16px;
  font-size: var(--font-size-medium);
  background-color: var(--color-light);
  color: var(--color-neutral-darker);
  font-size: 14px;
  ${p => !!p.contentScrollable ? 'max-height: 631px' : ''};
  ${p => !!p.contentScrollable ? 'overflow-x: hidden' : 'overflow: hidden'};
  &::-webkit-scrollbar {
    width: 10px!important;
    height: 10px!important;
  };
  &::-webkit-scrollbar-track {
    border-left: 1px solid var(--color-neutral-pale)!important;
    border-right: 1px solid var(--color-neutral-pale)!important;
    background-color: #F2F6F8!important;
  };
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-light)!important;
    outline: none!important;
    border: 2px solid var(--color-neutral-pale)!important;
    -webkit-transition: all .3s ease!important;
    border-radius: 8px!important;
    cursor: default!important;
    &::-webkit-scrollbar-track {
      border-color: #F2F6F8!important;
    };
    &:hover,
    &:active {
      background-color: var(--color-primary)!important;
      &::-webkit-scrollbar-track {
        border-color: var(--color-neutral-pale)!important;
      }
    }
  }
`;

export const ModalFooter = styled.div<IProps>`
  padding: 16px;
  display: flex;
  border-top: 1px solid var(--color-neutral-pale);
  align-items: center;
  justify-content: ${p => (!p.align || p.align === "right") ? "flex-end" : p.align === "center" ? "center" : "flex-start"};
  > * {
    &:not(:last-child) {
      margin-right: 8px;
    }
  }
  ${p => !!p.buttonsWidth ? `
    tx-core-button {
      min-width: ${p.buttonsWidth}px;
    }
  ` : ''}
`;
