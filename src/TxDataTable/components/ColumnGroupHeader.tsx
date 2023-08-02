import React from "react";
import { TableRow, TableCell, GroupHeader, CellContent } from "../styled";
import { DataTableContext } from "../index";

export default () => {
  const {
    selectable,
    state: { columns },
    collapsibleRowRender
  } = React.useContext(DataTableContext);

  const groupHeaders = columns.reduce((acc: { title: string | null; width: number }[], col) => {
    const lastHeader = acc[acc.length - 1];
    const colWidth = col.hide ? 0 : parseInt(col.width || "");

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

  return (
    <TableRow>
      {selectable && <TableCell width="42px" />}
      {collapsibleRowRender && <TableCell width="38px" />}
      {groupHeaders.map((groupHeader, index) => groupHeader.width > 0 && (
        <GroupHeader
          key={index}
          style={{
            width: `${groupHeader.width}px`,
          }}
        >
          <CellContent>{groupHeader.title}</CellContent>
        </GroupHeader>
      ))}
    </TableRow>
  );
}
