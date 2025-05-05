import { ReactNode } from 'react';

export interface ITXModalInterface {
  show?: boolean;
  children?: ReactNode;
  closeable?: boolean;
  onClose?: () => void;
  modalWidth?: "small" | "medium" | "large" | undefined | string;
  autoWidth?: boolean;
  showCloseIcon?: boolean;
  verticalAlign?: 'top' | 'center' | 'bottom';
  closeIcon?: string;
  iconSize?: "xs" | "s" | "r" | "l" | "xl" | "xxl" | string;
  zIndex?: number;
  iconColor?: string;
  position?: string;
}
