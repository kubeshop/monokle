import {getAuthenticator} from './authenticator';
import {getSynchronizer} from './synchronizer';

export const getProjectInfo = async (repoPath: string) => {
  const authenticator = await getAuthenticator();
  const synchronizer = await getSynchronizer();

  const user = await authenticator?.getUser();

  if (!user?.token || !synchronizer) {
    return null;
  }

  try {
    const project = await synchronizer?.getProjectInfo(repoPath, user.token, true);
    return project;
  } catch {
    return null;
  }
};
