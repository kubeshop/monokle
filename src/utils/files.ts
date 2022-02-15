import fs from 'fs';
import {lstat} from 'fs/promises';
import log from 'loglevel';
import path from 'path';

export function checkIfEntityExists(absolutePath: string) {
  try {
    fs.accessSync(absolutePath);

    return true;
  } catch (err) {
    return false;
  }
}

export function isSubDirectory(parentDir: string, dir: string) {
  const relative = path.relative(parentDir, dir);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function getFileTimestamp(filePath: string): number | undefined {
  const stats = getFileStats(filePath);
  if (stats) {
    return stats.mtimeMs;
  }
}

export function getFileStats(filePath: string, silent?: boolean): fs.Stats | undefined {
  try {
    return fs.statSync(filePath);
  } catch (err) {
    if (!silent && err instanceof Error) {
      log.warn(`[getFileStats]: ${err.message}`);
    }
  }
  return undefined;
}

export interface DeleteEntityCallback {
  isDirectory: boolean;
  name: string;
  err: NodeJS.ErrnoException | null;
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
  if (path.isAbsolute(absolutePath)) {
    const isDirectory = (await lstat(absolutePath)).isDirectory();
    const name = path.basename(absolutePath);

    return fs.rm(absolutePath, {recursive: true, force: true}, err => {
      callback({isDirectory, name, err});
    });
  }
}

export interface RenameEntityCallback {
  oldAbsolutePath: string;
  newName: string;
  isDirectory: boolean;
  err: NodeJS.ErrnoException | null;
}

/**
 * Renames entity by specified path
 *
 * @param oldAbsolutePath
 * Old absolute path to your entity
 * @param newName
 * New name of your entity
 * @param callback
 * Function which is called whenever the entity was renamed or not
 */

export async function renameEntity(
  oldAbsolutePath: string,
  newName: string,
  callback: (args: RenameEntityCallback) => any
): Promise<void> {
  if (path.isAbsolute(oldAbsolutePath)) {
    const isDirectory = (await lstat(oldAbsolutePath)).isDirectory();
    const oldName = path.basename(oldAbsolutePath);
    const newAbsolutePath = oldAbsolutePath.replace(oldName, newName);

    return fs.rename(oldAbsolutePath, newAbsolutePath, err => {
      callback({oldAbsolutePath, newName, isDirectory, err});
    });
  }
}

export interface CreateFolderCallback {
  rootDir: string;
  folderName: string;
  err: NodeJS.ErrnoException | null;
}

export function createFolder(rootDir: string, folderName: string, callback: (args: CreateFolderCallback) => any) {
  return fs.mkdir(`${rootDir}${path.sep}${folderName}`, err => callback({rootDir, folderName, err}));
}
