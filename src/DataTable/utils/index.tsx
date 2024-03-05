import React from 'react';
import * as XLSX from 'xlsx';
import { Actions } from "../interfaces";
import { ActionsColumn } from "../components/ActionsColumn";
import Ajv from "ajv";

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

export const useDoubleClick = (onClick, onDoubleClick, delay = 150) => {
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

export const getDeepValue = (obj, path, returnObj = false) => {
  const value = path?.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);

  if (value instanceof Date) {
    return value.toISOString(); // Format Date objects as ISO strings
  } else if (typeof value === 'boolean' || typeof value === 'object' && !returnObj) {
    return JSON.stringify(value); // Convert booleans and objects to strings, unless returnObj is true
  }

  return value || ""; // Return the value or an empty string if undefined
};

const deepClone = (obj) => {
  // Check for null or non-object values
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects specifically
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle arrays
  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepClone(item);
      return arr;
    }, []);
  }

  // Handle objects
  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepClone(obj[key]);
      return newObj;
    }, {});
  }

  // Fallback for all other types
  return obj;
};

export const setDeepValue = (obj, path, value) => {
  const newObj = deepClone(obj);
  const keys = path.match(/[^.[\]]+/g) || [];

  keys.reduce((acc, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
      return newObj; // Return newObj for consistency, although this line does not affect functionality
    } else {
      if (!acc[key] || typeof acc[key] !== 'object' || acc[key] instanceof Date) acc[key] = {};
      return acc[key];
    }
  }, newObj);

  return newObj;
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

export const getTableWidth = ({ state, selectable, collapsibleRowRender }) => ({
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
  let parsedRowValue: any = isNumberRange ? parseFloat(rowValue) : new Date(rowValue);

  if (!isNumberRange) {
    // Adjust parsedRowValue to the start of the day for consistent comparison
    parsedRowValue = new Date(parsedRowValue.setHours(0, 0, 0, 0));
  }

  switch (true) {
    case (!!filterValue && (!filterValue.min || !filterValue.max)):
    case (!filterValue || (filterValue.min === "" && filterValue.max === "")):
      return true;

    case isNumberRange:
      return (
        parsedRowValue >= parseFloat(filterValue.min) &&
        parsedRowValue <= parseFloat(filterValue.max)
      );

    default:
      // Create date objects for comparison, adjusting the max date to the end of the day
      const minDate = new Date(filterValue.min);
      minDate.setHours(0, 0, 0, 0); // Start of the min day
      const maxDate = new Date(filterValue.max);
      maxDate.setHours(23, 59, 59, 999); // End of the max day

      return parsedRowValue >= minDate && parsedRowValue <= maxDate;
  }
}


export const mergeColumnSettings = (originalColumns, savedColumns) => {
  return originalColumns.map((originalColumn) => {
    const savedColumn = savedColumns.find((sc) => sc.column === originalColumn.column);
    // Exclude actionConfig and filterConfig from the saved column before merging
    const { actionConfig, filterConfig, ...savedColumnExclusions } = savedColumn || {};
    return {
      ...originalColumn,
      ...savedColumnExclusions,
    };
  });
};

export const getLocalStorageColumnSettings = (columnSettings) => {
  const savedDefaultColumnSettings = JSON.parse(localStorage.getItem('defaultColumnSettings') || '[]');
  const savedCurrentColumnSettings = JSON.parse(localStorage.getItem('currentColumnSettings') || '[]');

  const mergedDefaultSettings = mergeColumnSettings(columnSettings, savedDefaultColumnSettings);
  const mergedCurrentSettings = mergeColumnSettings(columnSettings, savedCurrentColumnSettings);

  // Ensure actionConfig and filterConfig are applied from original columnSettings
  const applyConfigOverrides = (settings) => settings.map(setting => ({
    ...setting,
    actionConfig: columnSettings.find(cs => cs.column === setting.column)?.actionConfig,
    filterConfig: columnSettings.find(cs => cs.column === setting.column)?.filterConfig,
  }));

  if (mergedCurrentSettings.length > 0) {
    return applyConfigOverrides(mergedCurrentSettings);
  } else if (mergedDefaultSettings.length > 0) {
    return applyConfigOverrides(mergedDefaultSettings);
  } else {
    // If no saved settings, apply overrides to original just in case
    return applyConfigOverrides(columnSettings);
  }
};


export const setColumnSettings = (
  columnSettings: any,
  tableWidth: any,
  customRowSettings?: any,
  actions?: Actions | Actions[]
) => {
  let customColumns = (!!customRowSettings && customRowSettings.length > 0)
    ? customRowSettings.filter(i => i.showColumn !== false).map(i => ({
      column: i.column,
      title: i.title || "#",
      align: "center",
      order: 0,
      pinned: "none",
      sorted: "none",
      width: i.width || "40px",
      draggable: false,
      actionConfig: false,
      selectable: false,
      disableSelection: true,
      class: 'custom-action-column',
    })) : [];

  /** Create a Set to keep track of unique columns */
  const seenColumns = new Set();
  customColumns = customColumns.filter(customColumn => {
    if (!seenColumns.has(customColumn.column)) {
      seenColumns.add(customColumn.column);
      return true;
    }
    return false;
  });

  const hasActions = isStringExist(actions, [Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE]);

  const actionsColumn = hasActions ? [{
    column: "",
    title: "Actions",
    align: "center",
    order: 0,
    pinned: "none",
    sorted: "none",
    width: "60px",
    draggable: false,
    actionConfig: false,
    selectable: false,
    disableSelection: true,
    class: 'custom-action-column',
    columnCustomRenderer: (data, _, rowIndex) => <ActionsColumn data={data} rowIndex={rowIndex} />
  }] : [];

  const localStorageColumnSettings = getLocalStorageColumnSettings(columnSettings);

  /** Now we merge customColumns and localStorageColumnSettings, ensuring no duplicates from customColumns */
  const colSettings = [...actionsColumn, ...customColumns, ...localStorageColumnSettings];

  if (tableWidth === null) return colSettings;

  const columnsWithWidth = colSettings.filter(col => col.width);
  const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width, 10), 0);
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

  /** Find the first setting that has default: true */
  const defaultSetting = filterSettings.find(setting => setting.default);

  /** If there's no default setting, return an empty object */
  if (!defaultSetting) return {};

  return defaultSetting.fields.reduce((acc, field) => {
    acc[field.id] = field.value;
    return acc;
  }, {} as { [key: string]: string });
};

