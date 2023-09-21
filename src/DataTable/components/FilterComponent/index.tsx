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

const MenuItem = styled.div`
    padding: 10px;
    cursor: pointer;
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
  const initialFieldValues = getAdvanceFilterSettingsObj(filterSettings);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>(initialFieldValues);
  const [defaultSetting, setDefaultSetting] = useState<Setting | null>(
    filterSettings.find(setting => setting.default) || null
  );
  const [cloneMenuName, setCloneMenuName] = useState<string>("");

  const handleInputChange = (id: string, value: string) => {
    // Update fieldValues
    const updatedFieldValues = { ...fieldValues, [id]: value };
    setFieldValues(updatedFieldValues);

    // Update filterSettings with the new field value
    const updatedSettings = filterSettings.map(setting => {
      if (setting.id === selectedMenu) {
        return {
          ...setting,
          fields: setting.fields.map(field => 
            field.id === id ? { ...field, value: value } : field
          )
        };
      }
      return setting;
    });
    setFilterSettings(updatedSettings);

    onChange?.(updatedSettings);
  };

  const handleDefaultChange = (setting: Setting) => {
    // Update defaultSetting
    setDefaultSetting(setting);

    // Update filterSettings to reflect the new default
    const updatedSettings = filterSettings.map(s => ({
      ...s,
      default: s.id === setting.id
    }));
    setFilterSettings(updatedSettings);

    onChange?.(updatedSettings);
  };

  const applyChanges = () => {
    if (defaultSetting) {
      const defaultValues = defaultSetting.fields.reduce((acc, field) => {
        acc[field.id] = fieldValues[field.id] || field.value;
        return acc;
      }, {} as { [key: string]: string });
      onApply(defaultValues);
    }
  };

  const handleClone = () => {
    // Find the currently selected menu
    const selectedSetting = filterSettings.find(setting => setting.id === selectedMenu);
    if (selectedSetting && cloneMenuName) {
      // Clone the selected menu and update the id and title based on the input
      const clonedSetting: Setting = {
        ...selectedSetting,
        id: `${selectedSetting.id}-clone-${Date.now()}`, // Just to make sure it's unique
        title: cloneMenuName
      };

      const updatedSettings = [...filterSettings, clonedSetting];
      setFilterSettings(updatedSettings);
      
      // Trigger onChange with new settings if provided
      onChange?.(updatedSettings);
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <SideMenu>
          {filterSettings.map(setting => (
            <MenuItem
              key={setting.id}
              onClick={() => setSelectedMenu(setting.id)}>
              {setting.title}
            </MenuItem>
          ))}
        </SideMenu>

        <Content>
          {filterSettings
            .filter(setting => setting.id === selectedMenu)
            .map(setting => (
              setting.fields.map(field => {
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
              })
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
        {filterSettings.map(setting => (
          <label key={setting.id}>
            {setting.title}
            <input
              type="checkbox"
              checked={defaultSetting?.id === setting.id}
              onChange={() => handleDefaultChange(setting)}
            />
          </label>
        ))}
        <button onClick={applyChanges}>Apply</button>
      </Footer>
    </Container>
  );
}
