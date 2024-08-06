
import styled, { keyframes, css } from 'styled-components';

export const PanelContainer = styled.div<{ width: string, height: string }>`
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
`;

export const PanelHeader = styled.div`
  background: #f5f5f5;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #e0e0e0;
  }
`;

export const PanelContent = styled.div`
  padding: 10px;
  background: #fff;
  height: calc(100% - 50px); /* Adjust based on header height */
  overflow-y: auto;
`;

export const ExpandIcon = styled.span`
  font-size: 18px;
  line-height: 18px;
  padding: 0 10px;
`;

const overlayShowAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const overlayHideAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const FullScreenOverlay = styled.div<{ isExpanded: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${({ isExpanded }) => css`
    ${isExpanded ? overlayShowAnimation : overlayHideAnimation} 0.3s forwards
  `};
`;

const panelExpandAnimation = (initialRect: DOMRect) => keyframes`
  0% {
    width: ${initialRect.width}px;
    height: ${initialRect.height}px;
    top: ${initialRect.top}px;
    left: ${initialRect.left}px;
    opacity: 1;
  }
  100% {
    width: 90%;
    height: 90%;
    top: 5%;
    left: 5%;
    opacity: 1;
  }
`;

const panelCollapseAnimation = (initialRect: DOMRect) => keyframes`
  0% {
    width: 90%;
    height: 90%;
    top: 5%;
    left: 5%;
    opacity: 1;
  }
  100% {
    width: ${initialRect.width}px;
    height: ${initialRect.height}px;
    top: ${initialRect.top}px;
    left: ${initialRect.left}px;
    opacity: 1;
  }
`;

interface FullScreenPanelContainerProps {
  initialRect: DOMRect;
  isExpanded: boolean;
}

export const FullScreenPanelContainer = styled.div<FullScreenPanelContainerProps>`
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: fixed;
  animation: ${({ initialRect, isExpanded }) => css`
    ${isExpanded ? panelExpandAnimation(initialRect) : panelCollapseAnimation(initialRect)} 0.6s forwards
  `};
  top: ${({ initialRect }) => `${initialRect.top}px`};
  left: ${({ initialRect }) => `${initialRect.left}px`};
  width: ${({ initialRect }) => `${initialRect.width}px`};
  height: ${({ initialRect }) => `${initialRect.height}px`};
`;