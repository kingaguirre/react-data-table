import { createGlobalStyle } from 'styled-components';
export const GlobalStyle = createGlobalStyle`
  :root {
    --size-small: 24px;
    --size-medium: 36px;
    --size-large: 48px;
    --color-primary-darker: #005c84;
    --color-primary-dark: #0075b0;
    --color-primary: #009fda;
    --color-primary-light: #6ba8d0;
    --color-primary-pale: #dbe8f3;
    --color-secondary-darker: #3f9c35;
    --color-secondary-dark: #69be28;
    --color-secondary: #6ac07a;
    --color-secondary-light: #9dd29c;
    --color-secondary-pale: #c3e2c1;
    --color-neutral-darker: #202020;
    --color-neutral-dark: #6d6e71;
    --color-neutral: #939598;
    --color-neutral-light: #bcbec0;
    --color-neutral-pale: #e1e1e1;
    --color-success-darker: #23581d;
    --color-success-dark: #317929;
    --color-success: #3f9c35;
    --color-success-light: #9dd29c;
    --color-success-pale: #c3e2c1;
    --color-info-darker: #005c84;
    --color-info-dark: #0075b0;
    --color-info: #00a3e0;
    --color-info-light: #6ba8d0;
    --color-info-pale: #dbe8f3;
    --color-warning-darker: #e4892e;
    --color-warning-dark: #ed8d2d;
    --color-warning-dark-a: #ff991f;
    --color-warning: #f93;
    --color-warning-light: #ffb870;
    --color-warning-pale: #ffc993;
    --color-warning-pale-a: #fffbf3;
    --color-danger-darker: #ad0325;
    --color-danger-dark: #ca042c;
    --color-danger-dark-a: #bf0711;
    --color-danger: #e4002e;
    --color-danger-light: #fcd7d5;
    --color-danger-pale: #ffebe6;
    --color-danger-pale-a: #fff8f8;
    --color-light: #fff;
    --color-light-a: #f2f2f2;
    --color-dark: #000;
    --color-text-primary: #131417;
    --color-secondary-d: #024;
    --disabled-opacity: 0.5;
    --overlay-bg-color: rgba(0, 0, 0, 0.75);
    --font-size-base: 14px;
    --font-size-extra-small: 10px;
    --font-size-small: 12px;
    --font-size-medium: 14px;
    --font-size-large: 14px;
    --font-family: "SC Sans Web", "Helvetica Neue", Arial;
    --font-family-light: "SC Sans Web Light", "Helvetica Neue", Arial;
    --font-family-bold: "SC Sans Web Bold", "Helvetica Neue", Arial;
    --font-family-italic: "SC Sans Web Italic", "Helvetica Neue", Arial;
    --font-family-thin: "SC Sans Web Thin", "Helvetica Neue", Arial;
    --font-family-ultra-thin: "SC Sans Web Ultra Thin", "Helvetica Neue", Arial;
    --font-family-bold-italic: "SC Sans Web Bold Italic", "Helvetica Neue", Arial;
    --font-family-light-italic: "SC Sans Web Light Italic", "Helvetica Neue", Arial;
    --font-family-thin-italic: "SC Sans Web Thin Italic", "Helvetica Neue", Arial;
    --font-family-ultra-thin-italic: "SC Sans Web Ultra Thin Italic", "Helvetica Neue", Arial;
    --font-light: 300;
    --font-normal: 400;
    --font-medium: 500;
    --font-semi-bold: 600;
    --font-bold: 700;
    --text-secondary: var(--color-neutral-dark);
    --text-disabled: var(--color-neutral-light);
    --text-link: var(--color-primary-dark);
    --text-heading-100: var(--color-primary-darker);
    --text-heading-200: var(--color-secondary-d);
    --border-width: 1px;
    --border-style: solid;
    --border-color: var(--text-secondary);
    --border-radius-base: 4px;
    --border-radius-small: 3px;
    --border-radius-large: 6px;
    --border-radius: var(--border-radius-small);
    --border-radius-rounded: 30em;
    --default-transition: all 0.3s ease;
    --z-index-loader: 1010;
    --z-index-tooltip: 1005;
    --z-index-notification: 1000;
    --z-index-modal: 900;
    --z-index-scroll-top: 850;
    --z-index-popover: 950;
    --z-index-drawer-primary: 850;
    --z-index-drawer-secondary: 800;
    --z-index-navigation: 800;
    --z-index-calender: 902;
    --z-index-calender-secondary: 901;
    --z-index-dropdown: 100;
    --z-index-primary: 1;
    --z-index-secondary: 2;
    --z-index-tertiary: 3
  }


  /*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */
  body {
    margin: 0
  }

  main {
    display: block
  }

  h1 {
    font-size: 2em;
    margin: .67em 0
  }

  hr {
    box-sizing: initial;
    height: 0;
    overflow: visible
  }

  pre {
    font-family: monospace;
    font-size: 1em
  }

  a {
    background-color: initial
  }

  abbr[title] {
    border-bottom: none;
    text-decoration: underline;
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted
  }

  b,
  strong {
    font-weight: bolder
  }

  code,
  kbd,
  samp {
    font-family: monospace;
    font-size: 1em
  }

  small {
    font-size: 80%
  }

  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: initial
  }

  sub {
    bottom: -.25em
  }

  sup {
    top: -.5em
  }

  img {
    border-style: none
  }

  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0
  }

  button,
  input {
    overflow: visible
  }

  button,
  select {
    text-transform: none
  }

  [type=button],
  [type=reset],
  [type=submit],
  button {
    -webkit-appearance: button
  }

  [type=button]::-moz-focus-inner,
  [type=reset]::-moz-focus-inner,
  [type=submit]::-moz-focus-inner,
  button::-moz-focus-inner {
    border-style: none;
    padding: 0
  }

  [type=button]:-moz-focusring,
  [type=reset]:-moz-focusring,
  [type=submit]:-moz-focusring,
  button:-moz-focusring {
    outline: 1px dotted ButtonText
  }

  fieldset {
    padding: .35em .75em .625em
  }

  legend {
    box-sizing: border-box;
    color: inherit;
    display: table;
    max-width: 100%;
    padding: 0;
    white-space: normal
  }

  progress {
    vertical-align: initial
  }

  textarea {
    overflow: auto
  }

  [type=checkbox],
  [type=radio] {
    box-sizing: border-box;
    padding: 0
  }

  [type=number]::-webkit-inner-spin-button,
  [type=number]::-webkit-outer-spin-button {
    height: auto
  }

  [type=search] {
    -webkit-appearance: textfield;
    outline-offset: -2px
  }

  [type=search]::-webkit-search-decoration {
    -webkit-appearance: none
  }

  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit
  }

  details {
    display: block
  }

  summary {
    display: list-item
  }

  [hidden],
  template {
    display: none
  }
`;
