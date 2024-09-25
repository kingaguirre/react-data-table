import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

const PopoverContainer = styled.div<any>`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: ${props => (props.isOpen ? 10001 : -1)};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.3s ease;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  box-sizing: border-box;
  color: #222;
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
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 100%) rotate(180deg);
    `}

    ${props => props.placement === 'bottom' && css`
      left: 50%;
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
    border-color: transparent transparent #ccc transparent;
  }
`;

const PopoverTitle = styled.div`
  padding: 6px 12px;
  border-bottom: 1px solid #ccc;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
`;

const PopoverContent = styled.div`
  position: relative;
  padding: 12px;
`;

const Popover = ({ trigger = 'hover', content, title, placement = 'bottom', children, target }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef: any = useRef(null);
  const targetRef: any = useRef(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0, placement });

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const calculatePosition = () => {
    if (targetRef.current && popoverRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
  
      let left = targetRect.left + (targetRect.width / 2) - (popoverRect.width / 2);
      let top;
      let finalPlacement = placement; // Use a new variable to hold the placement
  
      // Check available space
      const spaceAbove = targetRect.top;
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;
  
      // Adjust placement based on available space
      if (finalPlacement === 'bottom') {
        if (spaceBelow < popoverRect.height + 5) {
          finalPlacement = 'top'; // Not enough space below, switch to top
        }
      } else if (finalPlacement === 'top') {
        if (spaceAbove < popoverRect.height + 5) {
          finalPlacement = 'bottom'; // Not enough space above, switch to bottom
        }
      } else if (finalPlacement === 'right') {
        if (spaceRight < popoverRect.width + 5) {
          finalPlacement = 'left'; // Not enough space to the right, switch to left
        }
      } else if (finalPlacement === 'left') {
        if (spaceLeft < popoverRect.width + 5) {
          finalPlacement = 'right'; // Not enough space to the left, switch to right
        }
      }
  
      // Calculate position based on the final placement
      switch (finalPlacement) {
        case 'top':
          top = targetRect.top + window.scrollY - popoverRect.height - 5;
          break;
        case 'bottom':
          top = targetRect.bottom + window.scrollY + 5;
          break;
        case 'left':
          left = targetRect.left + window.scrollX - popoverRect.width - 5;
          top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2) + window.scrollY;
          break;
        case 'right':
          left = targetRect.right + window.scrollX + 5;
          top = targetRect.top + (targetRect.height / 2) - (popoverRect.height / 2) + window.scrollY;
          break;
        default:
          top = targetRect.bottom + window.scrollY + 5;
      }
  
      setPopoverPosition({ left, top, placement: finalPlacement }); // Use finalPlacement here
    }
  };
  

  const handleOutsideClick = (event) => {
    if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (target && !children) {
      const element = document.querySelector(`[data-popover-id="${target}"]`);
      if (element) {
        targetRef.current = element as HTMLElement;
      }
    }
  }, [target, children]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('resize', calculatePosition); // Recalculate position on resize
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', calculatePosition); // Clean up resize listener
    };
  }, [isOpen]);

  useEffect(() => {
    if (trigger === 'hover') {
      const targetElement = targetRef.current;
      const handleMouseEnter = () => setIsOpen(true);
      const handleMouseLeave = () => setIsOpen(false);

      if (targetElement) {
        targetElement.addEventListener('mouseenter', handleMouseEnter);
        targetElement.addEventListener('mouseleave', handleMouseLeave);
      }

      return () => {
        if (targetElement) {
          targetElement.removeEventListener('mouseenter', handleMouseEnter);
          targetElement.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [trigger, targetRef]);

  return (
    <>
      <div
        ref={targetRef}
        onClick={trigger === 'click' ? handleToggle : undefined}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      {ReactDOM.createPortal(
        <PopoverContainer
          ref={popoverRef}
          isOpen={isOpen}
          left={popoverPosition.left}
          top={popoverPosition.top}
          placement={popoverPosition.placement}
        >
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverContent>{content}</PopoverContent>
        </PopoverContainer>,
        document.body
      )}
    </>
  );
};

export default Popover;
