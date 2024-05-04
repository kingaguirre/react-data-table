import React, { useState } from 'react';
import styled from 'styled-components';
import { getAdvanceFilterSettingsObj } from "../../utils";

const Container = styled.div`
    display: flex;
    height: 100%;
    flex-direction: column;
`;

const ContentWrapper = styled.div`
    flex: 1;
    display: flex;
`;

const SideMenu = styled.div`
    width: 20%;
    border-right: 1px solid black;
`;

const MenuItem = styled.div<{ isSelected: boolean }>`
    padding: 10px;
    cursor: pointer;
    background-color: ${props => props.isSelected ? '#f5f5f5' : 'transparent'};
    &:hover {
        background-color: #f5f5f5;
    }
`;


const Content = styled.div`
    width: 80%;
    padding: 10px;
`;

const Footer = styled.div`
    padding: 10px;
    border-top: 1px solid black;
    text-align: right;
`;

// Types
interface Option {
  value: string;
  text: string;
}

interface Field {
  id: string;
  type: "text" | "select";
  value: string;
  options?: Option[];
}

interface Setting {
  id: string;
  title: string;
  fields: Field[];
  default: boolean;
}

interface FilterComponentProps {
  filterSettings: Setting[];
  onApply: (value: any) => void;
  onChange?: (updatedSettings: Setting[]) => void;
}

export default (props: FilterComponentProps) => {
  const { filterSettings: initialFilterSettings, onApply, onChange } = props;

  const [selectedMenu, setSelectedMenu] = useState(initialFilterSettings[0].id);
  const [filterSettings, setFilterSettings] = useState<Setting[]>(initialFilterSettings);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>({});
  const [initialFieldValues, setInitialFieldValues] = useState<{ [key: string]: string }>({});
  const [defaultSetting, setDefaultSetting] = useState<Setting | null>(
    filterSettings.find(setting => setting.default) || null
  );
  const [cloneMenuName, setCloneMenuName] = useState<string>("");

  // Set initial field values when the filter settings change
  React.useEffect(() => {
    const initialFieldValues = getAdvanceFilterSettingsObj(filterSettings);
    setFieldValues(initialFieldValues);
    setInitialFieldValues(initialFieldValues);
  }, [filterSettings]);

  const handleInputChange = (id: string, value: string) => {
    // Update fieldValues
    const updatedFieldValues = { ...fieldValues, [id]: value };
    setFieldValues(updatedFieldValues);
  };

  const handleDefaultChange = (setting: Setting) => {
    // Update defaultSetting
    setDefaultSetting(setting);
  };

  const applyChanges = () => {
    const selectedSetting = filterSettings.find(setting => setting.id === selectedMenu);
    if (selectedSetting) {
      const selectedValues = selectedSetting.fields.reduce((acc, field) => {
        acc[field.id] = fieldValues[field.id] || field.value;
        return acc;
      }, {} as { [key: string]: string });
      onApply(selectedValues);
    }
  };

  const saveChanges = () => {
    // Save changes to the initial field values
    setInitialFieldValues({ ...fieldValues });
  };


  const handleClone = () => {
    // Find the currently selected menu
    const selectedSetting = filterSettings.find(setting => setting.id === selectedMenu);
    if (selectedSetting && cloneMenuName) {
      // Clone the selected menu and update the id, title, and default value based on the input
      const clonedSetting: Setting = {
        ...selectedSetting,
        id: `${selectedSetting.id}-clone-${Date.now()}`, // Just to make sure it's unique
        title: cloneMenuName,
        default: false // Ensure the cloned setting's default value is always false
      };

      const updatedSettings = [...filterSettings, clonedSetting];
      setFilterSettings(updatedSettings);

      // Trigger onChange with new settings if provided
      onChange?.(updatedSettings);
      // Reset field values to initial values after cloning
      setFieldValues(initialFieldValues);
    }
  };

  const handleMenuSelect = (menuId: string) => {
    setSelectedMenu(menuId);

    // Reset field values to initial values when a menu is selected
    setFieldValues(initialFieldValues);
  };

  return (
    <Container>
      <ContentWrapper>
        <SideMenu>
          {filterSettings.map(setting => (
            <MenuItem
              key={setting.id}
              isSelected={setting.id === selectedMenu}
              onClick={() => handleMenuSelect(setting.id)}>
              {setting.title}
            </MenuItem>
          ))}
        </SideMenu>

        <Content>
          {filterSettings
            .filter(setting => setting.id === selectedMenu)
            .map(setting => (
              <>
                {/* Checkbox moved here */}
                <label key={setting.id}>
                  Default:
                  <input
                    type="checkbox"
                    checked={defaultSetting?.id === setting.id}
                    onChange={() => handleDefaultChange(setting)}
                  />
                </label>

                {/* The setting fields */}
                {setting.fields.map(field => {
                  if (field.type === "text") {
                    return (
                      <input
                        key={field.id}
                        type="text"
                        defaultValue={field.value}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                      />
                    );
                  }
                  if (field.type === "select" && field.options) {
                    return (
                      <select
                        key={field.id}
                        defaultValue={field.value}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                      >
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    );
                  }
                  return null;
                })}
              </>
            ))}
        </Content>
      </ContentWrapper>

      <Footer>
        <div>
          <input
            value={cloneMenuName}
            onChange={(e) => setCloneMenuName(e.target.value)}
            placeholder="Enter clone menu name"
          />
          <button onClick={handleClone}>Clone</button>
        </div>
        <button onClick={applyChanges}>Apply</button>
        <button onClick={saveChanges}>Save</button>
      </Footer>
    </Container>
  );
}
