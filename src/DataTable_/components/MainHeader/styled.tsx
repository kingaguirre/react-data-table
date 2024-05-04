import styled from 'styled-components';

export const MainHeaderWrapper = styled.div`
  background-color: white;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  z-index: 1;
  border: 1px solid #ddd;
`;

export const SearchWrapper = styled.div`
  width: 50%;
  max-width: 320px;
  position: relative;
  > i {
    position: absolute;
    top: 1px;
    right: 1px;
    right: 1px;
    font-size: 12px;
    z-index: 1;
    height: calc(100% - 2px);
    border-radius: 2px;
    width: 24px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  > input {
    width: 100%;
  }
`;


export const DownloadWrapper = styled.div`
  position: relative;
`;

export const DownloadDropdown = styled.div`
  left: 0;
  bottom: 0;
  width: 135px!important;
  transform: translateY(100%);
  background-color: white!important;
  position: absolute!important;
  z-index: 120;
  font-size: 12px;
  padding: 0!important;
  height: auto!important;
  > span {
    display: block;
    cursor: pointer;
    transition: all .3s ease;
    color: #111;
    padding: 5px 12px;
    &:hover {
      background-color: #e1e1e1;
    }
  }
`;

export const ControlsWrapper = styled.div`
  background-color: #e1e1e1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: -6px -16px -6px 0;
  height: 38px;
  align-items: stretch;
  .add-button {
    &[disabled] {
      pointer-events: none;
      color: grey;
    }
  }

  > div > button,
  > * {
    height: 100%;
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
  > div > button {
    padding: 0;
  }
`;

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
