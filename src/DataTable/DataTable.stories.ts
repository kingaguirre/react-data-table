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
};
