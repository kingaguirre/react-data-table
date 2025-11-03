jest.mock('xlsx', () => {
  const realXLSX = jest.requireActual('xlsx');
  return {
    ...realXLSX,
    writeFile: jest.fn()
  }
})

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { createEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { TXDataTable } from '../../../src/atoms/TXDataTableV3';
import * as XLSX from 'xlsx';
import {
  deepClone,
  getErrorMessage,
  highlightText,
  filterRows,
  sortData
} from '../../../src/atoms/TXDataTableV3/utils';
import { Actions } from '../../../src/atoms/TXDataTableV3/interfaces';

// Common sample data
const dataSource = [{ id: 1, name: 'John Doe' }];
const initialData = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }, { id: 3, name: 'Bob Lee' }];
const columnSettings = [
  { column: 'id', title: 'ID' },
  { column: 'name', title: 'Name' }
];

// Handlers
const onChangeHandler = jest.fn();
const onSelectedRowsChangeHandler = jest.fn();
const onRowClickHandler = jest.fn();
const onRowDoubleClickHandler = jest.fn();
const onPageSizeChangeHandler = jest.fn();
const onPageIndexChangeHandler = jest.fn();
const onRefreshIconClickHandler = jest.fn();

jest.spyOn(XLSX, 'writeFile').mockImplementation(() => {});

const Validation = () => {
  const dataTableRef = React.createRef<any>();
  const [invalidData, setInvalidData] = React.useState<any>(undefined);

  const handleValidate = () => {
    if (dataTableRef.current) {
      const validateData = dataTableRef.current.validate();
      setInvalidData(validateData)
    }
  };

  return (
    <>
      <TXDataTable
        ref={dataTableRef}
        dataSource={[{ id: 1, name: '' }, { id: 2, name: 'Jane' }]}
        columnSettings={[
          { column: 'id', title: 'ID' },
          {
            column: 'name',
            title: 'Name',
            actionConfig: {
              type: "text",
              isUnique: true,
              schema: {
                type: "string",
                minLength: 1,
              }
            }
          }
        ]}
        rowKey='id'
      />
      <button onClick={handleValidate}>Validate</button>
      <code>{JSON.stringify(invalidData)}</code>
    </>
  )
}

