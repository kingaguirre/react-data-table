# tp-tabs-wc

<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description                                                                      | Type      | Default     |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------- | --------- | ----------- |
| `contentHeight`       | `content-height`         | Property to set max height on tab content section                                | `string`  | `undefined` |
| `firstLastNavControl` | `first-last-nav-control` | Property to hide/show the first and last navigation button/control in tab header | `boolean` | `true`      |
| `fullHeader`          | `full-header`            | Property to set full header item                                                 | `boolean` | `false`     |
| `separator`           | `separator`              | Property to hide/show the separator line between items in the header             | `boolean` | `false`     |


## Events

| Event       | Description                            | Type               |
| ----------- | -------------------------------------- | ------------------ |
| `tabChange` | Event is fired when the tab is changed | `CustomEvent<any>` |


## Methods

### `setActiveTabByIndex(index: number, emitEvent?: boolean) => Promise<void>`

Method to set the active tab by array index.

#### Returns

Type: `Promise<void>`



### `setActiveTabByTabId(tabId: string, emitEvent?: boolean) => Promise<void>`

Method to set the active tab by the tab ID.

#### Returns

Type: `Promise<void>`



### `setActiveTabByTitle(title: string, emitEvent?: boolean) => Promise<void>`

Method to set the active tab by header title.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
