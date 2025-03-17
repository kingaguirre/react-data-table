import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Core Tippy styles
import 'tippy.js/themes/light.css'; // Optional: light theme styles if needed

type PopupTooltipProps = {
  title: string;
  content: React.ReactNode;
  children: React.ReactNode;
  trigger?: 'click' | 'hover';
};

export const PopupTooltip: React.FC<PopupTooltipProps> = ({
  title,
  content,
  children,
  trigger = 'click',
}) => {
  const [visible, setVisible] = useState(false);

  const hideTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
  };

  const toggleTooltip = () => {
    setVisible((prev) => !prev);
  };

  const showTooltip = () => setVisible(true);
  const hideTooltipDelayed = () => setVisible(false);

  return (
    <Tippy
      visible={visible}
      interactive={true}
      placement="top"
      theme="light"
      maxWidth="100vh"
      onClickOutside={() => setVisible(false)}
      content={
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            // boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            color: '#000',
            width: '600px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              borderBottom: '1px solid #eee',
              paddingBottom: '4px',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>{title}</span>
            <button
              onClick={hideTooltip}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: '1',
              }}
              aria-label="Close tooltip"
            >
              &times;
            </button>
          </div>
          <div>{content}</div>
        </div>
      }
      trigger="manual" // Using manual control to match our state
      appendTo={document.body}
    >
      <div
        // Conditionally attach the appropriate event handlers
        onClick={trigger === 'click' ? toggleTooltip : undefined}
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltipDelayed : undefined}
        style={{ display: 'inline-block', cursor: 'pointer' }}
      >
        {children}
      </div>
    </Tippy>
  );
};
