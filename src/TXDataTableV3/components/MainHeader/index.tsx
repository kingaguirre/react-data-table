import React, { useState, useCallback, useEffect, useRef } from "react";
import { TxCoreFormControl, TxCoreButton, TxCoreIcon } from 'tradeport-web-components/dist/react';
import { setColumnSettings, isStringExist, setDeepValue, downloadExcel } from "../../utils";
import AdvanceFilter from "../AdvanceFilter";
import { TXConfirmModal } from '@atoms/TXConfirmModal';
import { UploadButton } from './UploadButton';
import { Actions } from "../../interfaces";
import { withState, IComponent } from '../../GlobalStateProvider';
import * as SC from "./styled";

export const MainHeader = withState({
  states: [
    'downloadXLS',
    'maxRowDownload',
    'columnSettings',
    'headerSearchSettings',
    'filterSettings',
    'filteredData',
    'customRowSettings',
    'actions',
    'onAddRow',
    'rowKey',
    'columns',
    'search',
    'selectedRows',
    'tableWidth',
    'fetchedData',
    'ssrConfig',
    'onColumnSettingsChange',
    'editingCells',
    'fetchConfig',
    'hasAnyFilterConfig',
    'headerRightControls',
    'isAddDisabled',
    'selectable',
    'rightPanelToggleButtonRef',
    'headerMainContent',
    'headerLeftContent',
    'headerRightContent',
    'isAllColumnHidden',
    'onResetIconClick',
    'headerRightIcons',
    'isDownloadDisabled',
    'withDownloadUploadAction',
    'downloadFileName',
    'localStorageSettingsKey',
    'showReset',
    'actionColumnSetting',
    'actionsDropdownItems',
    'downloadHiddenColumn',
    'onDownloadAllClick',
    'onDownloadSelectedClick',
    'disableDefaultDownload',
    'disableDefaultDownloadSelected',
    'downloadAllText',
    'downloadAllIcon',
    'downloadSelectedText',
    'downloadSelectedIcon',
    'downloadDropdownWidth'
  ],
})(React.memo((props: IComponent) => {
  const {
    downloadXLS,
    maxRowDownload,
    columnSettings,
    headerSearchSettings,
    filterSettings,
    filteredData,
    customRowSettings,
    actions,
    onAddRow,
    rowKey,
    columns,
    search,
    selectedRows,
    tableWidth,
    fetchedData,
    ssrConfig,
    onColumnSettingsChange,
    editingCells,
    fetchConfig,
    hasAnyFilterConfig,
    headerRightControls,
    isAddDisabled,
    selectable,
    rightPanelToggleButtonRef,
    headerMainContent,
    headerLeftContent,
    headerRightContent,
    setGlobalState,
    setGlobalStateByKey,
    setGlobalStateByObj,
    isAllColumnHidden,
    onResetIconClick,
    headerRightIcons,
    isDownloadDisabled,
    withDownloadUploadAction = false,
    downloadFileName,
    localStorageSettingsKey,
    showReset = true,
    actionColumnSetting,
    actionsDropdownItems,
    downloadHiddenColumn,
    onDownloadAllClick,
    onDownloadSelectedClick,
    disableDefaultDownload,
    disableDefaultDownloadSelected,
    downloadAllText,
    downloadAllIcon,
    downloadSelectedText,
    downloadSelectedIcon,
    downloadDropdownWidth
  } = props;

  const downloadDropdownRef: any = useRef(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [modalSettings, setModalSettings] = useState<any>({
    show: false,
    bodyContent: null,
    buttons: [],
    title: '',
    variation: '',
    icon: '',
  });

  const hasAddAction = isStringExist(actions, Actions.ADD);
  const dataSource = fetchConfig ? fetchedData.data : filteredData;
  /** Check if the user is adding a new row */
  const isAddState = editingCells?.some(i => i?.isNew === true) || dataSource?.find(i => i.intentAction === '*');
  /** Check if user is editing a cell */
  const isEditableState =  editingCells?.some(i => i?.editable === true)
  const _isAddDisabled = isAddState || isAddDisabled || isEditableState;
  const downloadAllDisabled = !dataSource || dataSource.length === 0 || isAllColumnHidden || isDownloadDisabled || isEditableState || isAddState;
  const _isUploadDisabled = isEditableState || isAddState;
  const hasSSRDownload = ssrConfig?.onDownloadAllClick;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current?.contains(event.target)
      ) {
        setShowDownloadDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (event: any) => {
    const value = event.target.value;
    setGlobalStateByKey('search', value !== null ? value : '');
  };

  const handleClearSearch = (event: any) => {
    const value = event.target.value;
    if (value === null) {
      setGlobalStateByKey('search', '');
    }
  };

  const handleKeyPress = useCallback((e: any) => {
    const keyCode = e.keyCode || e.which;

    if (keyCode === 13) {
      doSearch(e.target.value);
    } else if (keyCode === 32) {
      e.preventDefault();
    }
  }, []);

  const doSearch = useCallback((value?: string | null) => {
    setGlobalStateByObj({
      search: value !== null ? value : '',
      ...(ssrConfig?.fetchPageData !== undefined) ? {
        pageIndex: 0
      }: {
        isFetching: true
      }
    });
  }, []);

  const handleResetClick = () => {
    sessionStorage.removeItem(`${localStorageSettingsKey}-currentColumnSettings`);
    const newColumnSettings = setColumnSettings(
      columnSettings,
      tableWidth - 12,
      customRowSettings,
      actions,
      actionColumnSetting,
      localStorageSettingsKey,
      actionsDropdownItems
    );

    setGlobalStateByKey('columns', newColumnSettings);
    onResetIconClick?.(newColumnSettings);
    onColumnSettingsChange(newColumnSettings)
  };

  const handleClearFilters = () => {
    setGlobalStateByObj({
      filterValues: {},
      advanceFilterValues: {},
      search: ""
    });
  };

  const setFilterValues = (values: any) => setGlobalStateByKey('advanceFilterValues', values);
 
  const handleOnAddRow = () => {
    const newData = setDeepValue({
      intentAction: "*"
    }, rowKey, `new-${new Date().getTime()}`);
    onAddRow(newData, undefined, true);
    
    /** Remove any editing cells data on first row if there's any */
    setGlobalStateByKey('editingCells', editingCells.filter((cell: any) => cell.rowIndex !== 0));
  };

  const handleDownload = async (data, isSelected = false) => {
    if (hasSSRDownload) {
      const ssrDownloadData = await Promise.resolve(ssrConfig?.onDownloadAllClick?.());
      if (ssrDownloadData !== false) {
        if (ssrDownloadData.length > 0) {
          downloadExcel(columns, isSelected ? data : ssrDownloadData, rowKey, withDownloadUploadAction, downloadFileName, downloadHiddenColumn);
        } else {
          setModalSettings({
            title: 'Error',
            variation: 'Danger',
            icon: 'alert',
            show: true,
            bodyContent: <div>No data to download.<br/>Please check and try again.</div>,
            buttons: [{
              size: "small",
              onButtonClick: () => setModalSettings((prev) => ({...prev, show: false})),
              text: "Ok"
            }]
          });
        }
      }
    } else {
      if (!!maxRowDownload && maxRowDownload > 0 && maxRowDownload < data.length) {
        setModalSettings({
          title: 'Confirm',
          variation: 'info',
          icon: 'info',
          show: true,
          bodyContent: <SC.ModalContentContainer>The file contains more than <b>{maxRowDownload}</b> rows. Only the first <b>{maxRowDownload}</b> rows will be downloaded. Do you want to proceed?</SC.ModalContentContainer>,
          buttons: [{
            size: "small",
            onButtonClick: () => {
              if ((!!disableDefaultDownload && !isSelected) || (!!disableDefaultDownloadSelected && !!isSelected)) {
                // do nothing
              } else {
                downloadExcel(columns, data?.slice(0, maxRowDownload), rowKey, withDownloadUploadAction, downloadFileName, downloadHiddenColumn);
              }

              /** Returns click event when download menus are clicked */
              if (isSelected) {
                onDownloadSelectedClick?.(data);
              } else {
                onDownloadAllClick?.(data);
              }
              setModalSettings((prev) => ({...prev, show: false}))
            },
            text: "Proceed"
          }]
        });
      } else {
        if ((!!disableDefaultDownload && !isSelected) || (!!disableDefaultDownloadSelected && !!isSelected)) {
          // do nothing
        } else {
          downloadExcel(columns, data, rowKey, withDownloadUploadAction, downloadFileName, downloadHiddenColumn);
        }

        /** Returns click event when download menus are clicked */
        if (isSelected) {
          onDownloadSelectedClick?.(data);
        } else {
          onDownloadAllClick?.(data);
        }
      }
    }
    setShowDownloadDropdown(false);
  };

  return (
    <SC.MainHeaderWrapper className='main-header-wrapper' data-testid='main-header-wrapper'>
      <div>
        {headerMainContent}
        {headerSearchSettings !== false && (
          <SC.SearchWrapper
            title="Search"
            style={{
              width: headerSearchSettings?.width,
              maxWidth: headerSearchSettings?.width,
            }}
          >
            <TxCoreFormControl
              type="text"
              value={search || ""}
              placeholder={headerSearchSettings?.placeholder || "Search..."}
              size="small"
              disabled={isAllColumnHidden}
              {...(!search ? {
                icon: "search",
                iconColor: "var(--color-primary)"
              } : {
                onChange: handleClearSearch
              })}
              {...((!!fetchConfig || ssrConfig?.fetchPageData) ? {
                onKeyPress: handleKeyPress
              } : {
                onChange: handleSearchChange
              })}
            />
          </SC.SearchWrapper>
        )}
        {headerLeftContent}
        {!!filterSettings && !!filterSettings.length && (
          <AdvanceFilter
            filterSettings={filterSettings}
            onApply={(values) => setFilterValues(values)}
            onChange={(data) => console.log(data)}
          />
        )}
        {(hasAnyFilterConfig || (!!filterSettings && !!filterSettings.length)) && (
          <TxCoreButton
            size="sm"
            onButtonClick={() => handleClearFilters()}
          >
            Clear Filters
          </TxCoreButton>
        )}
      </div>
      <SC.ControlsWrapper>
        {headerRightContent}
        {hasAddAction && (
          <TxCoreButton
            size="sm"
            variation="primary"
            disabled={_isAddDisabled}
            onButtonClick={handleOnAddRow}
          >
            Add New
          </TxCoreButton>
        )}
        {(headerRightControls || downloadXLS || hasSSRDownload || headerRightIcons) && (
          <div>
            {headerRightIcons?.map((item, i) => (
              <button key={`icon-${i}`} title={item.title} onClick={item.onIconClick}>
                <TxCoreIcon icon={item.icon || 'question'}/>
              </button>
            ))}
            {(downloadXLS || hasSSRDownload) && (
              <SC.DownloadWrapper
                disabled={downloadAllDisabled }
                title="Download"
                ref={downloadDropdownRef}
              >
                <button data-testid="download-all-icon" onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}>
                  <TxCoreIcon icon="arrow-down-box"/>
                </button>
                {showDownloadDropdown && (
                  <SC.DownloadDropdown $downloadDropdownWidth={downloadDropdownWidth}>
                    <span data-testid='download-all-menu' onClick={() => handleDownload(dataSource)}>
                      {downloadAllIcon && <TxCoreIcon icon={downloadAllIcon} />}
                      {downloadAllText ?? 'Download All'}
                    </span>
                    {selectable && (
                      <span
                        {...(selectedRows?.length > 0 ? {
                          onClick: () => handleDownload(selectedRows, true)
                        } : { className: 'disabled' })}
                      >
                        {downloadSelectedIcon && <TxCoreIcon icon={downloadSelectedIcon} />}
                        {downloadSelectedText ?? 'Download selected'}
                      </span>
                    )}
                  </SC.DownloadDropdown>
                )}
                  <TXConfirmModal
                    {...modalSettings}
                    onClose={() => setModalSettings(prev => ({...prev, show: false}))}
                  />
              </SC.DownloadWrapper>
            )}
            <UploadButton _isUploadDisabled={_isUploadDisabled}/>
            {headerRightControls && (
              <>
                <button title="Settings" ref={rightPanelToggleButtonRef} onClick={() => {
                  setGlobalState(prev => ({...prev, rightPanelToggle: !prev.rightPanelToggle}));
                }}>
                  <TxCoreIcon icon="gear"/>
                </button>
                {
                  showReset &&
                  <button title="Reset" onClick={handleResetClick}>
                    <TxCoreIcon icon="redo" />
                  </button>
                }
              </>
            )}
          </div>
        )}
      </SC.ControlsWrapper>
    </SC.MainHeaderWrapper>
  )
}));
