import React, { useState, useEffect, useRef } from 'react';

// Helper to create an array of 100k rows. Each row is an array with one cell.
const createTableData = () => {
  return Array.from({ length: 1000000 }, (_, i) => [`Row ${i + 1}`]);
};

// Function to create an inline web worker using a Blob.
function createWorker() {
  const code = `
    self.onmessage = function(e) {
      const data = e.data;
      // Simulate heavy computation: block for 2 seconds
      const start = Date.now();
      // while (Date.now() - start < 2000) {}
      // Update first row, first column
      data[0][0] = "Updated Worker";
      self.postMessage(data);
    }
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

const TableUpdateTest = () => {
  // Two separate states for table data – one for sync update and one for worker update.
  const [syncTableData, setSyncTableData] = useState(createTableData());
  const [workerTableData, setWorkerTableData] = useState(createTableData());
  // A counter that updates every second to help visualize UI responsiveness.
  const [counter, setCounter] = useState(0);
  const workerRef = useRef(null);

  // Set up the web worker.
  useEffect(() => {
    workerRef.current = createWorker();
    workerRef.current.onmessage = (e) => {
      setWorkerTableData(e.data);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Heartbeat counter to show if the UI is freezing.
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Synchronous update that blocks the main thread.
  const handleSyncUpdate = () => {
    // Simulate heavy computation by blocking for 2 seconds.
    const start = Date.now();
    while (Date.now() - start < 2000) {} // UI will freeze here.
    // Update the first row, first column.
    setSyncTableData(prevData => {
      const newData = [...prevData];
      newData[0] = [...newData[0]];
      newData[0][0] = "Updated Sync";
      return newData;
    });
  };

  // Update using the web worker.
  const handleWorkerUpdate = () => {
    if (workerRef.current) {
      // Deep copy to avoid accidental mutation.
      const dataCopy = JSON.parse(JSON.stringify(workerTableData));
      workerRef.current.postMessage(dataCopy);
    }
  };

  // Render only the first 10 rows for demonstration.
  const renderTableRows = (data) => {
    return data.slice(0, 10).map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, cellIndex) => (
          <td
            key={cellIndex}
            style={{ padding: '4px', border: '1px solid #ccc' }}
          >
            {cell}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Heartbeat Counter: {counter}</h2>
      <div style={{ marginBottom: '40px' }}>
        <h2>Synchronous Update (blocks UI)</h2>
        <button onClick={handleSyncUpdate} style={{ marginBottom: '10px' }}>
          Update Sync
        </button>
        <table style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
          <tbody>{renderTableRows(syncTableData)}</tbody>
        </table>
      </div>
      <div>
        <h2>Web Worker Update (UI remains responsive)</h2>
        <button onClick={handleWorkerUpdate} style={{ marginBottom: '10px' }}>
          Update with Worker
        </button>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>{renderTableRows(workerTableData)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default TableUpdateTest;
