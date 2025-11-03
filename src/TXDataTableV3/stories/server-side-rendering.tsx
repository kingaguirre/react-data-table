import React from 'react';
import { TXDataTable } from '../index';
import { Container } from './utils';

export default () => {
  const [dataSource, setDataSource] = React.useState([]);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  /** This is the function where the developers handles the api response,
   * fetchPageData function returns pageIndex, pageSize and searchQuery 
   * base on what changes made in data-table. From here call the api and ensure 
   * to update 2 important props (dataSource and totalItems) so the data-table properly 
   * renders updated data from backend
   */
  const handlefetchPageData = React.useCallback(async (values) => {
    const { pageIndex, pageSize, searchQuery = '', filterValues } = values;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/users?_page=${pageIndex + 1}&_limit=${pageSize}&q=${searchQuery}&username=${filterValues?.username}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDataSource(data?.data)

      setTotalRecords(data?.totalData)
    } catch (fetchError) {
      /** Handle fetch error here */
      console.error('Fetch error: ', fetchError.message);
      setError(true)
    }
    setLoading(false);
  }, []);

  /** Example on how to get all data in api */
  const handleGetAllData = React.useCallback(async () => {
    setLoading(false);
    try {
      const response = await fetch('http://localhost:3000/users');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLoading(false);
      return data.data;
    } catch (fetchError) {
      /** Handle fetch error here */
      console.error('Download all error: ', fetchError.message);
      setError(true);
      setLoading(false);
      return [];
    }
  }, []);

  /** 
   * NOTE: If intend to use downloadAll without the array of object as data, 
   * just 'return false' and put any function before the return, 
   * data-table will call that function.
   */
  // const handleDownloadAll = React.useCallback(async () => {
  //   alert('Download link can place here as function');
  //   return false
  // }

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with props <b>fetchPageData</b>.</p>
      <TXDataTable
        /** Default settings */
        columnSettings={COLUMN_SETTINGS}

        /** Controls */
        dataSource={dataSource}
        totalItems={totalRecords}
        isLoading={loading}
        selectable
        multiSelect
        downloadXLS
        rowKey="id" // required if selectable is true
        onSelectedRowsChange={(r) => console.log(r)}
        ssrConfig={{
          fetchPageData: handlefetchPageData,
          allData: handleGetAllData,
          onDownloadAllClick: handleGetAllData,
        }}

        headerSearchSettings // props to show search textbox
      />
      {error && <p style={{color: 'var(--color-danger)', fontStyle: 'italic'}}>Seems server is not running, please run <b>node server.js</b> to run local server for this demo</p>}
      <p><b>Note</b>: Please check <a href="" target="_blank">stories file</a> to see how server-side-rendering works</p>
    </Container>
  )
}

const COLUMN_SETTINGS = [
  {
    title: 'Name',
    column: 'name',
  },
  {
    title: 'Username',
    column: 'username',
    filterConfig: {
      type: 'text',
      placeholder: 'Enter Username...'
    }
  },
  {
    title: 'email',
    column: 'email'
  },
  {
    title: 'address',
    column: 'address.city'
  },
  {
    title: 'company',
    column: 'company.name'
  }
]