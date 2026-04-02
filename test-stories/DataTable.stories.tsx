/**
 * Realistic story file modeled after a complex data table component.
 * Tests handling of object and array types, many props.
 */
import React from 'react';

const meta = {
  title: 'Data Display/DataTable',
  argTypes: {
    columns: {
      control: 'object',
      description: 'Column definitions for the table',
    },
    data: {
      control: 'object',
      description: 'Array of data objects to display in the table',
    },
    sortable: {
      control: 'boolean',
      description: 'Whether columns can be sorted by clicking headers',
      defaultValue: true,
    },
    filterable: {
      control: 'boolean',
      description: 'Whether to show the filter/search bar',
      defaultValue: false,
    },
    selectable: {
      control: 'boolean',
      description: 'Whether rows can be selected with checkboxes',
      defaultValue: false,
    },
    pagination: {
      control: 'boolean',
      description: 'Whether to show pagination controls',
      defaultValue: true,
    },
    pageSize: {
      control: 'select',
      options: ['10', '25', '50', '100'],
      description: 'Number of rows per page',
      defaultValue: '25',
    },
    density: {
      control: 'select',
      options: ['compact', 'normal', 'comfortable'],
      description: 'Row density / spacing',
      defaultValue: 'normal',
    },
    striped: {
      control: 'boolean',
      description: 'Whether to alternate row background colors',
      defaultValue: false,
    },
    bordered: {
      control: 'boolean',
      description: 'Whether to show cell borders',
      defaultValue: true,
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Whether the header stays fixed when scrolling',
      defaultValue: false,
    },
    emptyMessage: {
      control: 'text',
      description: 'Message to display when there is no data',
      defaultValue: 'No data available',
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show a loading skeleton',
      defaultValue: false,
    },
    height: {
      control: 'number',
      description: 'Fixed height of the table in pixels',
    },
    onRowClick: {
      action: 'rowClicked',
      description: 'Callback when a row is clicked',
    },
    onSelectionChange: {
      action: 'selectionChanged',
      description: 'Callback when row selection changes',
    },
    onSort: {
      action: 'sorted',
      description: 'Callback when a column sort changes',
    },
  },
};

export default meta;

export const Default = {
  args: {
    sortable: true,
    pagination: true,
    pageSize: '25',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
    ],
    data: [
      { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    ],
  },
};
