import path from 'path';
import fs from 'fs';
import log from 'loglevel';

export function isSubDirectory(parentDir: string, dir: string) {
  const relative = path.relative(parentDir, dir);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function getFileStats(filePath: string): fs.Stats | undefined {
  try {
    return fs.statSync(filePath);
  } catch (err) {
    if (err instanceof Error) {
      log.warn(`[getFileStats]: ${err.message}`);
    }
  }
  return undefined;
}
