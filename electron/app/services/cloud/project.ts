import {getSynchronizer} from './synchronizer';
import {getUser} from './user';

export const getProjectInfo = async (repoPath: string) => {
  const synchronizer = await getSynchronizer();
  const user = await getUser();
  if (!user?.token || !synchronizer) {
    return null;
  }

  try {
    const project = await synchronizer?.getProjectInfo(repoPath, user.token, true);
    return project ? {info: project, link: synchronizer.generateDeepLinkProjectPolicy(project.slug)} : null;
  } catch {
    return null;
  }
};
