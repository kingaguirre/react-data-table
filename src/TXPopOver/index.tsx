import React, { useState, useEffect, useRef, FC } from 'react';
import ReactDOM from 'react-dom';

import { PopoverContainer, PopoverTitle, PopoverContent, CloseButton } from './styled';
import { ITXPopOverInterface } from './interface';

export const TXPopOver: FC<ITXPopOverInterface> = (props) => {

  const {
    trigger = 'hover',
    content,
    title,
    placement = 'bottom',
    children,
    target,
    popoverPointerColor,
    popoverBorderColor,
    popoverWidth,
    childrenCss = {},
    popoverTitleColor
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0, placement, right: 0 });
  const [popoverKnobPosition, setPopoverKnobPosition] = useState('');

  const popoverRef: any = useRef(null);
  const targetRef: any = useRef(null);
  const devicePixelRatio = window.devicePixelRatio;

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  /* Not enough space to the left, switch to right */
  const calculatePopOverLeftPosition = (popoverRect, targetRect) => {
    let knobPosition, left;
    if (targetRect?.width < 20) {
      knobPosition = targetRect?.left - 37 + "px";
      left = 44;

    } else {
      const arrowPosition = Math.abs(popoverRect?.width - targetRect?.right + (targetRect?.width / 10) - popoverRect?.x) / 10;
      left = 10;
      if (arrowPosition < 5) knobPosition = arrowPosition + 4 + "px";
      else knobPosition = arrowPosition + "px";
    }

    return {
      knobPosition,
      left
    }
  }

  /* Not enough space to the right, switch to left */
  const calculatePopOverRightPosition = (popoverRect, targetRect) => {
    let knobPosition, right = (popoverRect?.width / 2) / 10;
    if (targetRect?.width < 20) {
      if (popoverRect?.width > 800) {
        knobPosition = devicePixelRatio < 1.5 ?
          Math.abs(targetRect?.left / 100 + popoverRect?.width - popoverRect?.left + 168) + "px" :
          Math.abs(targetRect?.left / 100 + popoverRect?.width - popoverRect?.left + 68) + "px"
      } else if (popoverRect?.width > 500) {
        right = (popoverRect?.width / 2) / 5;
        if (devicePixelRatio < 1.5) {
          if (devicePixelRatio > 1.1 && devicePixelRatio < 1.3) {
            knobPosition = Math.abs(targetRect?.left / 10 + popoverRect?.width / 2 - popoverRect?.left / 18 - 67) + "px";
          } else {
            knobPosition = Math.abs(targetRect?.left / 10 + popoverRect?.width / 2 - popoverRect?.left / 18 - 22) + "px";
          }
        } else {
          knobPosition = Math.abs(targetRect?.left / 10 + popoverRect?.width / 2 - popoverRect?.left / 18 + 6) + "px";
        }
      } else if (popoverRect?.width > 300) {
        knobPosition = Math.abs(targetRect?.left / 100 + popoverRect?.width - popoverRect?.left / 18) + "px"
      } else {
        right = devicePixelRatio < 1.2 ? (popoverRect?.width / 2) / 3 + 10 : (popoverRect?.width / 2) / 2;
        knobPosition = '96%';
      }
    } else {
      const arrowPosition = Math.abs(popoverRect?.width - targetRect?.right + (targetRect?.width / 10) - popoverRect?.x) / 10;
      if (arrowPosition < 5) knobPosition = arrowPosition + 4 + "px";
      else knobPosition = arrowPosition + "px";
    }

    return {
      knobPosition,
      left: 0,
      right
    }
  }

  const calculatePosition = () => {
    if (targetRef?.current && popoverRef?.current) {
      const targetRect = targetRef?.current?.getBoundingClientRect();
      const popoverRect = popoverRef?.current?.getBoundingClientRect();
      let knobPosition = '50%';

      let left = targetRect?.left + (targetRect?.width / 2) - (popoverRect?.width / 2);
      let top, right = 0;
      let finalPlacement = placement; // Use a new variable to hold the placement
      let isEnoughLeftSpace;

      // Check available space
      const spaceAbove = targetRect?.top;
      const spaceBelow = window?.innerHeight - targetRect?.bottom;
      const spaceLeft = targetRect?.left;
      const spaceRight = window?.innerWidth - targetRect?.right;
      if (devicePixelRatio === 1.125 && popoverRect?.width < 800) {
        isEnoughLeftSpace = targetRect?.left < popoverRect?.width
      } else {
        isEnoughLeftSpace = targetRect?.left * 2 < popoverRect?.width
      }
      const isEnoughRightSpace = spaceRight < 390;

      // Adjust placement based on available space
      if (finalPlacement === 'bottom') {
        if (spaceBelow < popoverRect?.height + 5) {
          finalPlacement = 'top'; // Not enough space below, switch to top
        }
        if (isEnoughLeftSpace) {
          const knobLeftPosition = calculatePopOverLeftPosition(popoverRect, targetRect);
          knobPosition = knobLeftPosition?.knobPosition;
          left = knobLeftPosition?.left;
        } else if (isEnoughRightSpace) {
          const knobRightPosition = calculatePopOverRightPosition(popoverRect, targetRect);
          knobPosition = knobRightPosition?.knobPosition;
          left = knobRightPosition?.left;
          right = knobRightPosition?.right;
        }
      } else if (finalPlacement === 'top') {
        if (spaceAbove < popoverRect?.height + 5) {
          finalPlacement = 'bottom'; // Not enough space above, switch to bottom
        }
        if (isEnoughLeftSpace) {
          const knobLeftPosition = calculatePopOverLeftPosition(popoverRect, targetRect);
          knobPosition = knobLeftPosition?.knobPosition;
          left = knobLeftPosition?.left;
        } else if (isEnoughRightSpace) {
          const knobRightPosition = calculatePopOverRightPosition(popoverRect, targetRect);
          knobPosition = knobRightPosition?.knobPosition;
          left = knobRightPosition?.left;
          right = knobRightPosition?.right;
        }
      } else if (finalPlacement === 'right') {
        if (spaceRight < popoverRect?.width + 5) {
          finalPlacement = 'left'; // Not enough space to the right, switch to left
        }
      } else if (finalPlacement === 'left') {
        if (spaceLeft < popoverRect?.width + 5) {
          finalPlacement = 'right'; // Not enough space to the left, switch to right
        }
      }

      // Calculate position based on the final placement
      switch (finalPlacement) {
        case 'top':
          top = targetRect?.top + window?.scrollY - popoverRect?.height - 5;
          break;
        case 'bottom':
          top = targetRect?.bottom + window?.scrollY + 15;
          break;
        case 'left':
          left = targetRect?.left + window?.scrollX - popoverRect?.width - 5;
          top = targetRect?.top + (targetRect?.height / 2) - (popoverRect?.height / 2) + window?.scrollY;
          break;
        case 'right':
          left = targetRect?.right + window?.scrollX + 5;
          top = targetRect?.top + (targetRect?.height / 2) - (popoverRect?.height / 2) + window?.scrollY;
          break;
        default:
          top = targetRect?.bottom + window?.scrollY + 5;
      }

      setPopoverPosition({ left, top, placement: finalPlacement, right }); // Use finalPlacement here
      setPopoverKnobPosition(knobPosition);
    }
  };


  const handleOutsideClick = (event) => {
    if (isOpen && popoverRef?.current && !popoverRef?.current?.contains(event?.target)) {
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

  const getScrollParent = (element: HTMLTimeElement | null): HTMLElement | Window => {
    if (!element) return window
    const overflowRegex = /(auto|scroll)/
    let parent: HTMLElement | null = element
    while (parent) {
      const { overflow, overflowY, overflowX } = getComputedStyle(parent)
      if (overflowRegex.test(overflow + overflowY + overflowX)) {
        if (parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) {
          return parent
        }
      }
      parent = parent.parentElement
    }
    return window
  }

  useEffect(() => {
    const scrollParent = getScrollParent(targetRef.current)
    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('resize', calculatePosition); // Recalculate position on resize
      scrollParent.addEventListener('scroll', calculatePosition, true);
 
      const resizeObserver = new ResizeObserver(calculatePosition)
      let ancestor = targetRef.current
      while (ancestor) {
        resizeObserver.observe(ancestor)
        ancestor = ancestor.parentElement
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', calculatePosition); // Clean up resize listener
      scrollParent.removeEventListener('scroll', calculatePosition, true);
      resizeObserver.disconnect()
    };

  }
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
        style={childrenCss}
      >
        {children}
      </div>

      {ReactDOM.createPortal(
        <PopoverContainer
          ref={popoverRef}
          isOpen={isOpen}
          left={popoverPosition.left}
          top={popoverPosition.top}
          right={popoverPosition.right}
          placement={popoverPosition.placement}
          popoverPointerColor={popoverPointerColor}
          popoverBorderColor={popoverBorderColor}
          popoverWidth={popoverWidth}
          popoverKnobPosition={popoverKnobPosition}
        >
          <PopoverTitle
            popoverBorderColor={popoverBorderColor}
            popoverTitleColor={popoverTitleColor}
          >
            {title}
          </PopoverTitle>
          <CloseButton onClick={handleToggle}>×</CloseButton>
          <PopoverContent>{content}</PopoverContent>
        </PopoverContainer>,
        document.body
      )}
    </>
  );
};

