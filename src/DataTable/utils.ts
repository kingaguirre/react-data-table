import { useState, useEffect } from 'react';

export const useDoubleClick = (singleClickCallback: any, doubleClickCallback: any, delay = 300) => {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount === 1) {
      const singleClickTimer = setTimeout(() => {
        singleClickCallback();
        setClickCount(0);
      }, delay);
      return () => clearTimeout(singleClickTimer);
    } else if (clickCount === 2) {
      doubleClickCallback();
      setClickCount(0);
    }
  }, [clickCount]);

  return () => setClickCount((prev) => prev + 1);
};
