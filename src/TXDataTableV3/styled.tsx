import styled from 'styled-components';

export const TableWrapper = styled.div<any>`
  position: relative;
  display: block;
  width: 100%;
  background-color: var(--color-neutral-light);
  box-sizing: border-box;
  border-radius: 2px;
  border: 1px solid var(--color-neutral-pale);
  * {
    box-sizing: border-box;
    line-height: 1.2;
  }

  /* Scrollbar style for WebKit based browsers (e.g., Chrome, Safari) */
  *::-webkit-scrollbar-track {
    width: 10px; /* Set the width of the scrollbar */
    height: 10px;
    background-color: #F2F6F8;
    border: 1px solid var(--color-neutral-light);
  }

  *::-webkit-scrollbar {
    width: 10px; /* Set the width of the scrollbar */
    height: 10px;
    background-color: #F2F6F8;
    border: 1px solid var(--color-neutral-light);
  }

  *::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-light); /* Grey cursor color */
    border: 2px solid #F2F6F8;
    border-radius: 6px; /* Rounded edges */
    transition: all .3s ease;
    height: 6px;
    width: 6px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-neutral); /* Change cursor color on hover */
  }

  /* Scrollbar style for Firefox */
  /* Firefox doesn't support changing the scrollbar color directly via CSS.
    However, you can use a browser-specific feature called scrollbar-color (only works in Firefox 64+). */

  @-moz-document url-prefix() {
    scrollbar-color: var(--color-neutral-light) #fff; /* Cursor and track colors */
    scrollbar-width: thin; /* Set the width of the scrollbar */
  }

  /* Scrollbar style for Edge and Internet Explorer (10+) */
  /* Microsoft Edge and IE 10+ support a different set of scrollbar CSS properties. */

  @supports (-ms-overflow-style: none) {
    /* Hide the default scrollbar */
    *::-webkit-scrollbar {
      display: none;
    }

    /* Define the custom scrollbar */
    & {
      -ms-overflow-style: none; /* Hide the default scrollbar */
      scrollbar-width: thin; /* Set the width of the scrollbar */
    }

    *::-ms-scrollbar-thumb {
      background-color: var(--color-neutral-light); /* Grey cursor color */
      border: 1.5px solid #F2F6F8;
      border-radius: 6px; /* Rounded edges */
    }

    *::-ms-scrollbar-thumb:hover {
      background-color: #a8aaac; /* Change cursor color on hover */
    }
  }
`;

export const TableInnerWrapper = styled.div<any>`
  overflow-y: scroll;
  overflow-x: auto;
  width: 100%;
  font-family: 'Helvetica';
  z-index: 1;
  position: relative;
  > div {
    transform: translateZ(0);
  }
`;

export const Table = styled.div<any>`
  z-index: 10;
  display: block;
  width: 100%;
  background-color: var(--color-light-a);
  box-sizing: border-box;
  position: relative;
  * {
    box-sizing: border-box;
  }
`;

export const Loader = styled.div<{hasHeader?: boolean, hasFooter?: boolean, show?: boolean}>`
  height 100%;
  width 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  opacity: 0;

  &:before {
    content: "";
    position: absolute;
    top: ${({hasHeader}) => hasHeader ? 38 : 0}px;
    bottom: ${({hasFooter}) => hasFooter ? 43 : 0}px;
    right: 0;
    left: 0;
    margin: auto;
    height 20px;
    width 20px;
    border-radius: 50%;
    border: 4px solid var(--color-primary);
    border-top-color: transparent;
    animation spin 1s linear infinite;
    transition: all .3s ease .15s;
    transform: scale(0);
    opacity: 0;
  }

  ${({show}) => show ? `
    transform: scale(1);
    opacity: 1;
    &:before {
      transition: all .3s ease .1s;
      transform: scale(1);
      opacity: 1;
    }
  ` : ''}

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;