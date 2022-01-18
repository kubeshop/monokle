import fs, {promises} from 'fs';
import util from 'util';

export const doesPathExist = (path: string) => util.promisify(fs.exists)(path);
export const createFolder = (folderPath: string) => promises.mkdir(folderPath);
export const createOrRecreateFolder = async (folderPath: string) => {
  const doesFolderExist = await doesPathExist(folderPath);
  if (doesFolderExist) {
    await deleteFolder(folderPath);
  }
  return createFolder(folderPath);
};
export const deleteFile = (filePath: string) => promises.unlink(filePath);
export const deleteFolder = (folderPath: string) => promises.rm(folderPath, {recursive: true});
export const readFile = (filePath: string) => promises.readFile(filePath, 'utf8');
export const writeFile = (filePath: string, fileContent: string) => promises.writeFile(filePath, fileContent, 'utf8');
