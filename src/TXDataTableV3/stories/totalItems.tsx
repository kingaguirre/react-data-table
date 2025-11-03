import React from 'react';
import { TxCoreFormControl } from 'tradeport-web-components/dist/react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import axios from 'axios';

/** Example to fetch api based on pageSize and pageIndex */
const fetchPaginatedData = async (pageIndex, pageSize, searchString = '') => {
  // https://www18-dev03-sg-sgr01.tx.standardchartered.com/https://jsonplaceholder.typicode.com/users?_page=0&_limit=10&q=

  // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  // const targetUrl = `https://jsonplaceholder.typicode.com/users?_page=${pageIndex}&_limit=${pageSize}&q=${searchString}`;
  const response = await fetch(`https://www18-dev03-sg-sgr01.tx.standardchartered.com/https://jsonplaceholder.typicode.com/users?_page=${pageIndex}&_limit=${pageSize}&q=${searchString}`);
  // const response = await axios.get('https://www18-dev03-sg-sgr01.tx.standardchartered.com/https://jsonplaceholder.typicode.com/users', {
  //   params: {
  //     _page: pageIndex,
  //     _limit: pageSize,
  //     q: searchString
  //   }
  // })

  // const dataSource = await response.data;
  const dataSource = await response.json();
  // const totalRecords = response.headers['x-total-count'];
  const totalRecords = response.headers.get('X-Total-Count');
  return { dataSource, totalRecords };
}

export default () => {
  const [dataSource, setDataSource] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [searchString, setSearchString] = React.useState('');

  React.useEffect(() => {
    // const localData = async () => {
    //   const result = await fetchPaginatedData(pageIndex, pageSize, searchString);
    //   setDataSource(result.dataSource)
    //   setTotalRecords(parseInt(result.totalRecords || ''))
    // }
    // localData();
    // fetch(`https://www18-dev03-sg-sgr01.tx.standardchartered.com/https://jsonplaceholder.typicode.com/users?_page=0&_limit=10&q=`).then((a)=> console.log(a))

    // fetch(`https://jsonplaceholder.typicode.com/users?_page=1&_limit=10&q=`)
    //   .then((r: any)=> {
    //     if (!r.ok) {
    //       throw new Error('Network response was not ok ' + r.statusText)
    //     }
    //     return r.json()
    //   })
    //   .then(data => console.log(data))
    //   .catch(error => console.error('Error: ', error))

  }, [pageIndex, pageSize])

  const handlePageIndexChange = (index) => {
    setPageIndex(index);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPageIndex(1);
  };

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with props <b>totalItems</b>.</p>
      <TXDataTable
        /** Default settings */
        dataSource={dataSource}
        columnSettings={COLUMN_SETTINGS}

        /** Controls */
        pageSize={pageSize}
        totalItems={totalRecords}
        onPageIndexChange={handlePageIndexChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Container>
  )
}

const COLUMN_SETTINGS = [
  {
    title: 'Name',
    column: 'name'
  },
  {
    title: 'Username',
    column: 'username'
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