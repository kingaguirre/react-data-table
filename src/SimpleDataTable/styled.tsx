import styled from 'styled-components';

export const TableWrapper = styled.div`
  position: relative;
  display: block;
  width: 100%;
  background-color: #eaeaea;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
    line-height: 1.2;
  }

  /* Scrollbar style for WebKit based browsers (e.g., Chrome, Safari) */
  *::-webkit-scrollbar {
    width: 8px; /* Set the width of the scrollbar */
    height: 8px;
    background-color: transparent;
    border: none;
  }

  *::-webkit-scrollbar-thumb {
    background-color: #e3e3e3; /* Grey cursor color */
    border-radius: 8px; /* Rounded edges */
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
    scrollbar-color: #e3e3e3 transaprent; /* Cursor and track colors */
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
      background-color: #e3e3e3; /* Grey cursor color */
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
