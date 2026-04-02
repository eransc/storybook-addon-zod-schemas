import { loadConfig } from '../config.js';
import { logger } from '../../utils/logger.js';

interface ExportOptions {
  config?: string;
}

export async function exportSchemas(options: ExportOptions): Promise<void> {
  const config = await loadConfig(options.config || '.storybook/zod-schemas.config.js');

  logger.info('Export command — re-generating all schemas...');

  // Re-use the generate command for now
  const { generate } = await import('./generate.js');
  await generate({ config: options.config });
}
