import React from 'react';
import { PopoverContainer, CloseButton, PopoverTitle, PopoverContent } from './styled';

interface IProps {
  position: string;
  onClose: () => void;
  title: string;
  width?: number;
  color?: string;
  children: React.ReactNode;
}

export default (props: IProps) => {
  const { position, onClose, title, children, width, color } = props;
  return (
    <PopoverContainer position={position} width={width} color={color}>
      <PopoverTitle>
        {title}
        <CloseButton onClick={onClose}>×</CloseButton>
      </PopoverTitle>
      <PopoverContent>{children}</PopoverContent>
    </PopoverContainer>
  );
};
