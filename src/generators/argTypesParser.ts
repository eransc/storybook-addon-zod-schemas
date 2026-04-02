import type { ComponentSchema, PropSchema, PropType } from '../types.js';

interface ArgTypeControl {
  type?: string;
  [key: string]: unknown;
}

interface ArgTypeTableType {
  summary?: string;
  required?: boolean;
}

interface ArgTypeTable {
  type?: ArgTypeTableType;
  defaultValue?: { summary?: string };
  category?: string;
}

interface ArgType {
  control?: ArgTypeControl | string | false;
  options?: string[];
  description?: string;
  defaultValue?: unknown;
  table?: ArgTypeTable;
  type?: { name?: string; required?: boolean };
  name?: string;
}

export type ArgTypes = Record<string, ArgType>;

function inferTypeFromControl(control: ArgTypeControl | string | false | undefined): PropType {
  if (control === false || control === undefined) {
    return 'any';
  }

  const controlType = typeof control === 'string' ? control : control.type;

  switch (controlType) {
    case 'select':
    case 'radio':
    case 'inline-radio':
    case 'check':
    case 'inline-check':
    case 'multi-select':
      return 'enum';
    case 'text':
    case 'color':
    case 'date':
      return 'string';
    case 'number':
    case 'range':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    case 'file':
      return 'string';
    default:
      return 'any';
  }
}

function inferTypeFromTableSummary(summary: string): PropType {
  const normalized = summary.toLowerCase().trim();

  if (normalized === 'string') return 'string';
  if (normalized === 'number') return 'number';
  if (normalized === 'boolean' || normalized === 'bool') return 'boolean';
  if (normalized.startsWith('array') || normalized.endsWith('[]')) return 'array';
  if (normalized === 'object' || normalized.startsWith('{')) return 'object';
  if (normalized.includes('|')) return 'enum';

  return 'any';
}

function extractEnumOptionsFromSummary(summary: string): string[] | undefined {
  if (!summary.includes('|')) return undefined;

  return summary
    .split('|')
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter((s) => s.length > 0 && s !== 'undefined' && s !== 'null');
}

function isEventHandler(propName: string, table?: ArgTypeTable): boolean {
  if (table?.category === 'Events') return true;
  return /^on[A-Z]/.test(propName);
}

function serializeDefaultValue(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

export function parseArgTypes(
  componentName: string,
  argTypes: ArgTypes,
  description?: string,
): ComponentSchema {
  const props: PropSchema[] = [];

  for (const [propName, argType] of Object.entries(argTypes)) {
    if (isEventHandler(propName, argType.table)) {
      continue;
    }

    let type = inferTypeFromControl(argType.control);

    // Fallback to table.type.summary if control didn't give us a useful type
    if (type === 'any' && argType.table?.type?.summary) {
      type = inferTypeFromTableSummary(argType.table.type.summary);
    }

    // Fallback to argType.type.name
    if (type === 'any' && argType.type?.name) {
      type = inferTypeFromTableSummary(argType.type.name);
    }

    // Get options for enum types
    let options = argType.options;
    if (!options && type === 'enum' && argType.table?.type?.summary) {
      options = extractEnumOptionsFromSummary(argType.table.type.summary);
    }

    // If we have enum type but no options, fall back to string
    if (type === 'enum' && (!options || options.length === 0)) {
      type = 'string';
    }

    // Determine required status
    let required = true;
    if (argType.table?.type?.required !== undefined) {
      required = argType.table.type.required;
    } else if (argType.type?.required !== undefined) {
      required = argType.type.required;
    }

    // Extract default value
    let defaultValue = serializeDefaultValue(argType.defaultValue);
    if (defaultValue === undefined && argType.table?.defaultValue?.summary !== undefined) {
      const summary = argType.table.defaultValue.summary;
      if (summary === 'true') defaultValue = true;
      else if (summary === 'false') defaultValue = false;
      else if (!isNaN(Number(summary))) defaultValue = Number(summary);
      else defaultValue = summary;
    }

    // If there's a default value, prop is not strictly required for the schema consumer
    if (defaultValue !== undefined) {
      required = false;
    }

    const prop: PropSchema = {
      name: propName,
      type,
      required,
      ...(argType.description && { description: argType.description }),
      ...(defaultValue !== undefined && { defaultValue }),
      ...(options && { options }),
    };

    props.push(prop);
  }

  return {
    name: componentName,
    ...(description && { description }),
    props,
  };
}
