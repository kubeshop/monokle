import log from 'loglevel';
import path from 'path';

import {doesPathExist, readFile} from './fileSystem';
import {LoadExtensionOptions} from './types';

async function loadExtension<ExtensionEntryType, ExtensionType>(
  options: LoadExtensionOptions<ExtensionEntryType, ExtensionType>
): Promise<ExtensionType | undefined> {
  const {
    folderPath,
    entryFileName,
    parseEntryFileContent,
    isEntryFileContentValid,
    transformEntryFileContentToExtension,
  } = options;
  const entryFilePath = path.join(folderPath, entryFileName);
  const doesEntryFileExist = await doesPathExist(entryFilePath);
  if (!doesEntryFileExist) {
    log.warn(`[LoadExtension]: Missing ${entryFileName} in ${folderPath}`);
    return;
  }
  const entryFileContent = await readFile(entryFilePath);
  const parsedEntryFileContent = parseEntryFileContent(entryFileContent);
  if (!isEntryFileContentValid(parsedEntryFileContent)) {
    log.warn(`[LoadExtension]: Invalid ${entryFileName} in ${folderPath}`);
    return;
  }
  const extension = transformEntryFileContentToExtension(parsedEntryFileContent);
  return extension;
}

export default loadExtension;
