import React from 'react';
import { TxCoreIcon } from 'tradeport-web-components/dist/react';
import * as SC from './styled';
import { withState, IComponent } from '../../GlobalStateProvider';
import { TXInput } from '@atoms/TXInput';

export const Footer = withState({
  states: [
    'filteredData',
    'pageIndex',
    'pageSize',
    'fetchedData',
    'fetchConfig',
    'onPageIndexChange',
    'onPageSizeChange',
    'fetchWithPagination',
    'totalItems',
    'disabledPagination',
    'isAllColumnHidden',
    'onRefreshIconClick',
    'isDisablePageSizeChange',
    'minPageSize'
  ],
})(React.memo((props: IComponent) => {
  const {
    filteredData,
    pageIndex,
    pageSize,
    fetchedData,
    fetchConfig,
    onPageIndexChange,
    onPageSizeChange,
    fetchWithPagination,
    totalItems,
    disabledPagination,
    isAllColumnHidden,
    onRefreshIconClick,
    isDisablePageSizeChange,
    minPageSize,
    setGlobalStateByKey,
    setGlobalStateByObj,
  } = props;

  const totalData = totalItems !== undefined ? totalItems : fetchConfig ? fetchedData?.totalData : filteredData?.length || 0;
  const noData = totalData === 0
  const totalPages = Math.ceil(totalData / pageSize);
  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalData);
  const isLastPage = totalData === 0 || pageIndex >= totalPages - 1;
  const isFirstPage = pageIndex === 0;
  const isDisabled = isNaN(pageIndex);

  const handlePageIndexChange = React.useCallback((index: number) => {
    onPageIndexChange?.(index);
    setGlobalStateByKey('pageIndex', index);
  }, [pageSize]);

  const handlePageSizeChange = (value: string) => {
    const parsedValue = parseInt(value, 10);
    const isNullValue = value === null;

    const newSize = !isNullValue && parsedValue !== 0 ? parsedValue : minPageSize;
    onPageSizeChange?.(newSize);
    onPageIndexChange?.(0);

    setGlobalStateByObj({
      pageSize: newSize,
      pageIndex: 0
    });
  };

  const handleOnRefresh = () => fetchWithPagination();

  const handleOnRefreshIconClick = () => onRefreshIconClick?.();

  return (
    <SC.TableFooter>
      {(totalData > 0 && !isAllColumnHidden) ? (
        <SC.InfoContainer title={`Displaying ${!isNaN(start) ? start : 0} to ${!isNaN(end) ? end : 0} of ${totalData} Records`}>
          Displaying {!isNaN(start) ? start : 0} to {!isNaN(end) ? end : 0} of {totalData} Records
          {fetchConfig && (
            <SC.RefreshContainer onClick={handleOnRefresh}>
              <TxCoreIcon icon='refresh'/>
            </SC.RefreshContainer>
          )}
          {onRefreshIconClick && (
            <SC.RefreshContainer onClick={handleOnRefreshIconClick} data-testid='footer-refresh-icon'>
              <TxCoreIcon icon='refresh'/>
            </SC.RefreshContainer>
          )}
        </SC.InfoContainer>
      ) : (
        <SC.InfoContainer>
          No Data To Display
        </SC.InfoContainer>
      )}
      
      <SC.PaginationContainer data-testid="footer-pagination-container">
        <span>Rows</span>
        <TXInput
          type='dropdown'
          size='sm'
          rawValueOnChange
          value={!isDisabled ? pageSize : 0}
          onChange={handlePageSizeChange}
          placeholder={minPageSize}
          disabled={isDisabled || isAllColumnHidden || disabledPagination || noData || isDisablePageSizeChange}
          options={[
            {value: '5', text: '5'},
            {value: '10', text: '10'},
            {value: '15', text: '15'},
            {value: '20', text: '20'},
            {value: '25', text: '25'},
            {value: '30', text: '30'},
            {value: '35', text: '35'},
            {value: '40', text: '40'},
            {value: '45', text: '45'},
            {value: '50', text: '50'},
          ]}
        />
        <button
          title='First'
          onClick={() => handlePageIndexChange(0)}
          disabled={isDisabled || isAllColumnHidden || disabledPagination || isFirstPage || noData}
        >
          <TxCoreIcon icon='chevron-left-to-line'/>
        </button>
        <button
          title='Previous'
          onClick={() => handlePageIndexChange(Math.max(pageIndex - 1, 0))}
          disabled={isDisabled || isAllColumnHidden || disabledPagination || isFirstPage || noData}
        >
          <TxCoreIcon icon='chevron-left'/>
        </button>
        <span style={{ margin: '0 8px' }}>{!isDisabled ? pageIndex + 1 : 0}</span>
        <button
          title='Next'
          onClick={() => handlePageIndexChange(Math.min(pageIndex + 1, totalPages - 1))}
          disabled={isDisabled || isAllColumnHidden || disabledPagination || isLastPage || noData}
        >
          <TxCoreIcon icon='chevron-right'/>
        </button>
        <button
          title='Last'
          onClick={() => handlePageIndexChange(totalPages - 1)}
          disabled={isDisabled || isAllColumnHidden || disabledPagination || isLastPage || noData}
        >
          <TxCoreIcon icon='chevron-right-to-line'/>
        </button>
      </SC.PaginationContainer>
    </SC.TableFooter>
  );
}));
