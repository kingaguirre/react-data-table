import React from "react";
import { TableRow } from "../Rows/styled";
import { CellContent } from "../Rows/Cell/styled";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import * as SC from "./styled";
import { withState, IComponent } from '../../GlobalStateProvider';

export const ColumnGroupHeader = withState({
  states: [ 'columns' ],
})(React.memo((props: IComponent) => {
  const { columns } = props;

  const groupHeaders = columns?.reduce((acc, col, index) => {
    const colWidth = col.hidden ? 0 : parseInt(col.width || "");

    // Handle the first object when it doesn't have a groupTitle
    if (index === 0 && !col.groupTitle) {
      acc.push({ title: null, width: colWidth });
      return acc;
    }

    const lastHeader = acc[acc.length - 1];
    
    if (col.groupTitle) {
      if (lastHeader && lastHeader.title === col.groupTitle) {
        lastHeader.width += colWidth;
      } else {
        acc.push({ title: col.groupTitle, width: colWidth });
      }
    } else {
      if (lastHeader && lastHeader.title === null) {
        lastHeader.width += colWidth;
      } else {
        acc.push({ title: null, width: colWidth });
      }
    }
    
    return acc;
  }, []);

  // Remove single null title if it's the only one
  if (groupHeaders?.length === 1 && groupHeaders[0].title === null) {
    groupHeaders.length = 0;
  }

  return groupHeaders?.length > 0 ? (
    <SC.GroupHeaderWrapper className="group-header">
      <TableRow>
        <CollapsibleRowColumn />
        <SelectCheckboxColumn />
        {groupHeaders?.map((groupHeader, index) => groupHeader.width > 0 && (
          <SC.GroupHeader
            key={index}
            style={{ width: `${groupHeader.width}px` }}
            hasTitle={!!groupHeader.title}
          >
            <CellContent>{groupHeader.title}</CellContent>
          </SC.GroupHeader>
        ))}
      </TableRow>
    </SC.GroupHeaderWrapper>
  ) : null;
}));
