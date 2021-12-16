import fs from 'fs';
import log from 'loglevel';
import path from 'path';
import util from 'util';

import {LoadExtensionOptions} from './types';

const fsReadFilePromise = util.promisify(fs.readFile);
const fsExistsPromise = util.promisify(fs.exists);

async function loadExtension<FileContentType, ExtensionType>(
  options: LoadExtensionOptions<FileContentType, ExtensionType>
): Promise<ExtensionType | undefined> {
  const {folderPath, targetFileName, parseFileContent, isFileContentValid, transformFileContentToExtension} = options;
  const targetFilePath = path.join(folderPath, targetFileName);
  const doesTargetFileExist = await fsExistsPromise(targetFilePath);
  if (!doesTargetFileExist) {
    log.warn(`[LoadExtension]: Missing ${targetFileName} in ${folderPath}`);
    return;
  }
  const targetFileContent = await fsReadFilePromise(targetFilePath, 'utf8');
  const parsedTargetFileContent = parseFileContent(targetFileContent);
  if (!isFileContentValid(parsedTargetFileContent)) {
    log.warn(`[LoadExtension]: Invalid ${targetFileName} in ${folderPath}`);
    return;
  }
  const extension = transformFileContentToExtension(parsedTargetFileContent);
  return extension;
}

export default loadExtension;
