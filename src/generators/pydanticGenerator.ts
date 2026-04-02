import type { ComponentSchema, PropSchema } from '../types.js';

function serializePythonValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'number') return String(value);
  return 'None';
}

function propToPythonType(prop: PropSchema): string {
  let baseType: string;

  switch (prop.type) {
    case 'string':
      baseType = 'str';
      break;
    case 'number':
      baseType = 'float';
      break;
    case 'boolean':
      baseType = 'bool';
      break;
    case 'enum':
      if (prop.options && prop.options.length > 0) {
        const opts = prop.options.map((o) => `"${o}"`).join(', ');
        baseType = `Literal[${opts}]`;
      } else {
        baseType = 'str';
      }
      break;
    case 'object':
      baseType = 'dict[str, Any]';
      break;
    case 'array':
      baseType = 'list[Any]';
      break;
    case 'any':
    default:
      baseType = 'Any';
      break;
  }

  if (!prop.required && prop.defaultValue === undefined) {
    return `Optional[${baseType}]`;
  }

  return baseType;
}

function toSnakeCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function propToPythonField(prop: PropSchema): string {
  const pythonName = toSnakeCase(prop.name);
  const pythonType = propToPythonType(prop);

  // Build the field assignment
  if (prop.description) {
    const defaultPart =
      prop.defaultValue !== undefined
        ? serializePythonValue(prop.defaultValue)
        : !prop.required
          ? 'None'
          : '...';
    return `    ${pythonName}: ${pythonType} = Field(${defaultPart}, description="${prop.description}")`;
  }

  if (prop.defaultValue !== undefined) {
    return `    ${pythonName}: ${pythonType} = ${serializePythonValue(prop.defaultValue)}`;
  }

  if (!prop.required) {
    return `    ${pythonName}: ${pythonType} = None`;
  }

  return `    ${pythonName}: ${pythonType}`;
}

function needsImport(types: Set<string>, check: string, props: PropSchema[]): boolean {
  return props.some((p) => {
    const pyType = propToPythonType(p);
    return pyType.includes(check);
  });
}

export function generatePydanticModel(schema: ComponentSchema): string {
  const lines: string[] = [];

  // Determine needed imports
  const needsLiteral = schema.props.some(
    (p) => p.type === 'enum' && p.options && p.options.length > 0,
  );
  const needsOptional = schema.props.some(
    (p) => !p.required && p.defaultValue === undefined,
  );
  const needsAny = schema.props.some(
    (p) => p.type === 'any' || p.type === 'object' || p.type === 'array',
  );
  const needsField = schema.props.some((p) => p.description);

  // Build typing imports
  const typingImports: string[] = [];
  if (needsLiteral) typingImports.push('Literal');
  if (needsOptional) typingImports.push('Optional');
  if (needsAny) typingImports.push('Any');

  // Always need Literal for the Component wrapper type field
  if (!needsLiteral) typingImports.push('Literal');

  if (typingImports.length > 0) {
    lines.push(`from typing import ${typingImports.join(', ')}`);
  }

  // Pydantic imports
  const pydanticImports = ['BaseModel'];
  if (needsField) pydanticImports.push('Field');
  lines.push(`from pydantic import ${pydanticImports.join(', ')}`);

  lines.push('');
  lines.push('');

  // Props class
  if (schema.description) {
    lines.push(`class ${schema.name}Props(BaseModel):`);
    lines.push(`    """${schema.description}"""`);
    lines.push('');
  } else {
    lines.push(`class ${schema.name}Props(BaseModel):`);
  }

  if (schema.props.length === 0) {
    lines.push('    pass');
  } else {
    for (const prop of schema.props) {
      lines.push(propToPythonField(prop));
    }
  }

  lines.push('');
  lines.push('');

  // Component wrapper class
  lines.push(`class ${schema.name}Component(BaseModel):`);
  lines.push(`    """${schema.name} component"""`);
  lines.push('');
  lines.push(`    type: Literal["${schema.name}"]`);
  lines.push(`    props: ${schema.name}Props`);
  lines.push('');

  return lines.join('\n');
}
