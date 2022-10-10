import log from 'loglevel';
import path from 'path';
import {parseAllDocuments} from 'yaml';

import {ResourceKindHandler} from '@models/resourcekindhandler';

import {createFolder, deleteFile, deleteFolder, doesPathExist, ensureFolderExists, writeFile} from '@utils/fileSystem';

const makeCrdGroupDir = (crdsDir: string, crdGroup: string) => {
  return path.join(crdsDir, crdGroup.replaceAll(/[\\/ ]/g, '_'));
};

const makeCrdNameFilePath = (groupDir: string, crdName: string) => {
  return path.join(groupDir, `${crdName.replaceAll(/[\\/ ]/g, '_')}.yaml`);
};

export async function saveCRD(crdsDir: string, crdContent: string) {
  await ensureFolderExists(crdsDir);
  try {
    const documents = parseAllDocuments(crdContent);
    for (let i = 0; i < documents.length; i += 1) {
      const doc = documents[i];
      const json = doc.toJSON();
      const crdName = json.metadata?.name as string | undefined;
      const crdGroup = json.spec?.group as string | undefined;
      if (crdGroup && crdName) {
        const groupDir = makeCrdGroupDir(crdsDir, crdGroup);
        // eslint-disable-next-line no-await-in-loop
        const doesGroupDirExist = await doesPathExist(groupDir);
        if (!doesGroupDirExist) {
          // eslint-disable-next-line no-await-in-loop
          await createFolder(groupDir);
        }
        const nameFile = makeCrdNameFilePath(groupDir, crdName);
        // eslint-disable-next-line no-await-in-loop
        const doesNameFileExist = await doesPathExist(nameFile);
        if (doesNameFileExist) {
          // eslint-disable-next-line no-await-in-loop
          await deleteFile(nameFile);
        }
        // eslint-disable-next-line no-await-in-loop
        await writeFile(nameFile, crdContent);
      }
    }
  } catch {
    log.warn("Couldn't save the CRD because we couldn't parse the content.");
  }
}

export async function deleteCRDGroup(crdsDir: string, crd: ResourceKindHandler) {
  await ensureFolderExists(crdsDir);
  const crdGroup = crd.apiVersionMatcher.slice(0, -2);
  const groupDir = makeCrdGroupDir(crdsDir, crdGroup);
  await deleteFolder(groupDir);
}
