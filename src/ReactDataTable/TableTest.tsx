import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReactTable, ComputedColumnSetting } from './useReactTable';
import { dataSource, COLUMN_SETTINGS } from './data';
import TableRow from './TableRow';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

// Compute initial column order:
// First, columns with a defined order (sorted by that value)
// Then, columns without an order (preserving their original order)
const columnsWithOrder = COLUMN_SETTINGS.filter(col => col.order !== undefined);
const columnsWithoutOrder = COLUMN_SETTINGS.filter(col => col.order === undefined);
columnsWithOrder.sort((a, b) => (a.order! - b.order!));
const initialColumnOrder = [...columnsWithOrder, ...columnsWithoutOrder].map(col => col.column);

/**
 * DraggableHeader Component
 * Wraps a header cell so that only the drag-handle (☰) activates dragging.
 * All other header events (sorting, pinning, resizing) remain functional.
 */
const DraggableHeader: React.FC<{ header: ComputedColumnSetting; children: React.ReactNode }> = ({ header, children }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id: header.column });
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
    <div ref={setNodeRef} style={combinedStyle}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {children}
        {/* Drag-handle icon: only this triggers drag behavior */}
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{ marginRight: '0.5rem', cursor: 'grab' }}
          onClick={(e) => e.stopPropagation()}
        >
          ☰
        </div>
      </div>
    </div>
  );
};

