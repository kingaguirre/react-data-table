import React from "react";
import * as SC from "./styled";
import { SET_LOCAL_PAGE_INDEX, SET_LOCAL_PAGE_SIZE } from "../../context/actions";
import { DataTableContext } from "../../index";

export const Footer = () => {
  const {
    filteredData,
    state: { localPageIndex, localPageSize, fetchedData },
    fetchConfig,
    setState,
    onPageIndexChange,
    onPageSizeChange
  } = React.useContext(DataTableContext);

  const totalData = fetchConfig ? fetchedData?.totalData : filteredData?.length;
  const totalPages = Math.ceil(totalData / localPageSize);
  const start = localPageIndex * localPageSize + 1;
  const end = Math.min(start + localPageSize - 1, totalData);
  const isLastPage = totalData === 0 || localPageIndex >= totalPages - 1;
  const isFirstPage = localPageIndex === 0;

  const handlePageIndexChange = React.useCallback((index: number) => {
    onPageIndexChange?.(index);
    setState({ type: SET_LOCAL_PAGE_INDEX, payload: index });
  }, [setState, localPageSize]);

  const handlePageSizeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange?.(newSize);
    onPageIndexChange?.(0);
    setState({ type: SET_LOCAL_PAGE_SIZE, payload: newSize });
    setState({ type: SET_LOCAL_PAGE_INDEX, payload: 0 });
  }, [setState]);

  return (
    <SC.TableFooter>
      {totalData > 0 ? (
        <SC.InfoContainer>
          Displaying <b>{start}</b> to <b>{end}</b> of <b>{totalData}</b> Records
          {/* | <i className="fa fa-refresh"/> */}
        </SC.InfoContainer>
      ) : (
        <SC.InfoContainer>
          No Data To Disaplay
        </SC.InfoContainer>
      )}
      
      <SC.PaginationContainer>
        <b>Rows</b>
        <select value={localPageSize} onChange={handlePageSizeChange}>
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
          onClick={() => handlePageIndexChange(Math.max(localPageIndex - 1, 0))}
          disabled={isFirstPage}
        >
          <i className="fa fa-angle-left"/>
        </button>
        <span style={{ margin: '0 8px' }}>{localPageIndex + 1}</span>
        <button
          onClick={() => handlePageIndexChange(Math.min(localPageIndex + 1, totalPages - 1))}
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
}