import { useState, useEffect, useCallback, useMemo } from 'react';

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
  disabled?: boolean;
}

/**
 * useVirtualizer
 *
 * Virtualizer hook that supports dynamic row heights. When "disabled" is true,
 * it returns a basic result (with no extra event listeners or calculations)
 * while still calling all hooks in the same order.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  itemSize,
  overscan = 5,
  disabled = false,
}: UseVirtualizerOptions) {
  // Always call these hooks.
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [heights, setHeights] = useState<number[]>(() =>
    Array(count).fill(itemSize)
  );

  // When count or default itemSize change, update the heights array.
  useEffect(() => {
    setHeights((prev) => {
      const newHeights = Array(count).fill(itemSize);
      for (let i = 0; i < Math.min(prev.length, count); i++) {
        newHeights[i] = prev[i];
      }
      return newHeights;
    });
  }, [count, itemSize]);

  // Attach event listeners only if not disabled.
  useEffect(() => {
    if (disabled) return;
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
  }, [getScrollElement, disabled]);

  // Compute cumulative offsets based on measured heights (or fallback if disabled).
  const cumulativeOffsets = useMemo(() => {
    if (disabled) {
      // Use fixed sizes when disabled.
      return Array.from({ length: count + 1 }, (_, i) => i * itemSize);
    }
    const offsets = new Array(count + 1);
    offsets[0] = 0;
    for (let i = 0; i < count; i++) {
      offsets[i + 1] = offsets[i] + heights[i];
    }
    return offsets;
  }, [heights, count, disabled, itemSize]);

  // Total container height.
  const totalSize = disabled ? count * itemSize : cumulativeOffsets[count];

  // A helper to compute the starting index based on scroll offset.
  const findStartIndex = (offset: number) => {
    if (disabled) {
      // With disabled virtualization, simply compute a basic index.
      return Math.floor(offset / itemSize);
    }
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

  // Compute end index based on viewport height.
  let endIndex = startIndex;
  if (!disabled) {
    while (
      endIndex < count &&
      cumulativeOffsets[endIndex + 1] < scrollOffset + viewportHeight
    ) {
      endIndex++;
    }
  } else {
    endIndex = Math.min(count - 1, Math.floor((scrollOffset + viewportHeight) / itemSize));
  }

  const visibleStartIndex = Math.max(0, startIndex - overscan);
  const visibleEndIndex = Math.min(count - 1, endIndex + overscan);

  // Compute virtual items.
  const virtualItems = useMemo(() => {
    if (disabled) {
      return Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * itemSize,
        size: itemSize,
        key: i.toString(),
      }));
    }
    const items: VirtualItem[] = [];
    for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
      items.push({
        index: i,
        start: cumulativeOffsets[i],
        size: heights[i],
        key: i.toString(),
      });
    }
    return items;
  }, [disabled, count, itemSize, cumulativeOffsets, heights, visibleStartIndex, visibleEndIndex]);

  // Callback to update a row's height.
  const registerRowHeight = useCallback(
    (index: number, height: number) => {
      if (disabled) return;
      setHeights((prev) => {
        if (prev[index] === height) return prev;
        const newHeights = [...prev];
        newHeights[index] = height;
        return newHeights;
      });
    },
    [disabled]
  );

  // Scroll to a specific index using the computed offsets.
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      if (disabled) return;
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
    [disabled, getScrollElement, cumulativeOffsets, heights, viewportHeight]
  );

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
    registerRowHeight,
  };
}