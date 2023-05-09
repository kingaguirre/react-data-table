import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  VerticalLine,
  DragHandle,
  ResizeHandle,
  GroupHeader,
  TableFooter,
  TableInnerWrapper,
  TableBodyWrapper,
  CellContent
} from './styled';
import { useDragDropManager } from './useDragDropManager';
import { useResizeManager } from './useResizeManager';
import { ColumnSettings } from './interface';

interface DataTableProps {
  dataSource: any[];
  columnSettings: ColumnSettings[];
  pageSize?: number;
  pageIndex?: number;
  onPageSizeChange?: (newPageSize: number) => void;
  onPageIndexChange?: (newPageIndex: number) => void;
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataSource,
  columnSettings,
  pageSize = 5,
  pageIndex = 0,
  onPageIndexChange,
  onPageSizeChange,
  onRowClick,
  onRowDoubleClick,
  onColumnSettingsChange
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number | null>(null);
  const [localPageIndex, setLocalPageIndex] = useState(pageIndex);
  const [localPageSize, setLocalPageSize] = useState(pageSize || 10);

  useEffect(() => {
    if (onPageIndexChange) {
      onPageIndexChange(localPageIndex);
    }
  }, [onPageIndexChange, localPageIndex]);

  useEffect(() => {
    if (onPageSizeChange) {
      onPageSizeChange(localPageSize);
    }
  }, [onPageSizeChange, localPageSize]);

  useEffect(() => {
    if (tableRef.current) {
      const tableWidth = tableRef.current.offsetWidth;
      setParentWidth(tableWidth);
    }
  }, [tableRef]);

  const updatedColumnSettings = useMemo(() => {
    if (parentWidth === null) return columnSettings;

    const columnsWithWidth = columnSettings.filter((col) => col.width);
    const totalWidthWithWidth = columnsWithWidth.reduce(
      (acc, col) => acc + parseInt(col.width!, 10), 0
    );
    const remainingWidth = parentWidth - totalWidthWithWidth;
    const columnsWithoutWidth = columnSettings.filter((col) => !col.width);
    const columnWidth = Math.max(remainingWidth / columnsWithoutWidth.length, 100);

    return columnSettings
      .sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) {
          return -1;
        }
        if (b.order !== undefined) {
          return 1;
        }
        return 0;
      })
      .map((col, index) => ({
        ...col,
        width: col.width || `${columnWidth}px`,
        order: index,
      }));
  }, [columnSettings, parentWidth]);

  const [columns, setColumns] = useState<any>(updatedColumnSettings);
  const dragImageRef = React.useRef<HTMLDivElement>(null);
  const {
    onDragStart,
    onDragOver,
    onDrop,
    showLineAtIndex,
  } = useDragDropManager(columns, setColumns, dataSource, dragImageRef, onColumnSettingsChange);
  const { onMouseDown } = useResizeManager(columns, setColumns, onColumnSettingsChange);

  useEffect(() => {
    setColumns(updatedColumnSettings);
  }, [updatedColumnSettings]);

  const renderGroupHeader = () => {
    const groupHeaders = columns.reduce(
      (acc: { title: string | null; colSpan: number; width: number }[], col) => {
        const lastHeader = acc[acc.length - 1];
        const colWidth = parseInt(col.width);

        if (col.groupTitle) {
          if (lastHeader && lastHeader.title === col.groupTitle) {
            lastHeader.colSpan++;
            lastHeader.width += colWidth;
          } else {
            acc.push({ title: col.groupTitle, colSpan: 1, width: colWidth });
          }
        } else {
          if (lastHeader && lastHeader.title === null) {
            lastHeader.colSpan++;
            lastHeader.width += colWidth;
          } else {
            acc.push({ title: null, colSpan: 1, width: colWidth });
          }
        }
        return acc;
      },
      []
    );

    return (
      <TableRow>
        {groupHeaders.map((groupHeader, index) => (
          <GroupHeader
            key={index}
            colSpan={groupHeader.colSpan}
            style={{ width: `${groupHeader.width}px` }}
          >
            <CellContent>{groupHeader.title}</CellContent>
          </GroupHeader>
        ))}
      </TableRow>
    );
  };

  const renderTableHeader = () => {
    return (
      <TableRow>
        {columns.map((col, index) => (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            align={col.align}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={(e) => onDrop(e, index)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <DragHandle
                draggable={true}
                onDragStart={(e: any) => onDragStart(e, index)}
              >
                ☰
              </DragHandle>
              <CellContent>{col.title}</CellContent>
              {showLineAtIndex === index && <VerticalLine />}
            </div>
            <ResizeHandle onMouseDown={onMouseDown(index)} />
          </TableCell>
        ))}
      </TableRow>
    );
  };

  const renderTableBody = () => {
    const start = localPageIndex * localPageSize;
    const end = start + localPageSize;
    const visibleRows = dataSource.slice(start, end);
  
    return visibleRows.map((row, rowIndex) => (
      <TableRow key={rowIndex} onClick={() => onRowClick?.(row)} onDoubleClick={() => onRowDoubleClick?.(row)}>
        {columns.map((col, index) => {
          const cellContent = col.customColumnRenderer
            ? col.customColumnRenderer(row[col.column], row)
            : getDeepValue(row, col.column);
          return (
            <TableCell
              key={index}
              width={col.width}
              minWidth={col.minWidth}
              align={col.align}
            >
              <CellContent className="cell-content" style={{ maxWidth: col.width }}>{cellContent}</CellContent>
              {showLineAtIndex === index && <VerticalLine />}
              <ResizeHandle onMouseDown={onMouseDown(index)} />
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };
  
  

  const renderTableFooter = () => {
    const start = localPageIndex * localPageSize + 1;
    const end = Math.min(start + localPageSize - 1, dataSource.length);
    const paginationInfo = `${start}-${end} of ${dataSource.length} items`;
    return (
      <TableFooter>
        <button
          onClick={() => setLocalPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={localPageIndex === 0}
        >
          ◀
        </button>
        <span style={{ margin: '0 8px' }}>{localPageIndex + 1}</span>
        <button
          onClick={() =>
            setLocalPageIndex((prev) => Math.min(prev + 1, Math.floor(dataSource.length / localPageSize) - 1))
          }
          disabled={localPageIndex >= Math.floor(dataSource.length / localPageSize) - 1}
        >
          ▶
        </button>
        <span style={{ margin: '0 8px' }}>{paginationInfo}</span>
        <select value={localPageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </TableFooter>
    );
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalPageSize(parseInt(e.target.value, 10));
    setLocalPageIndex(0);
  };

  const getDeepValue = (obj: any, path: string) => {
    const value = path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
  
    if (typeof value === 'boolean' || typeof value === 'object') {
      return JSON.stringify(value);
    }
  
    return value;
  };
  

  return (
    <Table ref={tableRef}>
      <TableInnerWrapper>
        <div style={{
          width: columns.reduce(
            (acc, col) => acc + (parseInt(col.width, 10) || 0),
            0
          ),
        }}
        >
          {renderGroupHeader()}
          {renderTableHeader()}
          <TableBodyWrapper>
            {renderTableBody()}
          </TableBodyWrapper>
          <div ref={dragImageRef} style={{ display: 'none' }} />
        </div>
      </TableInnerWrapper>
      {renderTableFooter()}
    </Table>
  );
};