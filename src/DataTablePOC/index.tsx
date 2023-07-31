import React from "react";
import { DataTableProps, ColumnSettings } from "./interfaces";
import { getDeepValue, useDragDropManager, useResizeManager } from "./utils";
import * as SC from "./styled";
import Rows from "./components/Rows";
import ColumnHeader from "./components/ColumnHeader";
import ColumnGroupHeader from "./components/ColumnGroupHeader";
import ColumnFilters from "./components/ColumnFilters";
import MainHeader from "./components/MainHeader";
import Footer from "./components/Footer";

export default (props: DataTableProps) => {
  const {
    dataSource,
    columnSettings,
    pageSize = 5,
    pageIndex = 0,
    selectable = false,
    rowKey,
    collapsibleRowHeight = "100px",
    onColumnSettingsChange,
    onRowClick,
    onRowDoubleClick,
    collapsibleRowRender,
  } = props;
  
  /** Refs */
  const tableRef = React.useRef<HTMLDivElement>(null);
  const dragImageRef = React.useRef<HTMLDivElement>(null);

  /** States */
  const [search, setSearch] = React.useState<string>("");
  const [parentWidth, setParentWidth] = React.useState<number | null>(null);
  const [localPageIndex, setLocalPageIndex] = React.useState(pageIndex);
  const [localPageSize, setLocalPageSize] = React.useState(pageSize);
  const [columns, setColumns] = React.useState<ColumnSettings[]>([]);
  const [activeRow, setActiveRow] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<Array<string>>([]);
  const [filterValues, setFilterValues] = React.useState(() => {
    return columnSettings.reduce((initialValues, col: ColumnSettings) => ({
      ...initialValues,
      [col.column]: col.filterBy ? col.filterBy.value : "",
    }), {});
  });

  /** Memos Start */
  const updatedColumnSettings = React.useMemo(() => {
    if (parentWidth === null) return columnSettings;
  
    const columnsWithWidth = columnSettings.filter(col => col.width);
    const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width!, 10), 0);
    const remainingWidth = parentWidth - totalWidthWithWidth;
    const columnsWithoutWidth = columnSettings.filter(col => !col.width);
    const columnWidth = Math.max(remainingWidth / columnsWithoutWidth.length, 100);

    return columnSettings.sort((a, b) => {
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
    }).map((col, index) => ({
      ...col,
      width: col.width || `${columnWidth}px`,
      order: index,
    }));
  }, [columnSettings, parentWidth]);

  const filteredData = React.useMemo(() => {
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

  const start = localPageIndex * localPageSize;
  const end = start + localPageSize;
  const visibleRows = React.useMemo(() => filteredData.slice(start, end), [filteredData, start, end]);
  /** Memos End */

  /** UseEffects Start */
  React.useEffect(() => {
    setColumns(updatedColumnSettings);
  }, [updatedColumnSettings]);

  React.useEffect(() => {
    if (tableRef.current) {
      setParentWidth(tableRef.current.offsetWidth);
    }
  }, [tableRef]);

  /** UseEffects End */

  /** Custom Functions Start */
  const {
    onDragStart,
    onDragOver,
    onDrop,
    showLineAtIndex
  } = useDragDropManager(columns, setColumns, dataSource, dragImageRef, onColumnSettingsChange);
  const { onMouseDown } = useResizeManager(columns, setColumns, onColumnSettingsChange);
  /** Custom Functions End */

  return (
    <SC.TableWrapper>
      <MainHeader
        columns={columns}
        visibleRows={visibleRows}
        search={search}
        setSearch={setSearch}
        setColumns={setColumns}
        onColumnSettingsChange={onColumnSettingsChange}
      />
      <SC.Table ref={tableRef}>
        <SC.TableInnerWrapper>
          <div style={{
            width: columns.reduce(
              (acc, col) => acc + (parseInt(col.hide ? "" : col.width || "", 10) || 0),
              0
            ) + (selectable ? 38 : 0) + (collapsibleRowRender ? 44 : 0),
          }}>
            <ColumnGroupHeader
              selectable={selectable}
              columns={columns}
              collapsibleRowRender={collapsibleRowRender}
            />
            <ColumnHeader
              visibleRows={visibleRows}
              selectable={selectable}
              rowKey={rowKey}
              columns={columns}
              showLineAtIndex={showLineAtIndex}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              collapsibleRowRender={collapsibleRowRender}
              onMouseDown={onMouseDown}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              setColumns={setColumns}
              onColumnSettingsChange={onColumnSettingsChange}
            />
            <ColumnFilters
                selectable={selectable}
                columns={columns}
                filterValues={filterValues}
                setFilterValues={setFilterValues}
                collapsibleRowRender={collapsibleRowRender}
            />
            <Rows
              visibleRows={visibleRows}
              rowKey={rowKey}
              activeRow={activeRow}
              selectable={selectable}
              columns={columns}
              search={search}
              showLineAtIndex={showLineAtIndex}
              collapsibleRowHeight={collapsibleRowHeight}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
              collapsibleRowRender={collapsibleRowRender}
              setActiveRow={setActiveRow}
              onMouseDown={onMouseDown}
            />
          </div>
        </SC.TableInnerWrapper>
        <Footer
          filteredData={filteredData}
          localPageIndex={localPageIndex}
          setLocalPageIndex={setLocalPageIndex}
          localPageSize={localPageSize}
          setLocalPageSize={setLocalPageSize}
        />
      </SC.Table>
    </SC.TableWrapper>
  )
}