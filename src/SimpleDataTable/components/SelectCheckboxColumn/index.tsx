import React from "react";
import { DataTableContext } from "../../index";
import { TableCell } from "../Rows/styled";
import * as SC from "./styled";

interface IProps {
  checked?: boolean;
  onChange?: (e: any) => void
}
export const SelectCheckboxColumn = (props: IProps) => {
  const { checked, onChange } = props;
  const { selectable, collapsibleRowRender } = React.useContext(DataTableContext);

  return selectable ? (
    <TableCell
      width="90px"
      onClick={e => e.stopPropagation()}
      isPinned
      style={{
        left: !!collapsibleRowRender ? "90px" : 0
      }}
    >
      {!!onChange && (
        <Checkbox
          checked={checked}
          onChange={onChange}
        />
      )}
    </TableCell>
  ) : null
}

interface ICheckbox {
  checked?: boolean;
  onChange?: (value: any) => void;
}
const Checkbox = (props: ICheckbox) => (
  <SC.Checkbox>
    <input
      type="checkbox"
      checked={props.checked}
      onChange={props.onChange}
    />
    <span/>
  </SC.Checkbox>
)
