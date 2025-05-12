// src/ReactDataTable/Cell.tsx
import React from 'react';

interface CellProps {
  value: any;
}

const Cell: React.FC<CellProps> = ({ value }) => {
  const renderCount = React.useRef(0);
  renderCount.current++;
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      {value} (renders: {renderCount.current})
    </div>
  );
};

export default React.memo(Cell);
