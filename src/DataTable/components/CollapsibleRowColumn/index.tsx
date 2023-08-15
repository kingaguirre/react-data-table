import React from "react";
import { DataTableContext } from "../../index";
import { TableCell, CollapseIcon } from "../Rows/styled";

interface IProps {
  isRowCollapsed?: boolean;
  onClick?: (e: any) => void
}
export const CollapsibleRowColumn = (props: IProps) => {
  const { isRowCollapsed, onClick } = props;
  const { collapsibleRowRender } = React.useContext(DataTableContext);

  return collapsibleRowRender ? (
    <TableCell className="empty-cell" width="30px" onClick={e => e.stopPropagation()}>
      {!!onClick && <CollapseIcon onClick={onClick}>{isRowCollapsed ? '-' : '+'}</CollapseIcon>}
    </TableCell>
  ) : null
}