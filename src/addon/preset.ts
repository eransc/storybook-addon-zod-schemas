import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function managerEntries(entry: string[] = []) {
  return [...entry, join(dirname(fileURLToPath(import.meta.url)), 'manager.js')];
}

export { managerEntries };
