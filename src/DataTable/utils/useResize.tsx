import { useCallback, useLayoutEffect, useState, useRef } from 'react';

export const useResize = (tableRef, delay = 100) => {
  const [width, setWidth] = useState(0);
  const handler = useRef();

  const updateTableWidth = useCallback(() => {
    if (tableRef.current && tableRef.current.offsetWidth !== 0) {
      setWidth(tableRef.current.offsetWidth);
    }
  }, [tableRef]);

  useLayoutEffect(() => {
    updateTableWidth(); // Initial measure

    const handleResize = () => {
      // Debouncing resize updates
      clearTimeout(handler.current);
      handler.current = setTimeout(() => {
        updateTableWidth();
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(handler.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateTableWidth, delay]);

  return width;
};
