import React from "react";
import { TableRow, TableCell, CellContent } from "../Rows/styled";
import { getPinnedDetails } from "../../utils";
import { SET_SELECTED_ROWS } from "../../context/actions";
import { DataTableContext } from "../../index";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from './styled'

export const ColumnHeader = () => {
  const {
    state: { columns },
    collapsibleRowRender,
    selectable
  } = React.useContext(DataTableContext);

  let pinnedWidth = 0 + (!!collapsibleRowRender ? 90 : 0) + (!!selectable ? 90 : 0);

  return (
    <SC.ColumnHeaderTableRow className="column-header-container">
      <CollapsibleRowColumn/>
      <TableCell className="empty-cell" width="90px">
        <CellContent>Select</CellContent>
      </TableCell>
      {columns.map((col, index) => {
        if (col.hidden) return null;
        const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

        if (isPinned) {
          pinnedWidth += colWidth;
        }

        return (
          <TableCell
            key={index}
            width={col.width}
            minWidth={col.minWidth}
            align={col.align}
            isPinned={isPinned}
            style={pinnedStyle}
          >
            <CellContent>{col.title}</CellContent>
          </TableCell>
        );
      })}
    </SC.ColumnHeaderTableRow>
  )
}