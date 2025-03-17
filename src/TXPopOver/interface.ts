import { ReactNode } from "react";

export interface ITXPopOverInterface {
  trigger?: string; // Property to set event type on which pop up to be displayed 'hover' | 'click'
  content?: any; // Property to set popover content 
  title?: string; // Property to set popover title 
  placement?: string; //Property to set the position 
  children?: ReactNode; // Property to set children on which click/hover event trigger
  target?: string; // Property to set id on which hover event trigger 
  popoverBorderColor?: string; // Property to set popover border color
  popoverPointerColor?: string // Property to set popover pointer color
  popoverWidth?: number // Property to set popover width
  childrenCss?: any // Property to set css for children 
  popoverTitleColor?: string // Property to set popover title color
}

