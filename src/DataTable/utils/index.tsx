import React from 'react';

export const highlightText = (text: string, highlight: string) => {
  if (typeof text === "string") {
    /** Split text on highlight term, include term itself into parts, ignore case  */
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
    <span>
      {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ?
        <span key={i} style={{ backgroundColor: '#ffc069' }}>{part}</span> :
        <span key={i}>{part}</span>
      )}
    </span>);
  }
};

export const useDoubleClick = (onClick, onDoubleClick, delay = 300) => {
  const [clickTimeout, setClickTimeout] = React.useState<any>(null);

  const handleClick = (...args) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onDoubleClick(...args);
    } else {
      const timeoutId = setTimeout(() => {
        onClick(...args);
        setClickTimeout(null);
      }, delay);
      setClickTimeout(timeoutId);
    }
  };

  return handleClick;
};

export const getDeepValue = (obj: any, path: string) => {
  const value = path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);

  if (value instanceof Date) {
    return value; // Return date objects as they are
  } else if (typeof value === 'boolean' || typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
};

export const setDeepValue = (obj: any, path: string, value: any) => {
  const keys = path.split(/[\.\[\]]+/).filter(Boolean);

  keys.reduce((acc, part, index) => {
    if (index === keys.length - 1) {
      // If we are at the last key, set the value
      acc[part] = value;
    } else if (!acc[part] || typeof acc[part] !== 'object') {
      // If the next key doesn't exist, or isn't an object, create an empty object
      acc[part] = {};
    }
    return acc[part];
  }, obj);
};

export const sortData = (data: any[] | null, column: string, direction: 'asc' | 'desc') => {
  const compareFunction = (a: any, b: any) => {
    const aVal = String(getDeepValue(a, column));
    const bVal = String(getDeepValue(b, column));

    /** Extract numbers from the strings  */
    const aMatches = aVal.match(/\d+/g) || [];
    const bMatches = bVal.match(/\d+/g) || [];

    /** If both have numbers, compare as numbers  */
    if (aMatches.length > 0 && bMatches.length > 0) {
      const aNum = parseInt(aMatches.join(''), 10);
      const bNum = parseInt(bMatches.join(''), 10);
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }

    /** If not, or if the numbers are equal, compare as strings  */
    return aVal.localeCompare(bVal);
  }

  return data !== null ? direction === 'asc' ? [...data].sort(compareFunction) : [...data].sort((a, b) => -compareFunction(a, b)) : null;
};

export const getTableWidth = ({state, selectable, collapsibleRowRender}) => ({
  width: state.columns?.reduce((acc, col) => 
    acc + (parseInt(col.hidden ? "" : col.width || "", 10) || 0), 0
  ) + (selectable ? 27 : 0) + (collapsibleRowRender ? 30 : 0),
});

