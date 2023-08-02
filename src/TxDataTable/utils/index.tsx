import React from 'react';

export const highlightText = (text: string, highlight: string) => {
  // Split text on highlight term, include term itself into parts, ignore case
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
  <span>
    {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ?
      <span key={i} style={{ backgroundColor: '#ffc069' }}>{part}</span> :
      <span key={i}>{part}</span>
    )}
  </span>);
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
  if ((navigator as any).msSaveBlob) { // IE 10+
    (navigator as any).msSaveBlob(blob, filename);
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

export * from "./useDragDropManager";
export * from "./useResizeManager";