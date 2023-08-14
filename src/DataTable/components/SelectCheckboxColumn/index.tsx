import React from "react";
import { DataTableContext } from "../../index";
import { TableCell } from "../Rows/styled";
import { Checkbox } from "./styled";

interface IProps {
  checked?: boolean;
  onChange?: (e: any) => void
}
export const SelectCheckboxColumn = (props: IProps) => {
  const { checked, onChange } = props;
  const { selectable } = React.useContext(DataTableContext);

  return selectable ? (
    <TableCell width="27px" onClick={e => e.stopPropagation()}>
      {!!onChange && (
        <Checkbox
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
      )}
    </TableCell>
  ) : null
}