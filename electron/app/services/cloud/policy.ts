import log from 'loglevel';

import {getSynchronizer} from './synchronizer';
import {getUser} from './user';

export const getPolicy = async (repoPath: string) => {
  const synchronizer = await getSynchronizer();
  const user = await getUser();
  if (!user?.tokenInfo || !synchronizer) {
    return null;
  }

  try {
    const policy = await synchronizer.getPolicy(repoPath, true, user.tokenInfo);
    return policy;
  } catch (e: any) {
    if (e instanceof Error) {
      log.warn(e.message);
    }
    log.warn('Failed to synchronize policy');
  }
  return null;
};
