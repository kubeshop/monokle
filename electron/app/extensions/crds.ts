// import {promises} from 'fs';
import path from 'path';
import {parseAllDocuments} from 'yaml';

import {registerCrdKindHandlers} from '@src/kindhandlers';

import {createFolder, deleteFile, doesPathExist, getSubfolders, readFiles, writeFile} from './fileSystem';

export async function saveCRD(crdsDir: string, crdContent: string) {
  const doesPluginsDirExist = await doesPathExist(crdsDir);
  if (!doesPluginsDirExist) {
    await createFolder(crdsDir);
  }
  try {
    const documents = parseAllDocuments(crdContent);
    for (let i = 0; i < documents.length; i += 1) {
      const doc = documents[i];
      const json = doc.toJSON();
      const kind = json.kind as string | undefined;
      const apiVersion = json.apiVersion as string | undefined;
      if (apiVersion && kind) {
        const apiVersionDir = path.join(crdsDir, apiVersion);
        // eslint-disable-next-line no-await-in-loop
        const doesApiVersionDirExist = await doesPathExist(apiVersionDir);
        if (!doesApiVersionDirExist) {
          // eslint-disable-next-line no-await-in-loop
          await createFolder(apiVersionDir);
        }
        const kindFile = path.join(apiVersionDir, kind, '.yaml');
        // eslint-disable-next-line no-await-in-loop
        const doesKindFileExist = await doesPathExist(kindFile);
        if (doesKindFileExist) {
          // eslint-disable-next-line no-await-in-loop
          await deleteFile(kindFile);
        }
        // eslint-disable-next-line no-await-in-loop
        await writeFile(kindFile, crdContent);
      }
    }
  } catch {
    console.warn("Couldn't save the CRD because we couldn't parse the content.");
  }
}

async function readSavedCrdKindHandlers(crdsDir: string) {
  const subdirectories = await getSubfolders(crdsDir);
  for (let i = 0; i < subdirectories.length; i += 1) {
    const dir = subdirectories[i];
    // eslint-disable-next-line no-await-in-loop
    const fileContents = await readFiles(dir);
    for (let j = 0; j < fileContents.length; j += 1) {
      const content = fileContents[i];
      registerCrdKindHandlers(content);
    }
  }
}
