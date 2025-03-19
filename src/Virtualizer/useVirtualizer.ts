import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string;
}

export interface UseVirtualizerOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  itemSize: number; // default height in pixels
  overscan?: number;
}

/**
 * useVirtualizer
 *
 * Updated virtualizer hook to handle dynamic row heights.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  itemSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  // Track scroll offset and viewport height.
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Keep an array of heights, starting with the default itemSize.
  const [heights, setHeights] = useState<number[]>(() =>
    Array(count).fill(itemSize)
  );

  // If count changes, preserve previous heights when possible.
  useEffect(() => {
    setHeights(prev => {
      const newHeights = Array(count).fill(itemSize);
      for (let i = 0; i < Math.min(prev.length, count); i++) {
        newHeights[i] = prev[i];
      }
      return newHeights;
    });
  }, [count, itemSize]);

  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    // Set initial measurements.
    setViewportHeight(scrollElement.clientHeight);
    setScrollOffset(scrollElement.scrollTop);

    const onScroll = () => {
      setScrollOffset(scrollElement.scrollTop);
    };
    const onResize = () => {
      setViewportHeight(scrollElement.clientHeight);
    };

    scrollElement.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);

    return () => {
      scrollElement.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [getScrollElement]);

  // Compute cumulative offsets based on measured heights.
  const cumulativeOffsets = useMemo(() => {
    const offsets = new Array(count + 1);
    offsets[0] = 0;
    for (let i = 0; i < count; i++) {
      offsets[i + 1] = offsets[i] + heights[i];
    }
    return offsets;
  }, [heights, count]);

  // Total container height.
  const totalSize = cumulativeOffsets[count];

  // Binary search to find the start index based on scrollOffset.
  const findStartIndex = (offset: number) => {
    let low = 0;
    let high = count - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (cumulativeOffsets[mid] <= offset && cumulativeOffsets[mid + 1] > offset) {
        return mid;
      } else if (cumulativeOffsets[mid] > offset) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return 0;
  };

  const startIndex = findStartIndex(scrollOffset);

  // Find the end index by advancing until we exceed the viewport height.
  let endIndex = startIndex;
  while (
    endIndex < count &&
    cumulativeOffsets[endIndex + 1] < scrollOffset + viewportHeight
  ) {
    endIndex++;
  }

  const visibleStartIndex = Math.max(0, startIndex - overscan);
  const visibleEndIndex = Math.min(count - 1, endIndex + overscan);

  // Create the virtual items with dynamic positions and sizes.
  const virtualItems: VirtualItem[] = [];
  for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
    virtualItems.push({
      index: i,
      start: cumulativeOffsets[i],
      size: heights[i],
      key: i.toString(),
    });
  }

  // Callback to update a row's height.
  const registerRowHeight = useCallback((index: number, height: number) => {
    setHeights(prev => {
      if (prev[index] === height) return prev;
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  }, []);

  // Scroll to a specific index using the computed offsets.
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      const scrollElement = getScrollElement();
      if (!scrollElement) return;
      const align = options?.align || 'start';
      const itemStart = cumulativeOffsets[index];
      const itemHeight = heights[index];
      let newScroll: number;
      if (align === 'center') {
        newScroll = itemStart - viewportHeight / 2 + itemHeight / 2;
      } else if (align === 'end') {
        newScroll = itemStart - viewportHeight + itemHeight;
      } else {
        newScroll = itemStart;
      }
      scrollElement.scrollTo({ top: newScroll, behavior: 'smooth' });
    },
    [getScrollElement, cumulativeOffsets, heights, viewportHeight]
  );

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
    registerRowHeight,
  };
}
