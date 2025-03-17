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
    popoverTitleColor,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, top: 0, placement, right: 0 });
  const [popoverKnobPosition, setPopoverKnobPosition] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const devicePixelRatio = window.devicePixelRatio;

  // Toggle popover open/closed
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  /* Helper to get scrollable parent elements */
  const getScrollableParents = (element: HTMLElement): HTMLElement[] => {
    const scrollableParents: HTMLElement[] = [];
    let parent = element.parentElement;
    while (parent) {
      const { overflowY } = getComputedStyle(parent);
      if (overflowY === 'auto' || overflowY === 'scroll') {
        scrollableParents.push(parent);
      }
      parent = parent.parentElement;
    }
    return scrollableParents;
  };

  /* Calculate knob position when there’s not enough space on the left */
  const calculatePopOverLeftPosition = (popoverRect: DOMRect, targetRect: DOMRect) => {
    let knobPosition, left;
    if (targetRect.width < 20) {
      knobPosition = targetRect.left - 37 + "px";
      left = 44;
    } else {
      const arrowPosition = Math.abs(popoverRect.width - targetRect.right + (targetRect.width / 10) - popoverRect.left) / 10;
      left = 10;
      knobPosition = arrowPosition < 5 ? arrowPosition + 4 + "px" : arrowPosition + "px";
    }
    return { knobPosition, left };
  };

  /* Calculate knob position when there’s not enough space on the right */
  const calculatePopOverRightPosition = (popoverRect: DOMRect, targetRect: DOMRect) => {
    let knobPosition, right = popoverRect.width / 20;
    if (targetRect.width < 20) {
      if (popoverRect.width > 800) {
        knobPosition = devicePixelRatio < 1.5
          ? Math.abs(targetRect.left / 100 + popoverRect.width - popoverRect.left + 168) + "px"
          : Math.abs(targetRect.left / 100 + popoverRect.width - popoverRect.left + 68) + "px";
      } else if (popoverRect.width > 500) {
        right = popoverRect.width / 10;
        if (devicePixelRatio < 1.5) {
          knobPosition = devicePixelRatio > 1.1 && devicePixelRatio < 1.3
            ? Math.abs(targetRect.left / 10 + popoverRect.width / 2 - popoverRect.left / 18 - 67) + "px"
            : Math.abs(targetRect.left / 10 + popoverRect.width / 2 - popoverRect.left / 18 - 22) + "px";
        } else {
          knobPosition = Math.abs(targetRect.left / 10 + popoverRect.width / 2 - popoverRect.left / 18 + 6) + "px";
        }
      } else if (popoverRect.width > 300) {
        knobPosition = Math.abs(targetRect.left / 100 + popoverRect.width - popoverRect.left / 18) + "px";
      } else {
        right = devicePixelRatio < 1.2 ? popoverRect.width / 6 + 10 : popoverRect.width / 4;
        knobPosition = '96%';
      }
    } else {
      const arrowPosition = Math.abs(popoverRect.width - targetRect.right + (targetRect.width / 10) - popoverRect.left) / 10;
      knobPosition = arrowPosition < 5 ? arrowPosition + 4 + "px" : arrowPosition + "px";
    }
    return { knobPosition, left: 0, right };
  };

  const calculatePosition = () => {
    if (targetRef.current && popoverRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();

      // Compute absolute coordinates based on the viewport plus the window’s scroll offsets.
      const absoluteLeft = targetRect.left + window.pageXOffset;
      const absoluteTop = targetRect.top + window.pageYOffset;

      let knobPosition = '50%';
      // Initially center the popover horizontally relative to the target.
      let left = absoluteLeft + targetRect.width / 2 - popoverRect.width / 2;
      let top: number, right = 0;
      let finalPlacement = placement;
      let isEnoughLeftSpace: boolean;

      // Available space relative to the viewport
      const spaceAbove = targetRect.top;
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;

      if (devicePixelRatio === 1.125 && popoverRect.width < 800) {
        isEnoughLeftSpace = targetRect.left < popoverRect.width;
      } else {
        isEnoughLeftSpace = targetRect.left * 2 < popoverRect.width;
      }
      const isEnoughRightSpace = spaceRight < 390;

      // Adjust placement based on available space and adjust knob position accordingly.
      if (finalPlacement === 'bottom') {
        if (spaceBelow < popoverRect.height + 5) {
          finalPlacement = 'top';
        }
        if (isEnoughLeftSpace) {
          const { knobPosition: knobLeft, left: newLeft } = calculatePopOverLeftPosition(popoverRect, targetRect);
          knobPosition = knobLeft;
          left = newLeft + window.pageXOffset;
        } else if (isEnoughRightSpace) {
          const { knobPosition: knobRight, left: newLeft, right: newRight } = calculatePopOverRightPosition(popoverRect, targetRect);
          knobPosition = knobRight;
          left = newLeft + window.pageXOffset;
          right = newRight;
        }
      } else if (finalPlacement === 'top') {
        if (spaceAbove < popoverRect.height + 5) {
          finalPlacement = 'bottom';
        }
        if (isEnoughLeftSpace) {
          const { knobPosition: knobLeft, left: newLeft } = calculatePopOverLeftPosition(popoverRect, targetRect);
          knobPosition = knobLeft;
          left = newLeft + window.pageXOffset;
        } else if (isEnoughRightSpace) {
          const { knobPosition: knobRight, left: newLeft, right: newRight } = calculatePopOverRightPosition(popoverRect, targetRect);
          knobPosition = knobRight;
          left = newLeft + window.pageXOffset;
          right = newRight;
        }
      } else if (finalPlacement === 'right') {
        if (spaceRight < popoverRect.width + 5) {
          finalPlacement = 'left';
        }
      } else if (finalPlacement === 'left') {
        if (spaceLeft < popoverRect.width + 5) {
          finalPlacement = 'right';
        }
      }

      // Compute final top and left based on the resolved placement.
      switch (finalPlacement) {
        case 'top':
          top = absoluteTop - popoverRect.height - 5;
          break;
        case 'bottom':
          top = absoluteTop + targetRect.height + 15;
          break;
        case 'left':
          left = absoluteLeft - popoverRect.width - 5;
          top = absoluteTop + targetRect.height / 2 - popoverRect.height / 2;
          break;
        case 'right':
          left = absoluteLeft + targetRect.width + 5;
          top = absoluteTop + targetRect.height / 2 - popoverRect.height / 2;
          break;
        default:
          top = absoluteTop + targetRect.height + 5;
      }

      setPopoverPosition({ left, top, placement: finalPlacement, right });
      setPopoverKnobPosition(knobPosition);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (isOpen && popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);

      // Add scroll listener for each scrollable parent of the target
      const scrollableParents = targetRef.current ? getScrollableParents(targetRef.current) : [];
      scrollableParents.forEach((parent) =>
        parent.addEventListener('scroll', calculatePosition)
      );
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
      const scrollableParents = targetRef.current ? getScrollableParents(targetRef.current) : [];
      scrollableParents.forEach((parent) =>
        parent.removeEventListener('scroll', calculatePosition)
      );
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
  }, [trigger]);

  return (
    <>
      <div
        ref={targetRef}
        onClick={trigger === 'click' ? handleToggle : undefined}
        style={childrenCss}
      >
        {children}
      </div>

      {isOpen &&
        ReactDOM.createPortal(
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
