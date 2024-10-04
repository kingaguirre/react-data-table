import React, { useState, useEffect, ReactNode, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Container, ChartWrapper, Label, Values } from './styled';
import { LABELS, VALUES, calculateHeights } from './utils';
import Popover from './Popover';

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
  labels?: ILabels[];
  values?: IValues[];
  popoverWidth?: number;
}

const ChartComponent: React.FC<IProps> = (props) => {
  const { chartHeight = '400px', labels = LABELS, values = VALUES, popoverWidth = 500 } = props;
  const [popoverContent, setPopoverContent] = useState<ReactNode | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);

  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const valueRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [labelBottomValues, setLabelBottomValues] = useState<number[]>([]);
  const [valueBottomValues, setValueBottomValues] = useState<number[]>([]);

  // Memoize calculated labels and values to prevent recalculating on each render
  const { sortedLabels, calculatedValues } = useMemo(() => calculateHeights(labels, values), [labels, values]);

  const shouldShowOnRight = useCallback((target: HTMLElement) => {
    const { right } = target.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    return right + popoverWidth < windowWidth;
  }, [popoverWidth]);

  const getPopOverContainerStyle = useCallback((popoverTarget: HTMLElement) => {
    const isPanelShowInRight = shouldShowOnRight(popoverTarget);
    const leftOffset = isPanelShowInRight ? popoverTarget.clientWidth : -16;
    return {
      position: 'absolute',
      top: popoverTarget.getBoundingClientRect().top + window.scrollY + popoverTarget.clientHeight / 2,
      left: leftOffset + popoverTarget.getBoundingClientRect().left + window.scrollX
    };
  }, [shouldShowOnRight]);

  const handleValueClick = useCallback((label: IValues, target: HTMLElement) => {
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
  }, [popoverWidth, shouldShowOnRight]);

  const handleKeyDown = useCallback((event, label, target) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleValueClick(label, target);
    }
  }, [handleValueClick]);

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
  }, [isPopoverOpen, popoverTarget, shouldShowOnRight]);

  useEffect(() => {
    // Calculate bottom values after 0.6s
    const calculateLabelBottomValues = () => {
      const newBottomValues = sortedLabels.map((_, i) => {
        const dataCurrentLabelHeight = labelRefs.current[i]?.clientHeight || 0;
        const dataCurrentLabelContainerHeight = labelRefs.current[i]?.querySelector('.label-container')?.clientHeight || 0;
        const dataBelowLabelHeight = labelRefs.current[i + 1]?.clientHeight || 0;
        const dataBelowLabelContainerHeight = labelRefs.current[i + 1]?.querySelector('.label-container')?.clientHeight || 0;
        const dataHeightDifferenceFromBelowLabel = dataCurrentLabelHeight - dataBelowLabelHeight;
        return dataHeightDifferenceFromBelowLabel < dataBelowLabelContainerHeight
          ? (dataBelowLabelContainerHeight / 2) + (dataCurrentLabelContainerHeight / 2)
          : 0;
      });
      setLabelBottomValues(newBottomValues);
    };

    const timeout = setTimeout(() => {
      calculateLabelBottomValues();
    }, 600);

    return () => clearTimeout(timeout);
  }, [sortedLabels]);

  useEffect(() => {
    const calculateValueBottomValues = () => {
      const newBottomValues = calculatedValues.map((_, i) => {
        const dataCurrentLabelHeight = valueRefs.current[i]?.clientHeight || 0;
        const dataCurrentLabelContainerHeight = valueRefs.current[i]?.querySelector('.values-details')?.clientHeight || 0;
        const dataBelowLabelHeight = valueRefs.current[i + 1]?.clientHeight || 0;
        const dataBelowLabelContainerHeight = valueRefs.current[i + 1]?.querySelector('.values-details')?.clientHeight || 0;
        const dataHeightDifferenceFromBelowLabel = dataCurrentLabelHeight - dataBelowLabelHeight;
        return dataHeightDifferenceFromBelowLabel < dataBelowLabelContainerHeight
          ? (dataBelowLabelContainerHeight / 2) + (dataCurrentLabelContainerHeight / 2)
          : 0;
      });
      setValueBottomValues(newBottomValues);
    };

    const timeout = setTimeout(() => {
      calculateValueBottomValues();
    }, 600);

    return () => clearTimeout(timeout);
  }, [calculatedValues]);

  const valueContainerTopValue = (label, index) => {
    const heightInPX = parseFloat(chartHeight) * (parseFloat(label.height) / 100);
    const textContainerHeight = valueBottomValues[index] ?? 0;

    if (heightInPX > textContainerHeight) {
      return '50%';
    } else {
      /** calculate if we will make the top position at middle of the bar or at top most of bar */
      const getMaxPercentage = 100 - (textContainerHeight / parseFloat(chartHeight)) * 100;
      const isMiddlePosition = label.accumulatedHeight < getMaxPercentage;

      if (isMiddlePosition) {
        const previousTetContainerHeight = valueBottomValues[index + 1]
        return `calc(50% - ${textContainerHeight + (textContainerHeight > 0 ? previousTetContainerHeight : 0)}px)`
      }

      return 0;
    }
  }

  return (
    <Container chartHeight={chartHeight} className="chart-container">
      <ChartWrapper>
        {sortedLabels.map((label, i) => (
          <Label
            key={i}
            ref={(el) => labelRefs.current[i] = el}
            height={label.height}
          >
            <div
              className="label-container"
              style={{ 
                bottom: labelBottomValues[i] + (labelBottomValues[i] > 0 ? labelBottomValues[i + 1] : 0),
                opacity: labelBottomValues[i] !== undefined ? 1 : 0
              }}
            >
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
            ref={(el) => valueRefs.current[i] = el}
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
                style={{
                  cursor: label.popoverContent ? 'pointer' : 'default',
                  top: valueContainerTopValue(label, i),
                  opacity: valueBottomValues[i] !== undefined ? 1 : 0
                }}
                tabIndex={label.popoverContent ? 0 : undefined}
                onKeyDown={(e) => handleKeyDown(e, label, e.currentTarget)}
                {...label.popoverContent ? {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleValueClick(label, e.currentTarget);
                  }
                } : {}}
              >
                <p>{label.title}{label.currentHeight}</p>
                <b>{label.currency || 'USD'} {label.value}</b>
              </div>
            </Tippy>
          </Values>
        ))}
      </ChartWrapper>
      {isPopoverOpen && popoverTarget && ReactDOM.createPortal(
        <div
          style={getPopOverContainerStyle(popoverTarget)}
          onClick={(e) => e.stopPropagation()}
        >
          {popoverContent}
        </div>,
        document.body // Render the popover in the body element
      )}
    </Container>
  );
};

export default ChartComponent;
