import React from "react";
import * as SC from "./styled";
import { SET_LOCAL_PAGE_INDEX, SET_LOCAL_PAGE_SIZE } from "../../context/actions";
import { DataTableContext } from "../../index";
import { withState, IComponent } from '../GlobalStateProvider';
import { useFlasher } from '../GlobalStateTest/utils';

export const Footer = withState({
  states: [
    'filteredData',
    'pageIndex',
    'pageSize',
    'fetchedData',
    'fetchConfig',
    // 'setState',
    'onPageIndexChange',
    'onPageSizeChange',
    // 'setlocalPageIndex',
    // 'setpageSize'
    // 'setGlobalStateByKey'
    // 'setGlobalState'
  ],
})(React.memo((props: IComponent) => {
  const {
    filteredData,
    pageIndex,
    pageSize,
    fetchedData,
    fetchConfig,
    // setState,
    onPageIndexChange,
    onPageSizeChange,
    // setlocalPageIndex,
    // setpageSize
    // setGlobalStateByKey
    // setGlobalState,
    setGlobalStateByKey,
    setGlobalStateByObj
  } = props;

  React.useEffect(() => {
    console.log(props)
  }, [])
  const totalData = fetchConfig ? fetchedData?.totalData : filteredData?.length;
  const totalPages = Math.ceil(totalData / pageSize);
  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalData);
  const isLastPage = totalData === 0 || pageIndex >= totalPages - 1;
  const isFirstPage = pageIndex === 0;

  const handlePageIndexChange = React.useCallback((index: number) => {
    onPageIndexChange?.(index);
    // setGlobalStateByKey('pageIndex', index);
    // setGlobalStateByKey('pageIndex', index)
    setGlobalStateByObj({pageIndex: index})
    // setGlobalState((prev) => ({...prev, pageIndex: index}))
    // setlocalPageIndex(index);
    // setState({ type: SET_LOCAL_PAGE_INDEX, payload: index });
  }, []);

  const handlePageSizeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange?.(newSize);
    onPageIndexChange?.(0);
    // setState({ type: SET_LOCAL_PAGE_SIZE, payload: newSize });
    // setGlobalStateByKey('pageSize', newSize);
    setGlobalStateByKey('pageSize', newSize)
    // setGlobalState((prev) => ({...prev, pageSize: newSize}))
    // setpageSize(newSize)
    // setState({ type: SET_LOCAL_PAGE_INDEX, payload: 0 });
    // setGlobalStateByKey('pageIndex', 0);
    setGlobalStateByKey('pageIndex', 0)
    // setGlobalState((prev) => ({...prev, pageIndex: 0}))
    // setlocalPageIndex(0);
  }, []);

  return (
    <SC.TableFooter ref={useFlasher()}>
      {totalData > 0 ? (
        <SC.InfoContainer>
          Displaying <b>{totalData > start? start : totalData}</b> to <b>{end}</b> of <b>{totalData}</b> Records
        </SC.InfoContainer>
      ) : (
        <SC.InfoContainer>
          No Data To Disaplay
        </SC.InfoContainer>
      )}
      
      <SC.PaginationContainer>
        <b>Rows</b>
        <select value={pageSize} onChange={handlePageSizeChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button
          onClick={() => handlePageIndexChange(0)}
          disabled={isFirstPage}
        >
          <i className="fa fa-angle-double-left"/>
        </button>
        <button
          onClick={() => handlePageIndexChange(Math.max(pageIndex - 1, 0))}
          disabled={isFirstPage}
        >
          <i className="fa fa-angle-left"/>
        </button>
        <span style={{ margin: '0 8px' }}>{pageIndex + 1}</span>
        <button
          onClick={() => handlePageIndexChange(Math.min(pageIndex + 1, totalPages - 1))}
          disabled={isLastPage}
        >
          <i className="fa fa-angle-right"/>
        </button>
        <button
          onClick={() => handlePageIndexChange(totalPages - 1)}
          disabled={isLastPage}
        >
          <i className="fa fa-angle-double-right"/>
        </button>
      </SC.PaginationContainer>
    </SC.TableFooter>
  );
}));
