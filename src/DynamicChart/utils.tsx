// utils.tsx
import React from "react";

export const LABELS = [
  {
    title: 'Program Limit',
    value: 55000000
  },
  {
    title: 'NAR Limit',
    value: 50000000
  },
  {
    title: 'Main SCB HOLD(20% of PGM Limit)',
    value: 24000000
  }
];

export const VALUES = [
  {
    title: 'Already Distributed',
    value: 125000000,
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
    value: 95000000,
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

  const calculatedValues = values.map(value => ({
    ...value,
    height: `${(value.value / maxValue) * 100}%`
  }));

  return { sortedLabels, calculatedValues };
};

