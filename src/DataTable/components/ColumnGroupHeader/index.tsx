import React from "react";
import { TableRow, CellContent } from "../Rows/styled";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import { DataTableContext } from "../../index";
import * as SC from "./styled";

export const ColumnGroupHeader = () => {
  const { state: { columns } } = React.useContext(DataTableContext);

  const groupHeaders = columns.reduce((acc: { title: string | null; width: number }[], col) => {
    const lastHeader = acc[acc.length - 1];
    const colWidth = col.hidden ? 0 : parseInt(col.width || "");

    if (col.groupTitle) {
      if (lastHeader && lastHeader.title === col.groupTitle) {
        lastHeader.width += colWidth;
      } else {
        acc.push({ title: col.groupTitle, width: colWidth });
      }
    } else {
      if (lastHeader && lastHeader.title === null) {
        lastHeader.width += colWidth;
      } else if (acc.some(header => header.title)) {
        acc.push({ title: null, width: colWidth });
      }
    }
    return acc;
  }, []);

  if (groupHeaders.length === 1 && groupHeaders[0].title === null) {
    groupHeaders.length = 0;
  }

  return groupHeaders.length > 0 ? (
    <SC.GroupHeaderWrapper className="group-header">
      <TableRow>
        <CollapsibleRowColumn />
        <SelectCheckboxColumn />
        {groupHeaders.map((groupHeader, index) => groupHeader.width > 0 && (
          <SC.GroupHeader
            key={index}
            style={{
              width: `${groupHeader.width}px`,
            }}
          >
            <CellContent>{groupHeader.title}</CellContent>
          </SC.GroupHeader>
        ))}
      </TableRow>
    </SC.GroupHeaderWrapper>
  ) : null;
}

