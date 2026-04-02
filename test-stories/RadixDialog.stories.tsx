/**
 * Realistic story file modeled after Radix UI Dialog component.
 * Tests handling of complex component patterns.
 */
import React from 'react';

const meta = {
  title: 'Overlays/Dialog',
  argTypes: {
    open: {
      control: 'boolean',
      description: 'The controlled open state of the dialog',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'The open state of the dialog when it is initially rendered',
      defaultValue: false,
    },
    modal: {
      control: 'boolean',
      description: 'When true, interaction with outside elements will be disabled and only dialog content will be visible to screen readers',
      defaultValue: true,
    },
    title: {
      control: 'text',
      description: 'An accessible title for the dialog',
    },
    description: {
      control: 'text',
      description: 'An accessible description for the dialog',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'The size of the dialog content',
      defaultValue: 'md',
    },
    position: {
      control: 'select',
      options: ['center', 'top', 'bottom'],
      description: 'Vertical position of the dialog',
      defaultValue: 'center',
    },
    overlayBlur: {
      control: 'number',
      description: 'Blur amount for the overlay backdrop in pixels',
      defaultValue: 0,
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Whether the dialog closes when clicking the overlay',
      defaultValue: true,
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether the dialog closes when pressing escape key',
      defaultValue: true,
    },
    preventScroll: {
      control: 'boolean',
      description: 'Whether to prevent scrolling of the body when dialog is open',
      defaultValue: true,
    },
    children: {
      control: 'text',
      description: 'Dialog body content',
    },
    onOpenChange: {
      action: 'openChanged',
      description: 'Event handler called when the open state changes',
    },
    onClose: {
      action: 'closed',
    },
  },
};

export default meta;

export const Default = {
  args: {
    title: 'Edit Profile',
    description: 'Make changes to your profile here.',
    children: 'Dialog content goes here',
  },
};

export const Fullscreen = {
  args: {
    title: 'Settings',
    size: 'full',
    children: 'Full screen dialog content',
  },
};
