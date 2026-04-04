import { Command } from 'commander';
import { generate } from './commands/generate.js';
import { initConfig } from './commands/init.js';

const program = new Command();

program
  .name('zod-schemas-gen')
  .description('Generate Zod schemas and Pydantic models from Storybook ArgTypes')
  .version('0.1.0')
  .option('-c, --config <path>', 'Config file path')
  .option('-s, --stories <glob>', 'Story files glob pattern')
  .option('--out-ts <dir>', 'Output directory for TypeScript/Zod schemas')
  .option('--out-py <dir>', 'Output directory for Python/Pydantic models')
  .option('--ts-only', 'Generate only TypeScript/Zod schemas')
  .option('--py-only', 'Generate only Python/Pydantic models')
  .option('--enrich', 'Use LLM to generate descriptions for undescribed props')
  .action(generate);

program
  .command('init')
  .description('Create a default config file')
  .action(initConfig);

program.parse();
