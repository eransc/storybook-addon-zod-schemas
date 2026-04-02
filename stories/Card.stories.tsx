const meta = {
  title: 'Components/Card',
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    content: {
      control: 'object',
      description: 'Card content configuration',
    },
    imageUrl: {
      control: 'text',
      description: 'Optional image URL',
    },
    elevation: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      defaultValue: 'sm',
    },
  },
};

export default meta;
export const Default = { args: { title: 'Card Title', imageUrl: '' } };
