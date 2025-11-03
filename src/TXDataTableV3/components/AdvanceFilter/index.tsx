import React, { useState } from 'react';
import { TxCoreButton, TxCoreIcon } from 'tradeport-web-components/dist/react';
import { TXModal } from '@atoms/TXModal';
import { TXInput, CODE_DECODE_DROPDOWN } from '@atoms/TXInput';
import { getAdvanceFilterSettingsObj } from "../../utils";
import { 
  Container,
  ContentWrapper,
  SideMenu,
  MenuItem,
  Content,
  Footer,
  Header,
  ContentInner,
  DefaultSwitchContainer,
  NewFilterConainer
} from "./styled";

interface Option {
  value: string;
  text: string;
}

interface Field {
  label?: string
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
  isFetching?: boolean;
}

export default (props: FilterComponentProps) => {
  const { filterSettings: initialFilterSettings, onApply, onChange, isFetching } = props;

  const [selectedMenu, setSelectedMenu] = useState(initialFilterSettings[0].id);
  const [filterSettings, setFilterSettings] = useState<Setting[]>(initialFilterSettings);
  const initialFieldValues = getAdvanceFilterSettingsObj(filterSettings);
  const [fieldValues, setFieldValues] = useState<{ [key: string]: string }>(initialFieldValues);
  const [defaultSetting, setDefaultSetting] = useState<Setting | null>(
    filterSettings.find(setting => setting.default) || null
  );
  const [cloneMenuName, setCloneMenuName] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);

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

  const applyChanges = (sMenu) => {
    const selectedSetting = filterSettings.find(setting => setting.id === sMenu);
    if (selectedSetting) {
      const selectedValues = selectedSetting.fields.reduce((acc, field) => {
        acc[field.id] = fieldValues[field.id] || field.value;
        return acc;
      }, {} as { [key: string]: string });
      onApply(selectedValues);
      setShowFilter(false);
    }
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
    }
  };

  return (
    <>
      <TXInput
        type="dropdown"
        options={filterSettings.map(i => ({value: i?.id, text: i?.title}))}
        value={selectedMenu}
        rawValueOnChange
        onChange={(v) => applyChanges(v)}
        size="sm"
      />
      <TxCoreButton
        size="sm"
        onButtonClick={() => setShowFilter(true)}
        disabled={isFetching}
      >
        <TxCoreIcon icon="filter"/>
      </TxCoreButton>
      <TXModal show={showFilter} onClose={() => setShowFilter(false)} modalWidth="large">
        <Container>
          <ContentWrapper>
            <SideMenu>
              <Header>Saved filters</Header>
              {filterSettings.map(setting => (
                <MenuItem
                  className={selectedMenu === setting.id ? 'is-active' : ''}
                  key={setting.id}
                  onClick={() => setSelectedMenu(setting.id)}>
                  {setting.title}
                </MenuItem>
              ))}
            </SideMenu>

            <Content>
              <Header>advanced filters options</Header>
              {filterSettings
                .filter(setting => setting.id === selectedMenu)
                .map((setting, i) => (
                  <ContentInner key={i}>
                    {setting.fields.map((field: any) => {

                      if (field.type === CODE_DECODE_DROPDOWN && field.codeId) {
                        return (
                          <TXInput
                            key={field.id}
                            type={CODE_DECODE_DROPDOWN}
                            codeId={field.codeId}
                            value={field.value}
                            label={field.label}
                            rawValueOnChange
                            onChange={value => handleInputChange(field.id, value)}
                            options={field.options}
                            dropdownZIndex={10001}
                            multiSelect={field.multiSelect}
                          />
                        );
                      }
                      return (
                        <TXInput
                          key={field.id}
                          type={field.type || "text"}
                          value={field.value}
                          label={field.label}
                          rawValueOnChange
                          onChange={value => handleInputChange(field.id, value)}
                        />
                      );
                  })}
                    <DefaultSwitchContainer>
                      <TXInput
                        type="switch"
                        size="sm"
                        value={defaultSetting?.id === setting.id}
                        onChange={() => handleDefaultChange(setting)}
                        text="Set as Default Filter"
                        simple
                      />
                    </DefaultSwitchContainer>
                </ContentInner>
              ))}

              <Footer>
                <NewFilterConainer>
                  <TXInput
                    value={cloneMenuName}
                    rawValueOnChange
                    onChange={(value) => setCloneMenuName(value)}
                    placeholder="Enter Filter Name"
                  />
                  <TxCoreButton onClick={handleClone}>Clone</TxCoreButton>
                </NewFilterConainer>
                <div>
                  <TxCoreButton onButtonClick={() => setShowFilter(false)}>Close</TxCoreButton>
                  <TxCoreButton onButtonClick={() => applyChanges(selectedMenu)} variation="success">Apply</TxCoreButton>
                </div>
              </Footer>

            </Content>
          </ContentWrapper>
        </Container>
      </TXModal>
    </>
  );
}