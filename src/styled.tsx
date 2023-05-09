import styled from "styled-components"

export const Container = styled.div`
  background-color: #f4f6f9;
  margin: 0;
  font-family: "Source Sans Pro",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: left;

  code {
    font-size: 87.5%;
    color: #e83e8c;
    word-wrap: break-word;
    font-family: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  }

  p {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  
  .table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
    background-color: transparent;
    border-collapse: collapse;

    td, th {
      padding: 0.75rem;
      vertical-align: top;
      border-top: 1px solid #dee2e6;
    }

    &.text-center {
      td, th {
        text-align: center;
      }
    }

    &.table-bordered {
      td, th {
        border: 1px solid #dee2e6;
      }
    }
  }



  /** Checkbox */
.rhl-radio,
.rhl-checkbox {
    position: relative;
    display: inline-block;
    font-size: 14px;
    letter-spacing: 0;
    line-height: 1.714;
    color: #888;
    padding-left: 40px;
    min-height: 20px;
    cursor: pointer;
    > *:not(input[type="radio"]):not(input[type="checkbox"]) {
        margin-top: 2px;
    }
    input[type="radio"],
    input[type="checkbox"] {
        position: absolute;
        left: 2px;
        top: 6px;
        min-height: 0;
        height: 0;
        padding: 0;
        margin: 0;
        -moz-appearance:initial;
        &:before, &:after {
            content: '';
            position: absolute;
            cursor: pointer;
        }
        &:before {
            height: 20px;
            width: 20px;
            border: 1px solid #eee;
            background-color: white;
            top: -5px;
            left: -2px;
        }
        &:after {
            border-bottom: 3px solid red;
            border-right: 3px solid red;
            height: 13px;
            width: 7px;
            top: -3px;
            transform: rotate(45deg);
            left: 5px;
            transition: all .3s ease;
            opacity: 0;
        }
    }
    input[type="radio"]:checked,
    input[type="checkbox"]:checked {
        &:after {
            opacity: 1;
        }
    }
    &:hover {
        input[type="radio"]:not(:checked),
        input[type="checkbox"]:not(:checked) {
            &:after {
                opacity: 0.3;
            }
        }
    }
}

.rhl-radio {
    input[type="radio"] {
        &:after,
        &:before {
            border-radius: 50%;
        }
        &:before {
            top: -6px;
        }
        &:after {
            width: 12px;
            height: 12px;
            border: none;
            background-color: red;
            left: 2px;
            top: -2px;
        }
    }
}


`
