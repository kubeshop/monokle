import {app} from 'electron';

import {join} from 'path';

import {Authenticator, StorageHandlerAuth, createMonokleAuthenticatorFromOrigin} from '@monokle/synchronizer';

export const AUTH_CLIENT_ID = 'mc-cli';

let authenticator: Authenticator | undefined;

const initAuthenticator = async (cloudStorageDir: string) => {
  const newAuthenticator = await createMonokleAuthenticatorFromOrigin(AUTH_CLIENT_ID, undefined, new StorageHandlerAuth(cloudStorageDir));
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
