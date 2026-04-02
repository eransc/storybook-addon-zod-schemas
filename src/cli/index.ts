import { Command } from 'commander';
import { generate } from './commands/generate.js';
import { exportSchemas } from './commands/export.js';

const program = new Command();

program
  .name('zod-schemas-gen')
  .description('Generate Zod schemas and Pydantic models from Storybook ArgTypes')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate schemas from story files')
  .option('-c, --config <path>', 'Config file path', '.storybook/zod-schemas.config.js')
  .option('-s, --stories <glob>', 'Story files glob pattern')
  .option('-o, --output <dir>', 'Output directory')
  .option('--ts-only', 'Generate only TypeScript/Zod schemas')
  .option('--py-only', 'Generate only Python/Pydantic models')
  .action(generate);

program
  .command('export')
  .description('Export schemas to registry files')
  .option('-c, --config <path>', 'Config file path', '.storybook/zod-schemas.config.js')
  .action(exportSchemas);

// Default to generate if no command specified
program.action(generate);

program.parse();
