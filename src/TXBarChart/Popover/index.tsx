// Popover.tsx
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

export default function Popover(props: IProps) {
  const { position, onClose, title, children, width, color } = props;
  return (
    <PopoverContainer
      position={position}
      width={width}
      color={color}
      role="dialog"
      aria-label={title}
      aria-modal={false}
      data-testid="tx-popover"
    >
      <PopoverTitle>
        {title}
        <CloseButton onClick={onClose} aria-label="Close">×</CloseButton>
      </PopoverTitle>
      <PopoverContent>{children}</PopoverContent>
    </PopoverContainer>
  );
}