/** Serialize object to query string */
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

  /** Loop through each customRowSetting */
  customRowSettings?.forEach((setting) => {
    const valueAtPath = getDeepValue(rowValue, setting.column);
    if (valueAtPath !== undefined && valueAtPath === setting.value) {
      /** Merge the styles if the condition is true */
      mergedStyles = { ...mergedStyles, ...setting.styles };
    }
  });

  return mergedStyles;
};

/**
 * Replaces the domain of a given URL if it's localhost with the specified new domain.
 * @param {string} url - The URL to be checked and updated.
 * @param {string} newDomain - The new domain to replace localhost with.
 * @returns {string} - The updated URL with the new domain.
 */
export const replaceLocalhostWithDomain = (url, newDomain) => {
  try {
    const urlObj = new URL(url);

    // Check if the hostname is localhost (this includes various localhost types)
    if (urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1' ||
      urlObj.hostname.startsWith('localhost:') ||
      urlObj.hostname.endsWith('.localhost')) {
      // Create a new URL with the new domain, preserving the pathname and search parameters if any
      return `${newDomain}${urlObj.pathname}${urlObj.search}`;
    }

    // If the hostname is not localhost, return the original URL
    return url;
  } catch (error) {
    console.error('Invalid URL:', error);
    return url; // Return the original URL if there was an error parsing it
  }
};

/**
 * Checks if a string or each string in an array of strings exists exactly (case-insensitive) in a given array.
 * @param {Array} firstArray - The array to search within.
 * @param {string|Array} secondParam - A string or an array of strings to look for.
 * @returns {boolean} - True if the string or all strings from the secondParam exist in the first array, false otherwise.
 */
export const isStringExist = (stringArray, stringToCheck) => {
  if (!stringArray) {
    return false;
  }

  // Convert all elements of the first array to lowercase for case-insensitive comparison
  const lowerCaseFirstArray = stringArray.map(element =>
    typeof element === 'string' ? element.toLowerCase() : element
  );

  // Check if stringToCheck is an array or a single string and convert to lowercase
  const elementsToCheck = Array.isArray(stringToCheck)
    ? stringToCheck.map(el => el.toLowerCase())
    : [stringToCheck.toLowerCase()];

  // Use some to determine if any element to check exists in the first array
  return elementsToCheck.some(element => lowerCaseFirstArray.includes(element));
};

