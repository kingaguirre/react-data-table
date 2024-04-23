import { useCallback, useState, useEffect, useRef } from 'react';

export const useCheckOverflow = () => {
  const [ellipsisMap, setEllipsisMap] = useState(new Map());
  const ellipsisStatesRef = useRef(new Map());

  const updateEllipsisState = useCallback((element, key) => {
    if (element) {
      const hasEllipsis = element.scrollWidth > element.clientWidth;
      ellipsisStatesRef.current.set(key, hasEllipsis);
    }
  }, []);

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  };

  useEffect(() => {
    const updateStates = () => {
      ellipsisStatesRef.current.forEach((_, key) => {
        const element = document.querySelector(`[data-ellipsis-key='${key}']`);
        if (element) {
          updateEllipsisState(element, key);
        }
      });
      setEllipsisMap(new Map(ellipsisStatesRef.current));
    };

    const debouncedUpdateStates = debounce(updateStates, 100); // 100 ms debounce period

    // Attach handlers for window resize and DOM content loaded
    window.addEventListener('resize', debouncedUpdateStates);
    document.addEventListener('DOMContentLoaded', updateStates);

    // Initial check in case elements are already in the DOM
    updateStates();

    return () => {
      window.removeEventListener('resize', debouncedUpdateStates);
      document.removeEventListener('DOMContentLoaded', updateStates);
    };
  }, [updateEllipsisState]);

  const refsMap = useRef(new Map());

  const addElement = useCallback((element, key) => {
    if (element) {
      element.setAttribute('data-ellipsis-key', key);
      updateEllipsisState(element, key);
      refsMap.current.set(key, element);
    }
  }, [updateEllipsisState]);

  return { addElement, ellipsisMap, refsMap };
};
