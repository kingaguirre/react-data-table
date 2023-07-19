import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { useDoubleClick, getDeepValue, exportToCsv } from "./utils"

export interface DataTableProps {
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
}: DataTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [parentWidth, setParentWidth] = useState<number | null>(null);
  const [localPageIndex, setLocalPageIndex] = useState(pageIndex);
  const [localPageSize, setLocalPageSize] = useState(pageSize || 10);
  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);
  const [collapsedRows, setCollapsedRows] = useState<Array<string>>([]);
  const [search, setSearch] = useState<string>("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [filterValues, setFilterValues] = React.useState(() => {
    return columnSettings.reduce((initialValues, col: ColumnSettings) => ({
      ...initialValues,
      [col.column]: col.filterBy ? col.filterBy.value : '',
    }), {});
  });
  
  let frozenWidth = 0;

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
  
    const columnsWithWidth = columnSettings.filter(col => col.width);
    const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width!, 10), 0);
    const remainingWidth = parentWidth - totalWidthWithWidth;
    const columnsWithoutWidth = columnSettings.filter(col => !col.width);
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


  const [columns, setColumns] = useState<ColumnSettings[]>(updatedColumnSettings);
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
        <button onClick={() => exportToCsv('data.csv', visibleRows, columns)}>Export to Excel</button>

      </TableHeader>
    );
  };

  const renderGroupHeader = () => {
    const groupHeaders = columns.reduce(
      (acc: { title: string | null; width: number }[], col) => {
        const lastHeader = acc[acc.length - 1];
        const colWidth = col.hide ? 0 : parseInt(col.width || "");

        if (col.groupTitle) {
          if (lastHeader && lastHeader.title === col.groupTitle) {
            lastHeader.width += colWidth;
          } else {
            acc.push({ title: col.groupTitle, width: colWidth });
          }
        } else {
          if (lastHeader && lastHeader.title === null) {
            lastHeader.width += colWidth;
          } else {
            acc.push({ title: null, width: colWidth });
          }
        }
        return acc;
      },
      []
    );

    return (
      <TableRow>
        {selectable && <TableCell width="42px" />}
        {collapsibleRowRender && <TableCell width="38px" />}
        {groupHeaders.map((groupHeader, index) => (
          groupHeader.width > 0 && (
            <GroupHeader
              key={index}
              style={{
                width: `${groupHeader.width}px`,
              }}
            >
              <CellContent>{groupHeader.title}</CellContent>
            </GroupHeader>
          )
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
              checked={!!visibleRows.length && selectedRows.length === visibleRows.length}
              onChange={(e) => e.target.checked ? selectAllRows() : deselectAllRows()}
            />
          </TableCell>
        )}
        {columns.map((col, index) => {
          if (col.hide) return null;
          const isFrozen = col.freeze;
          if (isFrozen) {
            frozenWidth += parseInt(col.width || "", 10);
          }
          return (
            <TableCell
              key={index}
              width={col.width}
              minWidth={col.minWidth}
              align={col.align}
              style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: '#fff' } : {}}
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

  const renderFilterRow = () => {
    const anyFilterBy = columns.some(col => col.filterBy);
    let frozenWidth = 0;

    if (!anyFilterBy) {
      return null;
    }

    return (
      <TableRow>
        {selectable && <TableCell width="42px" />}
        {collapsibleRowRender && <TableCell width="38px" />}
        {columns.map((col, index) => {
          if (col.hide) return null;
          const isFrozen = col.freeze;
          if (isFrozen) {
            frozenWidth += parseInt(col.width || "", 10);
          }
          return (
            <TableCell
              key={index}
              width={col.width}
              minWidth={col.minWidth}
              style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: '#fff' } : {}}
            >
              {(col.filterBy) ? col.filterBy.type === "text" ? (
                <input
                  type="text"
                  value={filterValues[col.column]}
                  onChange={e => {
                    setFilterValues(prev => ({
                      ...prev,
                      [col.column]: e.target.value,
                    }));
                  }}
                />
              ) : col.filterBy.type === "select" ? (
                <select
                  value={filterValues[col.column]}
                  onChange={e => {
                    setFilterValues(prev => ({
                      ...prev,
                      [col.column]: e.target.value,
                    }));
                  }}
                >
                  {col.filterBy.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option.value}>
                      {option.text}
                    </option>
                  ))}
                </select>
              ) : null : null}
            </TableCell>
          )
        })}
      </TableRow>
    );
  };

  const handleRowSingleClick = useCallback((row: any) => {
    onRowClick?.(row);
    setActiveRow((prev) => (prev === row[rowKey] ? null : row[rowKey]));
  }, [onRowClick]);

  const handleRowDoubleClick = useCallback((row: any) => {
    onRowDoubleClick?.(row);
  }, [onRowDoubleClick]);

  const handleRowClick = useCallback((row: any) => {
    const singleClickAction = () => {
      handleRowSingleClick(row);
    };
    const doubleClickAction = () => {
      handleRowDoubleClick(row);
    };
    return useDoubleClick(singleClickAction, doubleClickAction);
  }, [handleRowSingleClick, handleRowDoubleClick]);


  const renderTableBody = () => {
    return visibleRows.map((row, rowIndex) => {
      const isRowCollapsed = collapsedRows.includes(row[rowKey]);
      frozenWidth = 0; // reset the frozenWidth for each row
      const isActiveRow = row[rowKey] === activeRow;
      const isSelectedRow = selectedRows.includes(row[rowKey]);
      // const handleRowClick = useDoubleClick(() => handleRowSingleClick(row), () => handleRowDoubleClick(row));
      return (
        <React.Fragment key={rowIndex}>
          <TableRow
            onClick={() => handleRowClick(row)}
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
                frozenWidth += parseInt(col.width || "", 10);
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
                  style={isFrozen ? { position: 'sticky', left: `${frozenWidth - parseInt(col.width || "", 10)}px`, zIndex: 1, background: '#fff' } : {}}
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
      )
    }
    );
  };

  const filteredData = useMemo(() => {
    return dataSource.filter(row => {
      // Filter by column filter
      const columnFilterMatches = columns.every(col => {
        if (col.filterBy) {
          const filterValue = filterValues[col.column].toLowerCase();
          const rowValue = String(getDeepValue(row, col.column)).toLowerCase();
          return rowValue.includes(filterValue);
        }
        return true;
      });
  
      // Filter by search
      const searchMatches = columns.some(col => {
        const columnValue = String(getDeepValue(row, col.column)).toLowerCase();
        return columnValue.includes(search.toLowerCase());
      });
  
      return columnFilterMatches && searchMatches;
    });
  }, [dataSource, columns, filterValues, search]);

  const renderTableFooter = () => {
    const start = localPageIndex * localPageSize + 1;
    const end = Math.min(start + localPageSize - 1, filteredData.length);
    const paginationInfo = `${start}-${end} of ${filteredData.length} items`;
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
            setLocalPageIndex((prev) => Math.min(prev + 1, Math.floor(filteredData.length / localPageSize) - 1))
          }
          disabled={localPageIndex >= Math.floor(filteredData.length / localPageSize) - 1}
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
  
  useEffect(() => {
    setLocalPageIndex(0);
  }, [search, filterValues]);
  
  const start = localPageIndex * localPageSize;
  const end = start + localPageSize;
  const visibleRows = useMemo(() => filteredData.slice(start, end), [filteredData, start, end]);

  const handleColumnVisibilityChange = useCallback((columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].hide = !newColumns[columnIndex].hide;
    setColumns(newColumns);
    if (onColumnSettingsChange) {
      onColumnSettingsChange(newColumns);
    }
  }, [columns, onColumnSettingsChange]);

  const selectAllRows = useCallback(() => {
    setSelectedRows(visibleRows.map(row => row[rowKey]));
  }, [visibleRows]);

  const deselectAllRows = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const toggleRowCollapse = useCallback((id: string) => {
    setCollapsedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalPageSize(parseInt(e.target.value, 10));
    setLocalPageIndex(0);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const highlightText = (text: string, highlight: string) => {
    // Split text on highlight term, include term itself into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ?
        <span key={i} style={{ backgroundColor: '#ffc069' }}>{part}</span> :
        <span key={i}>{part}</span>
    )}</span>;
  };

  return (
    <div>
      {renderMainTableHeader()}
      <Table ref={tableRef}>
        <TableInnerWrapper>
          <div style={{
            width: columns.reduce(
              (acc, col) => acc + (parseInt(col.hide ? "" : col.width || "", 10) || 0),
              0
            ) + (selectable ? 38 : 0) + (collapsibleRowRender ? 44 : 0),
          }}
          >
            {renderGroupHeader()}
            {renderTableHeader()}
            {renderFilterRow()}
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