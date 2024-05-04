import styled from 'styled-components';

export const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-top: none;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`;

export const InfoContainer = styled.div`
  color: #222;
  font-size: 10px;
  text-transform: uppercase;
`;

export const PaginationContainer = styled(InfoContainer)`
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