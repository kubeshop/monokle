import {shell} from 'electron';

import {CloudLoginResponse} from '@shared/models/cloud';

import {getAuthenticator} from './authenticator';
import {serializeUser} from './user';

export const cloudLogin = async (): Promise<CloudLoginResponse> => {
  const authenticator = await getAuthenticator();
  if (!authenticator) {
    throw new Error('Something went wrong with the authenticator');
  }
  const loginResponse = await authenticator.login('device code');
  if (!loginResponse.handle) {
    throw new Error('Something went wrong with the login response');
  }
  shell.openExternal(loginResponse.handle.verification_uri_complete);
  const user = await loginResponse.onDone;
  if (!user) {
    throw new Error('Login to Cloud has failed');
  }
  return {user: serializeUser(user)};
};

export const cloudLogout = async (): Promise<void> => {
  const authenticator = await getAuthenticator();
  await authenticator?.logout();
};
