import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

// Synchronous data generation function for 500K records.
const generateDataSync = (numRecords) => {
  const data = [];
  for (let i = 0; i < numRecords; i++) {
    data.push({
      id: i,
      name: 'Name ' + i,
      value: Math.random(),
    });
  }
  return data;
};

// Create an inline web worker that generates data in chunks.
function createWorker() {
  const workerCode = `
    self.onmessage = function(e) {
      try {
        const numRecords = e.data.numRecords;
        const chunkSize = e.data.chunkSize || 100000;
        let dataChunk = [];
        for (let i = 0; i < numRecords; i++) {
          dataChunk.push({
            id: i,
            name: 'Name ' + i,
            value: Math.random(),
          });
          if (i > 0 && i % chunkSize === 0) {
            // Send a chunk of data.
            self.postMessage({ chunk: dataChunk });
            dataChunk = [];
          }
        }
        if (dataChunk.length > 0) {
          self.postMessage({ chunk: dataChunk });
        }
        // Signal that all data has been sent.
        self.postMessage({ done: true });
      } catch (error) {
        self.postMessage({ error: error.message });
      }
    }
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

// Pagination Footer component (based on Tanstack Table examples)
const PaginationFooter = ({ table }) => {
  const { pageIndex } = table.getState().pagination;
  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
        {'<<'}
      </button>
      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        {'<'}
      </button>
      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        {'>'}
      </button>
      <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
        {'>>'}
      </button>
      <span style={{ margin: '0 10px' }}>
        Page {pageIndex + 1} of {table.getPageCount()}
      </span>
      <span>
        | Go to page:{' '}
        <input
          type="number"
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            table.setPageIndex(page);
          }}
          style={{ width: '50px' }}
        />
      </span>
    </div>
  );
};

const TanstackTableWorkerExample = () => {
  // Data states and loading indicators.
  const [syncData, setSyncData] = useState(null);
  const [workerData, setWorkerData] = useState(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingWorker, setLoadingWorker] = useState(false);
  const workerRef = useRef(null);
  // Ref to accumulate chunks from the worker.
  const workerDataChunks = useRef([]);

  // Controlled pagination state for each table.
  const [syncPagination, setSyncPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [workerPagination, setWorkerPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Heartbeat state to show UI responsiveness.
  const [heartbeat, setHeartbeat] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setHeartbeat(prev => prev + 1), 100);
    return () => clearInterval(interval);
  }, []);

  // Set up the web worker.
  useEffect(() => {
    workerRef.current = createWorker();
    workerRef.current.onmessage = function(e) {
      if (e.data.error) {
        console.error("Worker error:", e.data.error);
        setLoadingWorker(false);
      } else if (e.data.chunk) {
        // Accumulate each chunk without causing too many re-renders.
        workerDataChunks.current = workerDataChunks.current.concat(e.data.chunk);
      } else if (e.data.done) {
        // Once done, update state once.
        setWorkerData(workerDataChunks.current);
        workerDataChunks.current = [];
        setLoadingWorker(false);
      }
    };
    workerRef.current.onerror = function(error) {
      console.error("Worker encountered an error:", error);
      setLoadingWorker(false);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Handle synchronous data load (this will block the UI).
  const handleLoadSync = () => {
    setLoadingSync(true);
    // This heavy operation runs on the main thread.
    const data = generateDataSync(1000000);
    setSyncData(data);
    setLoadingSync(false);
    setSyncPagination({ pageIndex: 0, pageSize: 10 });
  };

  // Handle data generation via the web worker.
  const handleLoadWorker = () => {
    setLoadingWorker(true);
    // Clear any previous data.
    setWorkerData(null);
    workerDataChunks.current = [];
    if (workerRef.current) {
      workerRef.current.postMessage({ numRecords: 1000000, chunkSize: 100000 });
    }
  };

  // Define columns for the table.
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'value', header: 'Value' },
    ],
    []
  );

  // Create Tanstack Table instance for synchronous data.
  const tableSync = useReactTable({
    data: syncData || [],
    columns,
    state: { pagination: syncPagination },
    onPaginationChange: setSyncPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Create Tanstack Table instance for worker data.
  const tableWorker = useReactTable({
    data: workerData || [],
    columns,
    state: { pagination: workerPagination },
    onPaginationChange: setWorkerPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Render table rows along with the pagination footer.
  const renderTable = (tableInstance) => (
    <>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          {tableInstance.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ border: '1px solid black', padding: '4px' }}>
                  {header.isPlaceholder ? null : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tableInstance.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{ border: '1px solid black', padding: '4px' }}>
                  {cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <PaginationFooter table={tableInstance} />
    </>
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tanstack Table with 500K Records</h1>
      <div>
        <strong>Heartbeat:</strong> {heartbeat}
      </div>
      <div style={{ marginBottom: '40px' }}>
        <h2>Synchronous Data Load</h2>
        <button onClick={handleLoadSync} disabled={loadingSync}>
          {loadingSync ? 'Loading...' : 'Load Data Sync'}
        </button>
        {syncData ? (
          <>
            <p>Showing first 10 rows:</p>
            {renderTable(tableSync)}
          </>
        ) : (
          <p>No Data Loaded</p>
        )}
      </div>
      <div>
        <h2>Web Worker Data Load (Chunked)</h2>
        <button onClick={handleLoadWorker} disabled={loadingWorker}>
          {loadingWorker ? 'Loading...' : 'Load Data with Worker'}
        </button>
        {workerData ? (
          <>
            <p>Showing first 10 rows:</p>
            {renderTable(tableWorker)}
          </>
        ) : (
          <p>No Data Loaded</p>
        )}
      </div>
    </div>
  );
};

export default TanstackTableWorkerExample;
