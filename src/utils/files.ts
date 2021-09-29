import path from 'path';
import fs from 'fs';

export function isSubDirectory(parentDir: string, dir: string) {
  const relative = path.relative(parentDir, dir);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function doesFileExist(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
