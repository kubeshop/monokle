import fs, {promises} from 'fs';
import {join} from 'path';
import util from 'util';

export const doesPathExist = (path: string) => util.promisify(fs.exists)(path);
export const createFolder = (folderPath: string) => promises.mkdir(folderPath);
export const deleteFile = (filePath: string) => promises.unlink(filePath);
export const readFile = (filePath: string) => promises.readFile(filePath, 'utf8');
export const writeFile = (filePath: string, fileContent: string) => promises.writeFile(filePath, fileContent, 'utf8');

export const readFiles = async (dirPath: string, extension?: string) => {
  const entries = await promises.readdir(dirPath, {withFileTypes: true});
  const files = entries.filter(e => e.isFile() && (extension ? e.name.endsWith(extension) : true));

  const fileContents = await Promise.all(files.map(f => readFile(join(dirPath, f.name))));
  return fileContents;
};

export const getSubfolders = async (path: string) => {
  const entries = await promises.readdir(path, {withFileTypes: true});
  return entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};
