import React, { useState, useRef } from 'react';
import { useVirtualizer } from './useVirtualizer';
import { VirtualRowItem } from './VirtualRowItem';

interface VirtualListProps {
  items: string[];
}

// A simple row component that toggles edit mode.
const MyActualRow: React.FC<{
  index: number;
  isEditing: boolean;
  toggleEditing: (index: number) => void;
  content: string;
}> = ({ index, isEditing, toggleEditing, content }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: isEditing ? '#f0f8ff' : '#fff',
      }}
    >
      <div style={{ flex: '0 0 80px', fontWeight: 'bold' }}>
        Row {index}
      </div>
      <div style={{ flex: 1, padding: '0 8px' }}>
        {isEditing ? (
          <textarea
            defaultValue={content}
            style={{ width: '100%', minHeight: '60px' }}
          />
        ) : (
          <span>{content}</span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleEditing(index);
        }}
      >
        {isEditing ? 'Save' : 'Edit'}
      </button>
    </div>
  );
};

export function VirtualList({ items }: VirtualListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    itemSize: 35, // default row height in pixels
    overscan: 5,
    // disabled: true
  });

  // Track which rows are in edit mode.
  const [editingRows, setEditingRows] = useState<Record<number, boolean>>({});

  const toggleEditing = (index: number) => {
    setEditingRows(prev => ({ ...prev, [index]: !prev[index] }));
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
        {/* Sticky Headers */}
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
        {/* Virtualized Rows */}
        <div style={{ height: rowVirtualizer.totalSize, position: 'relative' }}>
          {rowVirtualizer.virtualItems.map(virtualRow => (
            <VirtualRowItem
              key={virtualRow.key}
              virtualRow={virtualRow}
              registerRowHeight={rowVirtualizer.registerRowHeight}
              // disabled
            >
              <MyActualRow
                index={virtualRow.index}
                isEditing={!!editingRows[virtualRow.index]}
                toggleEditing={toggleEditing}
                content={items[virtualRow.index]}
              />
            </VirtualRowItem>
          ))}
        </div>
      </div>
    </div>
  );
}
