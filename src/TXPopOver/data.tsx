import { TXGrid } from "@atoms/TXGridV2";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import React from 'react';
import { TxCoreIcon } from "tradeport-web-components/dist/react";
import { TXPopOver } from "./index";

export const TIPPY_AND_INFO_CIRCLE_TEMPLATE = <Tippy
  content="Click to see more details"
  visible={undefined}
  trigger="click"
  placement='bottom'
>
  <div className="data-details"
    style={{
      cursor: 'pointer'
    }}>
    <TxCoreIcon icon="info-circle"
      color="var(--color-primary-darker)"
    />
  </div>
</Tippy>

export const DATA_SOURCE = {
  "customerProfile": {
    "title": 'Counter Party Detail',
    "popoverTitle": 'Counter Party Detail',
    "value": "Completed"
  },
  "customerAddress": {
    "value": "Pending",
    "title": 'Counter Party Detail',
    "popoverTitle": 'Counter Party Detail'
  },
  "customerAccounts": {
    "value": "Pending",
    "title": 'Counter Party Detail',
    "popoverTitle": 'Counter Party Detail'
  },
  "customerPreference": {
    "value": "Pending",
    "title": 'Counter Party Detail',
    "popoverTitle": 'Counter Party Detail'
  },
  "customerStatus": {
    "value": "Completed",
    "title": 'Counter Party Detail',
    "popoverTitle": 'Counter Party Detail'
  },
}

const popOverGridTemplate = (text, trigger: string) => <TXPopOver
  {...text}
  childrenCss={{ float: 'right' }}
  trigger={trigger}
  content={<TXGrid
    columnSettings={[
      {
        title: 'Counter Party Name',
        column: 'counterPartyName',
      },
      {
        title: "Counter Party's Limit ID",
        column: 'limitCounterPartyID',
      }
    ]}
    dataSource={[
      { counterPartyName: 'SCB', limitCounterPartyID: '111111111d' },
      { counterPartyName: 'SCB', limitCounterPartyID: '11111111qd' },
      { counterPartyName: 'SCB', limitCounterPartyID: '111111121d' },
      { counterPartyName: 'SCB', limitCounterPartyID: '111131111d' },
    ]}
    hideAllActionButtons
  />}>
  <TxCoreIcon
    icon="info-circle"
    style={{
      cursor: 'pointer'
    }}
    color="var(--color-primary-darker)"
  />
</TXPopOver>


const tippyPopOverGridTemplate = (text) => <TXPopOver
  {...text}
  childrenCss={{ float: 'right' }}
  trigger={'click'}
  content={<TXGrid
    columnSettings={[
      {
        title: 'Counter Party Name',
        column: 'counterPartyName',
      },
      {
        title: "Counter Party's Limit ID",
        column: 'limitCounterPartyID',
      }
    ]}
    dataSource={[
      { counterPartyName: 'SCB', limitCounterPartyID: '111111111d' },
      { counterPartyName: 'SCB', limitCounterPartyID: '11111111qd' },
      { counterPartyName: 'SCB', limitCounterPartyID: '111111121d' },
      { counterPartyName: 'SCB', limitCounterPartyID: '111131111d' },
    ]}
    hideAllActionButtons
  />}>
  {TIPPY_AND_INFO_CIRCLE_TEMPLATE}
</TXPopOver>

export const CLICK_COLUMN_SETTINGS = [
  {
    title: 'Client Profile',
    column: 'customerProfile',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'click')}
          </>
      }
    }
  },
  {
    title: 'Client Address',
    column: 'customerAddress',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'click')}
          </>
      }
    }
  },
  {
    title: 'Client Accounts',
    column: 'customerAccounts',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'click')}
          </>
      }
    }
  },
  {
    title: 'Client Preference',
    column: 'customerPreference',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'click')}
          </>
      }
    }
  },
];


export const HOVER_COLUMN_SETTINGS = [
  {
    title: 'Client Profile',
    column: 'customerProfile',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'hover')}
          </>
      }
    }
  },
  {
    title: 'Client Address',
    column: 'customerAddress',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'hover')}
          </>
      }
    }
  },
  {
    title: 'Client Accounts',
    column: 'customerAccounts',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'hover')}
          </>
      }
    }
  },
  {
    title: 'Client Preference',
    column: 'customerPreference',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {popOverGridTemplate(text, 'hover')}
          </>
      }
    }
  },
];


export const TIPPY_COLUMN_SETTINGS = [
  {
    title: 'Client Profile',
    column: 'customerProfile',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {tippyPopOverGridTemplate(text)}
          </>
      }
    }
  },
  {
    title: 'Client Address',
    column: 'customerAddress',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {tippyPopOverGridTemplate(text)}
          </>
      }
    }
  },
  {
    title: 'Client Accounts',
    column: 'customerAccounts',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {tippyPopOverGridTemplate(text)}
          </>
      }
    }
  },
  {
    title: 'Client Preference',
    column: 'customerPreference',
    align: 'center',
    columnCustomRenderer: (text) => {
      text = typeof (text) === 'string' ? JSON.parse(text) : text;
      return {
        render:
          <>
            {text?.value}
            {tippyPopOverGridTemplate(text)}
          </>
      }
    }
  },
];