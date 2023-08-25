import React, { createContext, useRef, useReducer, useMemo, useEffect } from "react";
import { DataTableProps, ColumnSettings } from "./interfaces";
import { getDeepValue, getTableWidth, exportToCsv, setColumnSettings } from "./utils";
import dataTableReducer, { IReducerState, initialState } from "./context/reducer";
import { SET_COLUMNS, SET_TABLE_WIDTH } from "./context/actions";
import * as SC from "./styled";
import { Rows } from "./components/Rows";
import { LoadingPanel } from "./components/Rows/styled";
import { ColumnHeader } from "./components/ColumnHeader";
import { Footer } from "./components/Footer";

export const DataTableContext = createContext<any>(null);

export const DataTable = (props: DataTableProps) => {
  /** Refs */
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    dataSource,
    columnSettings,
    pageSize = 5,
    pageIndex = 0,
    selectable = false,
    rowKey,
    collapsibleRowHeight,
    downloadCSV = false,
    activeRow = null,
    selectedRows = [],
    clickableRow = true,
    onRowClick,
    collapsibleRowRender,
    onPageSizeChange,
    onPageIndexChange,
    onSelectedRowsChange,
  } = props;

  /** Reducer Start */
  const [state, setState] = useReducer(dataTableReducer, {
    ...initialState,
    activeRow,
    selectedRows,
    localPageIndex: pageIndex,
    localPageSize: pageSize,
    filterValues: columnSettings.reduce((initialValues, col: ColumnSettings) => ({
      ...initialValues,
      [col.column]: col.filterBy ? col.filterBy.value : "",
    }), {})
  } as IReducerState);
  /** Reducer End */

  /** Memos Start */
  const start = state.localPageIndex * state.localPageSize;
  const end = start + state.localPageSize;
  const visibleRows = useMemo(() => (dataSource !== null || dataSource !== undefined) ? dataSource?.slice(start, end) : null, [dataSource, start, end]);
  /** Memos End */

  /** Custom Functions Start */
  const setColumns = (payload: ColumnSettings[]) => setState({ type: SET_COLUMNS, payload });
  const setTableWidth = (payload: number) => setState({ type: SET_TABLE_WIDTH, payload });
  /** Custom Functions End */

  /** UseEffects Start */
  useEffect(() => {
    if (tableRef && tableRef.current) {
      setTableWidth(tableRef.current.offsetWidth);
      setColumns(setColumnSettings(columnSettings, tableRef.current.offsetWidth));
    }
  }, [tableRef]);
  /** UseEffects End */

  return (
    <DataTableContext.Provider
      value={{
        rowKey,
        selectable,
        visibleRows,
        collapsibleRowHeight,
        downloadCSV,
        clickableRow,
        dataSource,
        state,
        setState,
        onRowClick,
        collapsibleRowRender,
        onPageSizeChange,
        onPageIndexChange,
        onSelectedRowsChange,
      }}
    >
      <SC.TableWrapper>
        <SC.Table ref={tableRef}>
          {state.tableWidth !== null ? (
            <SC.TableInnerWrapper>
              <div style={{ ...getTableWidth({ state, selectable, collapsibleRowRender }) }}>
                <ColumnHeader />
                <Rows />
              </div>
            </SC.TableInnerWrapper>
          ) : <LoadingPanel>Loading Rows...</LoadingPanel>}
        </SC.Table>
        {/* <Footer /> */}
      </SC.TableWrapper>
    </DataTableContext.Provider>
  );
}

export { getDeepValue, exportToCsv };
