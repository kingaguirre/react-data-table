import React from 'react';
import styled from 'styled-components';
// import { TXBarChart } from './index';
// import { TXDataTable } from '../../TXDataTableV2'

const InvestorText = styled.div`
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  color: var(--color-info-darker);
  text-transform: uppercase;
`;

const PopoverContent = styled.div`
  display: flex;
  align-items: flex-end;
  jutify-contente: flex-end;
`
export const SEGMENTS = [
  {
    title: 'Program Limit',
    value: 1000,
    arrowColor: 'red'
  },
  {
    title: 'NAR Limit',
    value: 12
  },
  {
    title: 'Main SCB HOLD(20% of PGM Limit)',
    value: 1,
    arrowColor: 'var(--color-neutral-darker)'
  }
];

export const DATA = [
  {
    title: 'Already Distributed',
    value: 2000,
    color: 'green',
    popoverTitle: 'Already Distributed Details',
    popoverContent: (
      <PopoverContent>
        test popover
      </PopoverContent>
    )
  },
  {
    title: 'SCB Exposure',
    value: 1500,
    color: 'blue',
    popoverTitle: 'Remarks',
    popoverContent: (
      <div>
        test
      </div>
    )
  },
];