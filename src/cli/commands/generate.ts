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
import type { ComponentSchema, GeneratedSchemas } from '../../types.js';

interface GenerateOptions {
  config?: string;
  stories?: string;
  outTs?: string;
  outPy?: string;
  tsOnly?: boolean;
  pyOnly?: boolean;
  enrich?: boolean;
  maxExamples?: string;
}

function progressBar(current: number, total: number, width: number = 30): string {
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `[${bar}] ${current}/${total} (${percent}%)`;
}

export async function generate(options: GenerateOptions): Promise<void> {
  const config = await loadConfig(options.config);

  const storyGlobs = options.stories ? [options.stories] : config.stories;
  const tsDir = resolve(options.outTs || config.output.typescript);
  const pyDir = resolve(options.outPy || config.output.python);

  const generateTs = !options.pyOnly;
  const generatePy = !options.tsOnly;

  logger.info('Scanning for story files...');

  // Collect all story files
  const storyFiles: string[] = [];
  for (const pattern of storyGlobs) {
    const { glob: globFn } = await import('glob');
    const isAbsolute = pattern.startsWith('/');
    const matches = await globFn(pattern, {
      cwd: isAbsolute ? '/' : process.cwd(),
      absolute: true,
    });
    storyFiles.push(...matches);
  }

  // Filter excludes
  const filteredFiles = storyFiles.filter((file) => {
    return !config.exclude.some((pattern) => file.includes(pattern));
  });

  const total = filteredFiles.length;
  if (total === 0) {
    console.log('\n  No story files found. Check your --stories glob pattern.\n');
    return;
  }

  logger.info(`Found ${total} story files\n`);

  let allComponentSchemas: ComponentSchema[] = [];
  const skipped: string[] = [];

  // Pass 1: Extract and parse all component schemas
  for (let i = 0; i < filteredFiles.length; i++) {
    const filePath = filteredFiles[i];
    const fileName = basename(filePath);

    process.stdout.write(`\r  ${progressBar(i + 1, total)} Processing: ${fileName}`);

    const source = await readFile(filePath, 'utf-8');
    const extracted = extractArgTypesAST(source, filePath);

    if (!extracted) {
      skipped.push(fileName);
      continue;
    }

    const { componentName, argTypes, description, examples } = extracted;
    const maxExamples = options.maxExamples ? parseInt(options.maxExamples, 10) : config.maxExamplesPerComponent;
    const limitedExamples = examples?.slice(0, maxExamples);
    const componentSchema = parseArgTypes(componentName, argTypes, description, limitedExamples);

    if (componentSchema.props.length === 0) {
      skipped.push(fileName);
      continue;
    }

    allComponentSchemas.push(componentSchema);
  }

  // Clear progress line
  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  // Enrichment step: use LLM to add missing descriptions
  if (options.enrich && allComponentSchemas.length > 0) {
    console.log('  Enriching descriptions with LLM...');
    const { enrichBatch } = await import('../../generators/enrichDescriptions.js');
    allComponentSchemas = await enrichBatch(allComponentSchemas);
    console.log('  ✓ Enrichment complete\n');
  }

  // Pass 2: Generate output files
  const allSchemas: GeneratedSchemas[] = [];

  for (const componentSchema of allComponentSchemas) {
    const zodSchema = generateZodSchema(componentSchema);
    const pydanticModel = generatePydanticModel(componentSchema);

    const schemas: GeneratedSchemas = {
      componentName: componentSchema.name,
      description: componentSchema.description,
      zodSchema,
      pydanticModel,
      timestamp: Date.now(),
      ...(componentSchema.examples && { examples: componentSchema.examples }),
    };

    allSchemas.push(schemas);

    if (generateTs) {
      const tsPath = resolve(tsDir, 'schemas', `${componentSchema.name}.ts`);
      await writeFileWithDirs(tsPath, zodSchema);
    }

    if (generatePy) {
      const pyName = componentSchema.name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
      const pyPath = resolve(pyDir, 'components', `${pyName}.py`);
      await writeFileWithDirs(pyPath, pydanticModel);
    }
  }

  // Generate registry files
  if (allSchemas.length > 0 && config.generateIndex) {
    if (generateTs) {
      const registryTs = generateTypescriptRegistry(allSchemas, config);
      const registryPath = resolve(tsDir, 'registry.ts');
      await writeFileWithDirs(registryPath, registryTs);
    }

    if (generatePy) {
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
      console.log(`    ${schema.componentName}`);
    }
    console.log('');
    if (generateTs) console.log(`  TypeScript output: ${tsDir}`);
    if (generatePy) console.log(`  Python output:     ${pyDir}`);
  }
  if (skipped.length > 0) {
    console.log(`\n  ⚠ Skipped ${skipped.length} files (no argTypes found)`);
    for (const name of skipped) {
      console.log(`    - ${name}`);
    }
  }

  // Complexity report — flag components with props LLMs can't handle
  const complexComponents = allComponentSchemas.filter((schema) => {
    const anyProps = schema.props.filter((p) => p.type === 'any');
    const skippedCount = schema.skippedProps?.length ?? 0;
    const totalOriginal = schema.props.length + skippedCount;
    return anyProps.length > 2 || (totalOriginal > 0 && skippedCount / totalOriginal > 0.5);
  });

  if (complexComponents.length > 0) {
    console.log('\n  --- Component Complexity Report ---');
    console.log('  These components have props that LLMs cannot generate values for.');
    console.log('  Consider creating simplified wrapper components:\n');
    for (const schema of complexComponents) {
      const anyProps = schema.props.filter((p) => p.type === 'any');
      const parts: string[] = [];
      if (anyProps.length > 0) {
        parts.push(`${anyProps.length} untyped props (${anyProps.map((p) => p.name).join(', ')})`);
      }
      if (schema.skippedProps && schema.skippedProps.length > 0) {
        parts.push(`${schema.skippedProps.length} skipped props`);
      }
      console.log(`    ${schema.name} — ${parts.join(', ')}`);
    }
  }

  console.log('');
}
