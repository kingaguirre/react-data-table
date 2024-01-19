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

  useEffect(() => {
    const updateStates = () => {
      setEllipsisMap(new Map(ellipsisStatesRef.current));
    };

    const resizeObserver = new ResizeObserver(updateStates);
    ellipsisStatesRef.current.forEach((_, key) => {
      const element = document.querySelector(`[data-ellipsis-key='${key}']`);
      if (element) {
        resizeObserver.observe(element);
      }
    });

    return () => {
      ellipsisStatesRef.current.forEach((_, key) => {
        const element = document.querySelector(`[data-ellipsis-key='${key}']`);
        if (element) {
          resizeObserver.unobserve(element);
        }
      });
    };
  }, []);

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
