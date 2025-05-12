import React from 'react';
import { ComputedColumnSetting } from './useReactTable';
import MyCell from './Cell';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TableRowProps {
  row: any;
  rowIndex: number;
  headers: ComputedColumnSetting[];
  selectedRowIds: Record<string, boolean>;
  toggleRowSelection: (id: string) => void;
  enableMultiRowSelection?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ 
  row, 
  rowIndex, 
  headers, 
  selectedRowIds, 
  toggleRowSelection, 
  enableMultiRowSelection = false,
}) => {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #ccc', position: 'relative' }}>
      {enableMultiRowSelection && (
        <div
          style={{
            width: 50,
            flexShrink: 0,
            padding: '0.5rem',
            borderRight: '1px solid #ccc',
            position: 'sticky',
            left: 0,
            zIndex: 2,
            background: '#eee'
          }}
        >
          <input
            type="checkbox"
            checked={row.id && selectedRowIds[row.id.toString()] ? true : false}
            onChange={() => {
              if (row.id) toggleRowSelection(row.id.toString());
            }}
          />
        </div>
      )}
      {headers.map((header) => {
        const { setNodeRef, transform, transition } = useSortable({ id: header.column });

        // Get base style (including width) from the header computed style.
        const baseStyle = header.getColumnStyle();
        // Ensure width is a pixel string so that it doesn't stretch during drag.
        const width = typeof baseStyle.width === 'number' ? `${baseStyle.width}px` : baseStyle.width;
        const combinedStyle: React.CSSProperties = {
          ...baseStyle,
          width,
          transform: CSS.Translate.toString(transform),
          transition,
        };

        return (
          <div
            ref={setNodeRef}
            key={header.column}
            style={{ position: 'relative', padding: '0.5rem', borderRight: '1px solid #ccc', ...combinedStyle }}
          >
            <MyCell value={row[header.column]} />
          </div>
        );
      })}
    </div>
  );
};

// Helper function to compare two style objects shallowly.
function areStylesEqual(styleA: React.CSSProperties, styleB: React.CSSProperties): boolean {
  const keysA = Object.keys(styleA);
  const keysB = Object.keys(styleB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (styleA[key] !== styleB[key]) return false;
  }
  return true;
}

export default React.memo(TableRow, (prevProps, nextProps) => {
  // If the row id changes, force re-render.
  if (prevProps.row.id !== nextProps.row.id) return false;
  
  // Check if the number of visible headers has changed.
  if (prevProps.headers.length !== nextProps.headers.length) return false;
  
  // Compare each header value and its computed style.
  for (let i = 0; i < prevProps.headers.length; i++) {
    const prevHeader = prevProps.headers[i];
    const nextHeader = nextProps.headers[i];
    
    // Compare the cell value for the column.
    if (prevProps.row[prevHeader.column] !== nextProps.row[prevHeader.column]) {
      return false;
    }
    
    // Compare computed styles.
    const prevStyle = prevHeader.getColumnStyle();
    const nextStyle = nextHeader.getColumnStyle();
    if (!areStylesEqual(prevStyle, nextStyle)) return false;
  }
  
  // Check if the selection state for this row has changed.
  const id = prevProps.row.id?.toString();
  if (id && prevProps.selectedRowIds[id] !== nextProps.selectedRowIds[id]) return false;
  
  return true;
});