export const exportToCsv = (filename: string, rows: any[], columns: any) => {
  const processRow = (row: any) => {
    return columns
      .filter(col => !col.hidden)
      .map(col => {
        let cell = col.columnCustomRenderer ? col.columnCustomRenderer(row[col.column], row) : getDeepValue(row, col.column);
        cell = (cell === null || cell === undefined) ? '' : cell.toString();
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',');
  };

  let csvContent = columns
    .filter(col => !col.hidden)
    .map(col => `"${col.title.replace(/"/g, '""')}"`)
    .join(',') + '\r\n';

  csvContent += rows.map(processRow).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=ISO-8859-1;' });
  if ((navigator as any).msSaveBlob) { /** IE 10+  */
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) { /** feature detection  */
      /** Browsers that support HTML5 download attribute  */
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

export const exportToExcel = (filename: string, rows: any[], columns: any) => {
  const xmlHeader = '<?xml version="1.0"?>';
  const workbookHeader = '<workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">';
  const workbookFooter = '</workbook>';
  const worksheetHeader = '<worksheet><table>';
  const worksheetFooter = '</table></worksheet>';

  const createRow = (cells: string[]) => {
    return `<row>${cells.map(cell => `<cell><data ss:Type="String">${cell}</data></cell>`).join('')}</row>`;
  };

  const headerRow = createRow(columns.filter(col => !col.hidden).map(col => col.title));

  const dataRows = rows.map(row => {
    return createRow(columns.filter(col => !col.hidden).map(col => {
      const cellValue = col.columnCustomRenderer ? col.columnCustomRenderer(row[col.column], row) : getDeepValue(row, col.column);
      return cellValue === null || cellValue === undefined ? '' : cellValue.toString();
    }));
  });

  const xml = [
    xmlHeader,
    workbookHeader,
    worksheetHeader,
    headerRow,
    ...dataRows,
    worksheetFooter,
    workbookFooter
  ].join('');

  const blob = new Blob([xml], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`; // Excel 2003 format
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getPinnedDetails = (col: any, pinnedWidth: number) => {
  const showPinIcon = col.pinned !== 'none';
  const isPinned = col.pinned === true;
  const colWidth = parseInt(col.width || "", 10);

  return {
    showPinIcon,
    isPinned,
    colWidth,
    pinnedStyle: isPinned ? { left: `${pinnedWidth}px` } : {}
  }
}

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const filterCheck = (filterValue: any, rowValue: string, filterType: string = "number-range") => {
  const isNumberRange = filterType === "number-range";
  const parsedRowValue = isNumberRange ? parseFloat(rowValue) : new Date(rowValue);

  switch (true) {
    case (!!filterValue && (!filterValue.min || !filterValue.max)):
    case (!filterValue || (filterValue.min === "" && filterValue.max === "")):
    case (parsedRowValue >= (isNumberRange ? parseFloat(filterValue.min) : new Date(filterValue.min)) && 
      parsedRowValue <= (isNumberRange ? parseFloat(filterValue.max) : new Date(filterValue.max))):
      return true;

    default:
      return false;
  }
}

export const getLocalStorageColumnSettings = (columnSettings: any) => {
  const savedDefaultColumnSettings = JSON.parse(localStorage.getItem('defaultColumnSettings') || '[]');
  const savedCurrentColumnSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');

  const mergedDefaultSettings = mergeColumnSettings(columnSettings, savedDefaultColumnSettings);
  const mergedCurrentSettings = mergeColumnSettings(columnSettings, savedCurrentColumnSettings);

  if (mergedCurrentSettings.length > 0) {
    return mergedCurrentSettings;
  } else if (mergedDefaultSettings.length > 0) {
    return mergedDefaultSettings;
  } else {
    return columnSettings;
  }
}

export const setColumnSettings = (
  columnSettings: any,
  tableWidth: any,
  customRowSettings: any
) => {
  const customColumns = (!!customRowSettings && customRowSettings.length > 0) ? customRowSettings.filter(i => i.showColumn !== false).map(i => ({
    column: i.column,
    title: "#",
    align: "center",
    order: 0,
    pinned: "none",
    sorted: "none",
    width: i.width || "40px",
    draggable: false
  })) : [];

  const colSettings = [...customColumns, ...getLocalStorageColumnSettings(columnSettings)];
  if (tableWidth === null) return colSettings;

  const columnsWithWidth = colSettings.filter(col => col.width);
  const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width!, 10), 0);
  const remainingWidth = tableWidth - totalWidthWithWidth;
  const columnsWithoutWidth = colSettings.filter(col => !col.width);
  const columnWidth = Math.max(remainingWidth / columnsWithoutWidth.length, 120);

  return colSettings.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) {
      return -1;
    }
    if (b.order !== undefined) {
      return 1;
    }
    return 0;
  }).map((col, index) => ({
    ...col,
    width: col.width || `${columnWidth}px`,
    order: index,
  }));
};

export const serializeColumns = (columns) => {
  return columns.map(({ columnCustomRenderer, ...rest }) => rest);
}

export const mergeColumnSettings = (originalColumns, savedColumns) => {
  return originalColumns.map((column) => {
      const savedColumn = savedColumns.find((sc) => sc.column === column.column); // Assuming 'column' is a unique identifier
      return {
          ...column,
          ...savedColumn,
      };
  });
}

export const mergeFilters = (defaultFilter: { [key: string]: any } | undefined, filterValues: { [key: string]: any }): { [key: string]: any } => {
  const validFilterValues = Object.entries(filterValues)
      .filter(([, value]) => value !== "")
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
  if (defaultFilter) {
      return { ...defaultFilter, ...validFilterValues };
  }
  return validFilterValues;
};

export const getAdvanceFilterSettingsObj = (filterSettings: any[]): { [key: string]: string } => {
  if (!filterSettings) return {};

  // Find the first setting that has default: true
  const defaultSetting = filterSettings.find(setting => setting.default);

  // If there's no default setting, return an empty object
  if (!defaultSetting) return {};

  return defaultSetting.fields.reduce((acc, field) => {
    acc[field.id] = field.value;
    return acc;
  }, {} as { [key: string]: string });
};

// Serialize object to query string
export const serialize = (obj: { [key: string]: any }): string => {
  const str: string[] = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p) && obj[p] !== undefined && obj[p] !== null) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
};

export const mergeCustomStylesForRow = (rowValue, customRowSettings) => {
  let mergedStyles = {};

  // Loop through each customRowSetting
  customRowSettings.forEach((setting) => {
    const valueAtPath = getDeepValue(rowValue, setting.column);
    if (valueAtPath !== undefined && valueAtPath === setting.value) {
      // Merge the styles if the condition is true
      mergedStyles = { ...mergedStyles, ...setting.styles };
    }
  });

  return mergedStyles;
};

export * from "./useDragDropManager";
export * from "./useResizeManager";