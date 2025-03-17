import React, { useRef } from 'react';
import { useVirtualizer, VirtualItem } from './useVirtualizer'; // adjust the path accordingly

interface VirtualListProps {
  items: string[];
}

export function VirtualList({ items }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // estimated row height in pixels
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: '300px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        position: 'relative',
        padding: 10
      }}
    >
      <div style={{width: 1000, border: '1px solid black'}}>
        <div style={{position: 'sticky', top: 0, height: 50, background: 'white', zIndex: 1}}>header</div>
        <div style={{position: 'sticky', top: 50, height: 50, background: 'white', zIndex: 1}}>header 2</div>
        <div style={{ height: rowVirtualizer.totalSize, position: 'relative' }}>
          {rowVirtualizer.virtualItems.map((virtualRow: VirtualItem) => (
            <div
              key={virtualRow.key}
              ref={virtualRow.measureRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {items[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
