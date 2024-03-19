import React, { useContext, useRef, useCallback, ChangeEvent } from "react";
import { setDeepValue, updateDataSourceFromExcelWithoutMutation, generateSelectedCells } from "../../../utils";
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

  // Handler for file selection and reading
  const handleFileUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      const toExcelFormat = (data) => {
        // Assuming all objects in `data` have the same keys.
        // Convert each object to a string, with values separated by tabs (\t)
        const rows = data.map(obj => {
          // Get all values for the current object, separated by tabs
          return Object.values(obj).join('\t');
        });
      
        // Join all rows with newlines (\n) to get the final string
        return rows.join('\n');
      }

      reader.onload = (e: any) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, {type: 'binary'});
        // For example, log the first sheet's data to the console
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Generate selected_cells array to pass in updateDataSourceFromExcelWithoutMutation function
        const selectedCells = generateSelectedCells(data, columns);

        const updatedRows = updateDataSourceFromExcelWithoutMutation(data, selectedCells, toExcelFormat(data))
          .map((item, i) => setDeepValue({intentAction: "N", ...item}, rowKey, `new-${i}-${new Date().getTime()}`));

        if (fetchConfig) {
          const newFetchedData = [...updatedRows, ...(fetchedData.data || [])];
          setState({
            type: SET_FETCHED_DATA,
            payload: { ...fetchedData, data: newFetchedData }
          });
          onChange?.(newFetchedData);
        } else {
          const newLocalData = [...updatedRows, ...(localData || [])];
          setState({ type: SET_LOCAL_DATA, payload: [...updatedRows, ...localData] });
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