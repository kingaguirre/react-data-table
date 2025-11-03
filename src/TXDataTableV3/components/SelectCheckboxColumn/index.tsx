import React from "react";
import { TXInput } from '@atoms/TXInput';
import { TableCell } from "../Rows/Cell/styled";
import { withState, IComponent } from '../../GlobalStateProvider';

export const SelectCheckboxColumn = withState({
  states: [ 'selectable', 'collapsibleRowRender', 'multiSelect', 'isSelectableDisabled' ],
})(React.memo((props: IComponent) => {
  const { checked, disabled, onChange, selectable, collapsibleRowRender, multiSelect, isSelectableDisabled, rowIndex, isHeader } = props;

  const type = multiSelect ? "checkbox" : "radio";
  return selectable ? (
    <TableCell
      className={`empty-cell row-select-container ${type}`}
      data-testid={`row-selector-${isHeader ? 'header' : rowIndex}`}
      width="27px"
      onClick={e => e.stopPropagation()}
      isPinned
      style={{
        left: !!collapsibleRowRender ? "30px" : 0
      }}
    >
      {!!onChange && (
        <TXInput
          type={type}
          value={checked}
          onChange={onChange}
          rawValueOnChange
          simple
          disabled={disabled || isSelectableDisabled}
        />
      )}
    </TableCell>
  ) : null
}));
