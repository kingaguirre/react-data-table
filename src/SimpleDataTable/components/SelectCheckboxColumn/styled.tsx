import styled from 'styled-components';

export const Checkbox = styled.label`
  box-sizing: border-box;
  height: 20px;
  width: 20px;
  position: relative;
  transition: all .3s ease;
  background-color: white;
  cursor: pointer;

  * {
    box-sizing: border-box;
  }

  input[type="checkbox"] {
    display: none;
    &:checked ~ span {
      &:before {
        border-color: white;
      }
      &:after {
        background-color: #5045E8;
      }
    }
  }

  > span {
    position: relative;
    display: block;
    height: 100%;
    &:before {
      content: "";
      position: absolute;
      transition: all .3s ease;
      left: 6px;
      top: 3px;
      width: 7px;
      height: 12px;
      border: solid white;
      border-width: 0px 3px 3px 0px;
      transform: rotate(45deg);
      background-color: transparent;
      z-index: 1;
    }
    &:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 1px solid #5045E8;
      background-color: white;
      z-index: 0;
      border-radius: 2px;
    }
  }
  &:hover {
    > span {
      &:before {
        border-color: #5045E8;
      }
    }
  }
`;