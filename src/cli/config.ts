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
};

export async function loadConfig(configPath: string): Promise<CliConfig> {
  const resolved = resolve(process.cwd(), configPath);

  if (!existsSync(resolved)) {
    return DEFAULT_CONFIG;
  }

  try {
    const userConfig = await import(resolved);
    const config = userConfig.default || userConfig;
    return { ...DEFAULT_CONFIG, ...config };
  } catch {
    console.warn(`Warning: Could not load config from ${resolved}, using defaults`);
    return DEFAULT_CONFIG;
  }
}
