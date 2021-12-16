import asyncLib from 'async';
import fs from 'fs';
import util from 'util';

import loadExtension from './loadExtension';
import {LoadExtensionOptions} from './types';

const fsReadDirPromise = util.promisify(fs.readdir);

const getSubfolders = async (folderPath: string) => {
  const subfolders = await fsReadDirPromise(folderPath, {withFileTypes: true});
  return subfolders.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};

async function loadMultipleExtensions<FileContentType, ExtensionType>(
  options: LoadExtensionOptions<FileContentType, ExtensionType>
): Promise<ExtensionType[]> {
  const {folderPath, ...restOptions} = options;
  const subfolders = await getSubfolders(folderPath);
  const extensions: ExtensionType[] = await asyncLib.map(subfolders, subfolder => {
    return loadExtension({folderPath: subfolder, ...restOptions});
  });
  return extensions;
}

export default loadMultipleExtensions;
