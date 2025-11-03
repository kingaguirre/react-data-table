import React, { useState, useCallback } from 'react';
import { TXDataTable } from '../index';

const TestWrapperForTXDataTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // The fetchPageData function calls the DummyJSON API and updates parent state.
  const fetchPageData = useCallback(async (values) => {
    const { pageIndex, pageSize } = values;
    // Simulate asynchronous delay if needed:
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const fakeResponse: any = {
      // Simulate 10 records
      data: Array.from({ length: pageSize }, (_, i) => ({
        id: pageIndex * pageSize + i + 1,
        name: `Name ${pageIndex * pageSize + i + 1}`,
        username: `username${pageIndex * pageSize + i + 1}`,
        email: `email${pageIndex * pageSize + i + 1}@dummy.com`,
        address: { city: `City ${pageIndex * pageSize + i + 1}` },
        company: { name: `Company ${pageIndex * pageSize + i + 1}` },
      })),
      totalData: 100, // For example, total records is 100
    };

    // Update parent state with the fake data.
    setDataSource(fakeResponse.data);
    setTotalRecords(fakeResponse.totalData);
    return { data: fakeResponse.data, totalData: fakeResponse.totalData };
  }, []);

  return (
    <TXDataTable
      columnSettings={[{ title: 'Name', column: 'firstName' }]} // adjust based on DummyJSON structure
      dataSource={dataSource}
      totalItems={totalRecords}
      ssrConfig={{
        fetchPageData,
      }}
    />
  );
};

export default TestWrapperForTXDataTable;