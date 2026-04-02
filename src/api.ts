import type { GeneratedSchemas } from './types.js';
import { parseArgTypes, type ArgTypes } from './generators/argTypesParser.js';
import { generateZodSchema } from './generators/zodGenerator.js';
import { generatePydanticModel } from './generators/pydanticGenerator.js';

export { parseArgTypes, type ArgTypes } from './generators/argTypesParser.js';
export { generateZodSchema } from './generators/zodGenerator.js';
export { generatePydanticModel } from './generators/pydanticGenerator.js';

/**
 * Generate both Zod schema and Pydantic model for a component.
 */
export function generateSchemas(
  componentName: string,
  argTypes: ArgTypes,
  description?: string,
): GeneratedSchemas {
  const schema = parseArgTypes(componentName, argTypes, description);

  return {
    componentName,
    description,
    zodSchema: generateZodSchema(schema),
    pydanticModel: generatePydanticModel(schema),
    timestamp: Date.now(),
  };
}
