export const calculateHeights = (
  labels: any[], 
  values: any[], 
) => {
  // Calculate the maximum value of labels
  const maxLabelValue = Math.max(...labels.map(label => label.value));
  
  // Calculate the sum of values
  const sumValues = values.reduce((acc, value) => acc + value.value, 0);
  
  // Determine the maxValue to use: either the maximum label value or the sum of values
  const maxValue = Math.max(maxLabelValue, sumValues) || 100;

  const sortedLabels = [...labels].map(label => ({
    ...label,
    height: `${(label.value / maxValue) * 100}%`
  })).sort((a, b) => b.value - a.value);

  // Start with accumulatedHeight as 0 for reverse calculation
  let accumulatedHeight = 0;

  // Reverse loop through values array and calculate accumulatedHeight based on the next values
  const calculatedDatasets = [...values].reverse().map((value) => {
    const height = (value.value / maxValue) * 100;
    accumulatedHeight += height; // Add the height of the current item to the accumulatedHeight

    return {
      ...value,
      height: `${height}%`,
      accumulatedHeight
    };
  }).reverse(); // Reverse back the array to maintain original order

  return { sortedLabels, calculatedDatasets };
};

// Function to remove circular references
export const removeCircularReferences = (obj, seen = new WeakSet()) => {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return '[Circular]'; // Circular reference detected, returning undefined to avoid it
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
      return obj.map(item => removeCircularReferences(item, seen));
    }

    const newObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {

        if (key === '$$typeof') {
          continue;
        }

        try {
          newObj[key] = removeCircularReferences(obj[key], seen);
        } catch (error) {
          newObj[key] = '[Circular]';
        }
      }
    }
    return newObj;
  }
  return obj;
};