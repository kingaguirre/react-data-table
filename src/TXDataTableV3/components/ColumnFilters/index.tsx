import React from "react";
import { TXInput, CODE_DECODE_DROPDOWN } from '@atoms/TXInput';
import { TableRow } from "../Rows/styled";
import { TableCell, NumberContainer } from "./styled";
import { ColumnDragHighlighter } from "../Rows/Cell";
import { SelectCheckboxColumn } from "../SelectCheckboxColumn";
import { CollapsibleRowColumn } from "../CollapsibleRowColumn";
import { getPinnedDetails } from "../../utils";
import { withState, IComponent } from '../../GlobalStateProvider';

export const ColumnFilters = withState({
  states: [
    'filterValues',
    'columns',
    'collapsibleRowRender',
    'selectable',
    'hasAnyFilterConfig',
    'ssrConfig',
    'fetchConfig',
    'fetchedData',
    'visibleRows',
    'isAllColumnHidden'
  ],
})(React.memo((props: IComponent) => {
  const {
    filterValues,
    columns,
    collapsibleRowRender,
    selectable,
    hasAnyFilterConfig,
    ssrConfig,
    fetchConfig,
    fetchedData,
    visibleRows,
    isAllColumnHidden,
    setGlobalState
  } = props;

  const rows = fetchConfig ? fetchedData.data : visibleRows;
  const isFetching = fetchConfig && fetchedData.fetching;
  const isNoData = !rows || rows.length === 0 || isAllColumnHidden || !Array.isArray(rows) && !isFetching && rows !== undefined;
  let pinnedWidth = 0 + (!!collapsibleRowRender ? 30 : 0) + (!!selectable ? 27 : 0);

  if (!hasAnyFilterConfig) {
    return null;
  }

  const handleSetFilterValues = (value: any, column: string) => {
    setGlobalState((prev) => ({ 
      ...prev,
      filterValues: { ...prev.filterValues, [column]: value || ""}
    }));
  };

  const handleKeyPress = (e: any, column: string) => {
    const keyCode = e.keyCode || e.which;

    if (keyCode === 13) {
      setGlobalState((prev) => ({ 
        ...prev,
        filterValues: { ...prev.filterValues, [column]: e.target.value || ""}
      }));
    }
  };

  const handleSetFilterObjValues = (value: any, column: string, isMin = false) => {
    setGlobalState((prev) => ({
      ...prev,
      filterValues: {
        ...prev.filterValues,
        [column]: {
          ...prev[column],
          [isMin ? "min" : "max"]: value,
        }
      }
    }));
  };

  const handleSetFilterDateRangeValues = (value: any, column: string) => {
    const dates = !!value ? value.split(',') : undefined;

    setGlobalState((prev) => ({
      ...prev,
      filterValues: {
        ...prev.filterValues,
        [column]: {min: dates?.[0] || "", max: dates?.[1] || "" },
      }
    }));
  };

  const handleSetFilterDropdownMultiSelectValues = (value: any, column: string) => {
    setGlobalState((prev) => ({
      ...prev,
      filterValues: {
        ...prev.filterValues,
        [column]: value || [],
      }
    }));
  };

  const getDateRangeValule = (value: any) => {
    const min = value?.min || "";
    const max = value?.max || "";
    return `${min},${max}`
  };

  return (
    <TableRow className="column-filters-container" data-testid='column-filters-container'>
      <CollapsibleRowColumn/>
      <SelectCheckboxColumn/>
      {columns.map((col, index) => {
        if (col.hidden) return null;

        const { isPinned, colWidth, pinnedStyle } = getPinnedDetails(col, pinnedWidth);

        if (isPinned) {
          pinnedWidth += colWidth;
        }

        return (
          <TableCell
            key={index}
            width={col.width || col.defaultWidth}
            minWidth={col.minWidth}
            isPinned={isPinned}
            style={pinnedStyle}
            data-testid={`column-filter-${col.column}`}
          >
            {(() => {
              if (col.filterConfig) {
                const isCodeDecodeDropdown = col.filterConfig.type === CODE_DECODE_DROPDOWN;
                const isDropdownOrCodeDecodeDropdown = col.filterConfig.type === "dropdown" || isCodeDecodeDropdown;
                switch(true) {
                  case col.filterConfig.type === "text":
                    return (
                      <TXInput
                        showHelpText={false}
                        size="xs"
                        rawValueOnChange
                        placeholder={col.filterConfig?.placeholder}
                        value={filterValues[col.column]}
                        {...(!!filterValues[col.column] ? {
                          onChange: value => handleSetFilterValues(value, col.column)
                        } : {})}
                        {...(ssrConfig?.fetchPageData) ? {
                          onKeyPress: value => handleKeyPress(value, col.column)
                        } : {
                          onChange: value => handleSetFilterValues(value, col.column)
                        }}
                      />
                    )
                  case isDropdownOrCodeDecodeDropdown:
                    return (
                      <TXInput
                        showHelpText={false}
                        size="xs"
                        rawValueOnChange
                        type={col.filterConfig?.type}
                        placeholder={col.filterConfig?.placeholder}
                        value={filterValues[col.column]}
                        onChange={value => (isCodeDecodeDropdown && !!col.filterConfig?.multiSelect) ?
                          handleSetFilterDropdownMultiSelectValues(value, col.column) :
                          handleSetFilterValues(value, col.column)
                        }
                        options={col.filterConfig.options}
                        multiSelect={col.filterConfig?.multiSelect}
                        multiSelectCheckbox={col.filterConfig?.multiSelect}
                        codeId={col.filterConfig?.codeId}
                      />
                    )
                  case col.filterConfig.type === "number-range":
                    return (
                      <NumberContainer>
                        <TXInput
                          showHelpText={false}
                          size="xs"
                          type="number"
                          rawValueOnChange
                          value={filterValues[col.column]?.min || ""}
                          onChange={value => handleSetFilterObjValues(value, col.column, true)}
                          placeholder="Min"
                        />
                        <TXInput
                          showHelpText={false}
                          size="xs"
                          type="number"
                          rawValueOnChange
                          value={filterValues[col.column]?.max || ""}
                          onChange={value => handleSetFilterObjValues(value, col.column, false)}
                          placeholder="Max"
                        />
                      </NumberContainer>
                    )
                  case col.filterConfig.type === "date-range":
                    return (
                      <TXInput
                        showHelpText={false}
                        size="xs"
                        type="date-range"
                        placeholder={col.filterConfig?.placeholder}
                        rawValueOnChange
                        value={getDateRangeValule(filterValues[col.column])}
                        onChange={value => handleSetFilterDateRangeValues(value, col.column)}
                      />
                    )
                  default: return null;
                }
              }
              return null;
            })()}
            <ColumnDragHighlighter index={index}/>
          </TableCell>
        )
      })}
    </TableRow>
  )
}));
