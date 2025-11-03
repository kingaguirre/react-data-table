
import styled from 'styled-components';

export const Container = styled.div<any>`
  position: absolute;
  top: 38px;
  background-color: white;
  overflow: hidden;
  overflow-y: auto;
  right: 0;
  width: 285px;
  height: calc(100% - 82px);
  min-height: 225px;
  display: none;
  box-shadow: -3px 0 6px 0 var(--color-neutral-pale);
  border-left: 1px solid var(--color-neutral-pale);
  z-index: 2001;
  .input-container {
    min-height: auto;
  }
  &.is-visible {
    display: block;
  }
`;

export const Body = styled.div`
  padding: 0 2px;
  position: relative;
  z-index: 0;
  height: calc(100% - 65px);
  min-height: 150px;
  overflow-y: scroll;
  text-transform: uppercase;
  > label > div {
    min-height: 32px;
    display: flex;
    align-items: center;
    transition: all .3s ease;
    font-size: 12px;
    color: var(--color-neutral-dark);
    border: 1px solid var(--color-neutral-pale);
    cursor: pointer;
    > div {
      width: 100%;
      padding: 4px 8px;
    }
    &:hover {
      background-color: var(--color-light-a);
    }
  }
`;

export const Header = styled.div<any>`
  background-color: var(--color-primary-dark);
  height: 25px;
  font-size: 11px;
  font-weight: 700;
  line-height: 17px;
  text-transform: uppercase;
  color: white;
  padding: 5px 12px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  user-select: none;
  z-index: 1;
  > tx-core-icon {
    cursor: pointer;
  }
`;

export const Footer = styled.div`
  padding: 8px 2px;
  display: flex;
  justify-content: space-between;
  position: sticky;
  bottom: 0;
  z-index: 1;
  background-color: white;
  box-shadow: 1px 1px 1px 1px var(--color-neutral);
  tx-core-button {
    margin: 0 8px;
  }
`;

