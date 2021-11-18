import fs from 'fs';
import log from 'loglevel';
import path from 'path';

import {lstat} from 'fs/promises';

export interface DeleteEntityCallback {
  isDirectory: boolean;
  name: string;
  err: NodeJS.ErrnoException | null;
}

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
 * Deletes entity by specified path
 *
 * @param absolutePath
 * Absolute path to your entity
 * @param callback
 * Function which is called whenever the entity was deleted or not
 */

export async function deleteEntity(absolutePath: string, callback: (args: DeleteEntityCallback) => any): Promise<void> {
  const isDirectory = (await lstat(absolutePath)).isDirectory();
  const name = path.basename(absolutePath);

  if (path.isAbsolute(absolutePath)) {
    return fs.rm(absolutePath, {recursive: true, force: true}, err => {
      callback({isDirectory, name, err});
    });
  }
}
