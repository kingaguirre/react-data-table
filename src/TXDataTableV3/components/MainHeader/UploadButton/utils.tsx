import { getDeepValue } from "@atoms/TXDataTableV3/utils";

export const updateData = (newData, currentData, rowKey) => {
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
