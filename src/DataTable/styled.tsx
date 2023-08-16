import styled from 'styled-components';

export const TableWrapper = styled.div`
  position: relative;
  display: block;
  width: 100%;
  background-color: #eaeaea;
  box-sizing: border-box;
  border-radius: 2px;
  box-shadow: 0 0 2px 1px #ddd;
  * {
    box-sizing: border-box;
    line-height: 1.2;
  }
  input[type="text"], select {
    border: 1px solid #b8babc;
    border-bottom-color: #939598;
    background-color: white;
    border-radius: 2px;
    height: 24px;
    font-size: 12px;
    color: #222;
    outline: none;
    transition: all .3s ease;
    padding: 2px 6px;
    &:focus {
      border-color: #222;
    }
    &.sm {
      height: 16px;
      font-size: 10px;
      padding: 0 4px;
    }
  }

  /* Scrollbar style for WebKit based browsers (e.g., Chrome, Safari) */
  *::-webkit-scrollbar {
    width: 8px; /* Set the width of the scrollbar */
    height: 8px;
    background-color: #f2f6f8;
    /* box-shadow: 0 0 2px 0 #bcbec0; */
    border: 1px solid #ddd;
    border-radius: 8px; /* Rounded edges */
  }

  *::-webkit-scrollbar-thumb {
    background-color: #bcbec0; /* Grey cursor color */
    border: 1px solid #ddd;
    border-radius: 8px; /* Rounded edges */
    transition: all .3s ease;
    height: 8px;
    width: 8px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background-color: #a8aaac; /* Change cursor color on hover */
  }

  /* Scrollbar style for Firefox */
  /* Firefox doesn't support changing the scrollbar color directly via CSS.
    However, you can use a browser-specific feature called scrollbar-color (only works in Firefox 64+). */

  @-moz-document url-prefix() {
    scrollbar-color: #bcbec0 #fff; /* Cursor and track colors */
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
      background-color: #bcbec0; /* Grey cursor color */
      border: 1.5px solid #f2f6f8;
      border-radius: 8px; /* Rounded edges */
    }

    *::-ms-scrollbar-thumb:hover {
      background-color: #a8aaac; /* Change cursor color on hover */
    }
  }
`;

export const TableInnerWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  font-family: 'Helvetica';
`;

export const Table = styled.div`
  display: block;
  width: 100%;
  background-color: #f2f6f8;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
`;
