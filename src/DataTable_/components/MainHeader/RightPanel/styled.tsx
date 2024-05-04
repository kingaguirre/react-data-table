import styled from 'styled-components';

export const SettingsContainer = styled.div`
  position: absolute;
  top: 40px;
  background-color: white;
  overflow: hidden;
  overflow-y: auto;
  right: 0;
  width: 200px;
  display: none;
  box-shadow: -3px 0 6px 0 #ddd;
  border-left: 1px solid #ddd;
  height: calc(100% - 88px);
  z-index: 10000;
  &.is-visible {
    display: block;
  }
  > label {
    display: flex;
    align-items: center;
    transition: all .3s ease;
    padding: 4px 8px;
    &:not(:last-child) {
      border-bottom: 1px dashed #ddd;
    }
    cursor: pointer;
    &:hover {
      background-color: #e1e1e1;
    }
  }
`;

export const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: blue;
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  padding: 8px 16px;
  font-size: 10px;
  position: sticky;
  top: 0;
`;

export const SettingsFooter = styled.div`
  padding: 16px 8px;
  display: flex;
  position: sticky;
  bottom: 0;
  background-color: white;
  > div {
    display: flex;
  }
  button {
    margin: 0 8px;
  }
`;
