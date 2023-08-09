import styled from 'styled-components';

export const MainHeaderWrapper = styled.div`
  background-color: white;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  box-shadow: 0 1px 0 1px #ddd;
  position: relative;
  z-index: 1;
`;

export const SearchWrapper = styled.div``;

export const ControlsWrapper = styled.div`
  background-color: #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: -6px -16px -6px 0;
  height: 38px;
  align-items: stretch;
  > * {
    background-color: #e1e1e1;
    padding: 0 16px;
    color: #222;
    background: transparent;
    transition: all .3s ease;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: #d1d1d1;
    }
  }
`;

export const SettingsContainer = styled.div`
  position: absolute;
  top: 38px;
  background-color: white;
  overflow: hidden;
  overflow-y: auto;
  right: 0;
  width: 200px;
  display: none;
  height: 250px;
  &.is-visible {
    display: block;
  }
  > label {
    display: flex;
    align-items: center;
    transition: all .3s ease;
    cursor: pointer;
    &:hover {
      background-color: #e1e1e1;
    }
  }
`;