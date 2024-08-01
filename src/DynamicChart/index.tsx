import React, { useState, useEffect, ReactNode } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Container, ChartWrapper, Label, Values } from './styled';
import { LABELS, VALUES, calculateHeights } from './utils';
import Popover from './Popover';

// Define interfaces for labels and values to ensure type safety
interface ILabels {
  title: string;
  value: number;
  currency?: string;
}

interface IValues extends ILabels {
  color: string;
  popoverContent?: ReactNode;
  popoverTitle?: string;
}

interface IProps {
  chartHeight?: string;
  labels: ILabels[];
  values: IValues[];
  popoverWidth?: number;
}

const ChartComponent: React.FC<IProps> = (props) => {
  const { chartHeight, labels = LABELS, values = VALUES, popoverWidth = 500 } = props;
  const [popoverContent, setPopoverContent] = useState<ReactNode | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);

  // Calculate the sorted labels and corresponding heights for the chart
  const { sortedLabels, calculatedValues } = calculateHeights(labels, values);

  // Determine if the popover should be displayed on the right side of the target element
  const shouldShowOnRight = (target) => {
    if (target) {
      const { right } = target.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      return right + popoverWidth < windowWidth;
    }
    return null;
  };

  // Get the style for the popover container based on its target element
  const getPopOverContainerStyle: any = (popoverTarget) => {
    const isPanelShowInRight = shouldShowOnRight(popoverTarget);
    const leftOffset = isPanelShowInRight ? popoverTarget.clientWidth : -16;
    return {
      position: 'absolute',
      top: popoverTarget.getBoundingClientRect().top + window.scrollY + popoverTarget.clientHeight / 2,
      left: leftOffset + popoverTarget.getBoundingClientRect().left + window.scrollX
    };
  };

  // Handle the click event on a value to display the popover with additional details
  const handleValueClick = (label: IValues, target: HTMLElement) => {
    const popoverTitle = label.popoverTitle || 'Details';
    setPopoverContent(
      <Popover
        position={shouldShowOnRight(target) ? 'right' : 'left'}
        onClose={() => setIsPopoverOpen(false)}
        title={popoverTitle}
        width={popoverWidth}
      >
        {label.popoverContent}
      </Popover>
    );
    setPopoverTarget(target);
    setIsPopoverOpen(true);
  };

  // Effect to handle click outside the popover and Escape key press to close the popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverTarget && !popoverTarget.contains(event.target)) {
        setIsPopoverOpen(false);
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsPopoverOpen(false);
      }
    };

    const handleResize = () => {
      if (popoverTarget) {
        setPopoverContent((prevContent: any) => {
          // Re-triggering the content render to adjust position
          return React.cloneElement(prevContent, { position: shouldShowOnRight(popoverTarget) ? 'right' : 'left' });
        });
      }
    };

    let resizeTimeout;
    const debounceResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    if (isPopoverOpen) {
      window.addEventListener('click', handleClickOutside);
      window.addEventListener('keydown', handleKeydown);
      window.addEventListener('resize', debounceResize);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('resize', debounceResize);
      clearTimeout(resizeTimeout);
    };
  }, [isPopoverOpen, popoverTarget]);

  return (
    <Container chartHeight={chartHeight} className="chart-container">
      <ChartWrapper>
        {sortedLabels.map((label, i) => (
          <Label key={i} height={label.height}>
            <div>
              <p>{label.title}</p>
              <b>{label.currency || 'USD'} {label.value}</b>
            </div>
          </Label>
        ))}
        {calculatedValues.map((label, i) => (
          <Values
            id={`value-${i}`}
            key={i}
            height={label.height}
            color={label.color}
          >
            <Tippy
              content="Click to see more details"
              visible={label.popoverContent ? undefined : false}
              interactive={true}
              trigger="mouseenter focus"
              hideOnClick={false}
            >
              <div
                className="values-details"
                style={{ cursor: label.popoverContent ? 'pointer' : 'default' }}
                {...label.popoverContent ? {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleValueClick(label, e.currentTarget);
                  }
                } : {}}
              >
                <p>{label.title}</p>
                <b>{label.currency || 'USD'} {label.value}</b>
              </div>
            </Tippy>
          </Values>
        ))}
      </ChartWrapper>
      {isPopoverOpen && popoverTarget && (
        <div
          style={getPopOverContainerStyle(popoverTarget)}
          onClick={(e) => e.stopPropagation()}
        >
          {popoverContent}
        </div>
      )}
    </Container>
  );
};

export default ChartComponent;
