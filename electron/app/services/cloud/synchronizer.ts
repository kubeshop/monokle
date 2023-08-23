import {app} from 'electron';

import {join} from 'path';

import {StorageHandlerPolicy, Synchronizer, createDefaultMonokleSynchronizer} from '@monokle/synchronizer';

let synchronizer: Synchronizer | undefined;

const initSynchronizer = async (cloudStorageDir: string) => {
  const newSynchronizer = createDefaultMonokleSynchronizer(new StorageHandlerPolicy(cloudStorageDir));
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
