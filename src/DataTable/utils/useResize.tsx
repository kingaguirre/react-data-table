import { useCallback, useEffect, useState, useRef } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handler: any = useRef();

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    handler.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      // Clear the timeout if value or delay changes
      clearTimeout(handler.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useResize = (tableRef, delay = 100) => {
  const [width, setWidth] = useState(0);
  const updateTableWidth = useCallback(() => {
    if (tableRef.current) {
      setWidth(tableRef.current.offsetWidth);
    }
  }, [tableRef]);

  const debouncedWidth = useDebounce(width, delay);

  useEffect(() => {
    const handleResize = () => {
      updateTableWidth();
    };

    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize); // Add resize event listener

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up
    };
  }, [updateTableWidth]);

  return debouncedWidth;
};