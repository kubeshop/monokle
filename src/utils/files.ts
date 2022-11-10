import fs from 'fs';
import {lstat} from 'fs/promises';
import log from 'loglevel';
import path from 'path';

import {AppDispatch} from '@models/appdispatch';

import {setAlert} from '@redux/reducers/alert';

import {AlertEnum} from '@monokle-desktop/shared';

export function doesPathExist(absolutePath: string) {
  try {
    fs.accessSync(absolutePath);

    return true;
  } catch (err) {
    return false;
  }
}

export function isEmptyDir(dirPath: string) {
  return fs.readdirSync(dirPath).length === 0;
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

export function dispatchDeleteAlert(dispatch: AppDispatch, args: DeleteEntityCallback) {
  const {isDirectory, name, err} = args;

  if (err) {
    dispatch(
      setAlert({
        title: 'Deleting failed',
        message: `Something went wrong during deleting ${name} ${isDirectory ? 'directory' : 'file'}`,
        type: AlertEnum.Error,
      })
    );
  } else {
    dispatch(
      setAlert({
        title: `Successfully deleted a ${isDirectory ? 'directory' : 'file'}`,
        message: `You have successfully deleted ${name} ${isDirectory ? 'directory' : 'file'}`,
        type: AlertEnum.Success,
      })
    );
  }
}

export interface RenameEntityCallback {
  oldAbsolutePath: string;
  newName: string;
  isDirectory: boolean;
  err: NodeJS.ErrnoException | null;
}

export interface DuplicateEntityCallback {
  duplicatedFileName: string;
  err: NodeJS.ErrnoException | null;
}

/**
 * Duplicates entity
 *
 * @param absolutePath
 * Absolute path to your entity
 * @param entityName
 * Entity name
 * @param dirName
 * Directory name
 * @param callback
 * Function which is called whenever the entity was duplicated or not
 */

export function duplicateEntity(
  absolutePath: string,
  entityName: string,
  dirName: string,
  callback: (args: DuplicateEntityCallback) => any
) {
  if (path.isAbsolute(absolutePath)) {
    const {name, ext} = path.parse(entityName);
    let newName = `${name} (1)`;

    let files = fs.readdirSync(dirName);
    let i = 1;

    while (i) {
      if (files.includes(`${newName}${ext}`)) {
        i += 1;
        newName = `${name} (${i})`;
      } else {
        i = 0;
        const duplicatedFileName = `${dirName}${path.sep}${newName}${ext}`;

        fs.copyFile(absolutePath, duplicatedFileName, err => {
          callback({duplicatedFileName, err});
        });
      }
    }
  }
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

export interface CreateFileFolderCallback {
  rootDir: string;
  fileFolderName: string;
  err: NodeJS.ErrnoException | null;
}

export function createFolder(rootDir: string, folderName: string, callback: (args: CreateFileFolderCallback) => any) {
  return fs.mkdir(path.join(rootDir, folderName), err => callback({rootDir, fileFolderName: folderName, err}));
}

export function createFile(rootDir: string, fileName: string, callback: (args: CreateFileFolderCallback) => any) {
  return fs.open(path.join(rootDir, fileName), 'wx', err => callback({rootDir, fileFolderName: fileName, err}));
}

export function hasValidExtension(file: string | undefined, extensions: string[]): boolean {
  if (!file) return false;
  return extensions.some(extension => file.endsWith(extension));
}

export function createFileWithContent(filePath: string, content: string) {
  return fs.writeFileSync(filePath, content, {flag: 'wx'});
}
