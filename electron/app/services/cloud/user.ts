import {User} from '@monokle/synchronizer';
import {CloudUser} from '@shared/models/cloud';

import {getAuthenticator} from './authenticator';

export const getUser = async (): Promise<CloudUser | undefined> => {
  const authenticator = await getAuthenticator();
  if (!authenticator) {
    return undefined;
  }
  const user = await authenticator.getUser();
  if (!user.isAuthenticated) {
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
