import asyncLib from 'async';
import fs from 'fs';
import path from 'path';
import util from 'util';

import loadExtension from './loadExtension';
import {LoadExtensionOptions} from './types';

const fsReadDirPromise = util.promisify(fs.readdir);

const getSubfolders = async (folderPath: string) => {
  const subfolders = await fsReadDirPromise(folderPath, {withFileTypes: true});
  return subfolders.filter(dirent => dirent.isDirectory()).map(dirent => path.join(folderPath, dirent.name));
};

async function loadMultipleExtensions<FileContentType, ExtensionType>(
  options: LoadExtensionOptions<FileContentType, ExtensionType>
): Promise<ExtensionType[]> {
  const {folderPath, ...restOptions} = options;
  const subfolders = await getSubfolders(folderPath);
  const extensions: (ExtensionType | undefined)[] = await asyncLib.map(subfolders, async subfolder => {
    const extension = await loadExtension({folderPath: subfolder, ...restOptions});
    return extension;
  });
  return extensions.filter((e): e is ExtensionType => e !== undefined);
}

export default loadMultipleExtensions;
