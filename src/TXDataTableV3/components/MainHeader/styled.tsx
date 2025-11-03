import styled from 'styled-components';

export const MainHeaderWrapper = styled.div<any>`
  background-color: white;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  z-index: 1;
  border-bottom: 1px solid #D4D4D4;
  max-height: 38px;

  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .input-container {
      min-height: auto;
      margin-top: 0;
    }

    > *:not(:last-child) {
      margin-right: 12px;
    }
  }
`;

export const SearchWrapper = styled.div<any>`
  width: 50%;
  max-width: 320px;
  position: relative;
  flex: 1;
  > tx-core-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    z-index: 1;
    height: calc(100% - 3px);
    border-radius: 2px;
    width: 24px;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: var(--color-primary-dark);
  }
  > input {
    width: 100%;
  }
`;


export const DownloadWrapper = styled.div<any>`
  position: relative;
  padding: 0!important;
  &[disabled] {
    cursor: not-allowed;
    color: var(--color-neutral);
    background-color: var(--color-light-a)!important;
    > button {
      pointer-events: none;
      color: var(--color-neutral)!important;
    }
  }
`;

export const DownloadDropdown = styled.div<any>`
  right: 0;
  bottom: 0;
  width: ${({ $downloadDropdownWidth = 135}) => $downloadDropdownWidth}px!important;
  transform: translateY(100%);
  background-color: white!important;
  position: absolute!important;
  z-index: 120;
  font-size: 12px;
  padding: 0!important;
  height: auto!important;
  box-shadow: 0px 3px 5px 0px #ADADAD80;
  border-radius: 2px;
  > span {
    display: block;
    cursor: pointer;
    transition: all .3s ease;
    color: #111;
    padding: 5px 12px;
    font-size: 12px;
    &.disabled {
      pointer-events: none;
      background-color: var(--color-light-a);
      color: #888;
    }
    &:not(:first-child) {
      border-top: 1px solid var(--color-neutral-light);
    }
    &:hover {
      background-color: var(--color-light-a);
    }
    tx-core-icon {
      margin-right: 8px;
    }
  }
`;

export const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: -6px -16px -6px 0;
  height: 38px;
  align-items: stretch;
  > tx-core-button {
    align-self: center;
    margin-right: 12px;
    min-width: 80px;
  }
  > div {
    background-color: var(--color-light-a);
    display: flex;
    align-items: stretch;
    justify-content: flex-end;
    border-bottom: 1px solid #D4D4D4;

    > * > button,
    > * {
      height: 38px;
      width: 38px;
      background-color: var(--color-light-a);
      padding: 0 6px;
      color: var(--color-primary-dark);
      background: transparent;
      transition: all .3s ease;
      font-size: 20px;
      border: none;
      cursor: pointer;

      &:hover {
        background-color: var(--color-neutral-pale);
      }
    }

    > * {
      padding: 0;
    }
  }
`;

export const ModalContentContainer = styled.div`
  font-size: 14px;
  line-height: 1.4;
`;
