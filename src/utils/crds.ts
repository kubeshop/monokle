import log from 'loglevel';
import path from 'path';
import {parseAllDocuments} from 'yaml';

import {createFolder, deleteFile, doesPathExist, writeFile} from '@utils/fileSystem';

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
        const apiVersionDir = path.join(crdsDir, apiVersion.replaceAll(/[\\/ ]/g, '_'));
        // eslint-disable-next-line no-await-in-loop
        const doesApiVersionDirExist = await doesPathExist(apiVersionDir);
        if (!doesApiVersionDirExist) {
          // eslint-disable-next-line no-await-in-loop
          await createFolder(apiVersionDir);
        }
        const kindFile = path.join(apiVersionDir, `${kind.replaceAll(/[\\/ ]/g, '_')}.yaml`);
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
    log.warn("Couldn't save the CRD because we couldn't parse the content.");
  }
}
