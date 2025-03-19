import React, { useState, useRef } from 'react';
import { useVirtualizer, VirtualItem } from './useVirtualizer';

interface VirtualListProps {
  items: string[];
}

export function VirtualList({ items }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    itemSize: 35, // default row height in pixels
    overscan: 5,
  });

  // Track which rows are expanded.
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      ref={parentRef}
      style={{
        height: '300px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        position: 'relative',
        padding: 10,
      }}
    >
      <div style={{ width: 1000, border: '1px solid black' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: 50,
            background: 'white',
            zIndex: 1,
            borderBottom: '1px solid #ccc',
          }}
        >
          header
        </div>
        <div
          style={{
            position: 'sticky',
            top: 50,
            height: 50,
            background: 'white',
            zIndex: 1,
            borderBottom: '1px solid #ccc',
          }}
        >
          header 2
        </div>
        <div style={{ height: rowVirtualizer.totalSize, position: 'relative' }}>
          {rowVirtualizer.virtualItems.map((virtualRow: VirtualItem) => (
            <div
              key={virtualRow.key}
              ref={el => {
                if (el) {
                  const measuredHeight = el.getBoundingClientRect().height;
                  rowVirtualizer.registerRowHeight(virtualRow.index, measuredHeight);
                }
              }}
              onClick={() => toggleRow(virtualRow.index)}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                left: 0,
                width: '100%',
                borderBottom: '1px solid #ccc',
                padding: '8px',
                boxSizing: 'border-box',
                background: expandedRows[virtualRow.index] ? '#f0f8ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              <div>Item {virtualRow.index}</div>
              {expandedRows[virtualRow.index] && (
                <div style={{ marginTop: '8px' }}>
                  Additional content for row {virtualRow.index}. This extra content increases the height.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
