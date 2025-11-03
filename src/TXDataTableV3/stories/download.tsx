import React from 'react';
import { TXDataTable } from '../index';
import { Container, ActionsContainer } from './utils';
import { DUMMY_DATA_SOURCE, DOWNLOAD_COLUMN_SETTINGS, CUSTOM_ROW_SETTINGS } from '../data';
import { TxCoreFormControl, TxCoreButton } from 'tradeport-web-components/dist/react';
import { UploadSummary, DownloadSummary } from './UploadDownloadSummary'
import { Actions } from '../interfaces';

export default () => {
  const [maxdownLoad, setMaxdownLoad] = React.useState<any>(undefined);
  const [maxupload, setMaxupload] = React.useState<any>(undefined);
  const [withDownloadUploadAction, setWithDownloadUploadAction] = React.useState<any>(false);
  const [pageIndex, setPageIndex] = React.useState<any>(undefined);
  const dataTableRef = React.createRef<any>();
  const [invalidData, setInvalidData] = React.useState<any>(undefined);

  const handleValidate = () => {
    if (dataTableRef.current) {
      const validateData = dataTableRef.current.validate();
      setInvalidData(validateData)
      console.log(validateData)
    }
  };

  return (
    <Container>
      <h2>TX Data Table V3</h2>
      <p>Data-table with download/upload excel capability using <b>downloadXLS</b> and <b>downloadXLS</b>.</p>
      <TXDataTable
        ref={dataTableRef}
        dataSource={DUMMY_DATA_SOURCE}
        columnSettings={DOWNLOAD_COLUMN_SETTINGS}
        onChange={(data) => console.log(data)}
        customRowSettings={CUSTOM_ROW_SETTINGS}
        rowKey="id"
        showPreviousValue
        pageSize={10}
        actions={[Actions.ADD]}
        // selectionRange

        /** Demo props */
        downloadXLS
        uploadXLS
        multiSelect
        selectable
        maxRowDownload={maxdownLoad}
        maxRowUpload={maxupload}
        withDownloadUploadAction={withDownloadUploadAction}
        downloadFileName='test-file-name'

        downloadAllText='Download All to Excel'
        downloadAllIcon='arrow-down-box'
        downloadSelectedIcon='arrow-down-box'
        downloadSelectedText='Download Selected to Excel'
        downloadDropdownWidth={210}
        

        disableDefaultDownload
        disableDefaultDownloadSelected
        onDownloadAllClick={() => console.log('Download all is clicked!')}
        onDownloadSelectedClick={() => console.log('Download selected is clicked!')}

        // isDownloadDisabled
        // isUploadDisabled
        // onServerSideUpload={(file) => console.log("Server side upload is enable. file: ", file)}

        onDataChange={(val) => {
          setPageIndex(val?.pageIndex)
        }}
        pageIndex={pageIndex}
      />
      <ActionsContainer>
        <p>Actions</p>
        <div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Set max row download"
              onChange={(value) => setMaxdownLoad(!!value.detail ? 20 : undefined)}
              text="20"
              checked={maxdownLoad === 20}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Set max row upload"
              onChange={(value) => setMaxupload(!!value.detail ? 5 : undefined)}
              text="5"
              checked={maxupload === 5}
              simple
            />
          </div>
          <div>
            <TxCoreFormControl
              type="checkbox"
              label="Use 'withDownloadUploadAction' feature"
              onChange={(value) => setWithDownloadUploadAction(value.detail)}
              text="Enabled"
              checked={withDownloadUploadAction}
              simple
            />
          </div>
          <div>
            <TxCoreButton onButtonClick={() => setPageIndex(0)}>Set to pageIndex 1</TxCoreButton>
          </div>
          
          <div>
            <div>
              <TxCoreButton onButtonClick={() => handleValidate()}>Validate Table</TxCoreButton>
            </div>
            <div>
              <code>{JSON.stringify(invalidData)}</code>
            </div>
          </div>

        </div>
      </ActionsContainer>
      <UploadSummary/>
      <DownloadSummary/>
    </Container>
  )
}