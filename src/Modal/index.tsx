import React from 'react';
import styled from 'styled-components';

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100001;
`;

const ModalWrapper = styled.div`
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  border: none;
  background: none;
  cursor: pointer;
  color: black;
`;

// Modal Component
export default ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <Overlay>
      <ModalWrapper>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalWrapper>
    </Overlay>
  );
};

