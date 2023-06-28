import fs from 'fs';
import {lstat, rm} from 'fs/promises';
import log from 'loglevel';
import path from 'path';

import {ALL_TEXT_EXTENSIONS} from '@constants/constants';

import {setAlert} from '@redux/reducers/alert';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileEntry} from '@shared/models/fileEntry';
import {DeleteFileEntryResult} from '@shared/models/fileExplorer';
import {isDefined} from '@shared/utils/filter';

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

/**
 * Deletes entity by specified path
 *
 * @param absolutePath
 * Absolute path to your entity
 * @param callback
 * Function which is called whenever the entity was deleted or not
 */

export async function deleteFileEntry(entry: FileEntry): Promise<DeleteFileEntryResult> {
  const absolutePath = path.join(entry.rootFolderPath, entry.filePath);

  if (path.isAbsolute(absolutePath)) {
    try {
      await rm(absolutePath, {recursive: true, force: true});
      return {entry};
    } catch {
      return {entry, error: 'Failed to remove path.'};
    }
  }
  return {entry, error: 'Path is not absolute.'};
}

export function dispatchDeleteAlert(dispatch: AppDispatch, args: DeleteFileEntryResult) {
  const {entry, error} = args;
  const isFolder = isDefined(entry.children);

  if (error) {
    dispatch(
      setAlert({
        title: 'Deleting failed',
        message: `Something went wrong during deleting ${entry.name} ${isFolder ? 'folder' : 'file'}`,
        type: AlertEnum.Error,
      })
    );
  } else {
    dispatch(
      setAlert({
        title: `Successfully deleted a ${isFolder ? 'folder' : 'file'}`,
        message: `You have successfully deleted ${entry.name} ${isFolder ? 'folder' : 'file'}`,
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
  return fs.writeFile(path.join(rootDir, fileName), '', {flag: 'wx'}, err =>
    callback({rootDir, fileFolderName: fileName, err})
  );
}

export function hasValidExtension(file: string | undefined, extensions: string[]): boolean {
  if (!file) return false;
  return extensions.some(extension => file.endsWith(extension));
}

export function createFileWithContent(filePath: string, content: string) {
  return fs.writeFileSync(filePath, content, {flag: 'wx'});
}

export const isFileEntryDisabled = (fileEntry?: FileEntry) => {
  if (!fileEntry) {
    return true;
  }
  const isFolder = isDefined(fileEntry.children);
  const isTextFile = ALL_TEXT_EXTENSIONS.some(extension => fileEntry.name.endsWith(extension));

  if (isFolder) {
    return false;
  }

  return !isTextFile || fileEntry.isExcluded;
};

const getParentFolderPath = (relativePath: string): string | undefined => {
  const parentFolderPath = path.dirname(relativePath);
  if (parentFolderPath.trim() === '' || parentFolderPath === path.sep) {
    return undefined;
  }
  return parentFolderPath;
};

export const getAllParentFolderPaths = (filePath: string): string[] => {
  const parentFolderPaths: string[] = [];
  let parentFolderPath = getParentFolderPath(filePath);
  while (parentFolderPath) {
    parentFolderPaths.push(parentFolderPath);
    parentFolderPath = getParentFolderPath(parentFolderPath);
  }
  return parentFolderPaths;
};
