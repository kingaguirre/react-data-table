import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const StyledTippy = styled(Tippy)<{ variation?: string}>`
  &.tippy-box {
    width: auto;
    max-width: initial !important;;
    background: white;
    border: 1px solid var(--color-${({ variation }) => variation});
    border-radius: 2px;
    box-shadow: rgba(173, 173, 173, 0.5) 0px 3px 5px 0px;
    text-align: left;
    box-sizing: border-box;
    color: rgb(17, 17, 17);
    font-size: 12px;
    line-height: 1.4;
    box-sizing: border-box;
    * { box-sizing: border-box; }

    &[data-placement^=bottom]>.tippy-arrow {
      &:after {
        top: -8px;
        left: 0;
        border-width: 0 8px 8px;
        border-bottom-color: var(--color-${({ variation }) => variation});
        transform-origin: center bottom;
      }
      &:before {
        border-bottom-color: var(--color-light-a);
      }
    }

    &[data-placement^=top]>.tippy-arrow {
      &:after {
        bottom: -8px;
        left: 0;
        border-width: 8px 8px 0;
        border-top-color: var(--color-${({ variation }) => variation});
        transform-origin: center top;
      }
      &:before {
        border-top-color: white;
      }
    }

    &[data-placement^=left]>.tippy-arrow {
      &:after {
        border-width: 8px 0 8px 8px;
        border-left-color: var(--color-${({ variation }) => variation});
        right: -8px;
        transform-origin: center left;
      }
      &:before {
        border-left-color: white;
      }
    }

    &[data-placement^=right]>.tippy-arrow {
      &:after {
        left: -8px;
        border-width: 8px 8px 8px 0;
        border-right-color: var(--color-${({ variation }) => variation});
        transform-origin: center right;
      }
      &:before {
        border-right-color: white;
      }
    }

    .tippy-arrow {
      &:before {
        z-index: 1;
      }
      &:after {
        content: "";
        position: absolute;
        border-color: transparent;
        border-style: solid;
        z-index: 0;
      }
    }

    .tippy-content {
      padding: 0;

      .tx-popover-content-wrapper {
        .tx-popover-title {
          position: relative;
          border-bottom: 1px solid rgb(204, 204, 204);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          line-height: 16px;
          text-align: left;
          padding: 4px 12px 4px 10px;
          border-left: 2px solid var(--color-${({ variation }) => variation});
          color: var(--color-${({ variation }) => variation}-darker);
          background-color: var(--color-light-a);
          font-weight: 700;
          text-transform: uppercase;
        }

        .tx-popover-content {
          padding: 12px;
          font-size: 12px;
        }
      }
    }

  }
`;

export const CloseButton = styled.span<any>`
  position: absolute;
  right: 8px;
  transform: translateY(-50%);
  top: 50%;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-neutral);
  z-index: 1;
  line-height: 1;
  padding: 0;
  transition: all .3s ease;
  &:hover {
    color: var(--color-neutral-darker);
  }
`;

export interface ITXPopOverInterface {
  title: string; // Property to set popover title 
  content: any; // Property to set popover content 
  placement?: 'top' | 'bottom' | 'left' | 'right'; //Property to set the position 
  children?: ReactNode; // Property to set children on which click/hover event trigger
  trigger?: 'click' | 'hover'; // Property to set event type on which pop up to be displayed 'hover' | 'click'
  variation?: string;
  width?: number
}

export const PopupTooltip: React.FC<ITXPopOverInterface> = ({
  title,
  content,
  placement = 'bottom',
  trigger = 'hover',
  children,
  variation = 'primary',
  width = 150
}) => {
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  const toggle = () => setVisible((v) => !v);

  return (
    <StyledTippy
      visible={visible}
      interactive
      placement={placement}
      onClickOutside={hide}
      appendTo={document.body}
      variation={variation}
      className='tx-popover'
      content={
        <div className='tx-popover-content-wrapper' style={{minWidth: width}}>
          <div className='tx-popover-title'>
            {title}
            <CloseButton onClick={hide}>×</CloseButton>
          </div>
          <div className='tx-popover-content'>{content}</div>
        </div>
      }
      trigger="manual"
    >
      <span
        onMouseEnter={trigger === 'hover' ? show : undefined}
        onMouseLeave={trigger === 'hover' ? hide : undefined}
        onClick={trigger === 'click' ? toggle : undefined}
        style={{ display: 'inline-block', cursor: 'pointer' }}
      >
        {children}
      </span>
    </StyledTippy>
  );
};
