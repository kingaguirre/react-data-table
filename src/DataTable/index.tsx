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
  CellContent,
  CollapseIcon,
  TableHeader
} from './styled';
import { useDragDropManager } from './useDragDropManager';
import { useResizeManager } from './useResizeManager';
import { ColumnSettings } from './interface';
import { useDoubleClick } from "./utils"

interface DataTableProps {
  dataSource: any[];
  columnSettings: ColumnSettings[];
  pageSize?: number;
  pageIndex?: number;
  selectable?: boolean;
  rowKey: string;
  onPageSizeChange?: (newPageSize: number) => void;
  onPageIndexChange?: (newPageIndex: number) => void;
  onRowClick?: (rowData: any) => void;
  onRowDoubleClick?: (rowData: any) => void;
  onColumnSettingsChange?: (newColumnSettings: ColumnSettings[]) => void;
  onSelectedRowsChange?: (rowData: any) => void;
  collapsibleRowRender?: (rowData: any) => React.ReactNode;
  collapsibleRowHeight?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataSource,
  columnSettings,
  pageSize = 5,
  pageIndex = 0,
  selectable = false,
  rowKey,
  onPageIndexChange,
  onPageSizeChange,
  onRowClick,
  onRowDoubleClick,
  onColumnSettingsChange,
  onSelectedRowsChange,
  collapsibleRowRender,
  collapsibleRowHeight = '100px',
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number | null>(null);
  const [localPageIndex, setLocalPageIndex] = useState(pageIndex);
  const [localPageSize, setLocalPageSize] = useState(pageSize || 10);
  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
  const [collapsedRows, setCollapsedRows] = useState<Array<string>>([]);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  let frozenWidth = 0;