export const updateDataByRowKey = (rowData, data, rowKey, intentAction = "R") => [...data].map(d => {
  const rowDataRowKey = getDeepValue(rowData, rowKey);
  const dataRowKey = getDeepValue(d, rowKey);
  if (rowDataRowKey === dataRowKey) {
    return { ...d, intentAction }
  }
  return d;
});

export const hasDomain = (url) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '(localhost|' + // localhost
    '(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+' + // subdomain
    '[a-z]{2,}' + // domain name
    '|(\\d{1,3}\\.){3}\\d{1,3})' + // OR ip (v4) address
    '(\\:\\d+)?' + // port
    '(\\/[-a-z\\d%_.~+]*)*' + // path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i' // case insensitive
  );
  return !!pattern.test(url);
};

// Utility function to compare objects
export const areObjectsEqual = (obj1, obj2) => {
  if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!areObjectsEqual(val1, val2)) {
        return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
};

// Utility function to compare arrays of objects
export const areArraysOfObjectsEqual = (arr1, arr2) => {
  if (arr1?.length !== arr2?.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!areObjectsEqual(arr1[i], arr2[i])) {
      return false;
    }
  }

  return true;
};

export const findUpdatedIndex = (data1, data2) => {
  const maxLength = Math.max(data1.length, data2.length);

  for (let i = 0; i < maxLength; i++) {
    const object1 = data1[i];
    const object2 = data2[i];

    // Check if the objects are different
    if (!areObjectsEqual(object1, object2)) {
      return i; // Return the index of the updated object
    }
  }

  return -1; // Return -1 if no differences are found
};

export const arrayToEmptyObject = (keys) => {
  const result = {};
  keys.forEach(key => {
    result[key] = '';
  });
  return result;
}

const extractValueFromObject = (obj) => {
  if ('value' in obj) {
    if (Array.isArray(obj.value)) {
      // Handle when 'value' is an array
      return obj.value.join(', ');
    } else if (typeof obj.value === 'string') {
      // Check if 'value' is a date string
      if (isDateString(obj.value) && !parseAndCheckIfValidNumber(obj.value)) {
        // 'value' is a valid date string, format the date
        return format(new Date(obj.value));
      }
      // Handle when 'value' is a string but not a date
      return obj.value;
    } else if (obj.value instanceof Date) {
      // Directly handle if 'value' is a Date object
      return format(obj.value);
    }
  }
  return null; // Handle the case when the object doesn't have a 'value' property or it's not an array/string/date
};


const isDateString = (input) => {
  const date = new Date(input);
  return !isNaN(date.getTime()); // Check if the date is valid
};

const format = (date) => {
  // Assuming format() is defined to format a Date object into a string
  // This is a placeholder; you should replace it with actual date formatting logic
  return date.toISOString(); // Example formatting
};

export const parseAndCheckIfValidNumber = (str) => {
  // First, trim the string to remove any leading/trailing spaces
  str = str.trim();

  // Use regular expression to check if the string is a valid number
  // This regex matches optional leading + or -, digits, optional decimal point, and more digits
  const isValidFormat = /^-?\d+(\.\d+)?$/.test(str);

  if (!isValidFormat) {
    return false;
  }

  // Parse the string to a number
  const num = Number(str);

  // Check if the result is a valid number
  if (isNaN(num)) {
    return false;
  }

  return true;
}

export const getValue = (input) => {
  // Check if input is a string
  if (typeof input === 'string') {
    if (isDateString(input) && !parseAndCheckIfValidNumber(input)) {
      // Input is a valid date string, format the date
      return format(new Date(input));
    }
    try {
      const parsedObject = JSON.parse(input);
      if (Array.isArray(parsedObject)) {
        // Handle case when input is a JSON string representing an array
        return parsedObject.join(', ');
      } else {
        // Handle case when input is a JSON string representing an object
        return extractValueFromObject(parsedObject);
      }
    } catch (error) {
      // Parsing failed, return the original string
      return input;
    }
  } else if (Array.isArray(input)) {
    // Handle case when input is an array
    return input.join(', ');
  } else if (typeof input === 'object' && input !== null) {
    if (input instanceof Date) {
      return input;
    } else {
      // Handle case when input is already an object
      return extractValueFromObject(input);
    }
  } else if (typeof input === "number") {
    return input;
  }

  return null; // Handle the case when the input doesn't match the expected format
};

