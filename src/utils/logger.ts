export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

let currentLevel: LogLevel = 'info';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levels[level] >= levels[currentLevel];
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.log('[zod-schemas]', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.log('[zod-schemas]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[zod-schemas]', ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('[zod-schemas]', ...args);
  },
};
