import { defineConfig } from 'tsup';

export default defineConfig([
  // Manager entry (addon panel UI) - ESM only, externalize everything
  {
    entry: { manager: 'src/addon/manager.tsx' },
    format: ['esm'],
    outDir: 'dist',
    external: [
      'react',
      'react-dom',
      '@storybook/components',
      '@storybook/manager-api',
      '@storybook/icons',
    ],
    platform: 'browser',
    clean: false,
  },
  // Preset entry (Node) - CJS for Storybook to load
  {
    entry: { preset: 'src/addon/preset.ts' },
    format: ['cjs'],
    outDir: 'dist',
    platform: 'node',
    clean: false,
  },
  // Public API exports - ESM + CJS with types
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    outDir: 'dist',
    dts: true,
    platform: 'neutral',
    clean: true,
  },
  // CLI entry - ESM with node shebang
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    banner: { js: '#!/usr/bin/env node' },
    clean: false,
  },
]);
