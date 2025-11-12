import React from 'react';
import * as XLSX from 'xlsx';
import { Actions, ColumnSettings } from "../interfaces";
import { ActionsColumn } from "../components/ActionsColumn";
import { TXAjv } from '@tradexpress/schemas/dist/TXAjv';
import { currencyBasedAmountFormat } from '@atoms/TXAmount/utils';
import { isValidArray, _mergeObject } from '@utils/index';

export const FIELD_REQUIRED = "Field is required";
export const DATA_UNIQUE_TEXT = "Data should be unique";
export const highlightText = (text: string, highlight: string) => {
  if (typeof text === "string") {
    // Escape regex special characters in the highlight term
    const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    /** Split text on highlight term, include term itself into parts, ignore case */
    const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ?
          <span key={i} style={{ backgroundColor: '#ffc069' }}>{part}</span> :
          <span key={i}>{part}</span>
        )}
      </span>
    );
  }
};

export const useDoubleClick = (onClick, onDoubleClick, delay = 250) => {
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

export const getDeepValue = (obj: any, path = "", returnObj = false) => {
  const value = path?.split(/[\.\[\]]+/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);

  if (value instanceof Date) {
    return value; /** Return date objects as they are */
  } else if (typeof value === 'boolean' || typeof value === 'object') {
    return returnObj ? value : JSON.stringify(value);
  }

  return value;
};

export const deepClone = (obj) => {
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
  const keys = path?.match(/[^.[\]]+/g) || [];

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

// Put this near the module top so it isn't recreated on every call
const TEXT_COLLATOR = new Intl.Collator(undefined, {
  // keep accents significant, but ignore case (good default for UIs)
  sensitivity: 'accent',
  // don't prefer upper or lower; treat case neutrally
  caseFirst: 'false',
});

export const sortData = (data: any[] | null, column: ColumnSettings, direction: 'asc' | 'desc') => {
  if (data === null) return null;

  const custom = (column as any).sortFn;
  if (typeof custom === 'function') {
    const asc = (a: any, b: any) => custom(a, b, column);
    const cmp = direction === 'asc' ? asc : (a: any, b: any) => -asc(a, b);
    return [...data].sort(cmp);
  }

  const compareFunction = (a: any, b: any) => {
    let aVal = '';
    let bVal = '';

    const aColVal = getDeepValue(a, column.column);
    const bColVal = getDeepValue(b, column.column);

    if (aColVal !== undefined || bColVal !== undefined) {
      aVal = String(aColVal ?? '').trim();
      bVal = String(bColVal ?? '').trim();
    } else {
      const aCustom = column.columnCustomRenderer?.(null, a ?? null);
      const bCustom = column.columnCustomRenderer?.(null, b ?? null);
      const aDownloadTextVal = renderColumnCustomRenderer(aCustom, 'downloadText');
      const bDownloadTextVal = renderColumnCustomRenderer(bCustom, 'downloadText');
      aVal = String(aDownloadTextVal ?? aCustom ?? '').trim();
      bVal = String(bDownloadTextVal ?? bCustom ?? '').trim();
    }

    // 1) Dates first
    const aTime = Date.parse(aVal);
    const bTime = Date.parse(bVal);
    if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) {
      return aTime - bTime;
    }

    // 2) Numeric strings next (extract digits like "RM 1,234" → 1234)
    const aMatches = aVal.match(/\d+/g) || [];
    const bMatches = bVal.match(/\d+/g) || [];
    if (aMatches.length > 0 && bMatches.length > 0) {
      const aNum = parseInt(aMatches.join(''), 10);
      const bNum = parseInt(bMatches.join(''), 10);
      if (aNum !== bNum) return aNum - bNum;
    }

    // 3) Case-insensitive, accent-sensitive text compare
    return TEXT_COLLATOR.compare(aVal, bVal);
  };

  return direction === 'asc'
    ? [...data].sort(compareFunction)
    : [...data].sort((x, y) => -compareFunction(x, y));
};

export const getTableWidth = (props) => {
  const { columns, selectable, collapsibleRowRender, isAllColumnHidden } = props;
  return {
    width: isAllColumnHidden ? '100%' : columns?.reduce((acc, col) =>
      acc + (parseInt((col.hidden) ? "" : (col.width || col.defaultWidth) || "", 10) || 0), 0
    ) + (selectable ? 27 : 0) + (collapsibleRowRender ? 30 : 0),
  }
};

export const getPinnedDetails = (col: any, pinnedWidth: number) => {
  const showPinIcon = col.pinned !== 'none';
  const isPinned = col.pinned === true;
  const colWidth = parseInt(col.width ?? col.defaultWidth ?? 0, 10);

  return {
    showPinIcon,
    isPinned,
    colWidth,
    pinnedStyle: isPinned ? { left: `${pinnedWidth}px`, zIndex: 10001 } : {}
  }
}

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export const filterCheck = (filterValue: any, rowValue: string, filterType = "number-range") => {
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

export const getLocalStorageColumnSettings = (columnSettings, localStorageSettingsKey) => {
  if (!!localStorageSettingsKey) {
    const savedDefaultColumnSettings = JSON.parse(sessionStorage.getItem(`${localStorageSettingsKey}-defaultColumnSettings`) || '[]');
    const savedCurrentColumnSettings = JSON.parse(sessionStorage.getItem(`${localStorageSettingsKey}-currentColumnSettings`) || '[]');
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
  }
  return columnSettings;
};

export const addPXPrefix = (value) => typeof value === 'number' ? `${value}px` : value;

export const getColumnDefaultWidth = (currentColoumnSettings: any, tableWidth: any) => {
  const _colSettings = currentColoumnSettings.filter(i => i.hidden !== true);
  const columnsWithWidth = _colSettings.filter(col => (col.width || col.minWidth));
  const totalWidthWithWidth = columnsWithWidth.reduce((acc, col) => acc + parseInt(col.width || col.minWidth, 10), 0);
  const remainingWidth = tableWidth - totalWidthWithWidth;
  const columnsWithoutWidth = _colSettings.filter(col => !col.width && !col.minWidth);
  const columnWidth = columnsWithoutWidth.length > 0 ? Math.max(remainingWidth / columnsWithoutWidth.length, 160) : 160;

  return addPXPrefix(columnWidth);
};

export const setColumnSettings = (
  columnSettings: any,
  tableWidth: any,
  customRowSettings?: any,
  actions?: Actions | Actions[],
  actionColumnSetting?: any,
  localStorageSettingsKey?: string,
  actionsDropdownItems?: any,
  currentColumnSettings?: any,
) => {
  // Custom Row column
  let customColumns = (!!customRowSettings && customRowSettings.length > 0)
    ? customRowSettings.filter(i => i.showColumn !== false).map(i => ({
      column: i.column,
      title: i.title || "#",
      align: "center",
      order: 0,
      pinned: true,
      sorted: "none",
      controls: "none",
      width: i.width || "40px",
      draggable: false,
      actionConfig: false,
      selectable: false,
      resizable: false,
      class: 'custom-intent-action-column',
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

  const hasActions = isStringExist(actions, [Actions.DELETE, Actions.COPY, Actions.PASTE, Actions.DUPLICATE, Actions.ADD]);

  // Action Column
  const actionsColumn = (hasActions || actionsDropdownItems) ? [{
    column: "",
    title: "Action",
    align: "center",
    order: 0,
    pinned: true,
    sorted: "none",
    controls: "none",
    width: "60px",
    draggable: false,
    actionConfig: false,
    selectable: false,
    resizable: false,
    class: 'custom-action-column',
    columnCustomRenderer: (data, _, rowIndex) => <ActionsColumn data={data} rowIndex={rowIndex}/>,
    ...actionColumnSetting,
  }] : [];

  const localStorageColumnSettings = getLocalStorageColumnSettings(columnSettings, localStorageSettingsKey);

  /** Now we merge customColumns and localStorageColumnSettings, ensuring no duplicates from customColumns */
  const currentColoumnSettings = [...actionsColumn, ...customColumns, ...localStorageColumnSettings];

  if (tableWidth === null) return currentColoumnSettings;

  const defaultWidth = getColumnDefaultWidth([...(currentColumnSettings || columnSettings)], tableWidth);

  return currentColoumnSettings.sort((a, b) => {
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
    ...getWidth((currentColumnSettings || columnSettings), col.column),
    // Use current column settings state value if already defined, else use the default columnSettings
    ...getColumnValueFromKey(currentColumnSettings, columnSettings, col.column, 'sorted'),
    ...getColumnValueFromKey(currentColumnSettings, columnSettings, col.column, 'pinned'),
    ...getColumnValueFromKey(currentColumnSettings, columnSettings, col.column, 'hidden'),
    ...getColumnValueFromKey(currentColumnSettings, columnSettings, col.column, 'order'),
    order: index,
    defaultWidth
  }));

};

const getColumnValueFromKey = (currentColumns, columns, key, colKey) => {
  const colValue = columns.find(i => i.column === key)?.[colKey];
  if (currentColumns === undefined || currentColumns?.length === 0) {
    return { [colKey]: colValue }
  } else {
    const curColValue = currentColumns.find(i => i.column === key)?.[colKey];
    return { [colKey]: curColValue !== colValue ? curColValue : colValue};
  }
};

export const getWidth = (columns, key) => {
  const width = columns.find(i => i.column === key)?.width;
  return width ? { width: addPXPrefix(width) } : {};
};

export const updateWidthByIndex = (columns, index, width) => {
  if (index >= 0 && index < columns.length) {
    columns[index].width = addPXPrefix(width);
  }
  return columns;
};

export const serializeColumns = (columns) => {
  return columns.map(({ columnCustomRenderer, ...rest }) => rest);
}

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
  for (const p in obj) {
    if (obj.hasOwnProperty(p) && obj[p] !== undefined && obj[p] !== null) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
};

export const mergeCustomStylesForRow = (rowValue, customRowSettings) => {
  let mergedStyles = {};

  // Loop through each customRowSetting
  customRowSettings?.forEach((setting) => {
    const valueAtPath = getValue(getDeepValue(rowValue, setting.column));
    if (valueAtPath !== undefined && valueAtPath === setting.value) {
      // Merge the styles if the condition is true
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

export const updateDataByRowKey = (rowData, data, rowKey, intentAction = "D") => [...data || []]
  .map(d => {
    const rowDataRowKey = getDeepValue(rowData, rowKey);
    const dataRowKey = getDeepValue(d, rowKey);
    if (rowDataRowKey === dataRowKey) {
      return { ...d, ...rowData, intentAction }
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

export const arrayToEmptyObject = (keys) => {
  const result = {};
  keys.forEach(key => {
    result[key] = '';
  });
  return result;
}

const extractValueFromObject = (obj, type) => {
  if ('value' in obj) {
    if (Array.isArray(obj.value)) {
      // Handle when 'value' is an array
      const commaSeparatedString = obj.value.join(', ');
      if (isValidDate(commaSeparatedString)) {
        // Input is a valid date string, format the date
        return dateFormat(new Date(commaSeparatedString), type);
      }
      return commaSeparatedString;
    } else if (typeof obj.value === 'string') {
      // Check if 'value' is a date string
      if (isValidDate(obj.value)) {
        // 'value' is a valid date string, format the date
        return dateFormat(obj.value, type);
      }
      // Handle when 'value' is a string but not a date
      return obj.value;
    } else if (obj.value instanceof Date) {
      // Directly handle if 'value' is a Date object
      return dateFormat(obj.value, type);
    } else {
      // Return any kind of value as string;
      return obj.value?.toString();
    }
  }
  return null; // Handle the case when the object doesn't have a 'value' property or it's not an array/string/date
};

const isValidDate = (str) => {
  // Updated regular expression to include comma-separated date formats
  const likelyDatePattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)|(\d+[\/\-.]\d+[\/\-.]\d+)|(\d{4}-\d{2}-\d{2})|(\d{4},\s*\d{1,2},\s*\d{1,2})/;

  // Remove surrounding quotes if present
  str = str.replace(/^["']|["']$/g, '');

  // Try to match the input string against the likely date pattern
  if (!likelyDatePattern.test(str)) {
    // If the input doesn't match the pattern, it's not a likely date format
    return false;
  }

  // Check for comma-separated date strings
  if (str.includes(',')) {
    const parts = str.split(',').map(part => part.trim());

    // If there are more than 3 parts, it's not a valid date format
    if (parts.length > 3) {
      return false;
    }

    // Attempt to convert the parts to a date
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);

    // Construct a date object using the parts
    const date = new Date(year, month, day);

    // Check if the constructed date is valid
    if (isNaN(date.getTime())) {
      return false;
    }

    // Successfully parsed a valid date
    return true;
  } else {
    // Try to parse the string as a date for other formats
    const date = new Date(str);

    // Check if the parsed date is an Invalid Date
    if (isNaN(date.getTime())) {
      return false;
    }

    // Successfully parsed a valid date
    return true;
  }
};

/** Simple formatter for date */
export const dateFormat = (dateValue: any, type?: string) => {
  const trimmedValue = dateValue?.replace(/^["']|["']$/g, '');
  const isUTC = trimmedValue.endsWith('Z');
  const date = new Date(trimmedValue);

  const hasTime = type === 'dateTime' || type === 'dateTimeSeconds';
  const hasSeconds = type === 'dateTimeSeconds';

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const addPadding = (val: number) => (val < 10 ? '0' + val : val);

  const year = isUTC ? date.getUTCFullYear() : date.getFullYear();
  const monthIndex = isUTC ? date.getUTCMonth() : date.getMonth();
  const day = isUTC ? date.getUTCDate() : date.getDate();
  const hours = isUTC ? date.getUTCHours() : date.getHours();
  const minutes = isUTC ? date.getUTCMinutes() : date.getMinutes();
  const seconds = isUTC ? date.getUTCSeconds() : date.getSeconds();
  const time = `${addPadding(hours)}:${addPadding(minutes)}${hasSeconds ? `:${addPadding(seconds)}` : ''}`;

  const formattedDate = `${addPadding(day)}-${monthNames[monthIndex]}-${year}${hasTime ? `, ${time}` : ''}`;
  return formattedDate;
};

/** Check object or string if its valid "currency format" and returns currency and formattedValue as an objet */
export const isCurrencyObjFormat = (value) => {
  let obj;

  // Helper function to safely check for both direct and nested properties
  function getNestedValue(object, key) {
    if (typeof object === 'object' && object !== null && !Array.isArray(object)) {
      if (key in object) {
        return object[key];
      } else if ((key + '.value') in object && typeof object[key] === 'object' && object[key] !== null) {
        return object[key].value;
      }
    }
    return undefined;
  }

  // If value is a string, try parsing it as JSON
  if (typeof value === 'string') {
    try {
      obj = JSON.parse(value);
    } catch (e) {
      // Parsing failed, return undefined
      return undefined;
    }
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // If value is already an object, use it for further processing
    obj = value;
  } else {
    // Not a parseable string or a valid object
    return undefined;
  }

  // Extract the values for currency and formattedValue, considering nested scenarios
  const currencyValue = getNestedValue(obj, 'currency');
  const formattedValue = getNestedValue(obj, 'formattedValue');
  const unFormattedValue = getNestedValue(obj, 'unFormattedValue');

  // Check if both values are not undefined
  if (currencyValue !== undefined && formattedValue !== undefined && unFormattedValue !== undefined) {
    return {
      currency: currencyValue,
      formattedValue: formattedValue,
      unFormattedValue: unFormattedValue,
    };
  } else {
    // If any value is missing, return undefined
    return undefined;
  }
};

export const getValue = (input, type?: string) => {
  // Check if input is a string
  if (typeof input === 'string') {
    if (isValidDate(input)) {
      // Input is a valid date string, format the date
      return dateFormat(input, type);
    }
    try {
      const parsedObject = JSON.parse(input);
      if (Array.isArray(parsedObject)) {
        // Handle case when input is a JSON string representing an array
        const commaSeparatedString = parsedObject.join(', ');
        if (isValidDate(commaSeparatedString)) {
          // Input is a valid date string, format the date
          return dateFormat(commaSeparatedString, type);
        }
        return commaSeparatedString;
      } else {
        const _isCurrencyObjFormat = isCurrencyObjFormat(parsedObject);
        if (_isCurrencyObjFormat) {
          return currencyBasedAmountFormat(_isCurrencyObjFormat.currency?.value, _isCurrencyObjFormat.formattedValue?.value)?.formattedValue
        }
        // Handle case when input is a JSON string representing an object
        return extractValueFromObject(parsedObject, type);
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
      const _isCurrencyObjFormat = isCurrencyObjFormat(input);
      if (_isCurrencyObjFormat) {
        return currencyBasedAmountFormat(_isCurrencyObjFormat.currency?.value, _isCurrencyObjFormat.formattedValue?.value)?.formattedValue
      }
      // Handle case when input is already an object
      return extractValueFromObject(input, type);
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
export const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => {
    if (acc && key.includes('[') && key.includes(']')) {
      const [arrayKey, index] = key.split(/[\[\]]/).filter(value => !!value)
      return acc[arrayKey] ? acc[arrayKey][index] : null;
    }
    return (acc && acc[key] !== undefined) ? acc[key] : null;
  }, obj);
};

/**
 * Function to download Excel file.
 * @param {Array} headers - Array of headers for the Excel file.
 * @param {Array} rows - Array of row data for the Excel file.
 * @param {String} fileName - Name of the file to be downloaded.
 */
export const downloadExcel = (headers, rows, rowKey, withDownloadUploadAction, fileName = "data", downloadHiddenColumn = true) => {
  const rowKeyColumnName = 'Row Key';
  const intentActionColumnName = 'Intent Action';

  // Check each header to see if it should be included based on its 'hidden' status and the type of 'cell'
  const filteredHeaders = headers.filter(header => {
    if (header.disableDownload) {
      return false;
    }

    // Directly include if not hidden and no cell renderer or cell renderer does not return a complex object
    if ((downloadHiddenColumn || !header.hidden) && header.class !== "custom-action-column") {
      // If there's a cell function, we evaluate it on the first row to check its return type (assuming row consistency)
      if (header.columnCustomRenderer) {
        const result = header.columnCustomRenderer(rows?.[0]?.[header.column], rows?.[0]);
        // Check if the result is a string (simple value)
        if (typeof result === 'object') {
          return checkIfObjHasProp(result, 'downloadText', 'string');
        }
        return true;
      }
      return true;
    }
    return false;
  });

  // Process rows to extract values, including handling string results from cell functions
  const processedRows = rows?.map(row => {
    let newRow = {};

    if (withDownloadUploadAction) {
      // First column: rowKey value
      newRow[rowKeyColumnName] = getDeepValue(row, rowKey);

      // Second column: intentAction
      newRow[intentActionColumnName] = row.intentAction;
    }
    
    filteredHeaders.forEach(header => {
      const keys = header.column.split('.');
      let value;
      // Check if header has a cell function and use it if available
      if (header.columnCustomRenderer && typeof header.columnCustomRenderer === 'function') {
        value = renderColumnCustomRenderer(header.columnCustomRenderer(row?.[header.column], row), 'downloadText');
      } else {
        value = getValue(getNestedValue(row, keys), header.type);
      }
      newRow[header.title] = value;
    });
    return newRow;
  });

  // Create a new workbook and add a worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(processedRows, {
    header: [...(withDownloadUploadAction ? [rowKeyColumnName, intentActionColumnName] : []), ...filteredHeaders.map(header => header.title)],
    skipHeader: false
  });

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Write workbook and download
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/** Check if the value is unique across the dataSource */
export const getIsDuplicate = (dataSource, value, column, rowKey, rowKeyValue) => {
  const _trimmedValue = trimValue(value);
  const normalizedInputValue = typeof _trimmedValue === 'string' ? _trimmedValue?.toLowerCase() : _trimmedValue;
  return dataSource.some((_row) => {
    const _trimmedRowValue = trimValue(getValue(getDeepValue(_row, column, true)));
    const rowValue = typeof _trimmedRowValue === 'string' ? _trimmedRowValue?.toLowerCase() : _trimmedRowValue;
    const _rowKeyValue = getDeepValue(_row, rowKey);
    const isDeletedRow = getDeepValue(_row, "intentAction") === "D";

    /** Check against all other rows except the current row being edited */
    return (_rowKeyValue !== rowKeyValue && !isDeletedRow && rowValue === normalizedInputValue);
  })
};

export const isValidDataWithSchema = (columns, editingCells, dataSource, rowKey) => {
  const addedRowData = dataSource.find(i => i.intentAction === '*');
  const addedRowKeyValue = addedRowData?.[rowKey];

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

  /** Get data from dataSource if schema or isUnique is defined from columns */
  const dataWithSchemaOrIsUnique = columns.map(item => {
    if (item?.actionConfig?.schema || item?.actionConfig?.schema) {
      return {
        column: item.column,
        editable: false,
        rowKeyValue: addedRowKeyValue,
        type: item?.actionConfig?.type || "text",
        value: addedRowData?.[item.column]?.value ?? addedRowData?.[item.column],
      }
    }
    return undefined
  }).filter(i => i);

  const mergeData = (obj1: any[], obj2: any[]) => {
    const obj2Map = new Map(obj2.map(item => [item.column, {...item}]));

    return obj1.map(item => {
      const obj2Match = obj2Map.get(item.column);

      return obj2Match ? { ...item, ...obj2Match } : { ...item };
    });
  }

  const data = mergeData(dataWithSchemaOrIsUnique, editingCells).filter(i => i.rowKeyValue === addedRowKeyValue);

  data.forEach(cell => {
    const isUnique = columnsWithIsUnique[cell.column];
    let isDuplicate = false;
    const _trimmedValue = trimValue(cell?.value);

    if (isUnique) {
      isDuplicate = getIsDuplicate(dataSource, _trimmedValue, cell.column, rowKey, addedRowKeyValue);

      if (isDuplicate) {
        validationResults.push({
          column: cell.column,
          errors: DATA_UNIQUE_TEXT
        });
      }
    }

    const schema = columnsWithSchema[cell.column];
    // Only validate if columnSchema is defined and its not duplicae
    if (schema && !isDuplicate) {
      const validationErrors = useTXAjvValidation(_trimmedValue, schema);
      if (validationErrors !== null) {
        // If validation fails, push the cell info and validation errors
        validationResults.push({
          column: cell.column,
          errors: validationErrors
        });
      }
    }
  });

  return !(validationResults.length > 0);
}

/** Use to properly set schema object  */
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

export const useTXAjvValidation = (value, schema) => {
  const txAjvObj: any = TXAjv.getSingletonInstance();
  const validate = txAjvObj.compile(updateSchemaObjectProperties(schema) || {});
  /** Do validation */
  validate(value);
  return validate.errors;
};

export const getTableCellClass = (props: any) => {
  const { isInEditableStatus, isSelectedCell, hasEditAction, isCellEditable, column, noActionConfig, highlighted } = props;
  const isNotEditable = column?.actionConfig === false;

  // Initialize the class array with the default class
  let classes = ['table-cell'];

  // Conditionally add 'selected' class
  if (isSelectedCell) {
    classes = classes.concat('selected');
  }

  // Conditionally add 'highlighted' class
  if (highlighted) {
    classes = classes.concat('highlighted');
  }

  // Conditionally add 'is-in-editable-status' when cell is in edit mode
  if (isInEditableStatus) {
    classes = classes.concat('is-in-editable-status');
  }

  // Conditionally add classes based on edit actions and editability
  if (hasEditAction || noActionConfig) {
    if (isCellEditable) {
      classes = classes.concat('is-editable');
    } else if (isNotEditable || noActionConfig) {
      classes = classes.concat('is-not-editable');
    }
  }

  // Conditionally add a class from the col object
  if (column?.class) {
    classes = classes.concat(column.class);
  }

  return classes.join(' ');
};

const getValueCaseInsensitive = (data, rowIndex, columnName) => {
  if (!columnName) {
    return undefined; // Safeguard against undefined columnName
  }

  // Preprocess the row at the specified index
  const row = data[rowIndex];
  const keyMap = new Map();

  for (const key in row) {
    keyMap.set(key.toLowerCase(), key);
  }

  // Lookup the column name case-insensitively
  const originalKey = keyMap.get(columnName.toLowerCase());
  return originalKey ? row[originalKey] : undefined;
};

export const findMismatchedCells = (columnSettings, selected_cells) => {
  // Filter column settings to exclude those with class = "custom-action-column"
  const filteredColumnSettings = columnSettings.filter(setting => setting.class !== "custom-action-column");
  
  // Create a map of columnSettings where the key is the column and value is the title
  const columnTitleMap = filteredColumnSettings.reduce((map, setting) => {
    map[setting.column] = setting.title?.toLowerCase();
    return map;
  }, {});

  // Find mismatched cells
  const mismatchedCells = selected_cells.filter(cell => {
    // Check if columnName in selected_cells matches the title in columnSettings
    const expectedTitle = columnTitleMap[cell.column];
    return expectedTitle !== cell.originalColumnName?.toLowerCase();
  });

  // Return mismatched cells
  return mismatchedCells;
}

export const updateDataSourceFromExcelWithoutMutation = (data_source, selected_cells, rowKey, columnSettings, excelData?, invalidCol?) => {
  // Deep clone function to avoid mutating the original data_source
  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const _selected_cells = selected_cells.filter(cell => cell.column !== undefined);

  const misMatchedCells = findMismatchedCells(columnSettings, _selected_cells);
  if (misMatchedCells.length > 0) {
    invalidCol?.(misMatchedCells);
  }

  // Step 1: Parse the Excel copied data
  const rows = excelData?.split('\n').map(row => row.split('\t')).slice(1);

  // Helper function to get column data from Excel data based on rowIndex and columnIndex
  const getExcelData = (rowIndex, columnIndex, lowestRowIndex, lowestColumnIndex) => {
    const adjustedRowIndex = rowIndex - lowestRowIndex;
    if (adjustedRowIndex < 0 || adjustedRowIndex >= rows.length) return null;
    const row = rows[adjustedRowIndex];
    const adjustedColumnIndex = columnIndex - lowestColumnIndex;
    return row && adjustedColumnIndex >= 0 && adjustedColumnIndex < row.length ? row[adjustedColumnIndex] : null;
  }

  // Helper function to get column settings for a title (case-insensitive)
  const getColumnSetting = (header) =>
    columnSettings.find(
      (setting) => setting.title.toLowerCase() === header.toLowerCase()
    );

  // Step 2: Deep clone the original data_source to avoid mutations
  let newData = deepClone(data_source);

  // Find the lowest rowIndex and columnIndex for adjustment
  const lowestRowIndex = Math.min(..._selected_cells.map((cell) => cell.rowIndex));
  const lowestColumnIndex = Math.min(..._selected_cells.map((cell) => cell.columnIndex));

  // Step 3: Iterate over _selected_cells to update newData
  _selected_cells.forEach((cell) => {
    const { rowIndex, columnIndex, columnName, disablePaste } = cell;

    // Skip update if disablePaste is true
    if (disablePaste) {
      return;
    }

    const excelValue = excelData
      ? getExcelData(rowIndex, columnIndex, lowestRowIndex, lowestColumnIndex)
      : getValueCaseInsensitive(data_source, rowIndex, columnName);

    const columnSetting = getColumnSetting(columnName);
    if (!columnSetting) {
      return; // Skip invalid titles
    }

    const columnKey = columnSetting.column; // Use columnSettings.column as the key

    if (excelValue !== null && excelValue !== undefined) {
      // Handle nested paths using pathParts
      const pathParts = columnKey.split('.');
      let currentObj = newData[rowIndex] || {}; // Create row if it doesn't exist
      newData[rowIndex] = currentObj;

      // Navigate to the correct nested location in newData
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!currentObj[pathParts[i]]) {
          currentObj[pathParts[i]] = {}; // Create nested objects if they don't exist
        }
        currentObj = currentObj[pathParts[i]];
      }

      // Update the value at the final path part
      currentObj[pathParts[pathParts.length - 1]] = excelValue;
    }
  });

  // Step 4: Clean up invalid or empty rows
  newData = newData.map((row) => {
    // Filter the row to only include valid columns
    const filteredRow = Object.keys(row).reduce((acc, key) => {
      const columnSetting = columnSettings.filter(i => i.class !== "custom-action-column").find(
        (setting) => setting.column === key
      );

      if (columnSetting) {
        if (columnSetting.disableUpload) {
          acc[key] = "";
        } else {
          acc[key] = row[key]?.toString();
        }
      }
      return acc;
    }, {});

    return filteredRow;
  });

  // Remove rows that are entirely empty or contain only null/undefined/empty strings
  newData = newData.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      const columnSetting = columnSettings.find((setting) => setting.column === key);
      return (
        columnSetting && // Ensure the column exists in settings
        !columnSetting.disableUpload && // Ensure the column is not marked for disableUpload
        value !== null &&
        value !== undefined &&
        value !== ''
      );
    })
  );

  return removeKeysWithSpaces(newData).map((value, i) => ({
    [rowKey]: `${rowKey}_new_${i}_${new Date().getTime()}`,
    ...value
  }));
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
};

const removeKeysWithSpaces = (arr) => {
  return arr.map((obj) => {
    return Object.keys(obj).reduce((acc, key) => {
      if (!key.includes(' ')) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  });
};

export const readClipboardText = async () => {
  if (navigator.clipboard) {
    try {
      const text = await navigator?.clipboard?.readText();
      return text;
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  } else {
    console.error('Clipboard API not available.');
  }
};

export const mergeWithPrevious = (obj1, obj2, rowKey?) => {
  const result = {};

  // Resolve the value of rowKey within obj1 to determine if it should be skipped
  const skipValue = getDeepValue(obj1, rowKey, true);

  // Helper function to check if an object has the specific format { value: ... }
  const isSpecialFormat = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null && 'value' in obj;

  Object.keys(obj1).forEach(key => {
    const currentPath = rowKey?.startsWith(key) ? rowKey?.slice(key.length) : '';
    const isRowKey = rowKey === currentPath || rowKey?.startsWith(key + '.');

    if (key === 'intentAction') {
      // Directly set value to 'U' for intentAction key and skip object format
      result[key] = 'U';
    } else if (isRowKey && skipValue !== undefined) {
      // If current key matches rowKey, use obj1's value directly
      result[key] = obj1[key];
    } else if (!obj2.hasOwnProperty(key)) {
      // Handle null and undefined explicitly
      if (obj1[key] === null || obj1[key] === undefined) {
        result[key] = { previous: obj1[key], isChanged: false };
      } else {
        result[key] = obj1[key];
      }
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj1[key]) && !isSpecialFormat(obj1[key]) && !isSpecialFormat(obj2[key])) {
      // Recursive merge for nested objects
      result[key] = mergeWithPrevious(obj1[key], obj2[key]);
    } else if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      // Handle arrays
      result[key] = obj1[key].map((item, index) => {
        if (obj2[key][index] !== undefined) {
          return mergeWithPrevious([item], [obj2[key][index]])[0];
        }
        return item;
      });
    } else {
      if (isSpecialFormat(obj1[key]) || isSpecialFormat(obj2[key])) {
        const previousValue = isSpecialFormat(obj1[key]) ? obj1[key].value : obj1[key];
        result[key] = {
          previous: { value: previousValue },
          isChanged: obj1[key] !== obj2[key],
          value: isSpecialFormat(obj2[key]) ? obj2[key].value : obj2[key]
        };
      } else {
        result[key] = {
          previous: {
            value: obj1[key]
          },
          isChanged: obj1[key] !== obj2[key],
          value: obj2[key]
        };
      }
    }
  });

  // Process keys in obj2 that are not in obj1
  Object.keys(obj2).forEach(key => {
    if (!obj1.hasOwnProperty(key) && key !== 'intentAction') {
      result[key] = obj2[key]; // Add new values from obj2
    }
    // Existing keys have been processed in the first loop
  });

  return result;
};

export const generateSelectedCells = (data, columns, rowKey, withDownloadUploadAction) => {
  // Ensure all data objects have the same keys, filling missing ones with null
  const allKeys = Array.from(new Set(data.flatMap(Object.keys)));
  const normalizedData = data.map(obj =>
    allKeys.reduce((acc: any, key: any) => ({ ...acc, [key]: obj.hasOwnProperty(key) ? obj[key] : null }), {})
  );

  // Remove other columns that is not visible to data-table
  const visibleCol = [...columns]?.filter(i => i.class !== "custom-action-column" && i.hidden !== true);

  // Generate selected_cells array to pass in updateDataSourceFromExcelWithoutMutation function
  return normalizedData.map((row: any, rowIndex) => 
    Object.values(row).map((_: any, itemIndex: number) => {
      let columnName, column;

      if (withDownloadUploadAction) {
        // Set the first column to 'Row Key'
        if (itemIndex === 0) {
          columnName = 'Row Key';
          column = rowKey;
        }
        // Set the second column to 'Intent Action'
        else if (itemIndex === 1) {
          columnName = 'Intent Action';
          column = 'intentAction';
        }
        // Handle the remaining columns as per original logic
        else {
          columnName = visibleCol[itemIndex - 2]?.title; // Adjust index due to the two new columns
          column = visibleCol[itemIndex - 2]?.column;
        }
      } else {
        columnName = visibleCol[itemIndex]?.title; // Adjust index due to the two new columns
        column = visibleCol[itemIndex]?.column;
      }

      return {
        column: column,
        columnIndex: itemIndex,
        columnName: columnName,
        disableCopy: false,
        disablePaste: false,
        disableUpload: visibleCol[itemIndex]?.disableUpload,
        rowIndex: rowIndex,
        originalColumnName: Object.keys(row)[itemIndex]
      };
    })
  ).flat();
};

export const getErrorMessage = (validationErrors, columnTitle, getTranslatedMessage) => {
  const errMessage = validationErrors?.[validationErrors?.length - 1]?.message;
  const customErrMessage = "must NOT be valid";
  const isNotCustomErrMessage = errMessage !== customErrMessage;

  if (isNotCustomErrMessage) {
    const isMandatory = validationErrors === FIELD_REQUIRED;
    return isMandatory ? `${columnTitle} is mandatory` : getTranslatedMessage(validationErrors)
  }
  return "Invalid Input";
};

/** Check if schema object has minLength value and if its > 0 then return true */
export const checkMinLength = (obj) => {
  // Check if the current value is an object, necessary for recursion
  const isObject = (value) => {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  // Recursive function to search for the minLength key
  const searchForObjectWithMinLength = (currentObj) => {
    // Iterate through each property in the current object
    for (const key in currentObj) {
      // Check if the current property is an object for recursion
      if (isObject(currentObj[key])) {
        // If the recursive call finds a minLength, return true immediately
        if (searchForObjectWithMinLength(currentObj[key])) {
          return true;
        }
      } else if (key === 'minLength' && currentObj[key] > 0) {
        // If the current key is minLength and its value is greater than 0
        return true;
      }
    }
    // If no minLength key with a value > 0 is found in the current branch
    return false;
  }

  return searchForObjectWithMinLength(obj);
}

export const isValidJsonObj = (str: string) => {
  try {
    const obj = JSON.parse(str);
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
  } catch (e) {
    return false
  }
}

/** Check if col.type === 'tx-amount' then return correct object, otherwise return value */
export const getParsedValue = (str: any, column: any) => {
  const type = column?.actionConfig?.type;
  const columnKey = column?.column;
  const isAmountType = type === 'tx-amount';

  const _isValidJsonObj = isValidJsonObj(str);
  if (isAmountType) {
    const value = _isValidJsonObj ? JSON.parse(str) : str;
    /** if tx-amount type value is in deep object create a new object and return to properly render in tx-amount component */
    if (columnKey.includes('.')) {
      return setDeepValue({}, columnKey, value)
    }
    return {[columnKey]: value};
  }
  return getValue(str);
}

/** Use to return unformatted value if its tx-amount for validation */
export const getSchemaObjValue = (value, column) => {
  const isAmountType = column?.actionConfig?.type === 'tx-amount';
  const isNumberType = column?.actionConfig?.type === 'number';
  if (isAmountType) {
    return getDeepValue(value, column?.column, true)?.formattedValue?.value
  } else if (isNumberType) {
    return value ? Number(value) : undefined
  } else {
    return value
  }
}

/** Use to parsed date value in cell before editing */
export const getDateValue = (date) => {
  const isStrDate = typeof date === 'string';
  const _isValidDate = isStrDate ? isValidDate(date) : true;
  const d = _isValidDate ? new Date(date) : undefined;
  return `${d?.getFullYear()}-${d?.getMonth()}-${d?.getDate()}`;
}

export const getTypedCellValue = (cellContent, type) => {
  const value = getValue(cellContent, type);
  switch(true) {
    case type === 'isYesNo':
      return (value === true || value === 'true') ? 'Yes' : 'No';
    case type === 'tx-amount':
      const isValidObj = isValidJsonObj(cellContent);
      const _isCurrencyObjFormat = isValidObj ? isCurrencyObjFormat(JSON.parse(cellContent)) : undefined;
      const currency = _isCurrencyObjFormat?.currency.value;
      return <>{currency && <b>{currency}</b>} {value}</>;
    case type === 'dateTime':
      return getValue(cellContent, type)
    default: return value;
  }
};

export const processData = (input, rowKey, rowKeyValue) => {
  const result = {};

  [...input].filter(i => getDeepValue(i, rowKey) === rowKeyValue)
    .forEach(({ column, value }) => {
    // Check if the column name indicates a nested object
    if (column?.includes('.')) {
      // Split the column name into parts to build the nested structure
      const parts = column.split('.');
      let current = result;

      // Iterate over the parts to build the nested structure
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // If we're at the last part, assign the value
        if (i === parts.length - 1) {
          current[part] = value;
        } else {
          // If the next part of the structure doesn't exist, create it
          if (!current[part]) {
            current[part] = {};
          }

          // Move deeper into the structure
          current = current[part];
        }
      }
    } else {
      // If it's not a nested object, simply assign the value to the key
      result[column] = value;
    }
  });

  return result;
};

export const filterQueryObjByColumns = (queryObj, columns, requestData, parameters) => {
  // Initialize an empty object to hold the filtered results
  const filteredQuery = {
    ...requestData,
    ...requestData?.filter,
  };

  // Remove the 'filter' key if it exists
  delete filteredQuery?.filter;

  // Iterate over the columns array
  columns.forEach(column => {
    // Only add the key from queryObj to filteredQuery if filterConfig is defined for the column
    // and the column's key is not listed in the parameters array
    if (column.filterConfig && queryObj.hasOwnProperty(column.column) && !parameters.includes(column.column)) {
      filteredQuery[column.column] = queryObj[column.column];
    }
  });

  // Additionally, remove any keys that are explicitly listed in the parameters array
  parameters.forEach(param => {
    if (filteredQuery.hasOwnProperty(param)) {
      delete filteredQuery[param];
    }
  });

  // Convert any array values in filteredQuery to comma-separated strings
  Object.keys(filteredQuery).forEach(key => {
    filteredQuery[key] = queryObj[key] || filteredQuery[key];
    if (Array.isArray(filteredQuery[key])) {
      filteredQuery[key] = filteredQuery[key].join(',')
    }
  })

  // Return the filtered object
  return filteredQuery;
};

export const replaceEndpointValues = (queryObj: any, endpoint: string) => {
  const regex = /{{(.*?)}}/g;
  let match;
  const parameters = new Set(); // Use a Set to automatically ensure uniqueness

  // First, find and collect all unique parameters
  while ((match = regex.exec(endpoint)) !== null) {
    const paramName = match[1];
    if (queryObj.hasOwnProperty(paramName)) {
      parameters.add(paramName);
    }
  }

  // Then, for each unique parameter found, replace all its occurrences in the endpoint
  parameters.forEach((paramName: any) => {
    const value = queryObj[paramName];
    // This creates a new global regex for each parameter to replace all occurrences
    const globalRegex = new RegExp(`{{${paramName}}}`, 'g');
    endpoint = endpoint.replace(globalRegex, value);
  });

  // Convert parameters Set to Array for the output
  return { endpoint, parameters: Array.from(parameters) };
};

export const getTotalWidth = (width, collapsibleRowRender = false, selectable = false) => {
  /** Remove some with if collapsibleRowRender is defined */
  const hasCollapsibleRowRender = collapsibleRowRender ? 38 : 0;
  /** Remove some with if selectable is true */
  const hasSelectable = selectable ? 38 : 0;
  /** Remove some with for horizontal scrollbar */
  const horizontalScrollBarWidth = 10;

  /** Return width */
  return width - (hasCollapsibleRowRender + hasSelectable + horizontalScrollBarWidth)
};

/** Function to create an update amount value object based on old value and new value */
const getAmountValue = (currentValue, newValue) => {
  const result = {};

  /** If no currentValue directly return newValue */
  if (!currentValue) {
    return newValue;
  }

  for (const key in newValue) {
    if (newValue.hasOwnProperty(key) && currentValue.hasOwnProperty(key)) {
      result[key] = {
        value: newValue[key].value
      };
      if (newValue[key].value !== currentValue[key].value) {
        result[key].previous = { value: currentValue[key].value };
      }
    }
  }

  return result;
}

/** get cell obj value when doing handleDoEdit, 
 * add condition to check if type is amount or a normal cell */
export const getCellValue = ({
  isValueUdpated,
  currentValue,
  value,
  column
}) => {
  const isAmount = column?.actionConfig?.type === 'tx-amount';
  return {
    ...(isValueUdpated ? {
      isChanged: true,
      previous: { value: currentValue },
    } : {}),
    ...(isAmount ? getAmountValue(currentValue, getDeepValue(value, column.column, true)) : {value})
  }
}

/** When setting new value in cell after editing get current value to use in 'previous' key */
export const getCurrentCellValue = (saveDataSourceCurrentRow, columnKey, column) => {
  const isAmount = column?.actionConfig?.type === 'tx-amount';
  const prevValue = getDeepValue(saveDataSourceCurrentRow, columnKey);
  const isValidObj = isValidJsonObj(prevValue);
  const parsedValue = isValidObj ? JSON.parse(prevValue) : prevValue;
  return isAmount ? parsedValue : getValue(prevValue);
}

/** Function to check if the object has specific property and type of key-value */
const checkIfObjHasProp = (obj: any, key: string, typeOf: string) => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    key in obj &&
    typeof obj?.[key] === typeOf
  )
};

/** Function to correctly render columnCustomRenderer if it has an object with key 'render' */
export const renderColumnCustomRenderer = (cellValue: any, objToUse = 'render') => {
  if (checkIfObjHasProp(cellValue, objToUse, objToUse === 'downloadText' ? 'string' : 'object')) {
    return cellValue?.[objToUse];
  }

  /** if 'render' value is undefined and downloadText value is defined*/
  if (objToUse === 'render' && !cellValue?.render && !!cellValue?.downloadText) {
    return cellValue?.downloadText;
  }

  if (
    typeof cellValue === 'object' &&
    cellValue !== null &&
    'render' in cellValue &&
    'downloadText' in cellValue &&
    cellValue.render === undefined &&
    cellValue.downloadText === undefined
  ) {
    return '';
  }

  return cellValue;
}

export const checkIsNewRow = (row) => row?.intentAction === "*";

/** Get the default value from columnSettings and return when adding new row */
export const extractValues = (arr: any[]) => arr?.reduce((result, item) => {
  if (item?.actionConfig?.value !== undefined) {
    result[item.column] = item.actionConfig.value
  }
  return result;
}, {});

export const returnAnArray = (data) => {
  return isValidArray(data) ? data : [];
};

/** Update data when pasting new data */
export const updateData = (data, updates) => {
  // Deep clone the data to avoid mutations
  const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  const updatedData = deepClone(data);

  updates.forEach(update => {
    const { rowIndex, column, value } = update;
    
    if (updatedData[rowIndex]) { // Check if the rowIndex exists in data
      const keys = column.split('.'); // Split the column string by '.' to handle nested properties
      let target = updatedData[rowIndex];

      // Traverse to the correct depth, stopping at the second-to-last key
      keys.slice(0, -1).forEach(key => {
        if (target[key] === undefined) target[key] = {}; // Create nested objects if they don't exist
        target = target[key];
      });

      // Set the value at the final key
      target[keys[keys.length - 1]] = value;
    }
  });
  
  return updatedData;
};

/** If actionConfig is an object return object else return as is */
export const getActionStatus = (action, row, isSelected?) => typeof action === 'function' ? action?.(row, isSelected) : action;

/** Returns trimmed value if its not object or number */
export const trimValue = (value) => typeof value === 'string' ? value?.trim() : value

export const getSelectedRows = (rows, rowKeyValue, rowKey) => {
  return Array.isArray(rows) && !!rows?.find(selectedRow => {
    // This will get the deep value if it's an object or just return the value if it's a string or number.
    const selectedRowKeyValue = typeof selectedRow === 'object' ? getDeepValue(selectedRow, rowKey) : selectedRow;
    return selectedRowKeyValue === rowKeyValue;
  });
};

export const filterRows = (rows, removeItems, rowKey) => {
  const idsToRemove = new Set(
    removeItems?.map(item => (typeof item === 'object' ? item[rowKey] : item))
  );
  return rows.filter(row => !idsToRemove.has(row[rowKey]));
}

export * from "./useDragDropManager";
export * from "./useCheckOverflow";