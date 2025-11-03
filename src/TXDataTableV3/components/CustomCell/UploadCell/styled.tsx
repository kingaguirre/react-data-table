import styled from 'styled-components';

export const UploadCellContainer = styled.div<React.PropsWithChildren<{editable?: boolean, ref?: any, onClick?: any}>>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  cursor: ${({ editable }) => (editable ? 'pointer' : 'default')};
  ${({ editable }) => (editable ? `
    cursor: pointer;
    border: 1px solid #ccc;
    padding: 2px 6px;
  ` : `
    cursor: default;
  `)};
`;

export const FileName = styled.div<React.PropsWithChildren<{ref?: any}>>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 20px);
  margin-right: 0;
`;

export const DownloadFileContainer = styled.div<React.PropsWithChildren<{onClick?: any}>>`
  color: var(--color-primary-dark);
  &:hover {
    color: var(--color-primary-darker);
  }
`;

export const UploadFileContainer = styled.div`
  padding: 16px;
  > p {
    font-weight: bold;
    color: var(--color-primary-dark);
    font-size: 10px;
    text-transform: uppercase;
    margin: 0 0 12px;
  }
`;

export const FileContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  i > {
    width: 20px;
  }
`;

export const FileDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  line-height: 1.2;
  background: var(--color-light-a);
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 2px;
  font-weight: 500;
  > div > div {
    font-size: 10px;
    text-align: right;
    word-break: break-word;
    &:last-child {
      width: 120px;
    }
  }
`;

export const DeleteContainer = styled.div`
  padding: 6px 0 6px 12px;
  > * {
    font-size: 16px;
    cursor: pointer;
    color: var(--color-primary-dark);
    &:hover {
      color: var(--color-primary-darker);
    }
  }
`;

export const FileInpuContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const SelectFileText = styled.div`
  padding-left: 12px;
  color: var(--color-neutral);
  font-size: 12px;
  align-self: center;
  font-style: italic;
`;
