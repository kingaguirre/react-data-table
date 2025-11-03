import styled from 'styled-components';
import { TableCell as TC } from "../Rows/Cell/styled";

export const TableCell = styled<any>(TC)`
  padding: 2px 3px;
  height: 24px;
  > * {
    width: 100%;
  }
`;

export const NumberContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  > * {
    flex: 1;
    margin: 0!important;
  }
`;
