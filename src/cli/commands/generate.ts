import { resolve, join, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { loadConfig } from '../config.js';
import { parseArgTypes } from '../../generators/argTypesParser.js';
import { generateZodSchema } from '../../generators/zodGenerator.js';
import { generatePydanticModel } from '../../generators/pydanticGenerator.js';
import { generateTypescriptRegistry, generatePythonRegistry } from '../../generators/registryGenerator.js';
import { writeFileWithDirs } from '../../utils/fileWriter.js';
import { logger } from '../../utils/logger.js';
import type { GeneratedSchemas } from '../../types.js';

interface GenerateOptions {
  config?: string;
  stories?: string;
  output?: string;
  tsOnly?: boolean;
  pyOnly?: boolean;
}

/**
 * Find the matching closing brace for an opening brace at position `start`.
 */
function findMatchingBrace(source: string, start: number): number {
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Extract argTypes from a story file by parsing its source.
 * This is a simplified static extraction — it looks for argTypes in the meta export.
 */
function extractArgTypesFromSource(source: string, filePath: string): {
  componentName: string;
  argTypes: Record<string, any>;
  description?: string;
} | null {
  // Extract component name from filename: Button.stories.tsx → Button
  // Also sanitize hyphens to produce valid JS identifiers
  const fileBaseName = basename(filePath)
    .replace(/\.stories\.(tsx?|jsx?|mdx)$/, '')
    .replace(/(^|-)(\w)/g, (_m, _sep, c) => c.toUpperCase());

  // Find argTypes: { ... } with balanced brace matching
  // Try meta-level first (argTypes: { ... }), then story-level (Story.argTypes = { ... })
  const argTypesStart = source.match(/argTypes\s*[=:]\s*\{/);
  if (!argTypesStart) {
    return null;
  }

  const braceStart = source.indexOf('{', argTypesStart.index!);
  const braceEnd = findMatchingBrace(source, braceStart);
  if (braceEnd === -1) {
    return null;
  }

  const argTypesText = source.slice(braceStart + 1, braceEnd);

  try {
    const argTypes: Record<string, any> = {};

    // Find each top-level prop: `propName: { ... }`
    // We need to find prop names followed by `{` and then match balanced braces
    // Match prop names: word chars, or quoted strings like 'aria-disabled'
    const propStartRegex = /(?:['"]([^'"]+)['"]|(\w+))\s*:\s*\{/g;
    let propStartMatch;

    while ((propStartMatch = propStartRegex.exec(argTypesText)) !== null) {
      const propName = propStartMatch[1] || propStartMatch[2];
      const propBraceStart = argTypesText.indexOf('{', propStartMatch.index);
      const propBraceEnd = findMatchingBrace(argTypesText, propBraceStart);
      if (propBraceEnd === -1) continue;

      const propBody = argTypesText.slice(propBraceStart + 1, propBraceEnd);

      // Move regex past this prop body to avoid matching nested props
      propStartRegex.lastIndex = propBraceEnd + 1;

      const argType: Record<string, any> = {};

      // Extract control — handles both forms:
      //   control: 'select'
      //   control: { type: 'select' }
      const controlStringMatch = propBody.match(/control\s*:\s*['"](\w+)['"]/);
      const controlObjectMatch = propBody.match(/control\s*:\s*\{[^}]*type\s*:\s*['"](\w+)['"]/);
      if (controlStringMatch) {
        argType.control = controlStringMatch[1];
      } else if (controlObjectMatch) {
        argType.control = controlObjectMatch[1];
      }

      // Extract control: false
      if (propBody.match(/control\s*:\s*false/)) {
        argType.control = false;
      }

      // Extract options
      const optionsMatch = propBody.match(/options\s*:\s*\[([^\]]+)\]/);
      if (optionsMatch) {
        argType.options = optionsMatch[1]
          .split(',')
          .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
      }

      // Extract description
      const descMatch = propBody.match(/description\s*:\s*['"]([^'"]+)['"]/);
      if (descMatch) {
        argType.description = descMatch[1];
      }

      // Extract defaultValue
      const defaultMatch = propBody.match(/defaultValue\s*:\s*(['"]([^'"]+)['"]|(\d+(?:\.\d+)?)|true|false)/);
      if (defaultMatch) {
        const val = defaultMatch[0].replace(/defaultValue\s*:\s*/, '').trim();
        if (val === 'true') argType.defaultValue = true;
        else if (val === 'false') argType.defaultValue = false;
        else if (!isNaN(Number(val))) argType.defaultValue = Number(val);
        else argType.defaultValue = val.replace(/^['"]|['"]$/g, '');
      }

      argTypes[propName] = argType;
    }

    if (Object.keys(argTypes).length === 0) {
      return null;
    }

    return {
      componentName: fileBaseName,
      argTypes,
    };
  } catch {
    logger.warn(`Could not parse argTypes from ${filePath}`);
    return null;
  }
}

export async function generate(options: GenerateOptions): Promise<void> {
  const config = await loadConfig(options.config || '.storybook/zod-schemas.config.js');

  const storyGlobs = options.stories ? [options.stories] : config.stories;
  const outputDir = options.output || config.output.typescript;

  logger.info('Scanning for story files...');

  // Collect all story files
  const storyFiles: string[] = [];
  for (const pattern of storyGlobs) {
    const { glob: globFn } = await import('glob');
    const matches = await globFn(pattern, { cwd: process.cwd(), absolute: true });
    storyFiles.push(...matches);
  }

  // Filter excludes
  const filteredFiles = storyFiles.filter((file) => {
    return !config.exclude.some((pattern) => file.includes(pattern));
  });

  logger.info(`Found ${filteredFiles.length} story files`);

  const allSchemas: GeneratedSchemas[] = [];

  for (const filePath of filteredFiles) {
    const source = await readFile(filePath, 'utf-8');
    const extracted = extractArgTypesFromSource(source, filePath);

    if (!extracted) {
      logger.debug(`No argTypes found in ${filePath}`);
      continue;
    }

    const { componentName, argTypes, description } = extracted;
    const componentSchema = parseArgTypes(componentName, argTypes, description);
    const zodSchema = generateZodSchema(componentSchema);
    const pydanticModel = generatePydanticModel(componentSchema);

    const schemas: GeneratedSchemas = {
      componentName,
      description,
      zodSchema,
      pydanticModel,
      timestamp: Date.now(),
    };

    allSchemas.push(schemas);

    // Write individual schema files
    if (!options.pyOnly) {
      const tsPath = resolve(outputDir, 'schemas', `${componentName}.ts`);
      await writeFileWithDirs(tsPath, zodSchema);
      logger.info(`  Generated: ${tsPath}`);
    }

    if (!options.tsOnly) {
      const pyDir = options.output || config.output.python;
      const pyName = componentName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      const pyPath = resolve(pyDir, 'components', `${pyName}.py`);
      await writeFileWithDirs(pyPath, pydanticModel);
      logger.info(`  Generated: ${pyPath}`);
    }
  }

  // Generate registry files
  if (allSchemas.length > 0 && config.generateIndex) {
    if (!options.pyOnly) {
      const registryTs = generateTypescriptRegistry(allSchemas, config);
      const registryPath = resolve(outputDir, 'registry.ts');
      await writeFileWithDirs(registryPath, registryTs);
      logger.info(`  Generated registry: ${registryPath}`);
    }

    if (!options.tsOnly) {
      const pyDir = options.output || config.output.python;
      const registryPy = generatePythonRegistry(allSchemas, config);
      const registryPath = resolve(pyDir, 'registry.py');
      await writeFileWithDirs(registryPath, registryPy);
      logger.info(`  Generated registry: ${registryPath}`);
    }
  }

  logger.info(`Done! Generated schemas for ${allSchemas.length} components.`);
}
