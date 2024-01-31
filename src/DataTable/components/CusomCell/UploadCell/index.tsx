import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // optional
import { useCheckOverflow } from "../../../utils";

// Styled components
const BoxContainer = styled.div<{editable: boolean}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
  border: 1px solid #ccc;
  font-size: 12px;
  cursor: ${({ editable }) => (editable ? 'pointer' : 'default')};
`;

const FileName = styled.div`
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  background: white;
  border: 1px solid #ccc;
  z-index: 100;
`;

const ModalContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: black;
  break-all: break-word;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 10002;
`;


interface IProps {
  fileName?: any;
  editable?: boolean;
  onFileChange?: (file: File | null) => void; // Callback function to return file details
  accept?: string; // Prop to customize selectable file types
}
export default (props: IProps) => {
  const { editable = false, onFileChange, accept = "*" } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(props.fileName);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const uploadCellRef = useRef(null);
  const { addElement, ellipsisMap } = useCheckOverflow();

  const cellKey = useRef(`id-${Date.now()}`).current;
  const hasEllipsis = ellipsisMap.get(cellKey);

  const handleBoxClick = () => {
    if (editable) {
      setIsModalOpen(true);
    }
  };

  const handleDelete = () => {
    setIsEditing(true);
    setCurrentFileName("");
    setUploadedFile(null);
    if (onFileChange) {
      onFileChange(null); // Call the callback with null when the file is deleted
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setCurrentFileName(file.name);
      setUploadedFile(file);
      setIsEditing(false);
      if (onFileChange) {
        onFileChange(file); // Call the callback with the file details
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

  return (
    <>
      <BoxContainer ref={uploadCellRef} editable={editable} onClick={handleBoxClick}>
        <FileName
          ref={node => addElement(node, cellKey)}
        >{currentFileName || "Select File..."}</FileName>
        {uploadedFile && <i className="fa fa-download" onClick={handleDownload}/>}
      </BoxContainer>
      {hasEllipsis && <Tippy content={currentFileName} placement="bottom" reference={uploadCellRef} />}
      {isModalOpen && ReactDOM.createPortal(
        <Overlay onClick={() => setIsModalOpen(false)}>
          <ModalContainer>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              {!currentFileName || isEditing ? (
                <input type="file" onChange={handleFileChange} accept={accept} />
              ) : (
                <>
                  {currentFileName}
                  <i className="fa fa-trash" onClick={handleDelete}/>
                </>
              )}
            </ModalContent>
          </ModalContainer>
        </Overlay>
      , document.body)}
    </>
  );
};
