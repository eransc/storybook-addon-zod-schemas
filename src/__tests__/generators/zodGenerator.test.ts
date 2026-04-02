import { describe, it, expect } from 'vitest';
import { generateZodSchema } from '../../generators/zodGenerator.js';
import type { ComponentSchema } from '../../types.js';

describe('generateZodSchema', () => {
  it('should generate string prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'title', type: 'string', required: true }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('title: z.string(),');
  });

  it('should generate number prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'count', type: 'number', required: true }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('count: z.number(),');
  });

  it('should generate boolean prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'disabled', type: 'boolean', required: true }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('disabled: z.boolean(),');
  });

  it('should generate enum prop with options', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        {
          name: 'variant',
          type: 'enum',
          options: ['solid', 'soft'],
          required: true,
        },
      ],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain("variant: z.enum(['solid', 'soft']),");
  });

  it('should generate optional prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'title', type: 'string', required: false }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('title: z.string().optional(),');
  });

  it('should generate prop with default value', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'size', type: 'string', required: false, defaultValue: 'md' },
      ],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain("size: z.string().default('md'),");
  });

  it('should generate prop with boolean default', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      ],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('disabled: z.boolean().default(false),');
  });

  it('should generate object prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'style', type: 'object', required: true }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('style: z.record(z.any()),');
  });

  it('should generate array prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'items', type: 'array', required: true }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('items: z.array(z.any()),');
  });

  it('should generate any prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'data', type: 'any', required: false }],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('data: z.any().optional(),');
  });

  it('should include import statement', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain("import { z } from 'zod';");
  });

  it('should generate schema name and type export', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      props: [],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('export const ButtonSchema = z.object({');
    expect(result).toContain('export type ButtonProps = z.infer<typeof ButtonSchema>;');
  });

  it('should include component description as JSDoc', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      description: 'A clickable button',
      props: [],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('/**');
    expect(result).toContain(' * A clickable button');
    expect(result).toContain(' */');
  });

  it('should include prop description as JSDoc', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      props: [
        { name: 'label', type: 'string', required: true, description: 'Button text' },
      ],
    };

    const result = generateZodSchema(schema);
    expect(result).toContain('/** Button text */');
  });

  it('should generate a complete multi-prop component', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      description: 'Action button component',
      props: [
        {
          name: 'variant',
          type: 'enum',
          options: ['solid', 'soft', 'outline'],
          required: false,
        },
        {
          name: 'size',
          type: 'enum',
          options: ['sm', 'md', 'lg'],
          required: false,
          defaultValue: 'md',
        },
        { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
        { name: 'children', type: 'string', required: true },
      ],
    };

    const result = generateZodSchema(schema);

    expect(result).toContain("import { z } from 'zod';");
    expect(result).toContain('export const ButtonSchema = z.object({');
    expect(result).toContain("variant: z.enum(['solid', 'soft', 'outline']).optional(),");
    expect(result).toContain("size: z.enum(['sm', 'md', 'lg']).default('md'),");
    expect(result).toContain('disabled: z.boolean().default(false),');
    expect(result).toContain('children: z.string(),');
    expect(result).toContain('});');
    expect(result).toContain('export type ButtonProps = z.infer<typeof ButtonSchema>;');
  });
});
