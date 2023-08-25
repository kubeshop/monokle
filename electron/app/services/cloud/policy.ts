import log from 'loglevel';

import {getAuthenticator} from './authenticator';
import {getSynchronizer} from './synchronizer';

export const getPolicy = async (repoPath: string) => {
  const authenticator = await getAuthenticator();
  const synchronizer = await getSynchronizer();

  const user = await authenticator?.getUser();

  if (!user?.token || !synchronizer) {
    return null;
  }

  try {
    const policy = await synchronizer.getPolicy(repoPath, true, user.token);
    return policy;
  } catch (e: any) {
    if (e instanceof Error) {
      log.warn(e.message);
    }
    log.warn('Failed to synchronize policy');
  }
  return null;
};
