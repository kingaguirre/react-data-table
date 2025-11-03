import styled from 'styled-components';

export const ActionsContainer = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: center;
  > * {
    display: block;
    width: 14px;
    height: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none!important;
  }

  .save-container, .cancel-container,
  .redo-container, .delete-container, .options-container {
    transition: all .3s ease;
    &.disabled {
      cursor: not-allowed;
      color: var(--color-neutral)!important;
      > * {
        pointer-events: none;
      }
    }
    &:hover:not(.disabled) {
      color: var(--color-primary);
    }
  }

  .delete-container {
    color: var(--color-primary-dark);
  }

  .save-container {
    &.disabled {
      cursor: not-allowed;
      color: var(--color-neutral-light);
    }
    &:hover {
      color: var(--color-success);
    }
  }

  .cancel-container,
  .delete-container {
    &:hover {
      color: var(--color-danger);
    }
  }
  
  .cancel-container {
    font-size: 10px;
  }

  .cancel-container,
  .options-container {
    margin-left: 6px;
  }
`

export const DropdownContainer = styled.div<any>`
  position: fixed;
  min-width: 80px;
  max-width: 160px;
  height: auto;
  background-color: white;
  background: white;
  margin: 0;
  display: block;
  z-index: 10001;
  box-shadow: 0px 3px 5px 0px #ADADAD80;
  border-radius: 2px;
  > div {
    color: black;
    transition: all .3s ease;
    color: #111;
    padding: 5px 12px;
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
    &:not(:first-child) {
      border-top: 0.5px solid var(--color-neutral-light);
    }
    &.disabled {
      pointer-events: none;
      background-color: var(--color-light-a);
      color: #888;
    }
    &:hover {
      background-color: var(--color-light-a);
    }
  }
  tx-core-icon {
    margin-right: 6px;
  }

  &:before,
  &:after {
    z-index: 2;
    content: "";
    position: absolute;
    top: 6px;
    width: 0px;
    height: 0px;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 7px solid white;
    left: -6px;
  }
  &:after {
    z-index: 1;
    border-right-color: var(--color-neutral-pale);
    left: -7px;
  }
`;

export const ActionsIconContainer = styled.div<any>``;
