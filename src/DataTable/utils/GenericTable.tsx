import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleLeft, faAngleLeft, faAngleRight, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';

const GenericTable = ({ 
  columns, 
  data, 
  onRowClick, 
  totalItems, 
  fetchPageData, 
  searchColumn, 
  initialCurrentPage = 1, 
  initialPageSize = 10 
}) => {
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  useEffect(() => {
    if (totalItems > 0) {
      setTotalPages(Math.ceil(totalItems / pageSize));
    }
  }, [totalItems, pageSize]);

  useEffect(() => {
    fetchPageData(currentPage, pageSize, searchQuery, searchColumn);
  }, [currentPage, pageSize, fetchPageData, searchQuery, searchColumn]);

  useEffect(() => {
    if (searchQuery === '') {
      setCurrentPage(1);
      fetchPageData(1, pageSize, '', searchColumn);
    }
  }, [searchQuery, pageSize, fetchPageData, searchColumn]);

  useEffect(() => {
    setCurrentPage(initialCurrentPage);
  }, [initialCurrentPage]);

  useEffect(() => {
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchPageData(1, newSize, searchQuery, searchColumn);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.target.value === '') {
      setSearchQuery(currentSearchQuery);
      setCurrentPage(1);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={currentSearchQuery}
          onChange={(e) => {
            setCurrentSearchQuery(e.target.value);
            if (e.target.value === '') {
              setSearchQuery('');
            }
          }}
          onKeyDown={handleSearch}
          className="p-2 border rounded-md"
        />
      </div>
      <table className="min-w-full bg-white mb-4">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor} className="text-left py-2 px-4 border-b border-gray-200">
                {column.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => onRowClick(row.id)}
            >
              {columns.map((column) => (
                <td key={column.accessor} className="py-2 px-4 border-b border-gray-200">
                  {column.Cell ? column.Cell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length} className="py-2 px-4 border-t border-gray-200 text-right">
              Total Items: {totalItems}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFirstPage}
            className="p-2 border rounded-md"
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button
            onClick={handlePreviousPage}
            className="p-2 border rounded-md"
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            onClick={handleNextPage}
            className="p-2 border rounded-md"
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            onClick={handleLastPage}
            className="p-2 border rounded-md"
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
        <div>
          <label htmlFor="pageSize" className="mr-2">Page Size:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded-md p-2"
          >
            {[2, 5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default GenericTable;
