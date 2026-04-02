import type { ComponentSchema, PropSchema } from '../types.js';

function serializeValue(value: unknown): string {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  return String(value);
}

function propToZod(prop: PropSchema): string {
  let base: string;

  switch (prop.type) {
    case 'string':
      base = 'z.string()';
      break;
    case 'number':
      base = 'z.number()';
      break;
    case 'boolean':
      base = 'z.boolean()';
      break;
    case 'enum':
      if (prop.options && prop.options.length > 0) {
        const opts = prop.options.map((o) => `'${o}'`).join(', ');
        base = `z.enum([${opts}])`;
      } else {
        base = 'z.string()';
      }
      break;
    case 'object':
      base = 'z.record(z.any())';
      break;
    case 'array':
      base = 'z.array(z.any())';
      break;
    case 'any':
    default:
      base = 'z.any()';
      break;
  }

  // Apply modifiers
  if (prop.defaultValue !== undefined) {
    base += `.default(${serializeValue(prop.defaultValue)})`;
  } else if (!prop.required) {
    base += '.optional()';
  }

  return base;
}

export function generateZodSchema(schema: ComponentSchema): string {
  const lines: string[] = [];

  lines.push("import { z } from 'zod';");
  lines.push('');

  if (schema.description) {
    lines.push('/**');
    lines.push(` * ${schema.description}`);
    lines.push(' */');
  }

  lines.push(`export const ${schema.name}Schema = z.object({`);

  for (const prop of schema.props) {
    if (prop.description) {
      lines.push(`  /** ${prop.description} */`);
    }
    lines.push(`  ${prop.name}: ${propToZod(prop)},`);
  }

  lines.push('});');
  lines.push('');
  lines.push(`export type ${schema.name}Props = z.infer<typeof ${schema.name}Schema>;`);
  lines.push('');

  return lines.join('\n');
}
