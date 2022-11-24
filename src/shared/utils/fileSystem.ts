import {createWriteStream, existsSync, promises, readdirSync, statSync, unlinkSync} from 'fs';
import fetch from 'node-fetch';
import {join, sep} from 'path';

export function deleteFolder(folderPath: string) {
  return promises.rm(folderPath, {recursive: true});
}

export function createFolder(folderPath: string) {
  return promises.mkdir(folderPath);
}

export function deleteFile(filePath: string) {
  return promises.unlink(filePath);
}

export async function doesPathExist(path: string) {
  try {
    await promises.access(path);
    return true;
  } catch (error) {
    return false;
  }
}

export function readFile(filePath: string) {
  return promises.readFile(filePath, 'utf8');
}

export function writeFile(filePath: string, fileContent: string) {
  return promises.writeFile(filePath, fileContent, 'utf8');
}

export async function readFiles(dirPath: string, extension?: string) {
  const entries = await promises.readdir(dirPath, {withFileTypes: true});
  const files = entries.filter(e => e.isFile() && (extension ? e.name.endsWith(extension) : true));

  const fileContents = await Promise.all(files.map(f => readFile(join(dirPath, f.name))));
  return fileContents;
}

export async function getSubfolders(path: string) {
  const entries = await promises.readdir(path, {withFileTypes: true});
  return entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
}

export const createOrRecreateFolder = async (folderPath: string) => {
  const doesFolderExist = await doesPathExist(folderPath);

  if (doesFolderExist) {
    await deleteFolder(folderPath);
  }
  return createFolder(folderPath);
};

export function getAllFiles(dirPath: string, arrayOfFiles?: Array<any>) {
  const files = readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file: string) => {
    if (statSync(join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(join(dirPath, file), arrayOfFiles);
    } else {
      (arrayOfFiles as Array<any>).push(join(dirPath, sep, file));
    }
  });

  return arrayOfFiles;
}

export async function downloadFile(sourceUrl: string, destinationFilePath: string): Promise<void> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Downdload error: ${response.status} ${response.statusText}`);
  }

  return new Promise<void>((resolve, reject) => {
    const fileStream = createWriteStream(destinationFilePath);

    if (!response.body) {
      throw new Error(`Download error: missing response body.`);
    }

    response.body.pipe(fileStream);

    response.body.on('error', err => {
      fileStream.close();
      if (existsSync(destinationFilePath) && statSync(destinationFilePath).isFile()) {
        unlinkSync(destinationFilePath);
      }
      reject(err);
    });

    fileStream.on('finish', () => {
      fileStream.close();
      resolve();
    });
  });
}
