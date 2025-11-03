import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
`;

export const SideMenu = styled.div`
  width: 200px;
  border-right: 1px solid var(--color-neutral-pale);
`;

export const MenuItem = styled.div<any>`
  padding: 10px;
  cursor: pointer;
  transition: all .3s ease;
  &:hover,
  &.is-active {
    background-color: var(--color-neutral-pale);
  }
`;

export const Content = styled.div`
  width: calc(100% - 200px);
`;

export const Footer = styled.div`
  padding: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--color-neutral-pale);
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: space-between;
  > div {
    *:not(:last-child) {
      margin-right: 12px;
    }
  }
`;

export const NewFilterConainer = styled.div`
  display: flex;

  > .input-container {
    min-height: auto;
    width: 350px
  }
`;

export const Header = styled.div`
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  color: #F2F2F2;
  background-color: var(--color-primary-dark);
  height: 32px;
  padding: 8px 16px;
  text-transform: uppercase;
`;

export const ContentInner = styled.div<any>`
  padding: 8px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  > * {
    width: calc(50% - 6px);
    margin-top: 0!important;
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
`;

export const DefaultSwitchContainer = styled.div`
  min-width: 100%;
  padding: 16px;
  background-color: var(--color-light-a);
  > * {
    min-height: auto;
  }
`;
