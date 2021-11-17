import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import {lstat} from 'fs/promises';

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

/**
 * Deletes file or directory by specified path
 *
 * @param absolutePath
 * Absolute path to your file or directory
 */

export async function deleteFileOrDirectory(absolutePath: string, callback: any): Promise<void> {
  const isDirectory = (await lstat(absolutePath)).isDirectory();
  const name = absolutePath.split('/').reverse()[0];

  if (path.isAbsolute(absolutePath)) {
    return fs.rm(absolutePath, {recursive: true, force: true}, err => {
      if (err) {
        callback({isDirectory, name, err});
      }

      callback({isDirectory, name});
    });
  }
}
