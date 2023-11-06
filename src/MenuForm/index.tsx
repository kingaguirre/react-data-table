import React, { useState, useRef } from "react";
import Ajv from "ajv";
import styled from "styled-components";
import { getDeepValue, setDeepValue } from "../DataTable";

type SizeType = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
};

type FieldType = {
  column: string;
  label: string;
  placeholder?: string;
  type?: string;
  size?: SizeType;
  options?: { value: any; text: string }[];
  schema?: any;
};

type SettingsType = {
  menuColumn: string;
  fields: FieldType[];
};

interface FormProps {
  dataSource: any;
  formSettings: SettingsType;
  onChange?: (updatedSource: any[]) => void;
  selectedMenu?: number;
}

export const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  * {
    box-sizing: border-box;
  }
`;

export const Menu = styled.div`
  width: 20%;
  border-right: 1px solid grey;
  padding: 15px;
`;

export const FieldsContainer = styled.div`
  width: 80%;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
`;

const getResponsiveWidth = (size: SizeType) => {
  const xs = size.xs ? `${(size.xs / 24) * 100}%` : undefined;
  const sm = size.sm ? `${(size.sm / 24) * 100}%` : xs;
  const md = size.md ? `${(size.md / 24) * 100}%` : sm;
  const lg = size.lg ? `${(size.lg / 24) * 100}%` : md;

  return `
    width: ${xs};
    
    @media (min-width: 576px) {
      width: ${sm};
    }
    
    @media (min-width: 768px) {
      width: ${md};
    }
    
    @media (min-width: 992px) {
      width: ${lg};
    }
  `;
};

export const FieldDiv = styled.div<{ size: SizeType }>`
  ${(props) => getResponsiveWidth(props.size)}
  > * {
    width: 100%;
  }
`;

export const InvalidInput = styled.input`
  border: 1px solid red;
`;

export const MenuItem = styled.div<{ isSelected: boolean, isInvalid: boolean }>`
    padding: 8px;
    cursor: pointer;
    background-color: ${(props) => {
    if (props.isInvalid) return "red";
    if (props.isSelected) return "#e0e0e0";
    return "transparent";
  }};
    &:hover {
        background-color: #f0f0f0;
    }
`;

const defaultSize: SizeType = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
};

export const MenuForm = React.forwardRef((props: FormProps, ref: React.Ref<any>) => {
  const { dataSource, formSettings, onChange } = props
  const [data, setData] = useState<any[]>(dataSource);
  const inputRefs = useRef<any[]>(formSettings.fields.map(() => React.createRef()));
  const ajv = new Ajv();

  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(props.selectedMenu || 0);
  const [invalidCounts, setInvalidCounts] = useState<number[]>(new Array(data.length).fill(0));

  const validateForm = () => {
    const newInvalidCounts: number[] = new Array(data.length).fill(0);

    data.forEach((datum, index) => {
      formSettings.fields.forEach((field, fieldIndex) => {
        const value = getDeepValue(datum, field.column);
        const schema = field.schema ? field.schema : undefined;
        if (schema && !ajv.validate(schema, value)) {
          newInvalidCounts[index]++;
          if (index === selectedItemIndex) {
            inputRefs.current[fieldIndex].current.classList.add('invalid');
          }
        } else if (index === selectedItemIndex) {
          inputRefs.current[fieldIndex].current.classList.remove('invalid');
        }
      });
    });

    setInvalidCounts(newInvalidCounts);
    return !newInvalidCounts.some(count => count > 0);
  };

  // Expose the validateForm method to parent components
  React.useImperativeHandle(ref, () => ({
    validate: validateForm
  }));

  const validateField = (field: FieldType, value: any, index: number) => {
    const schema = field.schema ? field.schema : undefined;
    if (schema && !ajv.validate(schema, value)) {
      // Update the invalid counts for that specific datum
      setInvalidCounts(currentCounts => {
        const newCounts = [...currentCounts];
        if (newCounts[index] === 0 || (inputRefs.current[index].current.classList.contains('invalid') && value === "")) {
          newCounts[index]++;
        }
        return newCounts;
      });
      return false;
    }
    return true;
  };
  
  // This function validates all fields for a specific datum and returns the count of invalid fields
  const validateAllFieldsForDatum = (datum: any): number => {
    return formSettings.fields.reduce((acc, field, fieldIndex) => {
      const value = getDeepValue(datum, field.column);
      const schema = field.schema ? field.schema : undefined;
      if (schema && !ajv.validate(schema, value)) {
        if (selectedItemIndex === datum) {
          inputRefs.current[fieldIndex].current.classList.add('invalid');
        }
        acc++;
      } else if (selectedItemIndex === datum) {
        inputRefs.current[fieldIndex].current.classList.remove('invalid');
      }
      return acc;
    }, 0);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: FieldType) => {
    const newValue = event.target.value;
    const newData = [...data];
    const dataToUpdate = { ...newData[selectedItemIndex] };
    newData[selectedItemIndex] = setDeepValue(dataToUpdate, field.column, newValue);
    setData(newData);

    // Update the invalid counts for the current data item being edited
    setInvalidCounts(currentCounts => {
      const newCounts = [...currentCounts];
      newCounts[selectedItemIndex] = validateAllFieldsForDatum(newData[selectedItemIndex]);
      return newCounts;
    });

    // Trigger the onChange if the field is valid
    const isCurrentFieldValid = validateField(field, newValue, selectedItemIndex);
    if (isCurrentFieldValid) {
      onChange?.(newData);
    }
  };

  const renderInputField = (field: FieldType, index: number) => {
    const fieldValue = getDeepValue(data[selectedItemIndex], field.column);

    switch (field.type) {
      case 'textarea':
        return <textarea ref={inputRefs.current[index]} placeholder={field.placeholder} value={fieldValue || ''} onChange={(e) => handleChange(e, field)} />;
      case 'date':
        return <input ref={inputRefs.current[index]} type="date" placeholder={field.placeholder} value={fieldValue || ''} onChange={(e) => handleChange(e, field)} />;
      case 'select':
        return (
          <select ref={inputRefs.current[index]} value={fieldValue || ''} onChange={(e) => handleChange(e, field)}>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );
      default:
        return <input ref={inputRefs.current[index]} type="text" placeholder={field.placeholder} value={fieldValue || ''} onChange={(e) => handleChange(e, field)} />;
    }
  };

  return (
    <Container>
      <Menu>
        {data.map((item, idx) => (
          <MenuItem
            key={idx}
            isSelected={idx === selectedItemIndex}
            isInvalid={invalidCounts[idx] > 0}
            onClick={() => setSelectedItemIndex(idx)}
          >
            {invalidCounts[idx] > 0 && <span>{invalidCounts[idx]} - </span>}
            {getDeepValue(item, formSettings.menuColumn)}
          </MenuItem>
        ))}
      </Menu>

      <FieldsContainer>
        {selectedItemIndex !== null &&
          formSettings.fields.map((field, idx) => (
            <FieldDiv key={idx} size={field.size || defaultSize}>
              {renderInputField(field, idx)}
            </FieldDiv>
          ))}
      </FieldsContainer>
    </Container>
  );
});
