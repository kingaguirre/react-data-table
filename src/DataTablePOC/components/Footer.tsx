import React from "react";
import { TableFooter } from "../styled";

interface IProps {
  filteredData: any[];
  localPageIndex: number;
  setLocalPageIndex: React.Dispatch<React.SetStateAction<number>>;
  localPageSize: number
  setLocalPageSize: React.Dispatch<React.SetStateAction<number>>;
}

export default (props: IProps) => {
  const { filteredData, localPageIndex, setLocalPageIndex, localPageSize, setLocalPageSize } = props;

  const start = localPageIndex * localPageSize + 1;
  const end = Math.min(start + localPageSize - 1, filteredData.length);
  const paginationInfo = `${start}-${end} of ${filteredData.length} items`;

  const handlePageSizeChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalPageSize(parseInt(e.target.value, 10));
    setLocalPageIndex(0);
  }, []);

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
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </TableFooter>
  );
}