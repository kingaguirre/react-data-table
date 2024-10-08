// utils.tsx
import React from "react";

export const LABELS = [
  {
    title: 'Program Limit',
    value: 10000
  },
  {
    title: 'NAR Limit',
    value: 10000
  },
  {
    title: 'Main SCB HOLD(20% of PGM Limit)',
    value: 10000
  }
];

export const VALUES = [
  {
    title: 'Already Distributed',
    value: 0,
    color: 'green',
    // details: { info: 'Some more details about Already Distributed' },
    popupTitle: 'Already Distributed Details',
    popoverContent: (
      <div>
        <h2>Already Distributed</h2>
        <p>Investor's Max. Risk Appetite</p>
        <p>USD 40,000,000.00</p>
        <p>Investor Program Limit</p>
        <p>USD 30,000,000.00</p>
        <p>Current Utilization</p>
        <p>USD 20,000,000.00</p>
      </div>
    )
  },
  {
    title: 'SCB Exposure',
    value: 0,
    color: 'blue'
  }
];

export const calculateHeights = (
  labels: any[], 
  values: any[], 
) => {
  // Calculate the maximum value of labels
  const maxLabelValue = Math.max(...labels.map(label => label.value));
  
  // Calculate the sum of values
  const sumValues = values.reduce((acc, value) => acc + value.value, 0);
  
  // Determine the maxValue to use: either the maximum label value or the sum of values
  const maxValue = Math.max(maxLabelValue, sumValues);

  const sortedLabels = labels.map(label => ({
    ...label,
    height: `${(label.value / maxValue) * 100}%`
  })).sort((a, b) => b.value - a.value);

  // Start with accumulatedHeight as 0 for reverse calculation
  let accumulatedHeight = 0;

  // Reverse loop through values array and calculate accumulatedHeight based on the next values
  const calculatedValues = [...values].reverse().map((value, index) => {
    const height = (value.value / maxValue) * 100;
    accumulatedHeight += height; // Add the height of the current item to the accumulatedHeight

    return {
      ...value,
      height: `${height}%`,
      accumulatedHeight
    };
  }).reverse(); // Reverse back the array to maintain original order

  return { sortedLabels, calculatedValues };
};


// Function to remove circular references
const removeCircularReferences = (obj, seen = new WeakSet()) => {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return; // Circular reference detected, returning undefined to avoid it
    }
    seen.add(obj);

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = removeCircularReferences(obj[key], seen);
      }
    }
  }
  return obj;
};