const MyTableComponent: React.FC = () => {
  // Table data state (e.g. 10,000 records)
  const [tableData, setTableData] = useState(() => dataSource(10000));

  // Initialize the table hook with various UI features.
  const table = useReactTable({
    columns: COLUMN_SETTINGS,
    data: tableData,
    enableMultiRowSelection: true,
    initialState: { pageSize: 10, columnOrder: initialColumnOrder },
    onSelectedRowsChange: selectedRows => {
      console.log('Selected rows:', selectedRows);
    },
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnFiltering: true,
    enableColumnSorting: true,
    enableGlobalFiltering: true,
  });

  const [jumpPage, setJumpPage] = useState(table.pageIndex + 1);

  // Toggle column visibility.
  const allColumns = COLUMN_SETTINGS;
  const handleToggleVisibility = useCallback((columnKey: string) => {
    table.setColumnVisibility(prev => {
      const isVisible = prev[columnKey] === undefined ? true : prev[columnKey];
      return { ...prev, [columnKey]: !isVisible };
    });
  }, [table]);

  // Toggle column pinning.
  const togglePin = useCallback((columnKey: string) => {
    table.setColumnPinning(prev => {
      const leftPinned = prev.left || [];
      return leftPinned.includes(columnKey)
        ? { ...prev, left: leftPinned.filter(key => key !== columnKey) }
        : { ...prev, left: [...leftPinned, columnKey] };
    });
  }, [table]);

  // Update the first cell (UI patch only).
  const updateFirstCell = useCallback(() => {
    if (!tableData.length) return;
    const visibleHeaders = table.headers();
    if (!visibleHeaders.length) return;
    const firstColumnKey = visibleHeaders[0].column;
    const newData = [...tableData];
    newData[0] = { ...newData[0], [firstColumnKey]: 'Random ' + Math.random().toString(36).substring(2, 8) };
    setTableData(newData);
  }, [tableData, table]);

  // Pagination functions.
  const goToFirstPage = useCallback(() => table.setPageIndex(0), [table]);
  const goToLastPage = useCallback(() => {
    const lastPage = Math.max(0, Math.ceil(table.totalRows / table.pageSize) - 1);
    table.setPageIndex(lastPage);
  }, [table]);
  const goToPage = useCallback((page: number) => {
    const totalPages = Math.max(1, Math.ceil(table.totalRows / table.pageSize));
    if (page >= 1 && page <= totalPages) table.setPageIndex(page - 1);
  }, [table]);

  const totalRecords = table.totalRows;
  const startRecord = totalRecords === 0 ? 0 : table.pageIndex * table.pageSize + 1;
  const endRecord = Math.min((table.pageIndex + 1) * table.pageSize, totalRecords);

  // Global select-all (header checkbox).
  const headerSelectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerSelectAllRef.current) {
      const allGlobalSelected = tableData.length && tableData.every(row => table.selectedRowIds[row.id.toString()]);
      const someGlobalSelected = tableData.some(row => table.selectedRowIds[row.id.toString()]) && !allGlobalSelected;
      headerSelectAllRef.current.indeterminate = someGlobalSelected;
    }
  }, [tableData, table.selectedRowIds]);

  const headerToggleSelectAll = useCallback(() => {
    const allGlobalSelected = tableData.length && tableData.every(row => table.selectedRowIds[row.id.toString()]);
    allGlobalSelected ? table.deselectAllRows() : table.selectAllRows(tableData);
  }, [table, tableData]);

  // Footer select-all checkbox.
  const footerSelectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (footerSelectAllRef.current) {
      footerSelectAllRef.current.indeterminate = table.rows.some(row => table.selectedRowIds[row.id?.toString()]) &&
        !table.rows.every(row => table.selectedRowIds[row.id?.toString()]);
    }
  }, [table.rows, table.selectedRowIds]);

  const footerToggleSelectAll = useCallback(() => {
    const visibleRowIds = table.rows.map(row => row.id?.toString()).filter(Boolean);
    const allVisibleSelected = visibleRowIds.length && visibleRowIds.every(id => table.selectedRowIds[id]);
    allVisibleSelected ? table.removeRowsFromSelection(table.rows) : table.appendRowsToSelection(table.rows);
  }, [table]);

  // Column resizing handler.
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnKey: string) => {
      e.preventDefault();
      const startX = e.clientX;
      const initialWidth = table.columnResizing[columnKey] || 150;
      const onMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = initialWidth + (moveEvent.clientX - startX);
        table.setColumnResizing(prev => ({ ...prev, [columnKey]: newWidth }));
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [table]
  );

  // Get current headers from table state.
  const headers = table.headers();
  const extraWidth = table.enableMultiRowSelection ? 50 : 0;
  const totalWidth = extraWidth + headers.reduce((acc, header) => {
    const width = table.columnResizing[header.column] || header.width || 150;
    return acc + width;
  }, 0);

  // --- Drag & Drop for Column Reordering ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = headers.findIndex(header => header.column === active.id);
      const newIndex = headers.findIndex(header => header.column === over.id);
      const newOrder = arrayMove(headers.map(h => h.column), oldIndex, newIndex);
      table.setColumnOrder(newOrder);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  return (
    <div style={{ padding: '1rem' }}>
      <HeartbeatDisplay />
      {/* Column Visibility Panel */}
      <div style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '0.5rem' }}>
        <strong>Column Visibility:</strong>
        {allColumns.map(col => {
          const isVisible = table.columnVisibility[col.column] === undefined ? true : table.columnVisibility[col.column];
          return (
            <label key={col.column} style={{ marginRight: '1rem' }}>
              <input type="checkbox" checked={isVisible} onChange={() => handleToggleVisibility(col.column)} />
              {col.title}
            </label>
          );
        })}
      </div>

      {/* Button to update the first visible cell */}
      <button onClick={updateFirstCell} style={{ marginBottom: '1rem' }}>
        Update First Cell with Random Text
      </button>

      {/* Global Filter */}
      {table.enableGlobalFiltering && (
        <input
          type="text"
          placeholder="Global Filter..."
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          style={{ marginBottom: '1rem', padding: '0.25rem', width: '100%' }}
        />
      )}

      {table.loading && <div>Loading...</div>}

      <div className="table-wrapper" style={{ maxHeight: 250, overflow: 'auto' }}>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          {/* Header & Filter Rows in Drag & Drop Context */}
          <SortableContext items={headers.map(h => h.column)} strategy={horizontalListSortingStrategy}>
            {/* Set container width based on total column widths */}
            <div className="table-container" style={{ border: '1px solid #ccc', marginBottom: '1rem', width: totalWidth }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 3, background: 'white' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', backgroundColor: '#eee', position: 'relative' }}>
                  {table.enableMultiRowSelection && (
                    <div
                      style={{
                        width: 50,
                        flexShrink: 0,
                        padding: '0.5rem',
                        borderRight: '1px solid #ccc',
                        position: 'sticky',
                        left: 0,
                        zIndex: 4,
                        background: '#eee',
                      }}
                    >
                      <input
                        type="checkbox"
                        ref={headerSelectAllRef}
                        checked={tableData.length > 0 && tableData.every(row => table.selectedRowIds[row.id.toString()])}
                        onChange={headerToggleSelectAll}
                      />
                    </div>
                  )}
                  {headers.map(header => (
                    <DraggableHeader key={header.column} header={header}>
                      <div style={{ width: '100%', position: 'relative' }}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          onClick={() => {
                            if (!table.enableColumnSorting || header.canSort === false) return;
                            let newSorting = [...table.sorting];
                            const sortIndex = newSorting.findIndex(sort => sort.id === header.column);
                            if (sortIndex >= 0) {
                              const currentSort = newSorting[sortIndex];
                              currentSort.desc
                                ? newSorting.splice(sortIndex, 1)
                                : (newSorting[sortIndex] = { id: header.column, desc: true });
                            } else {
                              newSorting.push({ id: header.column, desc: false });
                            }
                            table.setSorting(newSorting);
                          }}
                        >
                          <span>{header.title}</span>
                          {table.enableColumnSorting &&
                            header.canSort !== false &&
                            table.sorting.find(sort => sort.id === header.column)
                            ? (table.sorting.find(sort => sort.id === header.column)?.desc ? ' 🔽' : ' 🔼')
                            : ''}
                        </div>
                        {table.enableColumnPinning && (
                          <button
                            onClick={(e) => { e.stopPropagation(); togglePin(header.column); }}
                            style={{ marginLeft: '0.5rem' }}
                          >
                            {table.columnPinning.left.includes(header.column) ? 'Unpin' : 'Pin'}
                          </button>
                        )}
                      </div>
                      {table.enableColumnResizing && header.canResize !== false && (
                        <div
                          onMouseDown={(e) => handleMouseDown(e, header.column)}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '5px',
                            cursor: 'col-resize',
                            background: '#ccc'
                          }}
                        />
                      )}
                    </DraggableHeader>
                  ))}
                </div>
                {/* Filter Row */}
                {table.enableColumnFiltering && (
                  <div style={{ display: 'flex', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ccc' }}>
                    {table.enableMultiRowSelection && (
                      <div
                        style={{
                          width: 50,
                          flexShrink: 0,
                          padding: '0.5rem',
                          borderRight: '1px solid #ccc',
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          background: '#eee',
                        }}
                      />
                    )}
                    {headers.map(header => (
                      <div
                        key={header.column}
                        style={{
                          width: table.columnResizing[header.column] || header.width || 150,
                          flexShrink: 0,
                          padding: '0.25rem',
                          borderRight: '1px solid #ccc',
                          ...header.getColumnStyle(),
                        }}
                      >
                        <input
                          type="text"
                          placeholder={`Filter ${header.title}`}
                          value={table.columnFilters[header.column] || ''}
                          onChange={e => table.setColumnFilters(prev => ({ ...prev, [header.column]: e.target.value }))}
                          style={{ width: '100%' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Data Rows */}
              {table.rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  headers={headers}
                  selectedRowIds={table.selectedRowIds}
                  toggleRowSelection={table.toggleRowSelection}
                  enableMultiRowSelection={table.enableMultiRowSelection}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Footer: Select-all for visible rows */}
      {table.enableMultiRowSelection && (
        <div style={{ margin: '1rem 0' }}>
          <label>
            <input type="checkbox" ref={footerSelectAllRef} onChange={footerToggleSelectAll} /> Select All Visible Rows (Footer)
          </label>
        </div>
      )}

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <button onClick={goToFirstPage} disabled={table.pageIndex === 0}>First</button>
        <button onClick={() => table.setPageIndex(Math.max(0, table.pageIndex - 1))} disabled={table.pageIndex === 0}>Previous</button>
        <span>
          Page{' '}
          <input type="number" value={jumpPage} onChange={e => setJumpPage(parseInt(e.target.value, 10))} onBlur={() => goToPage(jumpPage)} style={{ width: '50px' }} min={1} max={Math.ceil(table.totalRows / table.pageSize)} /> of {Math.ceil(table.totalRows / table.pageSize)}
        </span>
        <button onClick={() => table.setPageIndex(table.pageIndex + 1)} disabled={table.pageIndex >= Math.ceil(table.totalRows / table.pageSize) - 1}>Next</button>
        <button onClick={goToLastPage} disabled={table.pageIndex >= Math.ceil(table.totalRows / table.pageSize) - 1}>Last</button>
        <span>
          Show{' '}
          <select value={table.pageSize} onChange={e => {
            const newSize = parseInt(e.target.value, 10);
            table.setPageSize(newSize);
            table.setPageIndex(0);
          }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select> records
        </span>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        {totalRecords > 0 ? `${startRecord} to ${endRecord} of ${totalRecords} records` : 'No records'}
      </div>
    </div>
  );
};

export default MyTableComponent;

const HeartbeatDisplay = React.memo(() => {
  const [heartbeat, setHeartbeat] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setHeartbeat(prev => prev + 1), 100);
    return () => clearInterval(interval);
  }, []);
  return <div><strong>Heartbeat:</strong> {heartbeat}</div>;
});
