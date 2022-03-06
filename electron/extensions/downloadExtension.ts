import {readFileSync} from 'fs';
import log from 'loglevel';
import path from 'path';
import tar from 'tar';

import {downloadFile} from '@utils/http';

import downloadExtensionEntry from './downloadExtensionEntry';
import {createOrRecreateFolder, deleteFile, deleteFolder, doesPathExist, getAllFiles} from './fileSystem';
import {DownloadExtensionOptions} from './types';

async function downloadExtension<ExtensionEntryType, ExtensionType>(
  options: DownloadExtensionOptions<ExtensionEntryType, ExtensionType>
): Promise<ExtensionType> {
  const {
    extensionTarballUrl,
    entryFileUrl,
    entryFileName,
    parseEntryFileContent,
    validateEntryFileContent,
    transformEntryFileContentToExtension,
    makeExtensionFolderPath,
  } = options;

  const extensionEntry = await downloadExtensionEntry<ExtensionEntryType>(
    {
      entryFileUrl,
      entryFileName,
      parseEntryFileContent,
      validateEntryFileContent,
      makeExtensionFolderPath,
    },
    {skipEntryFileSave: true}
  );

  const extensionFolderPath = makeExtensionFolderPath(extensionEntry);
  await createOrRecreateFolder(extensionFolderPath);

  const extension = transformEntryFileContentToExtension(extensionEntry, extensionFolderPath);

  const tarballFilePath = `${extensionFolderPath}.tgz`;
  const doesTarballFileExist = await doesPathExist(tarballFilePath);

  if (doesTarballFileExist) {
    await deleteFile(tarballFilePath);
  }
  await downloadFile(extensionTarballUrl, tarballFilePath);

  await tar.extract({
    file: tarballFilePath,
    cwd: extensionFolderPath,
    strip: 1,
  });

  await deleteFile(tarballFilePath);

  checkAllJSONFilesOfExtensionAreValid(extensionFolderPath);

  return extension;
}

export default downloadExtension;

export const checkAllJSONFilesOfExtensionAreValid = (folderPath: string) => {
  const allFiles = getAllFiles(folderPath).filter(file => path.extname(file) === '.json');
  let currentFile: string = '';
  try {
    allFiles.forEach(file => {
      currentFile = file;
      const fileData = readFileSync(file);
      JSON.parse(fileData.toString());
    });
  } catch (error: any) {
    deleteFolder(folderPath);
    const paths: Array<string> = currentFile.split(path.sep);
    log.warn(`[${paths[paths.length - 1]}]: ${error.message} `);
    throw new Error(`[${paths[paths.length - 1]}]: ${error.message}`);
  }
};
