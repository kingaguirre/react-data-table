import React from "react";
import { TableFooter } from "../styled";
import { SET_LOCAL_PAGE_INDEX, SET_LOCAL_PAGE_SIZE } from "../context/actions";
import { DataTableContext } from "../index";

export default () => {
  const {
    filteredData,
    state: { localPageIndex, localPageSize },
    setState,
  } = React.useContext(DataTableContext);

  const start = localPageIndex * localPageSize + 1;
  const end = Math.min(start + localPageSize - 1, filteredData.length);
  const paginationInfo = `${start}-${end} of ${filteredData.length} items`;

  const handlePageIndexChange = React.useCallback((index: number) => {
    setState({ type: SET_LOCAL_PAGE_INDEX, payload: index })
  }, [setState]);

  const handlePageSizeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({ type: SET_LOCAL_PAGE_SIZE, payload: parseInt(e.target.value, 10) })
    setState({ type: SET_LOCAL_PAGE_INDEX, payload: 0 })
  }, [setState]);

  return (
    <TableFooter>
      <button
        onClick={() => handlePageIndexChange(Math.max(localPageIndex - 1, 0))}
        disabled={localPageIndex === 0}
      >
        ◀
      </button>
      <span style={{ margin: '0 8px' }}>{localPageIndex + 1}</span>
      <button
        onClick={() => handlePageIndexChange(Math.min(localPageIndex + 1, Math.floor(filteredData.length / localPageSize) - 1))}
        disabled={localPageIndex >= Math.floor(filteredData.length / localPageSize) - 1}
      >
        ▶
      </button>
      <span style={{ margin: '0 8px' }}>{paginationInfo}</span>
      <select value={localPageSize} onChange={handlePageSizeChange}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </TableFooter>
  );
}