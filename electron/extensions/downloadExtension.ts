import tar from 'tar';

import {downloadFile} from '@utils/http';

import downloadExtensionEntry from './downloadExtensionEntry';
import {createOrRecreateFolder, deleteFile, doesPathExist} from './fileSystem';
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

  const extension = transformEntryFileContentToExtension(extensionEntry);

  const extensionFolderPath = makeExtensionFolderPath(extensionEntry);
  await createOrRecreateFolder(extensionFolderPath);

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

  return extension;
}

export default downloadExtension;
