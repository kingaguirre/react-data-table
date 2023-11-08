import styled from 'styled-components';

export const ActionsContainer = styled.div`
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
`

export const DropdownContainer = styled.div`
  position: fixed;
  width: 80px;
  height: auto;
  background-color: white;
  background: white;
  margin: 0;
  display: block;
  z-index: 10001;
  > div {
    color: black;
    padding: 4px 8px;
    border-bottom: 1px solid #e1e1e1;
    cursor: pointer;
    &:hover {
      background-color: #ddd;
    }
  }
`;

export const ActionsIconContainer = styled.div``;