/**
 * Function to safely get a nested value from an object.
 * @param {Object} obj - The object to query.
 * @param {Array} path - The path array to the property to get.
 */
const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => {
    return (acc && acc[key] !== undefined) ? acc[key] : null;
  }, obj);
};

/**
 * Function to download Excel file.
 * @param {Array} headers - Array of headers for the Excel file.
 * @param {Array} rows - Array of row data for the Excel file.
 * @param {String} fileName - Name of the file to be downloaded.
 */
export const downloadExcel = (headers, rows, fileName = "data") => {
  // Filter out headers that are hidden or have a custom renderer
  const filteredHeaders = headers.filter(header => !header.hidden && !header.columnCustomRenderer);

  // Process rows to extract deep values
  const processedRows = rows.map(row => {
    let newRow = {};
    filteredHeaders.forEach(header => {
      const keys = header.column.split('.');
      const value = getValue(getNestedValue(row, keys));

      newRow[header.title] = value;
    });
    return newRow;
  });

  // Create a new workbook and add a worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(processedRows, {
    header: filteredHeaders.map(header => header.title),
    skipHeader: false
  });

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Write workbook and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const isValidDataWithSchema = (columns, data, dataSource) => {
  const ajv = new Ajv();
  const validationResults: any = [];

  const columnsWithSchema = columns.reduce((acc, col) => {
    if (col.actionConfig && col.actionConfig.schema) {
      acc[col.column] = col.actionConfig.schema;
    }
    return acc;
  }, {});

  const columnsWithIsUnique = columns.reduce((acc, col) => {
    if (col.actionConfig && col.actionConfig.isUnique) {
      acc[col.column] = col.actionConfig.isUnique;
    }
    return acc;
  }, {});

  data.forEach(cell => {

    const isUnique = columnsWithIsUnique[cell.column];
    let isDuplicate = false;

    if (isUnique) {
      // Check if the value is unique across the dataSource
      isDuplicate = dataSource.some((row, index) => {
        const rowValue = getDeepValue(row, cell.column);
        // Check against all other rows except the current row being edited
        return index !== cell.rowIndex && getValue(rowValue).toLowerCase() === cell.value?.toLowerCase();
      });

      if (isDuplicate) {
        validationResults.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          column: cell.column,
          errors: "Data should be unique"
        });
      }
    }

    const schema = columnsWithSchema[cell.column];
    // Only validate if columnSchema is defined and its not duplicae
    if (schema && !isDuplicate) {
      const validate = ajv.compile(schema);
      if (!validate(cell.value)) {
        // If validation fails, push the cell info and validation errors
        validationResults.push({
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          column: cell.column,
          errors: validate.errors
        });
      }
    }
  });

  return !(validationResults.length > 0);
}

export const updateSchemaObjectProperties = (obj) => {
  // Check if 'properties' exists and has a 'value' property
  if (obj.hasOwnProperty('properties') && obj.properties.hasOwnProperty('value')) {
    // Create a new object with the contents of 'value' at the top level
    const updatedProperties = { ...obj.properties.value };

    // Return a new object with the updated structure
    return updatedProperties;
  }

  // If 'value' doesn't exist, return a shallow copy of the object as is
  return { ...obj };
}

export const getTableCellClass = (props: any) => {
  const { isSelectedColumn, hasEditAction, isColumnEditable, col } = props;
  const isNotEditable = col?.actionConfig === false;

  // Initialize the class array with the default class
  let classes = ['table-cell'];

  // Conditionally add 'selected' class
  if (isSelectedColumn) {
    classes = classes.concat('selected');
  }

  // Conditionally add classes based on edit actions and editability
  if (hasEditAction) {
    if (isColumnEditable) {
      classes = classes.concat('is-editable');
    } else if (isNotEditable) {
      classes = classes.concat('is-not-editable');
    }
  }

  // Conditionally add a class from the col object
  if (col?.class) {
    classes = classes.concat(col.class);
  }

  return classes.join(' ');
};

