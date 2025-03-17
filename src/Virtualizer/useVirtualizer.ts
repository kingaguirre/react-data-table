import { useState, useRef, useEffect, useCallback } from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string;
}

export interface UseVirtualizerOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  itemSize: number; // fixed height for each item in pixels
  overscan?: number;
}

/**
 * useVirtualizer
 *
 * A simple virtualizer hook that computes visible items using a fixed item height.
 * This removes the need for ref-based measurement.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  itemSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  // State to track the current scroll offset and the viewport's height
  const [scrollOffset, setScrollOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    // Set initial measurements
    setViewportHeight(scrollElement.clientHeight);
    setScrollOffset(scrollElement.scrollTop);

    // Update on scroll
    const onScroll = () => {
      setScrollOffset(scrollElement.scrollTop);
    };

    // Update on window resize
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

  // Calculate total container height
  const totalSize = count * itemSize;

  // Determine the visible range based on scroll position and viewport height
  const startIndex = Math.floor(scrollOffset / itemSize);
  const endIndex = Math.min(count - 1, Math.floor((scrollOffset + viewportHeight) / itemSize));
  const visibleStartIndex = Math.max(0, startIndex - overscan);
  const visibleEndIndex = Math.min(count - 1, endIndex + overscan);

  // Generate the list of virtual items to render
  const virtualItems: VirtualItem[] = [];
  for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemSize,
      size: itemSize,
      key: i.toString(),
    });
  }

  // Helper to scroll to a specific item
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      const scrollElement = getScrollElement();
      if (!scrollElement) return;
      const align = options?.align || 'start';
      const itemStart = index * itemSize;
      let newScroll: number;
      if (align === 'center') {
        newScroll = itemStart - viewportHeight / 2 + itemSize / 2;
      } else if (align === 'end') {
        newScroll = itemStart - viewportHeight + itemSize;
      } else {
        newScroll = itemStart;
      }
      scrollElement.scrollTo({ top: newScroll, behavior: 'smooth' });
    },
    [getScrollElement, itemSize, viewportHeight]
  );

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
  };
}
