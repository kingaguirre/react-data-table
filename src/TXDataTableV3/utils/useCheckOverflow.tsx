import { useCallback, useState, useEffect, useRef } from 'react';

export const useCheckOverflow = () => {
  const [ellipsisMap, setEllipsisMap] = useState(new Map());
  const ellipsisStatesRef = useRef(new Map());
  const refsMap = useRef(new Map());
  
  // Correctly initialize the ResizeObserver using useRef
  const resizeObserver = useRef(new ResizeObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target;
      const key = element.getAttribute('data-ellipsis-key');
      if (key) {
        updateEllipsisState(element, key);
      }
    }
  })).current;

  const updateEllipsisState = useCallback((element, key) => {
    if (element) {
      const hasEllipsis = element.scrollWidth > element.clientWidth;
      const currentHasEllipsis = ellipsisStatesRef.current.get(key);
      if (currentHasEllipsis !== hasEllipsis) {
        ellipsisStatesRef.current.set(key, hasEllipsis);
        setEllipsisMap(new Map(ellipsisStatesRef.current));
      }
    }
  }, []);

  const addElement = useCallback((element, key) => {
    if (element) {
      element.setAttribute('data-ellipsis-key', key);
      refsMap.current.set(key, element);
      resizeObserver.observe(element);  // Now correctly referencing resizeObserver
      updateEllipsisState(element, key);
    }
  }, [updateEllipsisState]);

  useEffect(() => {
    return () => {
      refsMap.current.forEach((element) => {
        if (element) {
          resizeObserver.unobserve(element);
        }
      });
      resizeObserver.disconnect();
    };
  }, [resizeObserver]);  // Added resizeObserver to dependencies for clarity

  return { addElement, ellipsisMap, refsMap };
};