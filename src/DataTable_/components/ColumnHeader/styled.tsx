import styled from 'styled-components';

export const TitleWrapper = styled.div<{hasControls?: boolean, align?: string}>`
  display: flex;
  align-items: center;
  justify-content: ${({hasControls, align}) => !!hasControls ? "space-between" : !!align ? align === 'right' ? 'flex-end' : 'flex-start' : 'center'};
  width: 100%;
  text-align: ${({align}) => align || 'center'};
  > * {
    flex: 1;
  }
`

export const TitleContainer = styled.div<{isDraggedOver?: boolean, hasControls?: boolean, align?: string}>`
  position: relative;
  flex: 1;
  cursor: grab;
  padding: 4px 6px;
  margin: -4px 0 -4px -6px;
  text-align: ${({ align }) => !!align ? align === 'center' ? 'center' : 'right' : 'left'};
  ${({hasControls}) => !!hasControls ? `
    width: calc(100% - 60px);
    text-align: left;
  ` : "width: 100%;"}
  ${({isDraggedOver}) => !isDraggedOver ? 'background-color: #eaeaea;' : ''}
  &:before {
    opacity: 0;
    content: "\f0c9";
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    margin-top: 1px;
    top: calc(50% - 1px);
    left: 5px;
    transform: translateY(-50%);
    font-size: 11px;
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
  padding-left: 5px;
  flex: none;
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
