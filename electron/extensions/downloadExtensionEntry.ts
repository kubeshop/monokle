import fetch from 'node-fetch';
import path from 'path';

import {createFolder, createOrRecreateFolder, deleteFile, doesPathExist, writeFile} from './fileSystem';
import {DownloadExtensionEntryOptions} from './types';

async function downloadExtensionEntry<ExtensionEntryType>(
  options: DownloadExtensionEntryOptions<ExtensionEntryType>,
  additionalOptions?: {
    skipEntryFileSave: boolean;
  }
): Promise<ExtensionEntryType> {
  const {entryFileUrl, entryFileName, parseEntryFileContent, isEntryFileContentValid, makeExtensionFolderPath} =
    options;

  const fetchEntryFileResponse = await fetch(entryFileUrl);
  if (!fetchEntryFileResponse.ok) {
    throw new Error(`Couldn't fetch ${entryFileName}.`);
  }
  const entryFileContent = await fetchEntryFileResponse.text();
  const parsedEntryFileContent = parseEntryFileContent(entryFileContent);
  if (!isEntryFileContentValid(parsedEntryFileContent)) {
    throw new Error(`The ${entryFileName} file is not valid.`);
  }

  if (additionalOptions?.skipEntryFileSave) {
    return parsedEntryFileContent;
  }

  const extensionFolderPath = makeExtensionFolderPath(parsedEntryFileContent);
  await createOrRecreateFolder(extensionFolderPath);

  const entryFilePath = path.join(extensionFolderPath, entryFileName);
  const doesDownloadFolderExist = await doesPathExist(extensionFolderPath);
  if (!doesDownloadFolderExist) {
    await createFolder(extensionFolderPath);
  }

  const doesEntryFileExist = await doesPathExist(entryFilePath);
  if (doesEntryFileExist) {
    await deleteFile(entryFilePath);
  }
  await writeFile(entryFilePath, entryFileContent);

  return parsedEntryFileContent;
}

export default downloadExtensionEntry;
