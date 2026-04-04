import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { CliConfig } from '../types.js';

const DEFAULT_CONFIG: CliConfig = {
  stories: ['src/**/*.stories.tsx', 'src/**/*.stories.ts'],
  output: {
    typescript: './generated/schemas',
    python: './generated/models',
  },
  includeVercelAISDK: false,
  includeTamboRegistration: false,
  generateIndex: true,
  fileHeader: '// AUTO-GENERATED — DO NOT EDIT',
  exclude: [],
  maxExamplesPerComponent: 5,
};

const CONFIG_SEARCH_PATHS = [
  'zod-schemas.config.js',
  'zod-schemas.config.cjs',
  '.storybook/zod-schemas.config.js',
];

export async function loadConfig(configPath?: string): Promise<CliConfig> {
  // If explicit path given, use it
  if (configPath) {
    const resolved = resolve(process.cwd(), configPath);
    if (!existsSync(resolved)) {
      console.warn(`  Warning: Config not found at ${resolved}, using defaults\n`);
      return DEFAULT_CONFIG;
    }
    return await loadConfigFile(resolved);
  }

  // Auto-discover config file
  for (const searchPath of CONFIG_SEARCH_PATHS) {
    const resolved = resolve(process.cwd(), searchPath);
    if (existsSync(resolved)) {
      console.log(`  Using config: ${resolved}\n`);
      return await loadConfigFile(resolved);
    }
  }

  return DEFAULT_CONFIG;
}

async function loadConfigFile(filePath: string): Promise<CliConfig> {
  try {
    const userConfig = await import(filePath);
    const config = userConfig.default || userConfig;
    return { ...DEFAULT_CONFIG, ...config };
  } catch (err) {
    console.warn(`  Warning: Could not load config from ${filePath}, using defaults\n`);
    return DEFAULT_CONFIG;
  }
}
