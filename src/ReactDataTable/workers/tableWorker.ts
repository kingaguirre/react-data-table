// src/ReactDataTable/workers/tableWorker.ts

export interface WorkerRequest<T> {
  data: T[];
  sorting: { id: string; desc: boolean }[];
  globalFilter: string;
  columnFilters: { [key: string]: string };
  pageIndex: number;
  pageSize: number;
}

export interface WorkerResponse<T> {
  rows: T[];
  totalRows: number;
}

// Use chunked processing for filtering.
self.onmessage = function <T>(e: MessageEvent<WorkerRequest<T>>) {
  const { data, sorting, globalFilter, columnFilters, pageIndex, pageSize } = e.data;

  // Sorting
  let sorted = data;
  if (sorting && sorting.length > 0) {
    sorted = [...data];
    sorting.forEach((sort) => {
      sorted.sort((a, b) => {
        const aValue = a[sort.id];
        const bValue = b[sort.id];
        if (aValue > bValue) return sort.desc ? -1 : 1;
        if (aValue < bValue) return sort.desc ? 1 : -1;
        return 0;
      });
    });
  }

  // Define chunked filtering.
  const chunkSize = 1000;
  async function chunkFilter(dataArray: T[], filterFn: (row: T) => boolean): Promise<T[]> {
    let result: T[] = [];
    for (let i = 0; i < dataArray.length; i += chunkSize) {
      const chunk = dataArray.slice(i, i + chunkSize);
      result = result.concat(chunk.filter(filterFn));
      // Yield control so the worker remains responsive.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return result;
  }

  // Process filtering and pagination in an async function.
  async function processData() {
    let filtered = sorted;
    // Global filtering (only applied if globalFilter is non-empty)
    if (globalFilter) {
      const filterLower = globalFilter.toLowerCase();
      filtered = await chunkFilter(filtered, (row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(filterLower))
      );
    }
    // Column filtering
    if (columnFilters) {
      for (const [columnId, filterValue] of Object.entries(columnFilters)) {
        if (filterValue) {
          const filterLower = filterValue.toLowerCase();
          filtered = await chunkFilter(filtered, (row) =>
            String(row[columnId]).toLowerCase().includes(filterLower)
          );
        }
      }
    }

    const totalRows = filtered.length;
    const start = pageIndex * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    const response: WorkerResponse<T> = {
      rows: paginated,
      totalRows,
    };

    // Post the computed data back to the main thread.
    self.postMessage(response);
  }

  processData();
};
