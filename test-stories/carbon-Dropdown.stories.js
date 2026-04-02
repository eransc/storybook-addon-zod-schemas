/**
 * Copyright IBM Corp. 2016, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Source: https://github.com/carbon-design-system/carbon
 * Path: packages/react/src/components/Dropdown/Dropdown.stories.js
 */

import React from 'react';
import { FolderOpen, Folders, Information, View } from '@carbon/icons-react';

import { WithLayer } from '../../../.storybook/templates/WithLayer';

import { default as Dropdown, DropdownSkeleton } from './';
import Button from '../Button';
import { AILabel, AILabelContent, AILabelActions } from '../AILabel';
import {
  Toggletip,
  ToggletipActions,
  ToggletipButton,
  ToggletipContent,
  ToggletipLabel,
} from '../Toggletip';
import { IconButton } from '../IconButton';
import mdx from './Dropdown.mdx';
import Link from '../Link';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  subcomponents: {
    DropdownSkeleton,
  },
  argTypes: {
    light: {
      table: {
        disable: true,
      },
    },
    slug: {
      table: {
        disable: true,
      },
    },
  },
  parameters: {
    docs: {
      page: mdx,
    },
    controls: {
      exclude: ['items', 'initialSelectedItem', 'itemToElement', 'id'],
    },
  },
};

const items = [
  {
    text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
  },
  {
    text: 'Option 1',
  },
  {
    text: 'Option 2',
  },
  {
    text: 'Option 3',
    disabled: true,
  },
  {
    text: 'Option 4',
  },
  {
    text: 'Option 5',
  },
  {
    text: 'Option 6',
  },
  {
    text: 'Option 7',
  },
  {
    text: 'Option 8',
  },
];

const sharedArgs = {
  invalid: false,
  invalidText: 'Error message goes here',
  disabled: false,
  hideLabel: false,
  label: 'Choose an option',
  warn: false,
  warnText: 'Warning message goes here',
  titleText: 'Label',
  type: 'default',
};

const sharedArgTypes = {
  invalid: {
    control: {
      type: 'boolean',
    },
  },
  invalidText: {
    control: {
      type: 'text',
    },
  },
  disabled: {
    control: {
      type: 'boolean',
    },
  },
  hideLabel: {
    control: {
      type: 'boolean',
    },
  },
  helperText: {
    control: {
      type: 'text',
    },
  },
  label: {
    control: {
      type: 'text',
    },
  },
  warn: {
    control: {
      type: 'boolean',
    },
  },
  warnText: {
    control: {
      type: 'text',
    },
  },
  titleText: {
    control: {
      type: 'text',
    },
    type: {
      required: true,
    },
  },
  size: {
    options: ['sm', 'md', 'lg'],
    control: { type: 'select' },
  },
  type: {
    control: { type: 'select' },
    options: ['default', 'inline'],
  },
};

export const Default = (args) => {
  const items = [
    {
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    },
    {
      text: 'Option 1',
    },
    {
      text: 'Option 2',
    },
    {
      text: 'Option 3',
      disabled: true,
    },
    {
      text: 'Option 4',
    },
    {
      text: 'Option 5',
    },
    {
      text: 'Option 6',
    },
    {
      text: 'Option 7',
    },
    {
      text: 'Option 8',
    },
  ];

  return (
    <div style={{ width: 400 }}>
      <Dropdown
        id="default"
        titleText="Label"
        helperText="Helper text"
        label="Choose an option"
        items={items}
        itemToString={(item) => (item ? item.text : '')}
        {...args}
      />
    </div>
  );
};

Default.args = {
  ...sharedArgs,
};

Default.argTypes = {
  ...sharedArgTypes,
};

export const ExperimentalAutoAlign = (args) => {
  const items = [
    {
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    },
    {
      text: 'Option 1',
    },
    {
      text: 'Option 2',
    },
    {
      text: 'Option 3',
      disabled: true,
    },
    {
      text: 'Option 4',
    },
    {
      text: 'Option 5',
    },
    {
      text: 'Option 6',
    },
    {
      text: 'Option 7',
    },
    {
      text: 'Option 8',
    },
  ];
  return (
    <div style={{ width: 400 }}>
      <div style={{ height: 300 }}></div>
      <Dropdown
        autoAlign={true}
        id="default"
        titleText="Label"
        helperText="Helper text"
        initialSelectedItem={items[1]}
        label="Option 1"
        items={items}
        itemToString={(item) => (item ? item.text : '')}
        direction="top"
        {...args}
      />
      <div style={{ height: 800 }}></div>
    </div>
  );
};

ExperimentalAutoAlign.argTypes = {
  ...sharedArgTypes,
};

ExperimentalAutoAlign.args = {
  invalid: false,
  invalidText: 'Error message goes here',
  warn: false,
  warnText: 'Warning message goes here',
};

export const Inline = (args) => {
  const items = [
    {
      text: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
    },
    {
      text: 'Option 1',
    },
    {
      text: 'Option 2',
    },
    {
      text: 'Option 3',
      disabled: true,
    },
    {
      text: 'Option 4',
    },
    {
      text: 'Option 5',
    },
    {
      text: 'Option 6',
    },
    {
      text: 'Option 7',
    },
    {
      text: 'Option 8',
    },
  ];
  return (
    <div style={{ width: 600 }}>
      <Dropdown
        id="inline"
        titleText="Label"
        initialSelectedItem={items[1]}
        label="Option 1"
        type="inline"
        items={items}
        itemToString={(item) => (item ? item.text : '')}
        {...args}
      />
    </div>
  );
};

Inline.argTypes = {
  ...sharedArgTypes,
};

export const Skeleton = () => {
  return (
    <div style={{ width: 300 }}>
      <DropdownSkeleton />
    </div>
  );
};
