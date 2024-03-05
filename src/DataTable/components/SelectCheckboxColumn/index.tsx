import React from "react";
import { DataTableContext } from "../../index";
import { TableCell } from "../Rows/styled";
import { Checkbox, Radio } from "./styled";

interface IProps {
  checked?: boolean;
  onChange?: (e: any) => void
}
export const SelectCheckboxColumn = (props: IProps) => {
  const { checked, onChange } = props;
  const { selectable, collapsibleRowRender, multiSelect } = React.useContext(DataTableContext); // Added multiSelect to context

  return selectable ? (
    <TableCell
      className="empty-cell"
      width="27px"
      onClick={e => e.stopPropagation()}
      isPinned
      style={{
        left: !!collapsibleRowRender ? "30px" : 0
      }}
    >
      {!!onChange && (
        multiSelect ? (
          <Radio // Use Radio instead of Checkbox for single select
            type="radio"
            checked={checked}
            onChange={onChange}
          />
        ) : (
          <Checkbox
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
        )
      )}
    </TableCell>
  ) : null;
}