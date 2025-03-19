import React, { useState, useRef, useEffect } from 'react';
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

  // Track which rows are in "edit" mode for the dynamic cell.
  const [editingRows, setEditingRows] = useState<Record<number, boolean>>({});

  const toggleEditing = (index: number) => {
    setEditingRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // VirtualRow component uses ResizeObserver to monitor height changes.
  const VirtualRow = ({
    virtualRow,
  }: {
    virtualRow: VirtualItem;
  }) => {
    const rowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!rowRef.current) return;
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const newHeight = entry.contentRect.height;
          rowVirtualizer.registerRowHeight(virtualRow.index, newHeight);
        }
      });
      observer.observe(rowRef.current);
      return () => {
        observer.disconnect();
      };
    }, [virtualRow.index, rowVirtualizer]);

    return (
      <div
        ref={rowRef}
        style={{
          position: 'absolute',
          top: virtualRow.start,
          left: 0,
          width: '100%',
          borderBottom: '1px solid #ccc',
          boxSizing: 'border-box',
          padding: '8px',
          background: editingRows[virtualRow.index] ? '#f0f8ff' : '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* First cell: fixed width label */}
          <div style={{ flex: '0 0 80px', fontWeight: 'bold' }}>
            Row {virtualRow.index}
          </div>
          {/* Second cell: dynamic content */}
          <div style={{ flex: 1, padding: '0 8px' }}>
            {editingRows[virtualRow.index] ? (
              // When in edit mode, show a textarea (larger height)
              <textarea
                defaultValue={items[virtualRow.index]}
                style={{ width: '100%', minHeight: '60px' }}
              />
            ) : (
              // Otherwise, show text content.
              <span>{items[virtualRow.index]}</span>
            )}
          </div>
          {/* Toggle button for switching between text and textbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleEditing(virtualRow.index);
            }}
          >
            {editingRows[virtualRow.index] ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    );
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
      <div style={{ width: 1000, border: '1px solid black', position: 'relative' }}>
        {/* Sticky headers */}
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
          Header
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
          Header 2
        </div>
        {/* Virtualized rows container */}
        <div style={{ height: rowVirtualizer.totalSize, position: 'relative' }}>
          {rowVirtualizer.virtualItems.map(virtualRow => (
            <VirtualRow key={virtualRow.key} virtualRow={virtualRow} />
          ))}
        </div>
      </div>
    </div>
  );
}