export const copyDataWithExcelFormat = (data, selectedCells) => {
  let grid: any = [];

  // Sort selectedCells by rowIndex
  selectedCells.sort((a, b) => a.rowIndex - b.rowIndex);

  // Calculate the required length for the header row
  const headerLength = Math.max(...selectedCells.map(cell => cell.columnIndex + 1));
  
  // Initialize the header row
  const headerRow = new Array(headerLength).fill(null);

  // Populate the header row
  selectedCells.forEach(cell => {
    if (headerRow[cell.columnIndex] === null) { // Ensure not to overwrite existing headers
      headerRow[cell.columnIndex] = cell.columnName;
    }
  });

  // Filter out null values and adjust the header row
  grid[0] = headerRow.filter(cell => cell !== null);

  // Populate the grid with data
  selectedCells.forEach(cell => {
    if (!grid[cell.rowIndex + 1]) {
      grid[cell.rowIndex + 1] = new Array(headerRow.length).fill(null);
    }

    if (!cell.disableCopy) {
      const dataSourceItem = data[cell.rowIndex];
      const value = getValue(getDeepValue(dataSourceItem, cell.column)) || "";
      grid[cell.rowIndex + 1][cell.columnIndex] = value;
    } else {
      grid[cell.rowIndex + 1][cell.columnIndex] = "";
    }
  });

  // Filter out completely empty rows
  grid = grid.filter(row => row.some(cell => cell !== null && cell !== ""));

  // Adjust each row and prepare for Excel
  const excelReadyText = grid.map(row => {
    const firstNonEmptyIndex = row.findIndex(cell => cell !== null && cell !== "");
    return row.slice(firstNonEmptyIndex).filter(cell => cell !== null).join("\t");
  }).join("\n");

  return excelReadyText;
}

// Assuming getValue and getDeepValue are utility functions you've defined elsewhere


export const updateDataSourceFromExcelWithoutMutation = (data_source, selected_cells, excelData) => {
  // Deep clone function to avoid mutating the original data_source
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  // Step 1: Parse the Excel copied data
  const rows = excelData.split('\n').map(row => row.split('\t'));

  // Helper function to get column data from Excel data based on rowIndex and columnIndex
  const getExcelData = (rowIndex, columnIndex, lowestRowIndex, lowestColumnIndex) => {
    const adjustedRowIndex = rowIndex - lowestRowIndex;
    if (adjustedRowIndex < 0 || adjustedRowIndex >= rows.length) return null;
    const row = rows[adjustedRowIndex];
    const adjustedColumnIndex = columnIndex - lowestColumnIndex;
    return row && adjustedColumnIndex >= 0 && adjustedColumnIndex < row.length ? row[adjustedColumnIndex] : null;
  }

  // Step 2: Deep clone the original data_source to avoid mutations
  const newData = deepClone(data_source);

  // Find the lowest rowIndex and columnIndex for adjustment
  const lowestRowIndex = Math.min(...selected_cells.map(cell => cell.rowIndex));
  const lowestColumnIndex = Math.min(...selected_cells.map(cell => cell.columnIndex));

  // Step 3: Iterate over selected_cells to update newData
  selected_cells.forEach(cell => {
    const { rowIndex, columnIndex, column, disablePaste } = cell;

    // Skip update if disablePaste is true
    if (disablePaste) {
      return;
    }

    const excelValue = getExcelData(rowIndex, columnIndex, lowestRowIndex, lowestColumnIndex);

    if (excelValue !== null) {
      // Navigate to the correct location in newData and update it
      const pathParts = column.split('.');
      let currentObj = newData[rowIndex];
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!currentObj[pathParts[i]]) {
          currentObj[pathParts[i]] = {}; // Create nested objects if they don't exist
        }
        currentObj = currentObj[pathParts[i]];
      }
      // Directly update the last part of the path with the excel value
      currentObj[pathParts[pathParts.length - 1]] = excelValue;
    }
  });

  return newData;
};


export const readClipboardText = async () => {
  if (navigator.clipboard) {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  } else {
    console.error('Clipboard API not available.');
  }
};

export * from "./useDragDropManager";
export * from "./useResizeManager";
export * from "./useCheckOverflow";