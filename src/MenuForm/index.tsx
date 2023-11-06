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

type DisabledType = boolean | ((data: any) => boolean);

type FieldType = {
  column: string;
  label: string;
  placeholder?: string;
  type?: string;
  size?: SizeType;
  options?: { value: any; text: string }[];
  schema?: any;
  disabled?: DisabledType;
  required?: DisabledType;
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
    &.invalid {
      border: 1px solid red;
    }
  }
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
        formSettings.fields.forEach((field) => {
            const value = getDeepValue(datum, field.column);

            // Required validation
            const isRequired = field.required !== undefined 
            ? (typeof field.required === 'function' 
                ? field.required(data[index]) 
                : field.required)
            : false;
            
            const isValueEmpty = value === undefined || value === '';
            const isRequiredInvalid = isRequired && isValueEmpty;

            const schema = field.schema ? field.schema : undefined;
            const isSchemaInvalid = schema && !ajv.validate(schema, value);
            
            if (isSchemaInvalid || isRequiredInvalid) {
                newInvalidCounts[index]++;
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
    // Existing schema validation
    const schema = field.schema ? field.schema : undefined;
    const schemaValid = !(schema && !ajv.validate(schema, value));

    // Required validation
    const isRequired = field.required !== undefined 
    ? (typeof field.required === 'function' 
        ? field.required(data[selectedItemIndex]) 
        : field.required)
    : false;
    const requiredValid = !(isRequired && (value === undefined || value === ''));

    return schemaValid && requiredValid;
  };
  
  // This function validates all fields for a specific datum and returns the count of invalid fields
  const validateAllFieldsForDatum = (datum: any): number => {
    return formSettings.fields.reduce((acc, field) => {
      const value = getDeepValue(datum, field.column);
      if (!validateField(field, value, selectedItemIndex)) {
        acc++;
      }
      return acc;
    }, 0);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: FieldType, fieldIndex: number) => {
    const newValue = event.target.value;
    const newData = [...data];
    const dataToUpdate = { ...newData[selectedItemIndex] };
    newData[selectedItemIndex] = setDeepValue(dataToUpdate, field.column, newValue);
    setData(newData);
  
    const isCurrentFieldValid = validateField(field, newValue, selectedItemIndex);
    
    // Update the invalid counts for the current data item being edited
    setInvalidCounts(currentCounts => {
      const newCounts = [...currentCounts];
      newCounts[selectedItemIndex] = validateAllFieldsForDatum(newData[selectedItemIndex]);
      return newCounts;
    });
  
    if (isCurrentFieldValid) {
      onChange?.(newData);
    }
  };

  const renderInputField = (field: FieldType, index: number) => {
    const fieldValue = getDeepValue(data[selectedItemIndex], field.column);
    const isInvalid = invalidCounts[selectedItemIndex] > 0 && !validateField(field, fieldValue, selectedItemIndex);

    const isDisabled = field.disabled !== undefined 
    ? (typeof field.disabled === 'function' 
        ? field.disabled(data[selectedItemIndex]) 
        : field.disabled)
    : false;
    
    const isRequired = field.required !== undefined 
    ? (typeof field.required === 'function' 
        ? field.required(data[selectedItemIndex]) 
        : field.required)
    : false;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
          ref={inputRefs.current[index]}
          placeholder={field.placeholder}
          value={fieldValue || ''}
          onChange={(e) => handleChange(e, field, index)}
          className={isInvalid ? 'invalid' : ""}
          disabled={isDisabled}
          required={isRequired}
          />
        );
      case 'date':
        return (
          <input
          type="date"
          ref={inputRefs.current[index]}
          placeholder={field.placeholder}
          value={fieldValue || ''}
          onChange={(e) => handleChange(e, field, index)}
          className={isInvalid ? 'invalid' : ""}
          disabled={isDisabled}
        />
        );
      case 'select':
        return (
          <select ref={inputRefs.current[index]} value={fieldValue || ''} onChange={(e) => handleChange(e, field, index)}>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        );
      default:
        return <input
          type="text"
          ref={inputRefs.current[index]}
          placeholder={field.placeholder}
          value={fieldValue || ''}
          onChange={(e) => handleChange(e, field, index)}
          className={isInvalid ? 'invalid' : ""}
          disabled={isDisabled}
          required={isRequired}
        />
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
