import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { writeFileWithDirs } from '../../utils/fileWriter.js';

const DEFAULT_CONFIG = `/** @type {import('storybook-addon-zod-schemas').CliConfig} */
module.exports = {
  // Glob patterns for story files
  stories: ['src/**/*.stories.tsx', 'src/**/*.stories.ts'],

  // Output directories
  output: {
    typescript: './generated/schemas',
    python: './generated/models',
  },

  // Wrap Zod schemas with tool() from Vercel AI SDK
  includeVercelAISDK: false,

  // Generate Tambo-compatible component registration array
  includeTamboRegistration: false,

  // Generate registry.ts and registry.py index files
  generateIndex: true,

  // Header comment added to all generated files
  fileHeader: '// AUTO-GENERATED — DO NOT EDIT',

  // Glob patterns to exclude
  exclude: [],
};
`;

export async function initConfig(): Promise<void> {
  const configPath = resolve(process.cwd(), 'zod-schemas.config.js');

  if (existsSync(configPath)) {
    console.log(`  Config already exists: ${configPath}`);
    return;
  }

  await writeFileWithDirs(configPath, DEFAULT_CONFIG);
  console.log(`  ✓ Created config: ${configPath}`);
  console.log('');
  console.log('  Edit the config, then run:');
  console.log('    npx zod-schemas-gen --config zod-schemas.config.js');
  console.log('');
}
