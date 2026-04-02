import { describe, it, expect } from 'vitest';
import { generatePydanticModel } from '../../generators/pydanticGenerator.js';
import type { ComponentSchema } from '../../types.js';

describe('generatePydanticModel', () => {
  it('should generate string prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'title', type: 'string', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('title: str');
  });

  it('should generate number prop as float', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'count', type: 'number', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('count: float');
  });

  it('should generate boolean prop', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'disabled', type: 'boolean', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('disabled: bool');
  });

  it('should generate enum prop with Literal', () => {
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

    const result = generatePydanticModel(schema);
    expect(result).toContain('variant: Literal["solid", "soft"]');
  });

  it('should generate optional prop with Optional type', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'title', type: 'string', required: false }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('title: Optional[str] = None');
  });

  it('should generate prop with default value', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'size', type: 'string', required: false, defaultValue: 'md' },
      ],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('size: str = "md"');
  });

  it('should generate prop with boolean default', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
      ],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('disabled: bool = False');
  });

  it('should generate object prop as dict', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'style', type: 'object', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('style: dict[str, Any]');
  });

  it('should generate array prop as list', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'items', type: 'array', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('items: list[Any]');
  });

  it('should include pydantic imports', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'title', type: 'string', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('from pydantic import BaseModel');
  });

  it('should include Field import when descriptions exist', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'title', type: 'string', required: true, description: 'The title' },
      ],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('from pydantic import BaseModel, Field');
  });

  it('should generate prop with description using Field', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [
        { name: 'title', type: 'string', required: true, description: 'The title' },
      ],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('title: str = Field(..., description="The title")');
  });

  it('should convert camelCase to snake_case', () => {
    const schema: ComponentSchema = {
      name: 'TestComponent',
      props: [{ name: 'maxLength', type: 'number', required: true }],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('max_length: float');
  });

  it('should generate Props class with docstring', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      description: 'A clickable button',
      props: [],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('class ButtonProps(BaseModel):');
    expect(result).toContain('"""A clickable button"""');
  });

  it('should generate Component wrapper class', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      props: [],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('class ButtonComponent(BaseModel):');
    expect(result).toContain('type: Literal["Button"]');
    expect(result).toContain('props: ButtonProps');
  });

  it('should generate pass for empty props', () => {
    const schema: ComponentSchema = {
      name: 'Empty',
      props: [],
    };

    const result = generatePydanticModel(schema);
    expect(result).toContain('    pass');
  });

  it('should generate a complete multi-prop component', () => {
    const schema: ComponentSchema = {
      name: 'Button',
      description: 'Button component props',
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

    const result = generatePydanticModel(schema);

    expect(result).toContain('from typing import Literal, Optional');
    expect(result).toContain('from pydantic import BaseModel');
    expect(result).toContain('class ButtonProps(BaseModel):');
    expect(result).toContain('"""Button component props"""');
    expect(result).toContain('variant: Optional[Literal["solid", "soft", "outline"]] = None');
    expect(result).toContain('size: Literal["sm", "md", "lg"] = "md"');
    expect(result).toContain('disabled: bool = False');
    expect(result).toContain('children: str');
    expect(result).toContain('class ButtonComponent(BaseModel):');
    expect(result).toContain('type: Literal["Button"]');
    expect(result).toContain('props: ButtonProps');
  });
});
