import log from 'loglevel';

import {getAuthenticator} from './authenticator';
import {getSynchronizer} from './synchronizer';

export const getPolicy = async (repoPath: string) => {
  const authenticator = await getAuthenticator();
  const synchronizer = await getSynchronizer();

  const user = await authenticator?.getUser();

  if (!user?.token || !synchronizer) {
    return undefined;
  }

  try {
    const policy = await synchronizer.synchronize(repoPath, user.token);
    return policy;
  } catch (e: any) {
    if (e instanceof Error) {
      console.log(e.message);
    }
    log.error('Failed to synchronize policy');
  }
  return undefined;
};
