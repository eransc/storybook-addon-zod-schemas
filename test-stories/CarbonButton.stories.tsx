/**
 * Realistic story file modeled after Carbon Design System's Button component.
 * Used to test schema generation against real-world argTypes patterns.
 */
import React from 'react';

const sharedArgTypes = {
  kind: {
    control: 'select',
    options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger', 'danger--tertiary', 'danger--ghost'],
    description: 'Specify the kind of Button you want to create',
  },
  size: {
    control: 'select',
    options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    description: 'Specify the size of the Button',
  },
  disabled: {
    control: 'boolean',
    description: 'Specify whether the Button should be disabled',
    defaultValue: false,
  },
  isSelected: {
    control: 'boolean',
    description: 'Specify whether the Button is currently selected. Only applies to ghost buttons.',
  },
  isExpressive: {
    control: 'boolean',
    description: 'Specify if the button is an expressive button',
    defaultValue: false,
  },
  hasIconOnly: {
    control: 'boolean',
    description: 'Specify if the button has an icon only',
    defaultValue: false,
  },
  tooltipPosition: {
    control: 'select',
    options: ['top', 'right', 'bottom', 'left'],
    description: 'Specify the direction of the tooltip for icon-only buttons',
  },
  tooltipAlignment: {
    control: 'select',
    options: ['start', 'center', 'end'],
    description: 'Specify the alignment of the tooltip to the icon-only button',
  },
  children: {
    control: 'text',
    description: 'Button label text',
  },
  onClick: {
    action: 'clicked',
    description: 'Click event handler',
  },
  onFocus: {
    action: 'focused',
  },
  onBlur: {
    action: 'blurred',
  },
};

const meta = {
  title: 'Components/Button',
  argTypes: sharedArgTypes,
};

export default meta;

export const Default = {
  args: {
    kind: 'primary',
    size: 'lg',
    children: 'Button',
  },
};

export const Secondary = {
  args: {
    kind: 'secondary',
    children: 'Secondary',
  },
};
