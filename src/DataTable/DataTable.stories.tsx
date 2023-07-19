import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DATA_SOURCE, COLUMN_SETTINGS } from './data';
import { DataTable } from './index';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof DataTable> = {
  title: 'Data Table',
  component: DataTable,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
  args: {
    dataSource: DATA_SOURCE,
    columnSettings: COLUMN_SETTINGS,
    rowKey: "test-key",
  },
  decorators: [(Story) => (
    <div>
      <h2>Data Table Enhancement POC</h2>
      <Story />

      <div style={{
        margin: "20px 0",
      }}>
        <h4><b>All behavior of current data-table is included</b></h4>
        <h3>Current Enhancement:</h3>
        <p>- Filter All columns</p>
        <p>- Filter specific column (this can be set to show dropdown or textbox)</p>
        <p>- Show/hde column</p>
        <p>- Re-order column</p>
        <p>- Resize column</p>
        <p>- Pin/Unpin column</p>
        <p>- Pagination</p>
        <p>- Left/Right pagination arrow</p>
        <p>- Change page size via dropdown</p>
        <p>- Export to excel</p>
        <p><b>- Any updates happened in columns can get via "onColumnSettingsChange". One of the requirement needed so we can save current user settings to backend.</b></p>
      </div>
    </div>
  )],
};
