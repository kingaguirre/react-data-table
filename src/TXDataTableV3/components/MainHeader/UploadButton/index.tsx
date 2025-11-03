import React, { useRef, ChangeEvent, useState } from "react";
import { TxCoreIcon } from 'tradeport-web-components/dist/react';
import { updateDataSourceFromExcelWithoutMutation, generateSelectedCells } from "../../../utils";
import * as XLSX from 'xlsx';
import { withState, IComponent } from '../../../GlobalStateProvider';
import { updateData } from './utils';
import { TXConfirmModal } from '@atoms/TXConfirmModal';
import styled from 'styled-components';
import { ModalContentContainer } from '../styled';

const Container = styled.div<any>`
  ${({disabled}) => !!disabled ? `
    cursor: not-allowed;
    color: var(--color-neutral);
    background-color: var(--color-light-a) !important;
    > button {
      pointer-events: none;
      color: var(--color-neutral)!important;
    }
  ` : ''}
`

export const UploadButton = withState({
  states: [
    'uploadXLS',
    'fetchConfig',
    'rowKey',
    'columns',
    'fetchedData',
    'localData',
    'onChange',
    'onServerSideUpload',
    'withDownloadUploadAction',
    'isUploadDisabled',
    'maxRowUpload'
  ],
})(React.memo((props: IComponent) => {
  const {
    uploadXLS,
    fetchConfig,
    rowKey,
    columns,
    fetchedData,
    localData,
    onChange,
    onServerSideUpload,
    withDownloadUploadAction = false,
    isUploadDisabled,
    maxRowUpload,
    setGlobalStateByKey,

    /** Component props */
    _isUploadDisabled
  } = props;

  const uploadRef = useRef(null);
  const [hasInvalidColumn, setHasInvalidColumn] = useState<boolean>(false);
  const [modalSettings, setModalSettings] = useState<any>({
    show: false,
    bodyContent: null,
    buttons: [],
    title: '',
    variation: '',
    icon: '',
  });

  // Handler for file selection and reading
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!!onServerSideUpload) {
      onServerSideUpload(files);
      if (uploadRef.current) {
        (uploadRef.current as any).value = '';
      }
    } else {
      if (files && files[0]) {
        const file = files[0];
        const reader = new FileReader();
  
        reader.onload = (e: any) => {
          const binaryStr = e.target.result;
          const workbook = XLSX.read(binaryStr, {type: 'binary'});
          // For example, log the first sheet's data to the console
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const fileData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  
          if (maxRowUpload !== undefined && maxRowUpload > 0 && maxRowUpload < fileData.length) {
            setModalSettings({
              title: 'Confirm',
              variation: 'info',
              icon: 'info',
              show: true,
              bodyContent: <ModalContentContainer>The file contains more than <b>{maxRowUpload}</b> rows. Only the first <b>{maxRowUpload}</b> rows will be processed. Do you want to proceed?</ModalContentContainer>,
              buttons: [{
                size: "small",
                onButtonClick: () => {
                  processData(fileData);
                  setModalSettings((prev) => ({...prev, show: false}))
                },
                text: "Proceed"
              }]
            });
          } else {
            processData(fileData);
          }

        };
        
        reader.readAsBinaryString(file);
      }
    }
  };

  const handleInvalidCol = (_hasInvalidCol) => {
    if (_hasInvalidCol) {
      setHasInvalidColumn(true);
      setModalSettings({
        title: 'Alert',
        variation: 'warning',
        icon: 'info-circle',
        show: true,
        bodyContent: <ModalContentContainer>Column header mismatch. Please check the file and retry.</ModalContentContainer>,
        buttons: [{
          size: "small",
          onButtonClick: () => setModalSettings((prev) => ({...prev, show: false})),
          text: "Ok"
        }]
      });
    }
  };

  const processData = (fileData: any[]) => {
    const limitedData = maxRowUpload ? fileData?.slice(0, maxRowUpload) : fileData;

    // Generate selected_cells array to pass in updateDataSourceFromExcelWithoutMutation function
    const selectedCells = generateSelectedCells(limitedData, columns, rowKey, withDownloadUploadAction);

    const uploadedData = updateDataSourceFromExcelWithoutMutation(limitedData, selectedCells, rowKey, columns, undefined, handleInvalidCol);

    if (fetchConfig) {
      const newFetchedData = [...uploadedData, ...(fetchedData.data || [])];
      setGlobalStateByKey('fetchedData', { ...fetchedData, data: newFetchedData });
      onChange?.(newFetchedData);
    } else {
      const newLocalData = withDownloadUploadAction ? updateData(uploadedData, localData, rowKey) : [...uploadedData, ...(localData || [])];
      setGlobalStateByKey('localData', newLocalData);
      onChange?.(newLocalData);
    }

    /** Fix issue where the uploading is not triggering when same file is uploaded consecutively */
    if (uploadRef.current) {
      (uploadRef.current as any).value = '';
    }
  };

  return uploadXLS && (
    <Container title="Upload" disabled={isUploadDisabled || _isUploadDisabled}>
      <input
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
        ref={uploadRef}
      />
      <button disabled={isUploadDisabled || _isUploadDisabled} onClick={() => {
        if (uploadRef && uploadRef?.current) {
          (uploadRef?.current as any)?.click();
        }
      }}>
        <TxCoreIcon icon="arrow-up-box"/>
        <i className="fa fa-upload" />
      </button>
      {(maxRowUpload !== undefined || hasInvalidColumn) && (
        <TXConfirmModal
          {...modalSettings}
          onClose={() => setModalSettings(prev => ({...prev, show: false}))}
        />
      )}
    </Container>
  )
}));
