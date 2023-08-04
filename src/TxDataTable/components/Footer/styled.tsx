import styled from 'styled-components';

export const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  padding: 14px 16px;
  border: 1px solid #d4d4d4;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`;

export const InfoContainer = styled.div`
  color: #6d6e71;
  font-size: 14px;
`;

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  > * {
    margin: 0 4px;
  }
  button {
    background-color: white;
    border: 1px solid #ddd;
    color: #222;
    cursor: pointer;
    &:disabled {
      cursor: not-allowed;
      background-color: #eee;
    }
  }
`;