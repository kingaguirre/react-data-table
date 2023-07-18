import { useState, useEffect } from 'react';

export const useDoubleClick = (singleClickCallback: any, doubleClickCallback: any, delay = 300) => {
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount === 1) {
      const singleClickTimer = setTimeout(() => {
        singleClickCallback();
        setClickCount(0);
      }, delay);
      return () => clearTimeout(singleClickTimer);
    } else if (clickCount === 2) {
      doubleClickCallback();
      setClickCount(0);
    }
  }, [clickCount]);

  return () => setClickCount((prev) => prev + 1);
};

export const getDeepValue = (obj: any, path: string) => {
  const value = path.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);

  if (typeof value === 'boolean' || typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
};

export const exportToCsv = (filename: string, rows: any[], columns: any) => {
  const processRow = (row: any) => {
    return columns
      .filter(col => !col.hide)
      .map(col => {
        let cell = col.customColumnRenderer ? col.customColumnRenderer(row[col.column], row) : getDeepValue(row, col.column);
        cell = (cell === null || cell === undefined) ? '' : cell.toString();
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      })
      .join(',');
  };

  let csvContent = columns
    .filter(col => !col.hide)
    .map(col => `"${col.title.replace(/"/g, '""')}"`)
    .join(',') + '\r\n';

  csvContent += rows.map(processRow).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=ISO-8859-1;' });
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      // Browsers that support HTML5 download attribute
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