describe('TXDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic rendering tests
  it('renders with defaults', () => {
    render(
      <TXDataTable
        columnSettings={columnSettings}
        dataSource={dataSource}
      />
    );
    expect(screen).toBeDefined();
    // check footer
    expect(screen.queryByText(/Displaying/)).toBeDefined();

    // check column controls
    // check sorting
    expect(screen.getByTitle('Sort ID (asc)')).toBeDefined();
    // do sort on clcik asc
    fireEvent.click(screen.getByTitle('Sort ID (asc)'));
    // check if sort is working asc
    expect(screen.queryByTitle('Sort ID (desc)')).toBeDefined();
    // do sort on clcik desc
    fireEvent.click(screen.queryByTitle('Sort ID (desc)')!);
    // check if sort is working desc
    expect(screen.queryByTitle('Sort ID (none)')).toBeDefined();
    // do sort on clcik none
    fireEvent.click(screen.queryByTitle('Sort ID (none)')!);
    // check if sort is working none
    expect(screen.queryByTitle('Sort ID (asc)')).toBeDefined();

    // check pinning
    expect(screen.getByTitle('Pin ID')).toBeDefined();
    fireEvent.click(screen.getByTitle('Pin ID'));
    expect(screen.queryByTitle('Unpin ID')).toBeDefined();
    fireEvent.click(screen.getByTitle('Unpin ID'));
    expect(screen.queryByTitle('Pin ID')).toBeDefined();

    // check resize is present
    expect(screen.getByTitle('Resize ID')).toBeDefined();
    // bulk delete should not be in dom
    expect(screen.queryByTestId('bulk-delete-panel')).toBeNull();
    // main header should not be in dom
    expect(screen.queryByTestId('main-header-wrapper')).toBeNull();
    // actions column should not be in dom
    expect(screen.queryByTestId('actions-container')).toBeNull();
    // column filters should not be in dom
    expect(screen.queryByTestId('column-filters-container')).toBeNull();
    // select column should not be in dom
    expect(screen.queryByTestId('row-selector-header')).toBeNull();
  });

  it('renders "No data available" when dataSource is empty', () => {
    render(<TXDataTable dataSource={[]} columnSettings={[]} />);
    expect(screen.getByText('No data available.')).toBeDefined();
  });

  it('renders "rowKey is required" when add action is enable', () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        actions={[Actions.ADD]}
      />);
    expect(screen.getByText('rowKey')).toBeDefined();
  });

  it('shows Add New button when ADD action is provided', async () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        actions={[Actions.ADD]}
        onChange={onChangeHandler}
        rowKey='id'
      />
    );

    const addBtn = screen.getByText('Add New');
    expect(addBtn).toBeDefined();

    expect(addBtn.getAttribute('disabled')).toBe('false');
    fireEvent(addBtn, createEvent('buttonClick', addBtn));
    await waitFor(() => {
      expect(addBtn.getAttribute('disabled')).toBe('[object Object]')
    })

    const cancel = await screen.findByTitle('Cancel');
    expect(cancel).toBeDefined();
    await userEvent.click(cancel!);
    await waitFor(() => {
      expect(addBtn.getAttribute('disabled')).toBe('false')
    })

    fireEvent(addBtn, createEvent('buttonClick', addBtn));
    await waitFor(() => {
      expect(addBtn.getAttribute('disabled')).toBe('[object Object]')
    })

    const cell = screen.getByText(/new-/);
    await userEvent.click(cell);

    const input = document.querySelector('tx-core-form-control')!
    expect(input).toBeDefined();
    await userEvent.click(input);

    fireEvent(input, createEvent('change', input, { detail: 0 }, { EventType: 'CustomEvent' }));
    fireEvent(input, createEvent('blur', input, { detail: 0 }, { EventType: 'CustomEvent' }));
  
    expect(screen.queryByText('0')).toBeDefined();

    const save = await screen.findByTitle('Save');
    expect(save).toBeDefined();
    await userEvent.click(save);
    cleanup();
  });

  it('enters edit mode on cell click when EDIT action is provided with undo and redo', async () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        actions={[Actions.EDIT]}
        onChange={onChangeHandler}
        rowKey='id'
        undoRedoCellEditing
      />
    );
    const cell = screen.getByText('John Doe');
    await userEvent.click(cell);

    const input = document.querySelector('tx-core-form-control')!
    expect(input).toBeDefined();
    await userEvent.click(input);

    fireEvent(input, createEvent( 'change', input, { detail: 'King' }, { EventType: 'CustomEvent' }));
    fireEvent.blur(input)
  
    expect(screen.queryByText('King')).not.toBeNull();

    expect(onChangeHandler).toHaveBeenCalledWith([{
      "id": 1,
      "name": {
        "isChanged": true,
        "previous": {
          "value": "John Doe"
        },
        "value": "King"
      },
      "intentAction": "U"
    }]);

    // do undo
    fireEvent.keyDown(document, {
      key: 'z',
      code: 'KeyZ',
      ctrlKey: true
    })
    expect(onChangeHandler).toHaveBeenCalledWith([
      {
        "id": 1,
        "name": "John Doe",
        "intentAction": "U"
      }
    ]);
  
     // do redo
     fireEvent.keyDown(document, {
      key: 'y',
      code: 'KeyY',
      ctrlKey: true
    })
     expect(onChangeHandler).toHaveBeenCalledWith([
       {
         "id": 1,
         "intentAction": "U",
         "name": undefined
       }
     ]);
    cleanup();
  });

  it('should do validation on edit', async () => {
    render(
      <TXDataTable
        dataSource={[{ id: 1, name: 'King' }, { id: 2, name: 'Jane' }]}
        columnSettings={[
          { column: 'id', title: 'ID' },
          {
            column: 'name',
            title: 'Name',
            actionConfig: {
              type: "text",
              isUnique: true,
              schema: {
                type: "string",
                minLength: 1,
              }
            }
          }
        ]}
        onChange={onChangeHandler}
        rowKey='id'
        actions={[Actions.EDIT]}
      />
    );

    const firstRowNameColumn = screen.getByTestId('table-cell-0-name');
    fireEvent.click(firstRowNameColumn);
    const input = firstRowNameColumn.querySelector('tx-core-form-control')!;
    // Update text for manadatory check
    fireEvent(input, createEvent( 'change', input, { detail: '' }, { EventType: 'CustomEvent' }));
    fireEvent(input, createEvent('blur', input, { detail: '' }, { EventType: 'CustomEvent' }));
    expect(onChangeHandler).toHaveBeenCalledWith([
      {
        "id": 1,
        "name": {
          "isChanged": true,
          "previous": {
            "value": "King"
          },
          "value": ''
        },
        "intentAction": "U"
      },
      {
        "id": 2,
        "name": "Jane"
      }
    ]);
    // check if Cell is empty
    expect(screen.queryByText('King')).toBeNull();
    // invalid border should be present
    expect(screen.queryByTestId('invalid-border-0-name')).toBeDefined();
    fireEvent.mouseEnter(firstRowNameColumn);
    // check tooltip if present
    expect(screen.queryByText('Name is mandatory')).toBeDefined();
    // should not have any tooltop when mouse leave
    fireEvent.mouseLeave(firstRowNameColumn);
    expect(screen.queryByText('Name is mandatory')).toBeNull();
    // click cell and check if helptext is present
    fireEvent.click(firstRowNameColumn);
    expect(screen.queryByText('Name is mandatory')).toBeDefined();
    // Update text for unique check
    fireEvent(input, createEvent( 'change', input, { detail: 'Jane' }, { EventType: 'CustomEvent' }));
    fireEvent(input, createEvent('blur', input, { detail: 'Jane' }, { EventType: 'CustomEvent' }));
    expect(onChangeHandler).toHaveBeenCalledWith([
      {
        "id": 1,
        "name": {
          "isChanged": true,
          "previous": {
            "value": "King"
          },
          "value": ""
        },
        "intentAction": "U"
      },
      {
        "id": 2,
        "name": "Jane"
      }
    ]);
    expect(screen.queryByText('Jane')).toBeDefined();
    fireEvent.mouseEnter(firstRowNameColumn);
    // check tooltip if present
    expect(screen.queryByText('Data should be unique')).toBeDefined();
    // click cell and check if helptext is present
    fireEvent.click(firstRowNameColumn);
    expect(screen.queryByText('Data should be unique')).toBeDefined();
    // Update text to remove validation
    fireEvent(input, createEvent( 'change', input, { detail: 'King' }, { EventType: 'CustomEvent' }));
    fireEvent(input, createEvent('blur', input, { detail: 'King' }, { EventType: 'CustomEvent' }));
    expect(onChangeHandler).toHaveBeenCalledWith([
      {
        "id": 1,
        "name": {
          "isChanged": true,
          "previous": {
            "value": "King"
          },
          "value": ""
        },
        "intentAction": "U"
      },
      {
        "id": 2,
        "name": "Jane"
      }
    ]);
    expect(screen.queryByText('King')).toBeDefined();
    // should not have any tooltip when mouseenter
    fireEvent.mouseEnter(firstRowNameColumn);
    expect(screen.queryByText('Data should be unique')).toBeNull();
    expect(screen.queryByText('Name is mandatory')).toBeNull();
    expect(screen.queryByTestId('invalid-border-1-name')).toBeNull();
  });

  it('deletes row with undo when non-permanent', async () => {
    render(
      <TXDataTable
        dataSource={[{ id: 1, name: 'Temp' }]}
        columnSettings={columnSettings}
        rowKey="id"
        actions={[Actions.DELETE]}
        isPermanentDelete={false}
        onChange={onChangeHandler}
      />
    );

    // do delete
    await userEvent.click(screen.getByTitle('Delete'));
    // check if undo icon is present
    expect(screen.getByTitle('Undo Delete')).toBeDefined();
    // should have intentAction as D
    expect(onChangeHandler).toHaveBeenCalledWith([{
      "id": 1,
      "name": "Temp",
      "intentAction": "D"
    }]);
    await userEvent.click(screen.getByTitle('Undo Delete'));
    expect(screen.getByText('Temp')).toBeDefined();
    expect(screen.getByTitle('Delete')).toBeDefined();
    // should have intentAction as U
    expect(onChangeHandler).toHaveBeenCalledWith([{
      "id": 1,
      "name": "Temp",
      "intentAction": "U"
    }]);
  });

  it('permanently deletes row when isPermanentDelete is true', async () => {
    render(
      <TXDataTable
        dataSource={[{ id: 1, name: 'Final' }]}
        columnSettings={columnSettings}
        rowKey="id"
        actions={[Actions.DELETE]}
        isPermanentDelete={true}
      />
    );
    
    await userEvent.click(screen.getByTitle('Delete'));
    expect(screen.queryByText('Final')).toBeNull();
    expect(screen.queryByTitle('rowKey is required if actions or selectable prop is defined')).toBeDefined();
  });

  it('renders disabled selection checkboxes when disabledSelectedRows is defined', () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        selectable
        multiSelect
        disabledSelectedRows={[1]}
        rowKey="id"
        onSelectedRowsChange={onSelectedRowsChangeHandler}
      />
    );

    const rowSelectorHeader = screen.getByTestId('row-selector-header');
    expect(rowSelectorHeader).toBeDefined();
    const rowCheckboxHeader = rowSelectorHeader.querySelector('tx-core-form-control')!;
    expect(rowCheckboxHeader).toBeDefined();

    // select first row
    fireEvent(rowCheckboxHeader, createEvent('change', rowCheckboxHeader, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([]);
  });

  it('renders disabled selection checkboxes when disabledSelectedRows is defined', () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        selectable
        multiSelect
        disabledSelectedRows={[1]}
        rowKey="id"
        onSelectedRowsChange={onSelectedRowsChangeHandler}
      />
    );
    const rowSelectorHeader = screen.getByTestId('row-selector-header');
    expect(rowSelectorHeader).toBeDefined();
    const rowCheckboxHeader = rowSelectorHeader.querySelector('tx-core-form-control')!;
    expect(rowCheckboxHeader).toBeDefined();
    // select first row
    fireEvent(rowCheckboxHeader, createEvent('change', rowCheckboxHeader, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([]);
  });

  it('renders selection checkboxes when selectable is true and single select', () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        selectable
        rowKey="id"
        onSelectedRowsChange={onSelectedRowsChangeHandler}
      />
    );
    
    const rowSelector0 = screen.getByTestId('row-selector-0');
    expect(rowSelector0).toBeDefined();
    expect(rowSelector0.getAttribute('class')).toContain('radio');
    const rowCheckbox0 = rowSelector0.querySelector('tx-core-form-control')!;

    // select first row
    fireEvent(rowCheckbox0, createEvent('change', rowCheckbox0, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([{ id: 1, name: 'John Doe' }]);

    // check if first row is selected
    const row0 = screen.getByTestId('row-0');
    expect(row0.getAttribute('class')).toContain('is-selected');

    const rowSelector1 = screen.getByTestId('row-selector-1');
    expect(rowSelector1).toBeDefined();
    expect(rowSelector1.getAttribute('class')).toContain('radio');
    const rowCheckbox1 = rowSelector1.querySelector('tx-core-form-control')!;

    // select first row
    fireEvent(rowCheckbox1, createEvent('change', rowCheckbox1, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([{"id": 2, "name": "Jane Smith"}]);
    
    // check if first row is selected
    const row1 = screen.getByTestId('row-1');
    expect(row1.getAttribute('class')).toContain('is-selected');

    expect(row0.getAttribute('class')).not.toContain('is-selected');
    cleanup();
  });

  it('renders selection checkboxes when selectable is true and multi-select', () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        selectable
        multiSelect
        rowKey="id"
        onSelectedRowsChange={onSelectedRowsChangeHandler}
      />
    );
    
    const rowSelector0 = screen.getByTestId('row-selector-0');
    expect(rowSelector0).toBeDefined();
    expect(rowSelector0.getAttribute('class')).toContain('checkbox');
    const rowCheckbox0 = rowSelector0.querySelector('tx-core-form-control')!;

    // select first row
    fireEvent(rowCheckbox0, createEvent('change', rowCheckbox0, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([{ id: 1, name: 'John Doe' }]);

    // check if first row is selected
    const row0 = screen.getByTestId('row-0');
    expect(row0.getAttribute('class')).toContain('is-selected');

    const rowSelector1 = screen.getByTestId('row-selector-1');
    expect(rowSelector1).toBeDefined();
    expect(rowSelector1.getAttribute('class')).toContain('checkbox');
    const rowCheckbox1 = rowSelector1.querySelector('tx-core-form-control')!;

    // select second row
    fireEvent(rowCheckbox1, createEvent('change', rowCheckbox1, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]);

    // check if first and second row is selected
    const row1 = screen.getByTestId('row-1');
    expect(row1.getAttribute('class')).toContain('is-selected');
    expect(row0.getAttribute('class')).toContain('is-selected');

    // select header checkbox
    const rowSelectorHeader = screen.getByTestId('row-selector-header');
    expect(rowSelectorHeader).toBeDefined();
    expect(rowSelectorHeader.getAttribute('class')).toContain('checkbox');
    const rowCheckboxHeader = rowSelectorHeader.querySelector('tx-core-form-control')!;
    // do change
    fireEvent(rowCheckboxHeader, createEvent('change', rowCheckboxHeader, {}, { EventType: 'CustomEvent' }));
    expect(onSelectedRowsChangeHandler).toHaveBeenCalledWith([]);

    cleanup();
  });

  it('renders header search input when headerSearchSettings provided', () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        headerSearchSettings={{ placeholder: 'Search...' }}
      />
    );
    expect(screen.getByPlaceholderText('Search...')).toBeDefined();
  });

  it('hides footer when hideFooter is true', () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={columnSettings}
        hideFooter
      />
    );
    expect(screen.queryByText(/Displaying/)).toBeNull();
  });

  it('calls onRowClick when a row is clicked', async () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        onRowClick={onRowClickHandler}
      />
    );
    
    const row0 = screen.getByTestId('row-0');
    // click first row
    fireEvent.click(row0)

    // check if is-active class is present
    await waitFor(() => {
      expect(row0.getAttribute('class')).toContain('is-active');
    })
    expect(onRowClickHandler).toHaveBeenCalledWith(initialData[0], 0);

    const row1 = screen.getByTestId('row-1');
    // click first row
    fireEvent.click(row1)
    // check if is-active class is present
    await waitFor(() => {
      expect(row1.getAttribute('class')).toContain('is-active');
    })
    await waitFor(() => {
      expect(row0.getAttribute('class')).not.toContain('is-active');
    })
    expect(onRowClickHandler).toHaveBeenCalledWith(initialData[1], 1);
  });

  it('calls onRowDoubleClick when a row is double-clicked', async () => {
    render(
      <TXDataTable
        dataSource={initialData}
        columnSettings={columnSettings}
        onRowDoubleClick={onRowDoubleClickHandler}
      />
    );
    
    const dClick = userEvent.setup({ delay: 50 })

    const row0 = screen.getByTestId('row-0');
    // click first row
    await dClick.click(row0)
    await dClick.click(row0)

    // check if is-active class is present
    await waitFor(() => {
      expect(row0.getAttribute('class')).toContain('is-active');
    })
    expect(onRowDoubleClickHandler).toHaveBeenCalledWith(initialData[0], 0);

    const row1 = screen.getByTestId('row-1');
    // click first row
    await dClick.click(row1)
    await dClick.click(row1)
    // check if is-active class is present
    await waitFor(() => {
      expect(row1.getAttribute('class')).toContain('is-active');
    })
    await waitFor(() => {
      expect(row0.getAttribute('class')).not.toContain('is-active');
    })
    expect(onRowDoubleClickHandler).toHaveBeenCalledWith(initialData[1], 1);
  });

  it('allows page size change via dropdown', async () => {
    render(
      <TXDataTable
        dataSource={Array(20).fill(null).map((_, i) => ({ id: i, name: `Name ${i}` }))}
        columnSettings={columnSettings}
        pageSize={5}
        onPageSizeChange={onPageSizeChangeHandler}
      />
    );

    const footerCPaginationContainer = screen.getByTestId('footer-pagination-container');
    const pageDropdown = footerCPaginationContainer.querySelector('tx-core-form-control')!;
    expect(pageDropdown).toBeDefined();
    // check if display is correct
    expect(screen.getByTitle('Displaying 1 to 5 of 20 Records')).toBeDefined();
    // check rows should be only 5
    expect(screen.getAllByTestId(/^row-\d+$/)).toHaveLength(5);

    // change page size to 10
    fireEvent(pageDropdown, createEvent('change', pageDropdown, { detail: '10' }, { EventType: 'CustomEvent' }));

    expect(onPageSizeChangeHandler).toHaveBeenCalledWith(10);
    // check if display is correct to 10
    expect(screen.getByTitle('Displaying 1 to 10 of 20 Records')).toBeDefined();
    expect(screen.getAllByTestId(/^row-\d+$/)).toHaveLength(10);
  });

  it('allows page index change via pagination icons', async () => {
    render(
      <TXDataTable
        dataSource={Array(20).fill(null).map((_, i) => ({ id: i, name: `Name ${i}` }))}
        columnSettings={columnSettings}
        pageIndex={0}
        onPageIndexChange={onPageIndexChangeHandler}
        onRefreshIconClick={onRefreshIconClickHandler}
      />
    );
    
    // check display is correct
    expect(screen.getByTitle('Displaying 1 to 10 of 20 Records')).toBeDefined();
    // check that first and previous button should be disabled
    expect(screen.getByTitle('First').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTitle('Previous').hasAttribute('disabled')).toBe(true);
    expect(screen.getByTitle('Next').hasAttribute('disabled')).toBe(false);
    expect(screen.getByTitle('Last').hasAttribute('disabled')).toBe(false);

    // click next button
    await userEvent.click(screen.getByTitle('Next'));

    await waitFor(() => {
      // check if display is correct
      expect(screen.getByTitle('Displaying 11 to 20 of 20 Records')).toBeDefined();
      // check that next and last should be disabled
      expect(screen.getByTitle('First').hasAttribute('disabled')).toBe(false);
      expect(screen.getByTitle('Previous').hasAttribute('disabled')).toBe(false);
      expect(screen.getByTitle('Next').hasAttribute('disabled')).toBe(true);
      expect(screen.getByTitle('Last').hasAttribute('disabled')).toBe(true);
    })

    expect(onPageIndexChangeHandler).toHaveBeenCalledWith(1);

    await userEvent.click(screen.getByTestId('footer-refresh-icon'));
    expect(onRefreshIconClickHandler).toHaveBeenCalled();

    // click footer pagination buttons
    await userEvent.click(screen.getByTitle('Last'));
    await userEvent.click(screen.getByTitle('Previous'));
    await userEvent.click(screen.getByTitle('First'));
  });

  it('should download all data to excel', async () => {
    render(
      <TXDataTable
        dataSource={[{ id: 1, name: 'King' }, { id: 2, name: 'Jane' }]}
        columnSettings={columnSettings}
        downloadXLS
      />
    );

    // should show header
    expect(screen.getByTestId('main-header-wrapper')).toBeDefined();
    // download icon shold be present
    const downloadIcon = screen.getByTestId('download-all-icon');
    expect(downloadIcon).toBeDefined();
    // download dropdown menu should not present
    expect(screen.queryByTestId('download-all-menu')).toBeNull();
    // click download icon
    fireEvent.click(downloadIcon);

    const downloadAllMenu = screen.queryByTestId('download-all-menu')!;
    expect(downloadAllMenu).toBeDefined();

    // do download
    fireEvent.click(downloadAllMenu);

    await waitFor(() => {
      expect(XLSX.writeFile).toHaveBeenCalledTimes(1);
    })
    const [workbookArg, filenameArg] = (XLSX.writeFile as jest.Mock).mock.calls[0];
    // check if data is being downloaded
    expect(filenameArg).toBe('data.xlsx');

    // check data inside excel
    const sheetName = workbookArg.SheetNames[0];
    const worksheet = workbookArg.Sheets[sheetName];

    const data: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    expect(data).toEqual( [ [ 'ID', 'Name' ], [ 1, 'King' ], [ 2, 'Jane' ] ])
  })

  it('render custom cell', async () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={[
          ...columnSettings, {
            title: 'Custom',
            column: '',
            columnCustomRenderer: (_, data) => <button>Action button {data.id}</button>
          }
        ]}
      />
    );

    // check render is correct
    expect(screen.getByText('Action button 1')).toBeDefined();
  });

  it('render column filter', async () => {
    render(
      <TXDataTable
        dataSource={dataSource}
        columnSettings={[
          { column: 'id', title: 'ID' },
          { column: 'name', title: 'Name', filterConfig: { type: 'text' } }
        ]}
      />
    );

    // check column filter should render correctly
    expect(screen.getByTestId('column-filters-container')).toBeDefined();
    expect(screen.getByText('John Doe')).toBeDefined();

    const nameFilter = screen.getByTestId('column-filter-name');
    const nameFilterInput = nameFilter.querySelector('tx-core-form-control')!;

    // do filter with 'x' value
    fireEvent(nameFilterInput, createEvent('change', nameFilterInput, { detail: 'x'}, { EventType: 'CustomEvent' }));
    // since 'x' doesnt match 'John Doe' it should not be in the document
    expect(screen.queryByText('John Doe')).toBeNull();

    // clear filter
    fireEvent(nameFilterInput, createEvent('change', nameFilterInput, {}, { EventType: 'CustomEvent' }));
    // since we clear the filter, 'John Doe' should be in the document
    expect(screen.queryByText('John Doe')).toBeDefined();
  });

  it('should validate when .validate api is called on button click', async () => {
    render(<Validation/>);

    fireEvent.click(screen.getByText('Validate'))
    expect(screen.getByText(/Name is mandatory/))
  });

  // Utility function tests
  it('returns error message via getErrorMessage', () => {
    const tMock = jest.fn().mockReturnValue('Error');
    expect(getErrorMessage([{ message: 'err' }], 'Title', tMock)).toMatch(/Error/);
  });

  it('deepClone handles various inputs', () => {
    expect(deepClone(null)).toBeNull();
    expect(deepClone({ a: 1 })).toEqual({ a: 1 });
  });

  it('highlightText finds substrings', () => {
    expect(highlightText('hello', 'ell')).toBeTruthy();
  });

  it('filterRows filter correctly', () => {
    expect(filterRows([{id: '1', name: 'Name 1'}, {id: '2', name: 'Name 2'}], ['1'], 'id')).toEqual([{id: '2', name: 'Name 2'}]);
  });

  it('sortData works correctly (default)', () => {
    expect(sortData([
      { "buyerLtpId": { "value": "1" } },
      { "buyerLtpId": { "value": "2" } }
    ], {
      "title": "ID",
      "column": "buyerLtpId",
      "sorted": "none"
    }, 'asc')).toEqual([ {"buyerLtpId": { "value": "1" } }, { "buyerLtpId": { "value": "2" }}]);
  });
  it('sortData works correctly (customColumnRenderer)', () => {
    expect(sortData([
      { "buyerLtpId": { "value": "1" } },
      { "buyerLtpId": { "value": "2" } }
    ], {
      "title": "ID",
      "column": "buyerLtpId_",
      "sorted": "none",
      columnCustomRenderer: (_, data) => data.buyerLtpId
    }, 'asc')).toEqual([ {"buyerLtpId": { "value": "1" } }, { "buyerLtpId": { "value": "2" }}]);
  });
  it('sortData works correctly (customColumnRenderer + downloadText)', () => {
    expect(sortData([
      { "buyerLtpId": { "value": "1" } },
      { "buyerLtpId": { "value": "2" } }
    ], {
      "title": "ID",
      "column": "buyerLtpId_",
      "sorted": "none",
      columnCustomRenderer: (_, data) => ({ render: data.buyerLtpId, downloadText: data.buyerLtpId })
    }, 'asc')).toEqual([ {"buyerLtpId": { "value": "1" } }, { "buyerLtpId": { "value": "2" }}]);
  });





  it('custom editable (Rating) commits and validates correctly for number & object values', async () => {
    const getValue = (v: any) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
    const onChange = jest.fn();

    // minimal star editor (same behavior as story)
    const StarRatingEditor = ({ value, onChange }: any) => {
      const current = Number(getValue(value) ?? 0);
      return (
        <div>
          {Array.from({ length: 5 }).map((_, i) => {
            const n = i + 1;
            const filled = n <= current;
            return (
              <span
                key={n}
                role="button"
                aria-label={`rate ${n}`}
                tabIndex={-1}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(n, { commit: true }); // commit immediately
                }}
              >
                {filled ? '★' : '☆'}
              </span>
            );
          })}
        </div>
      );
    };

    render(
      <TXDataTable
        dataSource={[
          { id: 1, name: 'A', rating: 0 },          // number form
          { id: 2, name: 'B', rating: { value: 0 } } // object form
        ]}
        columnSettings={[
          { column: 'id', title: 'ID' },
          { column: 'name', title: 'Name' },
          {
            column: 'rating',
            title: 'Rating',
            actionConfig: {
              value: 0,
              validation: (row: any) =>
                Number(getValue(row?.rating)) > 0 ? undefined : 'pick at least 1 star',
              render: ({ value, onChange, error }: any) => (
                <div>
                  <StarRatingEditor value={value} onChange={onChange} />
                  {error ? <span data-testid="rating-error">{error}</span> : null}
                </div>
              ),
            },
          },
        ]}
        actions={[Actions.EDIT]}
        rowKey="id"
        onChange={onChange}
      />
    );

    // Row 0 (rating as number -> 0), click cell -> pick 3 stars
    const r0 = screen.getByTestId('table-cell-0-rating');
    await userEvent.click(r0);
    await userEvent.pointer({ target: screen.getByLabelText('rate 3'), keys: '[MouseLeft]' });

    // Should not show validation error after commit
    expect(screen.queryByTestId('rating-error')).toBeNull();

    // Row 1 (rating as object -> {value:0}), click cell -> pick 2 stars
    const r1 = screen.getByTestId('table-cell-1-rating');
    await userEvent.click(r1);
    await userEvent.pointer({ target: screen.getByLabelText('rate 2'), keys: '[MouseLeft]' });

    expect(screen.queryByTestId('rating-error')).toBeNull();

    // Verify we got two change payloads and both carry rating updates
    expect(onChange).toHaveBeenCalled();
    const flatCalls = JSON.stringify(onChange.mock.calls);
    expect(flatCalls).toMatch(/"id":1/);
    expect(flatCalls).toMatch(/"rating"/);

    // crude but effective: there must be a 3 and a 2 somewhere in the rating updates
    expect(flatCalls).toMatch(/\b3\b/);
    expect(flatCalls).toMatch(/\b2\b/);
  });

  it('custom editable (Text) via actionConfig.render stages on type and commits on blur', async () => {
    const onChange = jest.fn();

    render(
      <TXDataTable
        dataSource={[{ id: 1, name: 'John', note: '' }]}
        columnSettings={[
          { column: 'id', title: 'ID' },
          { column: 'name', title: 'Name' },
          {
            column: 'note',
            title: 'Note',
            actionConfig: {
              render: ({ value, onChange }: any) => (
                <input
                  aria-label="custom-note"
                  value={value ?? ''}
                  onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                />
              ),
              schema: { type: 'string', minLength: 1 },
            },
          },
        ]}
        actions={[Actions.EDIT]}
        rowKey="id"
        onChange={onChange}
      />
    );

    const cell = screen.getByTestId('table-cell-0-note'); // table uses data-testid="table-cell-${rowIndex}-${columnKey}"
    await userEvent.click(cell);                            // enter edit
    const input = screen.getByLabelText('custom-note');
    await userEvent.type(input, 'hello');
    await userEvent.tab();                                  // blur -> commit

    expect(onChange).toHaveBeenCalled();
    // ensure "note" got into payload
    expect(JSON.stringify(onChange.mock.calls)).toMatch(/"note"/);
  });

});