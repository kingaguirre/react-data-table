import { useState, useRef, useEffect, useCallback } from 'react'

export interface VirtualItem {
  index: number
  start: number
  size: number
  key: string
  // A callback ref to measure the DOM element when mounted
  measureRef: (el: HTMLElement | null) => void
}

export interface UseVirtualizerOptions {
  count: number
  getScrollElement: () => HTMLElement | null
  // A function to return the estimated size (height) of an item
  estimateSize: () => number
  overscan?: number
}

/**
 * useVirtualizer
 *
 * A minimal hook that provides virtual items (with calculated positions)
 * and a total container size. It listens to scroll/resize events from the
 * given scroll element and recalculates the visible range.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  // Using a state update to force re-render when sizes change.
  const [, forceUpdate] = useState(0)
  // Store measured sizes initialize with estimated sizes.
  const sizesRef = useRef<number[]>(new Array(count).fill(estimateSize()))

  // Store scroll offset and container (viewport) height.
  const [scrollOffset, setScrollOffset] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Set up scroll and resize listeners.
  useEffect(() => {
    const scrollElement = getScrollElement()
    if (!scrollElement) return

    const onScroll = () => {
      setScrollOffset(scrollElement.scrollTop)
    }

    const onResize = () => {
      setViewportHeight(scrollElement.clientHeight)
    }

    // Initial measurements.
    setViewportHeight(scrollElement.clientHeight)
    setScrollOffset(scrollElement.scrollTop)

    scrollElement.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)

    return () => {
      scrollElement.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [getScrollElement])

  // When an item’s size is measured and is different, update it and force a re-render.
  const updateSize = useCallback(() => {
    forceUpdate(n => n + 1)
  }, [])

  // Return a ref callback for a given index to measure the element.
  const getMeasureRef = useCallback(
    (index: number) => {
      return (el: HTMLElement | null) => {
        if (el) {
          const newSize = el.getBoundingClientRect().height
          if (sizesRef.current[index] !== newSize) {
            sizesRef.current[index] = newSize
            updateSize()
          }
        }
      }
    },
    [updateSize]
  )

  // Compute cumulative offsets and total height.
  const cumSizes = new Array(count)
  let totalSize = 0
  for (let i = 0; i < count; i++) {
    cumSizes[i] = totalSize
    totalSize += sizesRef.current[i]
  }

  // Use binary search to find the start index from the current scroll offset.
  const findStartIndex = (offset: number) => {
    let low = 0
    let high = count - 1
    let mid: number
    while (low <= high) {
      mid = Math.floor((low + high) / 2)
      // If the bottom of the item is before the offset, move right.
      if (cumSizes[mid] + sizesRef.current[mid] < offset) {
        low = mid + 1
      } else if (cumSizes[mid] > offset) {
        high = mid - 1
      } else {
        return mid
      }
    }
    return low
  }

  // Determine the visible range of items.
  const startIndex = findStartIndex(scrollOffset)
  let endIndex = startIndex
  while (endIndex < count && cumSizes[endIndex] < scrollOffset + viewportHeight) {
    endIndex++
  }
  // Apply overscan.
  const visibleStartIndex = Math.max(0, startIndex - overscan)
  const visibleEndIndex = Math.min(count - 1, endIndex + overscan)

  // Build virtual items for rendering.
  const virtualItems: VirtualItem[] = []
  for (let i = visibleStartIndex; i <= visibleEndIndex; i++) {
    virtualItems.push({
      index: i,
      start: cumSizes[i],
      size: sizesRef.current[i],
      key: i.toString(),
      measureRef: getMeasureRef(i),
    })
  }

  // scrollToIndex: scroll the container to make a particular item visible.
  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
      const scrollElement = getScrollElement()
      if (!scrollElement) return
      const align = options?.align || 'start'
      const itemStart = cumSizes[index]
      const itemSize = sizesRef.current[index]
      let newScroll: number
      if (align === 'center') {
        newScroll = itemStart - viewportHeight / 2 + itemSize / 2
      } else if (align === 'end') {
        newScroll = itemStart - viewportHeight + itemSize
      } else {
        newScroll = itemStart
      }
      scrollElement.scrollTo({ top: newScroll, behavior: 'smooth' })
    },
    [getScrollElement, cumSizes, viewportHeight]
  )

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
  }
}
