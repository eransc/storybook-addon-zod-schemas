const meta = {
  title: 'Components/Button',
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline'],
      description: 'Visual style of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    children: {
      control: 'text',
      description: 'Button label',
    },
    onClick: {
      control: false,
      description: 'Click handler',
    },
  },
};

export default meta;
export const Primary = { args: { variant: 'solid', children: 'Click me' } };
export const Secondary = { args: { variant: 'soft', children: 'Click me' } };
