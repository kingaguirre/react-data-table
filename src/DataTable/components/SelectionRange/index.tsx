import React, { useState, useRef, useEffect, ReactNode, useContext } from 'react';
import { ParentContainer, Row, Col, SelectionBox } from "./styled";
import { DataTableContext } from "../../index";
import { copyDataWithExcelFormat, updateDataSourceFromExcelWithoutMutation, readClipboardText } from "../../utils"
import { SET_LOCAL_DATA, SET_FETCHED_DATA } from "../../context/actions";

interface IProps {
  children: ReactNode;
  selectionRange?: boolean;
  onSelectionChange?: (selectedCells?: any[]) => void;
  rows: any
}

export default React.forwardRef((props: IProps, ref: React.Ref<any>) => {
  const { onSelectionChange, selectionRange = false, children, rows } = props;

  const {
    fetchConfig,
    state: { fetchedData },
    setState,
  } = useContext(DataTableContext);

  if (!selectionRange) {
    return children
  };

  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [persistentSelectionBox, setPersistentSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedCells, setSelectedCells] = useState([]);
  const parentRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (parentRef.current && !(parentRef.current as any).contains(event.target)) {
        setSelectedCells([]);
        clearSelection();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (isSelecting) {
          setIsSelecting(false);
          setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
          calculateBoundsOfSelectedCells();
          onSelectionChange?.(selectedCells);
        } else if (selectedCells.length > 0) {
          // This will now also call onSelectionChange with an empty array
          clearSelection();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSelecting, onSelectionChange, selectedCells]); // Add onSelectionChange as a dependency

  useEffect(() => {
    const handleCopyAndPasteClipboard = async (e) => {
      if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && selectedCells !== null) {
        const texts = copyDataWithExcelFormat(rows, selectedCells);
        console.log(navigator)
        await navigator.clipboard.writeText(texts);
      }

      if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey) && selectedCells !== null) {
        readClipboardText().then(text => {
          // Use the text from the clipboard here
          const updatedRows = updateDataSourceFromExcelWithoutMutation(rows, selectedCells, text);

          if (fetchConfig) {
            setState({
              type: SET_FETCHED_DATA,
              payload: { ...fetchedData, data: updatedRows }
            });
          } else {
            setState({ type: SET_LOCAL_DATA, payload: updatedRows });
          }
        });
      }
    };
  
    document.addEventListener('keydown', handleCopyAndPasteClipboard);
  
    return () => {
      document.removeEventListener('keydown', handleCopyAndPasteClipboard);
    };
  }, [selectedCells, rows]);

  React.useImperativeHandle(ref, () => ({
    clearSelection: clearSelection
  }));

  const calculateBoundsOfSelectedCells = () => {
    const selectedCells = (parentRef.current as any).querySelectorAll('.selected');
    if (selectedCells.length === 0) return;
  
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  
    selectedCells.forEach(cell => {
      const rect = cell.getBoundingClientRect();
      const parentRect = (parentRef.current as any).getBoundingClientRect();
      const x = rect.left - parentRect.left;
      const y = rect.top - parentRect.top;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + rect.width);
      maxY = Math.max(maxY, y + rect.height);
    });
  
    setPersistentSelectionBox({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
  };

  const clearSelection = () => {
    const cells = (parentRef.current as any).querySelectorAll('.selected');
    cells.forEach(cell => {
      cell.classList.remove('selected');
    });
    // Clear selected cells state
    setSelectedCells([]);
    // Call onSelectionChange with empty array when clearing selection
    onSelectionChange?.([]);
  };

  const updateSelection = () => {
    const newSelectedCells: any = [];
    const cells = (parentRef.current as any).querySelectorAll('.table-cell');
  
    cells.forEach(cell => {
      // Check if selection is disabled for this cell
      const isSelectionDisabled = cell.dataset.disableSelection === 'true';
      if (isSelectionDisabled) {
        cell.classList.remove('selected');
        return; // Skip this cell if selection is disabled
      }
  
      const cellRect = cell.getBoundingClientRect();
      const parentRect = (parentRef.current as any).getBoundingClientRect();
      const cellTop = cellRect.top - parentRect.top + (parentRef.current as any).scrollTop;
      const cellLeft = cellRect.left - parentRect.left + (parentRef.current as any).scrollLeft;
      const cellBottom = cellTop + cellRect.height;
      const cellRight = cellLeft + cellRect.width;
  
      const isInSelectionBox =
        cellRight > selectionBox.x &&
        cellLeft < selectionBox.x + selectionBox.width &&
        cellBottom > selectionBox.y &&
        cellTop < selectionBox.y + selectionBox.height;

      if (isInSelectionBox) {
        cell.classList.add('selected');
        const rowIndex = parseInt(cell.dataset.rowIndex, 10);
        const columnIndex = parseInt(cell.dataset.columnIndex, 10);
        // Capture the disable-copy value
        const disableCopy = cell.dataset.disableCopy === 'true';
        const disablePaste = cell.dataset.disablePaste === 'true';
        const columnName = cell.dataset.columnName;
  
        newSelectedCells.push({
          rowIndex,
          columnIndex,
          column: cell.dataset.column,
          disableCopy, // Include disableCopy in the object
          disablePaste, // Include disablePaste in object
          columnName
        });
      } else {
        cell.classList.remove('selected');
      }
    });
  
    setSelectedCells(newSelectedCells);
  };

  const handleMouseDown = (e) => {
    setIsSelecting(true);
    const rect = (parentRef.current as any).getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    setStartPoint({ x: startX, y: startY });
    setSelectionBox({ x: startX, y: startY, width: 0, height: 0 });
    e.stopPropagation(); // Prevent event from bubbling
  };

  const handleMouseMove = (e) => {
    if (!isSelecting) return;
    const rect = (parentRef.current as any).getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setSelectionBox({
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      width: Math.abs(currentX - startPoint.x),
      height: Math.abs(currentY - startPoint.y),
    });

    updateSelection();
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionBox({ x: 0, y: 0, width: 0, height: 0 });
      // Call onSelectionChange with the selected cells when selection ends
      onSelectionChange?.(selectedCells);
      calculateBoundsOfSelectedCells(); 
    }
  };

  const renderGrid = () => {
    const rows = 3; // Number of content rows
    const cols = 5; // Number of columns
  
    // Render the header row separately
    const headerRow = (
      <Row key="header-row">
        {Array.from({ length: cols }, (_, colIndex) => (
          <Col
            key={`header-${colIndex}`}
            className="table-cell header-cell" // Added 'header-cell' for specific header styling
            data-column={`colname-${colIndex}`}
            data-disable-selection={true} // First column disables selection
            data-disable-copy={true} // Third column disables copy
          >
            Column {colIndex + 1}
          </Col>
        ))}
      </Row>
    );
  
    // Render the content rows
    const contentRows = Array.from({ length: rows }, (_, rowIndex) => (
      <Row key={rowIndex}>
        {Array.from({ length: cols }, (_, colIndex) => (
          <Col
            key={`${rowIndex}-${colIndex}`}
            className="table-cell"
            data-row-index={rowIndex}
            data-column-index={colIndex}
            data-column={`colname-${colIndex}`}
            data-disable-selection={colIndex === 0} // First column disables selection
            data-disable-copy={colIndex === 2} // Third column disables copy
            data-disable-paste={colIndex === 2} // fourth column disables paste
            data-column-name={`Column ${colIndex + 1}`}
          >
            {colIndex + 1}
          </Col>
        ))}
      </Row>
    ));
  
    return [headerRow, ...contentRows]; // Combine the header row with the content rows
  };

  return (
    <ParentContainer
      ref={parentRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {children || renderGrid()}
      {isSelecting && (
        <SelectionBox
          style={{
            left: `${selectionBox.x}px`,
            top: `${selectionBox.y}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
          }}
        />
      )}
      {selectedCells.length > 0 && !isSelecting && (
        <SelectionBox
          style={{
            left: `${persistentSelectionBox.x}px`,
            top: `${persistentSelectionBox.y}px`,
            width: `${persistentSelectionBox.width}px`,
            height: `${persistentSelectionBox.height}px`,
          }}
        />
      )}
    </ParentContainer>
  );
});
