import log from 'loglevel';

import {User} from '@monokle/synchronizer';
import {CloudUser} from '@shared/models/cloud';

import {getAuthenticator} from './authenticator';

export const getUser = async (): Promise<User | undefined> => {
  const authenticator = await getAuthenticator();
  if (!authenticator) {
    return undefined;
  }
  try {
    const user = await authenticator.getUser();
    if (!user.isAuthenticated) {
      return undefined;
    }
    return user;
  } catch (e: any) {
    log.warn(e.message);
    return undefined;
  }
};

export const getSerializedUser = async (): Promise<CloudUser | undefined> => {
  const user = await getUser();
  if (!user) {
    return undefined;
  }
  try {
    const serializedUser = serializeUser(user);
    return serializedUser;
  } catch {
    return undefined;
  }
};

export const serializeUser = (user: User): CloudUser => {
  if (!user.email) {
    throw new Error('User not found');
  }
  return {
    email: user.email,
  };
};
