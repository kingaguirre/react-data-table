import React, { useRef, useEffect } from 'react';
import { VirtualItem } from '../../hooks/useVirtualizer';

interface VirtualRowItemProps {
  virtualRow: VirtualItem;
  registerRowHeight: (index: number, height: number) => void;
  children: React.ReactNode;
  disabled: boolean;
}

export const VirtualRowItem: React.FC<VirtualRowItemProps> = ({
  virtualRow,
  registerRowHeight,
  children,
  disabled,
}) => {
  if (disabled) {
    return <>{children}</>;
  }

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const newHeight = entry.contentRect.height;
          registerRowHeight(virtualRow.index, newHeight);
        }, 10); // Delay to let the DOM settle
      }
    });
    observer.observe(rowRef.current);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [virtualRow.index, registerRowHeight]);

  return (
    <div
      ref={rowRef}
      style={{
        position: 'absolute',
        top: !isNaN(virtualRow.start) ? virtualRow.start : 'initial',
        left: 0,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};