import styled from 'styled-components';

export const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const TitleContainer = styled.div`
  position: relative;
  flex: 1;
  cursor: grab;
  padding: 4px 6px;
  margin: -4px 0 -4px -6px;
  width: calc(100% - 60px);
  background-color: white;
  &:before {
    opacity: 0;
    content: "☰";
    position: absolute;
    margin-top: 1px;
    top: calc(50% - 1px);
    left: 5px;
    transform: translateY(-50%);
    font-size: 12px;
    line-height: 1;
    transition: all .3s ease;
  }
  > * {
    transition: all .3s ease;
    &:last-child {
      bottom: 0;
    }
  }
  &:hover {
    &:before {
      opacity: 1;
    }
    > * {
      transform: translateX(14px);
    }
  }
`;

export const TitleControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-left: 10px;
`;

export const SortContainer = styled.div`
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  margin-right: -5px;
  transition: all .3s ease;
  &:hover {
    background-color: #eee;
  }
`;

export const PinContainer = styled(SortContainer)<{isPinned?: boolean}>`
  margin: 0;
  font-size: 10px;
  ${({isPinned}) => isPinned ? `
    font-size: 14px;
    color: #006eff;
    > i {
      transform: rotate(30deg);
    }
  ` : ''}
`;
