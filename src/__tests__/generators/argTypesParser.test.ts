import { describe, it, expect } from 'vitest';
import { parseArgTypes, type ArgTypes } from '../../generators/argTypesParser.js';

describe('parseArgTypes', () => {
  it('should parse select control as enum', () => {
    const argTypes: ArgTypes = {
      variant: {
        control: 'select',
        options: ['solid', 'soft', 'outline'],
      },
    };

    const result = parseArgTypes('Button', argTypes);

    expect(result.name).toBe('Button');
    expect(result.props).toHaveLength(1);
    expect(result.props[0]).toMatchObject({
      name: 'variant',
      type: 'enum',
      options: ['solid', 'soft', 'outline'],
      required: true,
    });
  });

  it('should parse text control as string', () => {
    const argTypes: ArgTypes = {
      children: { control: 'text' },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0]).toMatchObject({
      name: 'children',
      type: 'string',
      required: true,
    });
  });

  it('should parse number control', () => {
    const argTypes: ArgTypes = {
      maxLength: { control: 'number' },
    };

    const result = parseArgTypes('Input', argTypes);
    expect(result.props[0]).toMatchObject({
      name: 'maxLength',
      type: 'number',
      required: true,
    });
  });

  it('should parse boolean control', () => {
    const argTypes: ArgTypes = {
      disabled: { control: 'boolean' },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0]).toMatchObject({
      name: 'disabled',
      type: 'boolean',
      required: true,
    });
  });

  it('should parse object control', () => {
    const argTypes: ArgTypes = {
      style: { control: 'object' },
    };

    const result = parseArgTypes('Card', argTypes);
    expect(result.props[0]).toMatchObject({
      name: 'style',
      type: 'object',
      required: true,
    });
  });

  it('should parse control as object with type field', () => {
    const argTypes: ArgTypes = {
      variant: {
        control: { type: 'select' },
        options: ['solid', 'soft'],
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0]).toMatchObject({
      type: 'enum',
      options: ['solid', 'soft'],
    });
  });

  it('should extract description', () => {
    const argTypes: ArgTypes = {
      children: {
        control: 'text',
        description: 'Button label text',
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].description).toBe('Button label text');
  });

  it('should extract defaultValue', () => {
    const argTypes: ArgTypes = {
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].defaultValue).toBe('md');
    expect(result.props[0].required).toBe(false);
  });

  it('should extract defaultValue from table', () => {
    const argTypes: ArgTypes = {
      disabled: {
        control: 'boolean',
        table: {
          defaultValue: { summary: 'false' },
        },
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].defaultValue).toBe(false);
    expect(result.props[0].required).toBe(false);
  });

  it('should detect required from table.type.required', () => {
    const argTypes: ArgTypes = {
      children: {
        control: 'text',
        table: {
          type: { summary: 'string', required: true },
        },
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].required).toBe(true);
  });

  it('should detect optional from table.type.required=false', () => {
    const argTypes: ArgTypes = {
      title: {
        control: 'text',
        table: {
          type: { summary: 'string', required: false },
        },
      },
    };

    const result = parseArgTypes('Card', argTypes);
    expect(result.props[0].required).toBe(false);
  });

  it('should filter out event handlers by name', () => {
    const argTypes: ArgTypes = {
      onClick: { control: false },
      onSubmit: { control: false },
      children: { control: 'text' },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props).toHaveLength(1);
    expect(result.props[0].name).toBe('children');
  });

  it('should filter out event handlers by category', () => {
    const argTypes: ArgTypes = {
      onPress: {
        control: false,
        table: { category: 'Events' },
      },
      label: { control: 'text' },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props).toHaveLength(1);
    expect(result.props[0].name).toBe('label');
  });

  it('should return empty props for empty argTypes', () => {
    const result = parseArgTypes('Empty', {});
    expect(result.name).toBe('Empty');
    expect(result.props).toHaveLength(0);
  });

  it('should include component description', () => {
    const result = parseArgTypes('Button', {}, 'A clickable button component');
    expect(result.description).toBe('A clickable button component');
  });

  it('should fallback to table.type.summary for type inference', () => {
    const argTypes: ArgTypes = {
      count: {
        table: {
          type: { summary: 'number' },
        },
      },
    };

    const result = parseArgTypes('Counter', argTypes);
    expect(result.props[0].type).toBe('number');
  });

  it('should infer enum from table.type.summary with pipes', () => {
    const argTypes: ArgTypes = {
      variant: {
        table: {
          type: { summary: '"primary" | "secondary" | "danger"' },
        },
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].type).toBe('enum');
    expect(result.props[0].options).toEqual(['primary', 'secondary', 'danger']);
  });

  it('should fall back enum to string when no options available', () => {
    const argTypes: ArgTypes = {
      variant: {
        control: 'select',
        // no options provided
      },
    };

    const result = parseArgTypes('Button', argTypes);
    expect(result.props[0].type).toBe('string');
  });
});
