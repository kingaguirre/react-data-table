import styled from 'styled-components';
import { TableRow, TableCell, CellContent } from "../Rows/styled";

export const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ColumnHeaderTableRow = styled(TableRow)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: stretch;
  ${TableCell} {
    min-height: 41px;
    padding: 10px 24px 10px 24px;
    background: #F9F0FF;
    border-color: transparent;
    border-bottom: 1px solid #6328FA;
    cursor: default;
    &.empty-cell {
      padding: 0;
    }
    > ${CellContent} {
    font-family: Gordita, 'Poppins', 'Helvetica', sans-serif;
    font-size: 14px;
    font-weight: bold;
    line-height: 21px;
    color: #6328FA;
    background: #F9F0FF;
  }
  }
`
