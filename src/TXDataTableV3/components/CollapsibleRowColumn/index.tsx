import React from "react";
import { TableCell } from "../Rows/Cell/styled";
import { CollapseIconConainer, CollapseIcon } from "./styled";
import { withState, IComponent } from '../../GlobalStateProvider';

export const CollapsibleRowColumn = withState({
  states: [ 'collapsibleRowRender' ],
})(React.memo((props: IComponent) => {
  const { isRowCollapsed, onClick, collapsibleRowRender } = props;

  return collapsibleRowRender ? (
    <TableCell
      className="empty-cell"
      width="30px"
      onClick={e => e.stopPropagation()}
      isPinned
      style={{left: 0}}
    >
      {!!onClick && (
        <CollapseIconConainer
          onClick={onClick}
          isRowCollapsed={!!isRowCollapsed}
          title={!!isRowCollapsed ? 'Collapse' : 'Expand'}
        >
          <CollapseIcon isRowCollapsed={isRowCollapsed}/>
        </CollapseIconConainer>
      )}
    </TableCell>
  ) : null
}));
