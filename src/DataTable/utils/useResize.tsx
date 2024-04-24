import { useCallback, useLayoutEffect, useEffect, useState, useRef } from 'react';

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
    // Ensure the ref is attached and the element is in the DOM
    if (tableRef.current) {
      setWidth(tableRef.current.offsetWidth);
    }
  }, [tableRef]);

  const debouncedWidth = useDebounce(width, delay);

  useLayoutEffect(() => {
    const handleResize = () => {
      updateTableWidth();
    };

    if (tableRef.current) {
      handleResize(); // Set initial width more reliably
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateTableWidth]);

  return debouncedWidth;
};