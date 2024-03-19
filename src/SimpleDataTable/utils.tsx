import React from 'react';

export const getDeepValue = (obj: any, path: string) => {
  const value = path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);

  if (value instanceof Date) {
    return value; // Return date objects as they are
  } else if (typeof value === 'boolean' || typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
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
  ) + (selectable ? 90 : 0) + (collapsibleRowRender ? 90 : 0),
});

export const exportToCsv = (filename: string, rows: any[], columns: any) => {
  const processRow = (row: any) => {
    return columns
      .filter(col => !col.hidden)
      .map(col => {
        let cell = col.cell ? col.cell(row[col.column], row) : getDeepValue(row, col.column);
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
      const cellValue = col.cell ? col.cell(row[col.column], row) : getDeepValue(row, col.column);
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
  const isPinned = col.pinned === true;
  const colWidth = parseInt(col.width || "", 10);

  return {
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

export const setColumnSettings = (columnSettings: any, tableWidth: any) => {
  if (tableWidth === null) return columnSettings;

  const columnsWithWidth = columnSettings.filter(col => col.width);
  const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width!, 10), 0);
  const remainingWidth = tableWidth - totalWidthWithWidth;
  const columnsWithoutWidth = columnSettings.filter(col => !col.width);
  const columnWidth = Math.max(remainingWidth / columnsWithoutWidth.length, 120);

  return columnSettings.sort((a, b) => {
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
