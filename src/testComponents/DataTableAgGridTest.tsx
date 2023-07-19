import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import styled from 'styled-components';

const StyledGrid = styled.div`
  width: 100%;

  .ag-header-cell {
    background-color: #f2f2f2;
    /* Add any other styles you want for the column header */
  }
`;

const MyGridComponent = () => {
  // const columnDefs = [
  //   { headerName: 'Column 1', field: 'col1', resizable: true, filter: true },
  //   { headerName: 'Column 2', field: 'col2', resizable: true, filter: true },
  //   { headerName: 'Column 3', field: 'col3', resizable: true, filter: true },
  //   // Add more column definitions as needed
  // ];

  const rowData = [
    { col1: 'Row 1', col2: 'Value 1', col3: 'Data 1' },
    { col1: 'Row 2', col2: 'Value 2', col3: 'Data 2' },
    { col1: 'Row 3', col2: 'Value 3', col3: 'Data 3' },
    // Add more rows as needed
  ];

  return (
    <StyledGrid>
      <div
        className="ag-theme-alpine"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <AgGridReact
          // columnDefs={columnDefs}
          rowData={rowData}
          suppressColumnVirtualisation={true}
          domLayout="autoHeight"
        ></AgGridReact>
      </div>
    </StyledGrid>
  );
};

export default MyGridComponent;
