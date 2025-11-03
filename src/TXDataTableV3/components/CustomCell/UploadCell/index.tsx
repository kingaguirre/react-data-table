import React, { useRef, useState } from 'react';
import { TxCoreIcon, TxCoreButton } from 'tradeport-web-components/dist/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import { useCheckOverflow } from "../../../utils";
import * as SC from "./styled";
import { TXModal } from '@atoms/TXModal';
import { formatDate } from "@utils/formatDate";

interface IProps {
  fileName?: any;
  editable?: boolean;
  onFileChange?: (file: File | null, data?: any) => void; // Callback function to return file details
  accept?: string; // Prop to customize selectable file types
  data?: any
}
export default (props: IProps) => {
  const { editable = false, onFileChange, accept = "*", data } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(props.fileName);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fileUploadDate, setFileUploadDate] = useState<string | null>(null);
  const uploadCellRef: any = useRef(null);
  const { addElement, ellipsisMap } = useCheckOverflow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cellKey = useRef(`id-${Date.now()}`).current;
  const hasEllipsis = ellipsisMap.get(cellKey);
  const isRowDeleted = data?.intentAction === "D";
  const isEditable = editable && !isRowDeleted;

  const handleUploadCellClick = () => {
    if (isEditable) {
      setIsModalOpen(true);
    }
  };

  const handleDelete = () => {
    setIsEditing(true);
    setCurrentFileName("");
    setUploadedFile(null);
    setFileUploadDate(null);
    if (onFileChange) {
      onFileChange(null, null); // Call the callback with null when the file is deleted
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCurrentFileName(file.name);
      setUploadedFile(file);
      setIsEditing(false);
      setFileUploadDate(formatDate(new Date(), 'DD-MON-YYYY hh:mm:ss'));
      if (onFileChange) {
        onFileChange(file, data); // Call the callback with the file details
      }
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentFileName;
      document.body.appendChild(link); // Required for FF
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    }
  };

  const onBrowseFileClick = () => fileInputRef?.current?.click();

  return (
    <>
      <SC.UploadCellContainer ref={uploadCellRef} editable={isEditable} onClick={handleUploadCellClick}>
        <SC.FileName
          ref={node => addElement(node, cellKey)}
        >
          {currentFileName ? currentFileName : isEditable ? "Select File." : "No File."}
        </SC.FileName>
        {uploadedFile && (
          <SC.DownloadFileContainer onClick={handleDownload}>
            <TxCoreIcon icon="arrow-down-box" />
          </SC.DownloadFileContainer>
        )}
      </SC.UploadCellContainer>
      {hasEllipsis && <Tippy content={currentFileName} placement="bottom" reference={uploadCellRef} />}
      <TXModal
        zIndex={10002}
        modalWidth="450px"
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <SC.UploadFileContainer>
          <p>Attach document</p>
          {!currentFileName || isEditing ? (
            <SC.FileInpuContainer>
              <TxCoreButton
                onButtonClick={onBrowseFileClick}
                variation="primary"
                size="small"
              >
                Browse File&nbsp;<TxCoreIcon icon="add" />
              </TxCoreButton>
              <input
                type="file"
                hidden
                accept={accept}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <SC.SelectFileText>Select the file</SC.SelectFileText>
            </SC.FileInpuContainer>
          ) : (
            <SC.FileContainer>
              <SC.FileDetails>
                <div>{currentFileName}</div>
                <div>
                  <div>{((uploadedFile?.size || 0) / 1024).toFixed(2)} KB</div>
                  <div>{fileUploadDate}</div>
                </div>
              </SC.FileDetails>
              <SC.DeleteContainer>
                <TxCoreIcon icon="trash" onClick={handleDelete}/>
              </SC.DeleteContainer>
            </SC.FileContainer>
          )}
        </SC.UploadFileContainer>
      </TXModal>
    </>
  );
};