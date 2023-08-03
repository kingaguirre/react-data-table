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
  &:before {
    opacity: 0;
    content: "☰";
    position: absolute;
    top: calc(50% - 1px);
    left: 5px;
    transform: translateY(-50%);
    font-size: 12px;
    line-height: 1;
    transition: all .3s ease;
  }
  > * {
    transition: all .3s ease;
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
