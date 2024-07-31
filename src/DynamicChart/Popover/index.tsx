import React from 'react';
import { PopoverContainer, CloseButton, PopupTitle } from './styled';

interface PopoverProps {
  position: string;
  onClose: () => void;
  title: string;
  width?: number;
  children: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ position, onClose, title, children, width }) => {
  return (
    <PopoverContainer position={position} width={width}>
      <CloseButton onClick={onClose}>×</CloseButton>
      <PopupTitle>{title}</PopupTitle>
      <div>{children}</div>
    </PopoverContainer>
  );
};

export default Popover;
