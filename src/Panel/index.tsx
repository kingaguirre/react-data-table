import React, { useState, useEffect, useRef, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import {
  PanelContainer,
  PanelHeader,
  PanelContent,
  ExpandIcon,
  FullScreenPanelContainer,
  FullScreenOverlay,
} from './styled';

interface PanelProps {
  title: string;
  children: ReactNode;
  width?: string;
  height?: string;
}

const Panel: React.FC<PanelProps> = ({ title, children, width = '300px', height = '200px' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fullScreenPanelRef = useRef<HTMLDivElement>(null);

  const handleExpandClick = () => {
    if (panelRef.current) {
      setPanelRect(panelRef.current.getBoundingClientRect());
    }
    setIsAnimating(true);
    setIsExpanded((prev) => !prev);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (fullScreenPanelRef.current && !fullScreenPanelRef.current.contains(event.target as Node)) {
      setIsAnimating(true);
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isExpanded) {
      setIsAnimating(true);
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isAnimating && panelRect && !isExpanded) {
      setPanelRect(panelRef.current!.getBoundingClientRect());
    }
  }, [isAnimating, isExpanded]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  const renderPanelContent = () => (
    <>
      <PanelHeader onClick={handleExpandClick}>
        <span>{title}</span>
        <ExpandIcon>{isExpanded ? '-' : '+'}</ExpandIcon>
      </PanelHeader>
      <PanelContent>{children}</PanelContent>
    </>
  );

  return (
    <>
      <PanelContainer id={`panel-${title}`} width={width} height={height} ref={panelRef}>
        {renderPanelContent()}
      </PanelContainer>
      {panelRect &&
        ReactDOM.createPortal(
          <FullScreenOverlay
            style={{ display: isExpanded || isAnimating ? 'flex' : 'none' }}
            onClick={handleOverlayClick}
            isExpanded={isExpanded}
          >
            <FullScreenPanelContainer
              ref={fullScreenPanelRef}
              initialRect={panelRect}
              isExpanded={isExpanded}
              onAnimationEnd={handleAnimationEnd}
            >
              {renderPanelContent()}
            </FullScreenPanelContainer>
          </FullScreenOverlay>,
          document.body
        )}
    </>
  );
};

export default Panel;