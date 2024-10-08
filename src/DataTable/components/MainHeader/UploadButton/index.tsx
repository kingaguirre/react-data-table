import React, { useContext, useRef, useCallback, ChangeEvent } from "react";
import { setDeepValue, getDeepValue, updateDataSourceFromExcelWithoutMutation, generateSelectedCells, toExcelFormat } from "../../../utils";
import { SET_FETCHED_DATA, SET_LOCAL_DATA } from "../../../context/actions";
import { DataTableContext } from "../../../index";
import * as XLSX from 'xlsx';

export const UploadButton = () => {
  const {
    uploadXLS,
    fetchConfig,
    rowKey,
    state: { columns, fetchedData, localData },
    setState,
    onChange,
  } = useContext(DataTableContext);

  const uploadRef = useRef(null);

  const updateData = (newData, currentData, rowKey) => {
    // Helper function to filter out keys that don't exist in the currentData row
    const filterKeys = (newRow, currentRow) => {
      const filteredRow = {};
      Object.keys(currentRow).forEach(key => {
        if (key in newRow) {
          filteredRow[key] = newRow[key];
        }
      });
      return filteredRow;
    };
  
    // Helper function to handle value changes
    const handleValueChange = (currentValue, newValue) => {
      // Check if currentValue is an object with 'value' property
      const actualCurrentValue = currentValue && typeof currentValue === 'object' && 'value' in currentValue ? currentValue.value : currentValue;
      
      // If the current and new values are different, return the correct structure
      if (actualCurrentValue !== newValue) {
        return {
          previous: { value: actualCurrentValue },
          value: newValue,
          isChanged: true
        };
      }
      
      // If the values are the same, return the current value as is
      return { value: newValue };
    };
  
    // Loop through each new data item
    newData.forEach(newRow => {
      const newRowKey = getDeepValue(newRow, rowKey);
  
      // Check if rowKey exists in currentData
      const existingRowIndex = currentData.findIndex(currentRow => 
        getDeepValue(currentRow, rowKey) === newRowKey && newRowKey !== '' // Ignore empty rowKeys in currentData
      );
  
      const intentAction = newRow.intentAction;
  
      if (existingRowIndex !== -1 && newRowKey !== '') {
        // If rowKey is found and not empty, proceed with updating or deleting logic
        if (intentAction === 'U') {
          // If intentAction is 'U' (Update), and the row exists, update the row
          const currentRow = currentData[existingRowIndex];
          const filteredNewRow = filterKeys(newRow, currentRow);
          const updatedRow = {};
  
          // Compare and update only the relevant keys, ignoring 'intentAction'
          Object.keys(filteredNewRow).forEach(key => {
            if (key === rowKey || key === 'intentAction') {
              updatedRow[key] = filteredNewRow[key]; // Keep rowKey and intentAction unchanged
            } else {
              updatedRow[key] = handleValueChange(currentRow[key], filteredNewRow[key]);
            }
          });
  
          // Update the currentData row
          currentData[existingRowIndex] = { ...currentRow, ...updatedRow };
  
        } else if (intentAction === 'D') {
          // If intentAction is 'D' (Delete), mark the row as deleted (update intentAction to 'D')
          currentData[existingRowIndex].intentAction = 'D';
        }
      } else {
        // Always prepend if the rowKey is empty or not found
        const newEntry = { ...newRow, intentAction: 'N' };
        currentData.unshift(newEntry);
      }
    });
  
    return currentData;
  };

  // Handler for file selection and reading
  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        // For example, log the first sheet's data to the console
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          defval: null, // You can also set it to an empty string if you prefer ''
        });
        // Generate selected_cells array to pass in updateDataSourceFromExcelWithoutMutation function
        const selectedCells = generateSelectedCells(data, columns, rowKey);
        const uploadedData = updateDataSourceFromExcelWithoutMutation(data, selectedCells, toExcelFormat(data))
          // .map((item, i) => setDeepValue({intentAction: "N", ...item}, rowKey, `new-${i}-${new Date().getTime()}`));

        if (fetchConfig) {
          const newFetchedData = [...uploadedData, ...(fetchedData.data || [])];
          setState({
            type: SET_FETCHED_DATA,
            payload: { ...fetchedData, data: newFetchedData }
          });
          onChange?.(newFetchedData);
        } else {
          const newLocalData = updateData(uploadedData, localData, rowKey);
          console.log('newLocalData: ', newLocalData)
          setState({ type: SET_LOCAL_DATA, payload: newLocalData });
          onChange?.(newLocalData);
        }
      };
      
      reader.readAsBinaryString(file);
    }
  }, [columns]);

  return uploadXLS && (
    <div>
      <input
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
        ref={uploadRef}
      />
      <button onClick={() => {
        if (uploadRef && uploadRef?.current) {
          (uploadRef?.current as any)?.click();
        }
      }}>
        <i className="fa fa-upload" />
      </button>
    </div>
  )
}