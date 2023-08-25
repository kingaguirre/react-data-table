import React from "react";
import { DataTableContext } from "../../index";
import { TableCell } from "../Rows/styled";
import { CollapseIcon } from "./styled";

interface IProps {
  isRowCollapsed?: boolean;
  onClick?: (e: any) => void
}
export const CollapsibleRowColumn = (props: IProps) => {
  const { isRowCollapsed, onClick } = props;
  const { collapsibleRowRender } = React.useContext(DataTableContext);

  return collapsibleRowRender ? (
    <TableCell
      className="empty-cell"
      width="90px"
      onClick={e => e.stopPropagation()}
      isPinned
      style={{left: 0}}
    >
      {!!onClick && (
        <CollapseIcon onClick={onClick} isRowCollapsed={!!isRowCollapsed}>
          {isRowCollapsed ? '-' : '+'}
        </CollapseIcon>
      )}
    </TableCell>
  ) : null
}