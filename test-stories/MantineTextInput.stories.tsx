/**
 * Realistic story file modeled after Mantine's TextInput component.
 * Tests handling of various input-related argTypes.
 */
import React from 'react';

const meta = {
  title: 'Inputs/TextInput',
  argTypes: {
    label: {
      control: 'text',
      description: 'Input label, displayed before input',
    },
    description: {
      control: 'text',
      description: 'Input description, displayed after label',
    },
    error: {
      control: 'text',
      description: 'Displays error message after input',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder',
    },
    disabled: {
      control: 'boolean',
      description: 'Sets disabled state on input',
      defaultValue: false,
    },
    required: {
      control: 'boolean',
      description: 'Adds required attribute to the input and red asterisk on the right side of label',
      defaultValue: false,
    },
    readOnly: {
      control: 'boolean',
      description: 'Sets the input to read-only state',
      defaultValue: false,
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Input size',
      defaultValue: 'sm',
    },
    radius: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Input border-radius',
      defaultValue: 'sm',
    },
    variant: {
      control: 'select',
      options: ['default', 'filled', 'unstyled'],
      description: 'Input appearance variant',
      defaultValue: 'default',
    },
    withAsterisk: {
      control: 'boolean',
      description: 'Determines whether required asterisk is displayed',
      defaultValue: false,
    },
    leftSection: {
      control: 'object',
      description: 'Content rendered on the left side of the input',
    },
    rightSection: {
      control: 'object',
      description: 'Content rendered on the right side of the input',
    },
    onChange: {
      action: 'changed',
    },
    onFocus: {
      action: 'focused',
    },
  },
};

export default meta;

export const Default = {
  args: {
    label: 'Your name',
    placeholder: 'Enter your name',
  },
};

export const WithError = {
  args: {
    label: 'Email',
    error: 'Invalid email',
  },
};
