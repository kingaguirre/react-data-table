import styled from 'styled-components';

export const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  padding: 8px 16px;
  border: 1px solid var(--color-neutral-pale);
  border-top: none;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  min-height: 42px;
  flex-wrap: wrap;
  > *:first-child {
    padding: 6px 0;
  }
`;

export const InfoContainer = styled.div<any>`
  color: var(--color-neutral-dark);
  font-size: 12px;
  display: flex;
  align-items: center;
`;

export const PaginationContainer = styled<any>(InfoContainer)`
  justify-content: flex-end;
  font-size: 12px;
  color: var(--color-neutral-dark);
  margin: 0 -5px;
  > * {
    margin: 0 5px;
    min-height: auto;
  }
  .input-placeholder-container {
    display: none;
  }
  tx-core-form-control {
    width: 50px;
  }
  button {
    padding: 0;
    background-color: white;
    cursor: pointer;
    width: 16px;
    height: 24px;
    border-radius: 2px;
    border: 0.5px solid var(--color-neutral-pale);
    box-shadow: 0px 1px 3px 0px #0000001F;
    border-radius: 2px;
    transition: all .3s ease;
    &:hover:not(:disabled) {
      border-color: var(--color-primary);
      background-color: var(--color-primary);
      color: white;
      > * {
        color: white;
      }
    }
    > * {
      color: var(--color-neutral-dark);
      font-size: 8px;
    }

    &:disabled {
      cursor: not-allowed;
      background-color: var(--color-light-a);
    }
  }
`;

export const RefreshContainer = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--color-neutral);
  padding: 0px 8px;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
  tx-core-icon {
    color: var(--color-primary);
    margin-right: 6px;
  }
`;
