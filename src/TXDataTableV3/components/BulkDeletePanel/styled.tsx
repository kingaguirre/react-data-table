import styled from 'styled-components';

export const Wrapper = styled.div<any>`
  animation: ${({show}) => show ? 'fadeInPanel' : 'fadeOutPanel'} .3s forwards;
  opacity: 0;
  max-height: 0;
  overflow: hidden;

  @keyframes fadeInPanel {
    0% {
      opacity: 0;
      max-height: 0;
    }
    100% {
      opacity: 1;
      max-height: 54px;
    }
  }

  @keyframes fadeOutPanel {
    0% {
      opacity: 1;
      max-height: 54px;
    }
    100% {
      opacity: 0;
      max-height: 0;
    }
  }
`;

export const Container = styled.div`
  padding: 6px 10px;
  border: 1px solid var(--color-neutral-pale);
  background-color: white;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f8f8;
  margin-bottom: 16px;
`;

export const SelectedItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size 11px;
  color: var(--color-neutral-darker);
  b {
    margin: 0 3px 0 10px;
  }
`;

export const IconContainer = styled.div`
  position: relative;
  tx-core-icon {
    color: var(--color-success);
    line-height:1;
    &:last-child {
      position: absolute;
      left: 3px;
      top: 1px;
    }
  }
`;