  const filteredData = useMemo(() => {
    return dataSource.filter(row => {
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [dataSource, search]);
  
  const start = localPageIndex * localPageSize;
  const end = start + localPageSize;
  const visibleRows = useMemo(() => filteredData.slice(start, end), [filteredData, start, end]);
  

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
    if (onSelectedRowsChange) {
      const selectedRowData = selectedRows.map(rowId => dataSource.find(row => row[rowKey] === rowId));
      onSelectedRowsChange(selectedRowData);
    }
  }, [selectedRows]);

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

  const renderMainTableHeader = () => {
    return (
      <TableHeader>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
        <button onClick={() => setDropdownOpen(prev => !prev)}>
          Column Visibility
        </button>
        {isDropdownOpen && (
          <div style={{ position: 'absolute', backgroundColor: 'white', zIndex: 20 }}>
            {columns.map((col, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  checked={!col.hide}
                  onChange={() => handleColumnVisibilityChange(index)}
                />
                <label>{col.title}</label>
              </div>
            ))}
          </div>
        )}
      </TableHeader>
    );
  };
  

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
        {selectable && <TableCell width="42px"/>}
        {collapsibleRowRender && <TableCell width="38px" />}
        {groupHeaders.map((groupHeader, index) => (
          <GroupHeader
            key={index}
            style={{ 
              width: `${groupHeader.width}px`,
            }}
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
        {collapsibleRowRender && <TableCell width="42px" />}
        {selectable && (
          <TableCell width="38px">
            <input
              type="checkbox"
              checked={visibleRows.length && selectedRows.length === visibleRows.length}
              onChange={(e) => e.target.checked ? selectAllRows() : deselectAllRows()}
            />
          </TableCell>
        )}
        {columns.map((col, index) => {
          if (col.hide) return null;
          const isFrozen = col.freeze;
          if (isFrozen) {
            frozenWidth += parseInt(col.width, 10);
          }
          return (
            <TableCell
              key={index}
              width={col.width}
              minWidth={col.minWidth}
              align={col.align}
              style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width, 10)}px`, zIndex: 1, background: '#fff' } : {}}
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
                <div 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering other click events
                    // Create a copy of columns and modify the freeze value of the current column
                    const newColumns = [...columns];
                    newColumns[index] = {
                      ...newColumns[index],
                      freeze: !newColumns[index].freeze,
                    };
                    // Update the state and call onColumnSettingsChange if provided
                    setColumns(newColumns);
                    if (onColumnSettingsChange) {
                      onColumnSettingsChange(newColumns);
                    }
                  }}
                >
                  📌
                </div>
              </div>
              <ResizeHandle onMouseDown={onMouseDown(index)} />
            </TableCell>
          );
        })}
      </TableRow>
    );
  };
  

  const renderTableBody = () => {
    return visibleRows.map((row, rowIndex) => {
      const isRowCollapsed = collapsedRows.includes(row[rowKey]);
      frozenWidth = 0; // reset the frozenWidth for each row
      const isActiveRow = row[rowKey] === activeRow;
      const isSelectedRow = selectedRows.includes(row[rowKey]);
      const handleRowClick = useDoubleClick(() => handleRowSingleClick(row), () => handleRowDoubleClick(row));
      return (
        <React.Fragment key={rowIndex}>
          <TableRow
            onClick={handleRowClick}
            style={{
              backgroundColor: isActiveRow ? 'lightblue' : isSelectedRow ? '#ddd' : 'white', // Set the background color based on whether the row is active.
              border: isSelectedRow ? '1px solid black' : undefined, // Set the border if the row is selected.
            }}
          >
            {collapsibleRowRender && (
              <TableCell onClick={() => toggleRowCollapse(row[rowKey])}>
                <CollapseIcon>{isRowCollapsed ? '-' : '+'}</CollapseIcon>
              </TableCell>
            )}
            {selectable && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row[rowKey])}
                  onChange={() => toggleRowSelection(row[rowKey])}
                />
              </TableCell>
            )}
            {columns.map((col, index) => {
              if (col.hide) return null;
              const isFrozen = col.freeze;
              if (isFrozen) {
                frozenWidth += parseInt(col.width, 10);
              }
              let cellContent = col.customColumnRenderer
                ? col.customColumnRenderer(row[col.column], row)
                : getDeepValue(row, col.column);
        
              // If search text exists, highlight the text
              if (search) {
                cellContent = highlightText(cellContent, search);
              }
              return (
                <TableCell
                  key={index}
                  width={col.width}
                  minWidth={col.minWidth}
                  align={col.align}
                  style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width, 10)}px`, zIndex: 1, background: '#fff' } : {}}
                >
                  <CellContent className="cell-content" style={{ maxWidth: col.width }}>{cellContent}</CellContent>
                  {showLineAtIndex === index && <VerticalLine />}
                  <ResizeHandle onMouseDown={onMouseDown(index)} />
                </TableCell>
              );
            })}
          </TableRow>
          {isRowCollapsed && collapsibleRowRender && (
            <TableRow style={{ height: collapsibleRowHeight }}>
              <TableCell>
                {collapsibleRowRender(row)}
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      )}
    );
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

  const handleColumnVisibilityChange = (columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hide = !newColumns[columnIndex].hide;
    setColumns(newColumns);
    if (onColumnSettingsChange) {
      onColumnSettingsChange(newColumns);
    }
  };
  
  const selectAllRows = () => {
    setSelectedRows(visibleRows.map(row => row[rowKey]));
  };
  
  const deselectAllRows = () => {
    setSelectedRows([]);
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleRowCollapse = (id: string) => {
    setCollapsedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalPageSize(parseInt(e.target.value, 10));
    setLocalPageIndex(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };
  
  const getDeepValue = (obj: any, path: string) => {
    const value = path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
  
    if (typeof value === 'boolean' || typeof value === 'object') {
      return JSON.stringify(value);
    }
  
    return value;
  };

  const highlightText = (text: string, highlight: string) => {
    // Split text on highlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ?
        <span key={i} style={{backgroundColor: '#ffc069'}}>{part}</span> : 
        <span key={i}>{part}</span>
    )}</span>;
  };
  
  const handleRowSingleClick = (row: any) => {
    onRowClick?.(row);
    setActiveRow((prev) => (prev === row[rowKey] ? null : row[rowKey]));
  };
  
  const handleRowDoubleClick = (row: any) => {
    onRowDoubleClick?.(row);
  };
  

  const handleRowClick = useDoubleClick(handleRowSingleClick, handleRowDoubleClick);

  return (
    <div>
      {renderMainTableHeader()}
      <Table ref={tableRef}>
        <TableInnerWrapper>
          <div style={{
            width: columns.reduce(
              (acc, col) => acc + (parseInt(col.width, 10) || 0),
              0
            ) + (selectable ? 38 : 0) + (collapsibleRowRender ? 44 : 0),
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
    </div>
  );
};