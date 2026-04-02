import { resolve, basename } from 'node:path';
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../config.js';
import { extractArgTypesAST } from '../astExtractor.js';
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

function progressBar(current: number, total: number, width: number = 30): string {
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `[${bar}] ${current}/${total} (${percent}%)`;
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

  const total = filteredFiles.length;
  logger.info(`Found ${total} story files\n`);

  const allSchemas: GeneratedSchemas[] = [];
  const skipped: string[] = [];

  for (let i = 0; i < filteredFiles.length; i++) {
    const filePath = filteredFiles[i];
    const fileName = basename(filePath);

    // Show progress
    process.stdout.write(`\r  ${progressBar(i + 1, total)} Processing: ${fileName}`);

    const source = await readFile(filePath, 'utf-8');
    const extracted = extractArgTypesAST(source, filePath);

    if (!extracted) {
      skipped.push(fileName);
      continue;
    }

    const { componentName, argTypes, description } = extracted;
    const componentSchema = parseArgTypes(componentName, argTypes, description);

    if (componentSchema.props.length === 0) {
      skipped.push(fileName);
      continue;
    }

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
    }

    if (!options.tsOnly) {
      const pyDir = options.output || config.output.python;
      const pyName = componentName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      const pyPath = resolve(pyDir, 'components', `${pyName}.py`);
      await writeFileWithDirs(pyPath, pydanticModel);
    }
  }

  // Clear progress line
  process.stdout.write('\r' + ' '.repeat(80) + '\r');

  // Generate registry files
  if (allSchemas.length > 0 && config.generateIndex) {
    if (!options.pyOnly) {
      const registryTs = generateTypescriptRegistry(allSchemas, config);
      const registryPath = resolve(outputDir, 'registry.ts');
      await writeFileWithDirs(registryPath, registryTs);
    }

    if (!options.tsOnly) {
      const pyDir = options.output || config.output.python;
      const registryPy = generatePythonRegistry(allSchemas, config);
      const registryPath = resolve(pyDir, 'registry.py');
      await writeFileWithDirs(registryPath, registryPy);
    }
  }

  // Summary
  console.log('');
  console.log(`  ✓ Generated schemas for ${allSchemas.length} components`);
  if (allSchemas.length > 0) {
    console.log('');
    for (const schema of allSchemas) {
      const propCount = parseArgTypes(schema.componentName, {}).props.length;
      console.log(`    ${schema.componentName}`);
    }
    console.log('');
    if (!options.pyOnly) {
      console.log(`  TypeScript: ${resolve(outputDir, 'schemas/')}`);
    }
    if (!options.tsOnly) {
      const pyDir = options.output || config.output.python;
      console.log(`  Python:     ${resolve(pyDir, 'components/')}`);
    }
  }
  if (skipped.length > 0) {
    console.log(`\n  ⚠ Skipped ${skipped.length} files (no argTypes found)`);
    for (const name of skipped) {
      console.log(`    - ${name}`);
    }
  }
  console.log('');
}
