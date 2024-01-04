import {app} from 'electron';

import {join} from 'path';

import {StorageHandlerPolicy, Synchronizer, createMonokleSynchronizerFromOrigin} from '@monokle/synchronizer';
import {getClientConfig} from './client-config';

let synchronizer: Synchronizer | undefined;

const initSynchronizer = async (cloudStorageDir: string) => {
  const newSynchronizer = await createMonokleSynchronizerFromOrigin(getClientConfig(), undefined, new StorageHandlerPolicy(cloudStorageDir));
  synchronizer = newSynchronizer;
  return newSynchronizer;
};

export const getSynchronizer = async () => {
  const userDataDir = app.getPath('userData');
  const cloudStorageDir = join(userDataDir, 'cloud');
  if (!synchronizer) {
    await initSynchronizer(cloudStorageDir);
  }
  return synchronizer;
};
