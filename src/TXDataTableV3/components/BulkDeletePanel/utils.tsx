export const updateDataSource = (dataSource, deletedRows, rowKey, isPermanentDelete) => {
  // Create a Set of rowKey values from deletedRows for efficient look-up
  const deletedKeys = new Set(deletedRows.map(row => row[rowKey]));

  // Create a new array by mapping or filtering the dataSource
  if (isPermanentDelete) {
    // Filter out rows where the rowKey is in deletedKeys
    return dataSource.filter(row => !deletedKeys.has(row[rowKey]));
  } else {
    // Map the dataSource, updating the intentAction to "D" if the rowKey is in deletedKeys
    return dataSource.map(row => 
      deletedKeys.has(row[rowKey]) 
        ? { ...row, intentAction: "D" } 
        : { ...row }
    );
  }
};