import log from 'loglevel';
import path from 'path';
import {parseAllDocuments} from 'yaml';

import {createFolder, deleteFile, doesPathExist, writeFile} from '@shared/utils/fileSystem';

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
      const name = json.metadata?.name as string | undefined;
      const group = json.spec?.group as string | undefined;
      if (group && name) {
        const groupDir = path.join(crdsDir, group.replaceAll(/[\\/ ]/g, '_'));
        // eslint-disable-next-line no-await-in-loop
        const doesGroupDirExist = await doesPathExist(groupDir);
        if (!doesGroupDirExist) {
          // eslint-disable-next-line no-await-in-loop
          await createFolder(groupDir);
        }
        const nameFile = path.join(groupDir, `${name.replaceAll(/[\\/ ]/g, '_')}.yaml`);
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
