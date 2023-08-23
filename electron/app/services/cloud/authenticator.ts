import {app} from 'electron';

import {join} from 'path';

import {Authenticator, StorageHandlerAuth, createDefaultMonokleAuthenticator} from '@monokle/synchronizer';

let authenticator: Authenticator | undefined;

const initAuthenticator = async (cloudStorageDir: string) => {
  const newAuthenticator = createDefaultMonokleAuthenticator(new StorageHandlerAuth(cloudStorageDir));
  authenticator = newAuthenticator;
  return newAuthenticator;
};

export const getAuthenticator = async () => {
  const userDataDir = app.getPath('userData');
  const cloudStorageDir = join(userDataDir, 'cloud');
  if (!authenticator) {
    await initAuthenticator(cloudStorageDir);
  }
  return authenticator;
};
